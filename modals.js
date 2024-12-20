
function createRouteGradientColors(routeCoordinates, startColor = '#fc7474', endColor = '#ab0707') {
    // Helper function to convert hex to RGB
    const hexToRgb = (hex) => {
        const bigint = parseInt(hex.slice(1), 16);
        return [
            (bigint >> 16) & 255,
            (bigint >> 8) & 255,
            bigint & 255
        ];
    };

    // Helper function to convert RGB to hex
    const rgbToHex = (r, g, b) => {
        return '#' + [r, g, b]
            .map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            })
            .join('');
    };

    // Helper function to interpolate between two colors
    const interpolateColor = (color1, color2, factor) => {
        const result = color1.map((channel, index) => 
            Math.round(channel + factor * (color2[index] - channel))
        );
        return result;
    };

    // Convert start and end colors to RGB
    const startRGB = hexToRgb(startColor);
    const endRGB = hexToRgb(endColor);

    // Generate gradient colors for the route
    const gradientColors = [];
    const numSegments = routeCoordinates.length - 1;

    for (let i = 0; i < numSegments; i++) {
        // Calculate interpolation factor
        const factor = i / (numSegments - 1);
        
        // Interpolate between start and end colors
        const interpolatedRGB = interpolateColor(startRGB, endRGB, factor);
        
        // Convert back to hex
        const gradientColor = rgbToHex(...interpolatedRGB);
        gradientColors.push(gradientColor);
    }

    return gradientColors;
}

// Modify the route visualization in your existing code
function createRouteGeoJSON(routeCoordinates) {
    // Generate gradient colors
    const gradientColors = createRouteGradientColors(routeCoordinates);

    // Create a FeatureCollection with multiple line segments for gradient effect
    const routeFeatures = routeCoordinates.slice(0, -1).map((coord, index) => ({
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [coord, routeCoordinates[index + 1]]
        },
        "properties": {
            "color": gradientColors[index]
        }
    }));

    return {
        "type": "FeatureCollection",
        "features": routeFeatures
    };
}

// Update the route layer addition in your existing code
function addRouteToMap(map, routeGeoJSON) {
    if (map.getSource('route')) {
        map.removeSource('route');
    }
    if (map.getLayer('route-layer')) {
        map.removeLayer('route-layer');
    }

    map.addSource('route', {
        type: 'geojson',
        data: routeGeoJSON
    });

    map.addLayer({
        id: 'route-layer',
        type: 'line',
        source: 'route',
        paint: {
            'line-color': ['get', 'color'],
            'line-width': 4,
            'line-opacity': 0.7
        }
    });
}

export function initializeRouteModal(map, graph, nodesData, dijkstra) {
    // Create modal HTML
    const modalHTML = `
        <div id="routeModal">
            <div class="modal-content">
                <h2>Find Route</h2>
                <div class="input-wrapper">
                    <input type="text" id="fromNodeInput" autocomplete="off" class="modal-input" placeholder="Start Node (e.g., NODE_015)">
                    <div id="fromNodeDropdown" class="node-dropdown"></div>
                </div>
                <div class="input-wrapper">
                    <input type="text" id="toNodeInput" autocomplete="off" class="modal-input" placeholder="End Node (e.g., NODE_027)">
                    <div id="toNodeDropdown" class="node-dropdown"></div>
                </div>
                <div class="modal-buttons">
                    <button id="cancelRouteModalBtn" class="modal-btn modal-btn-cancel">Cancel</button>
                    <button id="findRouteModalBtn" class="modal-btn modal-btn-find">Find Route</button>
                </div>
            </div>
        </div>
    `;

    // Append modal to body if not exists
    if (!document.getElementById('routeModal')) {
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv.firstElementChild);
    }

    // Get modal elements
    const routeButton = document.getElementById('routeButton');
    const routeModal = document.getElementById('routeModal');
    const findRouteModalBtn = document.getElementById('findRouteModalBtn');
    const cancelRouteModalBtn = document.getElementById('cancelRouteModalBtn');
    const fromNodeInput = document.getElementById('fromNodeInput');
    const toNodeInput = document.getElementById('toNodeInput');
    const fromNodeDropdown = document.getElementById('fromNodeDropdown');
    const toNodeDropdown = document.getElementById('toNodeDropdown');
    

    let timeMinutes = 0;
    let remainingSeconds = 0;
    

    // Add event listeners to input fields
    function createNodeDropdown(inputElement, dropdownElement, nodesData) {
        // Extract unique node IDs and sort them
        const nodeIds = nodesData.features
            .map(feature => feature.properties.NODE_ID)
            .sort();

        // Create dropdown options
        function updateDropdown(searchTerm) {
            // Clear previous options
            dropdownElement.innerHTML = '';

            // Filter nodes based on input
            const filteredNodes = nodeIds.filter(nodeId => 
                nodeId.toLowerCase().includes(searchTerm.toLowerCase())
            );

            // Create dropdown items
            filteredNodes.slice(0, 999).forEach(nodeId => {
                const dropdownItem = document.createElement('div');
                dropdownItem.classList.add('dropdown-item');
                dropdownItem.textContent = nodeId;
                dropdownItem.addEventListener('click', () => {
                    inputElement.value = nodeId;
                    dropdownElement.style.display = 'none';
                });
                dropdownElement.appendChild(dropdownItem);
            });

            // Show/hide dropdown based on results
            dropdownElement.style.display = filteredNodes.length > 0 ? 'block' : 'none';
        }

        // Add event listeners for input
        inputElement.addEventListener('input', (e) => {
            updateDropdown(e.target.value);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!inputElement.contains(e.target) && !dropdownElement.contains(e.target)) {
                dropdownElement.style.display = 'none';
            }
        });

        // Show dropdown when input is focused
        inputElement.addEventListener('focus', (e) => {
            updateDropdown(e.target.value);
        });
    }

    // Initialize dropdowns for both inputs
    createNodeDropdown(fromNodeInput, fromNodeDropdown, nodesData);
    createNodeDropdown(toNodeInput, toNodeDropdown, nodesData);


    // Show modal when Find Route button is clicked
    routeButton.addEventListener('click', () => {
        routeModal.style.display = 'flex';
        // Small timeout to ensure display is set before adding show class
        setTimeout(() => {
            routeModal.classList.add('show');
        }, 10);
    });
    
    // Close modal with animation
    function closeModal() {
        routeModal.classList.remove('show');
        // Wait for animation to complete before hiding
        setTimeout(() => {
            routeModal.style.display = 'none';
        }, 300); // Match this with the CSS transition time
    }
    
    // Cancel button closes the modal
    cancelRouteModalBtn.addEventListener('click', closeModal);
    
    // Handle route finding
    findRouteModalBtn.addEventListener('click', () => {
        
        const fromNode = fromNodeInput.value.trim();
        const toNode = toNodeInput.value.trim();
        const timeData = {};

    
        // Close the modal after the user clicks the button
        closeModal();
    
        const existingStepsModal = document.getElementById('stepsModal');
        if (existingStepsModal) {
            existingStepsModal.remove();
        }
    
        if (!fromNode || !toNode) {
            alert("Both 'From' and 'To' nodes must be specified.");
            return;
        }
    
        if (!graph[fromNode] || !graph[toNode]) {
            alert("One or both of the specified nodes do not exist in the graph.");
            return;
        }
    
        // Find the start node's floor
        const startNodeData = nodesData.features.find(feature => feature.properties.NODE_ID === fromNode);
        
        if (startNodeData) {
            // Map floor numbers to corresponding data-floor attributes
            const floorMap = {
                        '-1': 'basement',
                        '0': 'ground',
                        '1': 'first',
                        '2': 'second'
            };
    
            const startFloor = startNodeData.properties.Floor;
            
            // Find and click the correct floor button
            const floorNumberButtons = document.querySelectorAll('.floor-number');
            const targetButton = Array.from(floorNumberButtons).find(btn => 
                btn.dataset.floor === floorMap[startFloor]
            );
    
            if (targetButton) {
                // Programmatically trigger the click event on the target floor button
                targetButton.click();
            }
        }

        let routeTime = {
            minutes: timeMinutes,
            seconds: remainingSeconds
        };
    
        // Find route using Dijkstra algorithm
        const route = dijkstra(graph, nodesData, fromNode, toNode, timeData);

        console.log('Estimated time:', timeData.minutes, 'minutes and', timeData.seconds, 'seconds');
    
        if (route.length === 0) {
            alert("No route found between the specified nodes.");
            return;
        }
    
        const routeCoordinates = route.map(nodeID => {
            const node = nodesData.features.find(feature => feature.properties.NODE_ID === nodeID);
            return node ? [node.properties.X, node.properties.Y] : null;
        }).filter(coord => coord !== null);
    
        if (routeCoordinates.length === 0) {
            alert("No route found between the specified nodes.");
            return;
        }
    
        // Step 1: Group nodes by floor for stepwise navigation
        const steps = [];
        let currentFloor = null;
        let currentStep = [];
    
        route.forEach(nodeID => {
            const node = nodesData.features.find(feature => feature.properties.NODE_ID === nodeID);
            
            // Access the Floor property here
            const floor = node ? node.properties.Floor : null;
    
           

    if (floor !== currentFloor) {
        // New floor means a new step
        if (currentStep.length > 0) {
            steps.push(currentStep);
            console.log('Step added:', currentStep);
        }
        currentStep = [nodeID];
        currentFloor = floor;
        console.log('New floor detected:', floor);
    } else {
        currentStep.push(nodeID);
    }
});

// Add the last step if there are nodes in currentStep
if (currentStep.length > 0) {
    steps.push(currentStep);
    console.log('Final step added:', currentStep);
}

console.log('All Steps:', steps);
    
        // Step 2: Visualize the route on the map
        const routeGeoJSON = createRouteGeoJSON(routeCoordinates);


        addRouteToMap(map, routeGeoJSON);
        // Step 3: Create and manage the steps modal within InitializeRouteModal
        let currentStepIndex = 0;
        const modalContainer = document.body;
        const stepsModalHTML = `<div id="stepsModal" class="stepsModal">
        <button id="closeStepsModalBtn" class="closeStepsModalBtn">✕</button>
        <button id="prevStepBtn" class="prevStepBtn">←</button>
        <span id="stepTitle" class="stepTitle">Step ${currentStep}</span>
         
        <button id="nextStepBtn" class="nextStepBtn">→</button>
        <div id="additionalStepsInfo"></div>

    </div>
    <style>
        @keyframes fadeInModal {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    
        #prevStepBtn:hover, #nextStepBtn:hover {
            transform: scale(1.1);
            color: #007bff;
        }
    
        #closeStepsModalBtn:hover {
            background: #ff6b6b;
            transform: rotate(90deg);
        }
    
        #stepTitle {
            text-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
    </style>
    `;
    
        // Ensure the modal container exists before appending
        if (modalContainer) {
            const stepsDiv = document.createElement('div');
            stepsDiv.innerHTML = stepsModalHTML;
            modalContainer.appendChild(stepsDiv.firstElementChild);
        }
       
        const stepTitle = document.getElementById('stepTitle');
        const prevStepBtn = document.getElementById('prevStepBtn');
        const nextStepBtn = document.getElementById('nextStepBtn');


        
    
       // Modify the updateStepDisplay function to add floor transition markers
       const updateStepDisplay = () => {
        if (steps[currentStepIndex]) {
            const currentStepNodes = steps[currentStepIndex];
            const stepFloor = nodesData.features.find(node => node.properties.NODE_ID === currentStepNodes[0])?.properties.Floor;
            
            if (stepFloor !== undefined) {
                
                stepTitle.style.transition = 'opacity 0.25s ease, transform 0.25s ease'; // Add transition for opacity and transform

stepTitle.style.opacity = 0;
stepTitle.style.transform = 'translateX(10px)'; // Slide it to the right (out of view)


const additionalStepsInfo = document.getElementById('additionalStepsInfo');
if (additionalStepsInfo) {
    // Example of adding additional information
    
    additionalStepsInfo.innerHTML = `
    <span style="color: #2c3e50;">Estimated Arrival Time: </span>
    <span style="color: #FF0000;">${timeData.minutes} min ${timeData.seconds} sec</span>
`;
}


setTimeout(() => {
    stepTitle.textContent = `Step ${currentStepIndex + 1}: Floor ${stepFloor}` 
    stepTitle.style.opacity = 1;
    stepTitle.style.transform = 'translateX(0)'; // Slide it back to its original position
}, 250);

    
                // Remove previous route layers and transition markers if they exist
                if (map.getLayer('step-route-layer')) {
                    map.removeLayer('step-route-layer');
                }
                if (map.getSource('step-route')) {
                    map.removeSource('step-route');
                }
                if (map.getLayer('route-layer')) {
                    map.removeLayer('route-layer');
                }
                if (map.getSource('route')) {
                    map.removeSource('route');
                }
                if (map.getLayer('floor-transition-marker')) {
                    map.removeLayer('floor-transition-marker');
                }
                if (map.getSource('floor-transition')) {
                    map.removeSource('floor-transition');
                }
    
                // Show the current step's path
                const stepCoordinates = currentStepNodes.map(nodeID => {
                    const node = nodesData.features.find(feature => feature.properties.NODE_ID === nodeID);
                    return [node.properties.X, node.properties.Y];
                });
    
                // Create gradient colors for step route
const stepGradientColors = createRouteGradientColors(stepCoordinates, '#fc7474', '#ab0707');

// Create step route FeatureCollection with gradient
const stepRouteFeatures = stepCoordinates.slice(0, -1).map((coord, index) => ({
    "type": "Feature",
    "geometry": {
        "type": "LineString",
        "coordinates": [coord, stepCoordinates[index + 1]]
    },
    "properties": {
        "color": stepGradientColors[index] || '#0a0a0a'
    }
}));

const stepGeoJSON = {
    "type": "FeatureCollection",
    "features": stepRouteFeatures
};

// Add the current step route
map.addSource('step-route', {
    type: 'geojson',
    data: stepGeoJSON
});


map.addLayer({
    id: 'step-route-layer',
    type: 'line',
    source: 'step-route',
    paint: {
        'line-color': ['get', 'color'],
        'line-width': 7,
        'line-opacity': 1
    },
    layout: {
        'line-cap': 'round',
        'line-join': 'round'
    }
}, 'basement-floor-3d');
    
                // Add floor transition marker only when changing floors
                if (steps.length > 1 && currentStepIndex < steps.length - 1) {
                    const currentFloor = stepFloor;
                    const nextFloor = nodesData.features.find(node => 
                        node.properties.NODE_ID === steps[currentStepIndex + 1][0]
                    )?.properties.Floor;
    
                    // Only add transition marker if floors are different
                    if (currentFloor !== nextFloor) {
                        // Determine transition direction
                        const transitionIcon = nextFloor > currentFloor ? '▲' : '▼';
    
                        // Get the last coordinate of the current step
                        const lastCoordinate = stepCoordinates[stepCoordinates.length - 1];
    
                        // Add transition marker
                        const transitionGeoJSON = {
                            "type": "FeatureCollection",
                            "features": [{
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": lastCoordinate
                                },
                                "properties": {
                                    "icon": transitionIcon
                                }
                            }]
                        };
    
                        map.addSource('floor-transition', {
                            type: 'geojson',
                            data: transitionGeoJSON
                        });
    
                        map.addLayer({
                            id: 'floor-transition-marker',
                            type: 'symbol',
                            source: 'floor-transition',
                            layout: {
                                'text-field': ['get', 'icon'],
                                'text-size': 30,
                                'text-allow-overlap': true
                            },
                            paint: {
                                'text-color': '#FF5733',
                                'text-halo-color': 'white',
                                'text-halo-width': 2
                            }
                        });
    
                        
                        // Modify the click event for floor transition marker
map.on('click', 'floor-transition-marker', () => {
    // Add a small delay to ensure previous operations have completed
    if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        
        // Find the floor for the current step
        const currentStepNodes = steps[currentStepIndex];
        const currentNode = nodesData.features.find(feature => 
            feature.properties.NODE_ID === currentStepNodes[0]
        );

        if (currentNode) {
            // Map floor numbers to corresponding data-floor attributes
            const floorMap = {
                '-1': 'basement',
                '0': 'ground',
                '1': 'first',
                '2': 'second'
                
            };
        

            const currentFloor = currentNode.properties.Floor;
            
            // Find and click the correct floor button
            const floorNumberButtons = document.querySelectorAll('.floor-number');
            const targetButton = Array.from(floorNumberButtons).find(btn => 
                btn.dataset.floor === floorMap[currentFloor]
            );

            if (targetButton) {
                // Programmatically trigger the click event on the target floor button
                targetButton.click();
            }
        }

        updateStepDisplay();
    }

});

    
                        // Change cursor to pointer when hovering over the marker
                        map.on('mouseenter', 'floor-transition-marker', () => {
                            map.getCanvas().style.cursor = 'pointer';
                        });
    
                        map.on('mouseleave', 'floor-transition-marker', () => {
                            map.getCanvas().style.cursor = '';
                        });
                    }
                }
            } else {
                console.error('Floor property not found for the current step!');
            }
        }
    };
    
        // Initialize the first step display
        updateStepDisplay();
    

        prevStepBtn.addEventListener('mouseover', () => {
            prevStepBtn.style.transform = 'scale(1.1)';
            prevStepBtn.style.color = '#007bff';
        });
        
        prevStepBtn.addEventListener('mouseout', () => {
            prevStepBtn.style.transform = 'scale(1)';
            prevStepBtn.style.color = '#333';
        });
        
        nextStepBtn.addEventListener('mouseover', () => {
            nextStepBtn.style.transform = 'scale(1.1)';
            nextStepBtn.style.color = '#007bff';
        });
        
        nextStepBtn.addEventListener('mouseout', () => {
            nextStepBtn.style.transform = 'scale(1)';
            nextStepBtn.style.color = '#333';
        });
        // Event listeners for navigating through the steps
        prevStepBtn.addEventListener('click', () => {
            if (currentStepIndex > 0) {
                currentStepIndex--;
                
                // Find the floor for the current step
                const currentStepNodes = steps[currentStepIndex];
                const currentNode = nodesData.features.find(feature => 
                    feature.properties.NODE_ID === currentStepNodes[0]
                );
        
                if (currentNode) {
                    // Map floor numbers to corresponding data-floor attributes
                    const floorMap = {
                        '-1': 'basement',
                        '0': 'ground',
                        '1': 'first',
                        '2': 'second'
                    };
        
                    const currentFloor = currentNode.properties.Floor;
                    
                    // Find and click the correct floor button
                    const floorNumberButtons = document.querySelectorAll('.floor-number');
                    const targetButton = Array.from(floorNumberButtons).find(btn => 
                        btn.dataset.floor === floorMap[currentFloor]
                    );
        
                    if (targetButton) {
                        // Programmatically trigger the click event on the target floor button
                        targetButton.click();
                    }
                }
        
                updateStepDisplay();
            }
        });
        
        nextStepBtn.addEventListener('click', () => {

            if (currentStepIndex < steps.length - 1) {
                currentStepIndex++;
                
                // Find the floor for the current step
                const currentStepNodes = steps[currentStepIndex];
                const currentNode = nodesData.features.find(feature => 
                    feature.properties.NODE_ID === currentStepNodes[0]
                );
        
                if (currentNode) {
                    // Map floor numbers to corresponding data-floor attributes
                    const floorMap = {
                        '-1': 'basement',
                        '0': 'ground',
                        '1': 'first',
                        '2': 'second'
                        
                    };
                
        
                    const currentFloor = currentNode.properties.Floor;
                    
                    // Find and click the correct floor button
                    const floorNumberButtons = document.querySelectorAll('.floor-number');
                    const targetButton = Array.from(floorNumberButtons).find(btn => 
                        btn.dataset.floor === floorMap[currentFloor]
                    );
        
                    if (targetButton) {
                        // Programmatically trigger the click event on the target floor button
                        targetButton.click();
                    }
                }
        
                updateStepDisplay();
            }
        
        });
    
// Close steps modal functionality
const closeStepsModalBtn = document.getElementById('closeStepsModalBtn');
closeStepsModalBtn.addEventListener('click', () => {
    // Remove steps modal
    const stepsModal = document.getElementById('stepsModal');
    if (stepsModal) stepsModal.remove();

    // Remove route layers
    if (map.getLayer('step-route-layer')) {
        map.removeLayer('step-route-layer');
    }
    if (map.getSource('step-route')) {
        map.removeSource('step-route');
    }
    if (map.getLayer('route-layer')) {
        map.removeLayer('route-layer');
    }
    if (map.getSource('route')) {
        map.removeSource('route');
    }
    if (map.getLayer('floor-transition-marker')) {
        map.removeLayer('floor-transition-marker');
    }
    if (map.getSource('floor-transition')) {
        map.removeSource('floor-transition');
    }
});
    });
}    





