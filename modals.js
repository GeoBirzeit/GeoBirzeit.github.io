
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
        
        map.removeLayer('route-layer');
        map.removeSource('route');
        
           
        
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

// Sample data arrays for categories
const buildingsData = [
    { name: "Engineering Building", nodeId: "NODE_001" },
    { name: "Science Building", nodeId: "NODE_015" },
    { name: "Library", nodeId: "NODE_227" },
    { name: "Administration Building", nodeId: "NODE_035" }
];

const doctorsData = [
    { name: "Dr. Smith - Computer Science", nodeId: "NODE_010" },
    { name: "Dr. Johnson - Mathematics", nodeId: "NODE_017" },
    { name: "Dr. Williams - Physics", nodeId: "NODE_034" },
    { name: "Dr. Brown - Engineering", nodeId: "NODE_061" }
];

const roomsData = [
    { name: "Room 101 - Lecture Hall", nodeId: "NODE_001" },
    { name: "Room 162 - Lab", nodeId: "NODE_017" },
    { name: "Room 150 - Conference Room", nodeId: "NODE_041" },
    { name: "Room 152 - Study Room", nodeId: "NODE_027" }
];

const departmentData = [
    { name: "Arabic Department", nodeId: "NODE_091" },
    { name: "English Department", nodeId: "NODE_057" },
    { name: "IT Department", nodeId: "NODE_051" },
    { name: "Science Department", nodeId: "NODE_037" }
]

const othersData = [
    { name: "Ritaj - Service", nodeId: "NODE_101" },
    { name: "Abu Ahmad - Cafeteria", nodeId: "NODE_102" },
    { name: "Arab Bank - Service", nodeId: "NODE_103" },
    { name: "Elevator - Service", nodeId: "NODE_104" }
];

let currentMarker = null;
let markerNodeId = null;
let activeMarker = null;

function clearRouteLayers(map) {
    const stepsModal = document.getElementById('stepsModal');
    if (stepsModal) {

        stepsModal.remove();

        const warningDiv = document.createElement('div');
    warningDiv.className = 'warning-message';
    warningDiv.innerHTML = `
        <div class="warning-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Route cleared</span>
        </div>
    `;
    document.body.appendChild(warningDiv);

    // Remove the warning after 7 seconds
    setTimeout(() => {
        warningDiv.classList.add('fade-out');
        setTimeout(() => {
            warningDiv.remove();
        }, 300); // Match this with the CSS transition duration
    }, 7000);
}

    // Create and show the warning message
    

    // Clear map layers
    if (map.getLayer('step-route-layer')) map.removeLayer('step-route-layer');
    if (map.getSource('step-route')) map.removeSource('step-route');
    if (map.getLayer('route-layer')) map.removeLayer('route-layer');
    if (map.getSource('route')) map.removeSource('route');
    if (map.getLayer('floor-transition-marker')) map.removeLayer('floor-transition-marker');
    if (map.getSource('floor-transition')) map.removeSource('floor-transition');
    
    if (currentMarker) {
        currentMarker.remove();
        console.log('Current marker removed');
    }
}

export function initializeRouteModal(map, graph, nodesData, dijkstra, getCurrentFloor) {
    // Create modal HTML
    const modalHTML = `
        <div id="routeModal">
    <div class="modal-content">
        <h2>Find Route</h2>
        
        <!-- Start Location -->
        <div class="location-section">
            <h3>Start Location</h3>
            <div class="category-selector">
                <button class="category-btn" data-category="buildings" data-input="from">Buildings</button>
                <button class="category-btn" data-category="departments" data-input="from">Departments</button>
                <button class="category-btn" data-category="doctors" data-input="from">Doctors</button>
                <button class="category-btn" data-category="rooms" data-input="from">Rooms</button>
                <button class="category-btn" data-category="others" data-input="from">Others</button>
            </div>
            <div class="input-wrapper">
                <input type="text" id="fromNodeInput" autocomplete="off" class="modal-input" placeholder="Search location...">
                <input type="hidden" id="fromNodeId">
                <div id="fromNodeDropdown" class="node-dropdown"></div>
            </div>
        </div>

        <!-- End Location -->
        <div class="location-section">
            <h3>End Location</h3>
            <div class="category-selector">
                <button class="category-btn" data-category="buildings" data-input="to">Buildings</button>
                <button class="category-btn" data-category="departments" data-input="to">Departments</button>
                <button class="category-btn" data-category="doctors" data-input="to">Doctors</button>
                <button class="category-btn" data-category="rooms" data-input="to">Rooms</button>
                <button class="category-btn" data-category="others" data-input="to">Others</button>
            </div>
            <div class="input-wrapper">
                <input type="text" id="toNodeInput" autocomplete="off" class="modal-input" placeholder="Search location...">
                <input type="hidden" id="toNodeId">
                <div id="toNodeDropdown" class="node-dropdown"></div>
            </div>
        </div>

        <div class="modal-buttons">
            <button id="cancelRouteModalBtn" class="modal-btn modal-btn-cancel">Cancel</button>
            <button id="findRouteModalBtn" class="modal-btn modal-btn-find">Find Route</button>
        </div>
    </div>
</div>`;


    // Append modal to body if not exists
    if (!document.getElementById('routeModal')) {
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv.firstElementChild);
    }

    
   
    window.clearRouteLayers = () => clearRouteLayers(map);

    // Get modal elements
    const routeButton = document.getElementById('routeButton');
    const routeModal = document.getElementById('routeModal');
    const findRouteModalBtn = document.getElementById('findRouteModalBtn');
    const cancelRouteModalBtn = document.getElementById('cancelRouteModalBtn');
    const fromNodeInput = document.getElementById('fromNodeInput');
    const toNodeInput = document.getElementById('toNodeInput');
    const fromNodeDropdown = document.getElementById('fromNodeDropdown');
    const toNodeDropdown = document.getElementById('toNodeDropdown');
    const fromNodeId = document.getElementById('fromNodeId');
    const toNodeId = document.getElementById('toNodeId');

    const timeData = {};
    let timeMinutes = 0;
    let remainingSeconds = 0;

    let currentFromCategory = null;
    let currentToCategory = null;
    let isPlacingMarker = false;
    

    
     // Add pin button to fromNode input wrapper
     const fromInputWrapper = document.querySelector('#fromNodeInput').parentElement;
     const pinButton = document.createElement('button');
     pinButton.className = 'pin-button';
     pinButton.innerHTML = `
         <svg viewBox="0 0 24 24">
             <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
         </svg>
     `;
     fromInputWrapper.appendChild(pinButton);
 
     // Create overlay for marker placement mode
     const overlay = document.createElement('div');
     overlay.className = 'marker-mode-overlay';
     document.body.appendChild(overlay);
 
     const message = document.createElement('div');
     message.className = 'marker-mode-message';
     message.textContent = 'Click on the map to place your starting point';
     overlay.appendChild(message);
 
     // Helper function to find closest node on current floor
     function findFloorSpecificClosestNode(coordinates) {
        const floor = getCurrentFloor();
        console.log('Current floor:', floor); // Debug log
        
        const targetFloor = floor === 'basement' ? '-1' : 
                          floor === 'ground' ? '0' :
                          floor === 'first' ? '1' : 
                          floor === 'second' ? '2' : floor;
        
        console.log('Target floor:', targetFloor); // Debug log

        let closestNode = null;
        let minDistance = Infinity;

        nodesData.features.forEach(node => {
            if (node.properties.Floor !== targetFloor) return;

            const nodeCoords = [node.properties.X, node.properties.Y];
            const distance = Math.sqrt(
                Math.pow(coordinates[0] - nodeCoords[0], 2) + 
                Math.pow(coordinates[1] - nodeCoords[1], 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestNode = node.properties.NODE_ID;
            }
        });

        console.log('Found closest node:', closestNode); // Debug log
        return closestNode;
    }
 
     // Pin button click handler
     pinButton.addEventListener('click', () => {
        routeModal.style.display = 'none';
        overlay.classList.add('active');
        isPlacingMarker = true;
        map.getCanvas().style.cursor = 'crosshair';
    });
 
     // Map click handler for marker placement
     map.on('click', (e) => {
        if (!isPlacingMarker) return;
    
        const coordinates = [e.lngLat.lng, e.lngLat.lat];
        markerNodeId = findFloorSpecificClosestNode(coordinates);
    
        if (!markerNodeId) {
            alert('No valid node found on this floor. Try another location.');
            return;
        }
    
        // Find the closest node's actual coordinates for snapping
        const closestNode = nodesData.features.find(feature => 
            feature.properties.NODE_ID === markerNodeId
        );
    
        if (currentMarker) {
            currentMarker.remove();
        }
        
        
        
       
    
        // Create new marker at the snapped position
        currentMarker = new mapboxgl.Marker({
            color: "#FF0000",
            draggable: true
        })
        .setLngLat([closestNode.properties.X, closestNode.properties.Y])
        .addTo(map);
 

         // Modified marker dragend event handler
        // REPLACE the entire currentMarker.on('dragend') event handler with this updated version
// REPLACE the dragend event handler with this version
currentMarker.on('dragend', () => {
    const newCoords = currentMarker.getLngLat();
    const newNodeId = findFloorSpecificClosestNode([newCoords.lng, newCoords.lat]);
    
    if (newNodeId) {
        // Update form values
        fromNodeId.value = newNodeId;
        fromNodeInput.value = `Custom Location Has Been Set`;
        markerNodeId = newNodeId;

        // Find the closest node's actual coordinates
        const closestNode = nodesData.features.find(feature => 
            feature.properties.NODE_ID === newNodeId
        );
        
        if (closestNode && toNodeId.value) {
            // Snap marker to the closest node
            currentMarker.setLngLat([
                closestNode.properties.X,
                closestNode.properties.Y
            ]);

            // Remove existing layers and sources
            if (map.getLayer('step-route-layer')) map.removeLayer('step-route-layer');
            if (map.getSource('step-route')) map.removeSource('step-route');
            if (map.getLayer('route-layer')) map.removeLayer('route-layer');
            if (map.getSource('route')) map.removeSource('route');
            if (map.getLayer('floor-transition-marker')) map.removeLayer('floor-transition-marker');
            if (map.getSource('floor-transition')) map.removeSource('floor-transition');

            // Remove existing steps modal if present
            const existingStepsModal = document.getElementById('stepsModal');
            if (existingStepsModal) {
                existingStepsModal.remove();
            }

            // Calculate new route
            const route = dijkstra(graph, nodesData, newNodeId, toNodeId.value, timeData);

            if (route.length > 0) {
                // Group nodes by floor for stepwise navigation
                const steps = [];
                let currentFloor = null;
                let currentStep = [];

                route.forEach(nodeID => {
                    const node = nodesData.features.find(feature => 
                        feature.properties.NODE_ID === nodeID
                    );
                    const floor = node ? node.properties.Floor : null;

                    if (floor !== currentFloor) {
                        if (currentStep.length > 0) {
                            steps.push(currentStep);
                        }
                        currentStep = [nodeID];
                        currentFloor = floor;
                    } else {
                        currentStep.push(nodeID);
                    }
                });

                if (currentStep.length > 0) {
                    steps.push(currentStep);
                }

                // Create new steps modal
                const stepsModalHTML = `
                    <div id="stepsModal" class="stepsModal">
                        <button id="closeStepsModalBtn" class="closeStepsModalBtn">✕</button>
                        <button id="prevStepBtn" class="prevStepBtn">←</button>
                        <span id="stepTitle" class="stepTitle">Step 1</span>
                        <button id="nextStepBtn" class="nextStepBtn">→</button>
                        <div id="additionalStepsInfo"></div>
                    </div>
                `;

                document.body.insertAdjacentHTML('beforeend', stepsModalHTML);

                // Initialize steps modal functionality
                let currentStepIndex = 0;
                
                const updateStepDisplay = () => {
                    if (steps[currentStepIndex]) {
                        const currentStepNodes = steps[currentStepIndex];
                        const stepFloor = nodesData.features.find(node => 
                            node.properties.NODE_ID === currentStepNodes[0]
                        )?.properties.Floor;

                        if (stepFloor !== undefined) {
                            const stepTitle = document.getElementById('stepTitle');
                            stepTitle.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                            stepTitle.style.opacity = 0;
                            stepTitle.style.transform = 'translateX(10px)';

                            const additionalStepsInfo = document.getElementById('additionalStepsInfo');
                            if (additionalStepsInfo) {
                                additionalStepsInfo.innerHTML = `
                                    <span style="color: #2c3e50;">Estimated Arrival Time: </span>
                                    <span style="color: #FF0000;">${timeData.minutes} min ${timeData.seconds} sec</span>
                                `;
                            }

                            setTimeout(() => {
                                stepTitle.textContent = `Step ${currentStepIndex + 1}: Floor ${stepFloor}`;
                                stepTitle.style.opacity = 1;
                                stepTitle.style.transform = 'translateX(0)';
                            }, 250);

                            // Clear previous route visualization
                            if (map.getLayer('step-route-layer')) map.removeLayer('step-route-layer');
                            if (map.getSource('step-route')) map.removeSource('step-route');
                            if (map.getLayer('floor-transition-marker')) map.removeLayer('floor-transition-marker');
                            if (map.getSource('floor-transition')) map.removeSource('floor-transition');

                            // Show current step's path with visualization
                            const stepCoordinates = currentStepNodes.map(nodeID => {
                                const node = nodesData.features.find(feature => 
                                    feature.properties.NODE_ID === nodeID
                                );
                                return [node.properties.X, node.properties.Y];
                            });

                            const stepGradientColors = createRouteGradientColors(stepCoordinates, '#fc7474', '#ab0707');
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

                            // Add floor transition marker
                            if (steps.length > 1 && currentStepIndex < steps.length - 1) {
                                const nextFloor = nodesData.features.find(node => 
                                    node.properties.NODE_ID === steps[currentStepIndex + 1][0]
                                )?.properties.Floor;

                                if (stepFloor !== nextFloor) {
                                    const transitionIcon = nextFloor > stepFloor ? '▲' : '▼';
                                    const lastCoordinate = stepCoordinates[stepCoordinates.length - 1];

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
                                    map.on('click', 'floor-transition-marker', () => {
                                        if (currentMarker) {
                                            currentMarker.remove();
                                        }
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
                        }
                    }
                };

                // Set up event listeners for steps modal
                const prevStepBtn = document.getElementById('prevStepBtn');
                const nextStepBtn = document.getElementById('nextStepBtn');
                const closeStepsModalBtn = document.getElementById('closeStepsModalBtn');

                prevStepBtn.addEventListener('click', () => {
                    if (currentStepIndex > 0) {
                        currentStepIndex--;
                        const currentStepNodes = steps[currentStepIndex];
                        const currentNode = nodesData.features.find(feature => 
                            feature.properties.NODE_ID === currentStepNodes[0]
                        );

                        if (currentNode) {
                            const floorMap = {
                                '-1': 'basement',
                                '0': 'ground',
                                '1': 'first',
                                '2': 'second'
                            };

                            const currentFloor = currentNode.properties.Floor;
                            const floorNumberButtons = document.querySelectorAll('.floor-number');
                            const targetButton = Array.from(floorNumberButtons).find(btn => 
                                btn.dataset.floor === floorMap[currentFloor]
                            );

                            if (targetButton) {
                                targetButton.click();
                            }
                        }
                        updateStepDisplay();
                    }
                });

                nextStepBtn.addEventListener('click', () => {
                    
                    
                    if (currentStepIndex < steps.length - 1) {

                        if (currentMarker) {
                            currentMarker.remove();
                        }
                        if (markerNodeId) {
                            markerNodeId = null;
                        }
                        currentStepIndex++;
                        const currentStepNodes = steps[currentStepIndex];
                        const currentNode = nodesData.features.find(feature => 
                            feature.properties.NODE_ID === currentStepNodes[0]
                        );

                        if (currentNode) {
                            const floorMap = {
                                '-1': 'basement',
                                '0': 'ground',
                                '1': 'first',
                                '2': 'second'
                            };

                            const currentFloor = currentNode.properties.Floor;
                            const floorNumberButtons = document.querySelectorAll('.floor-number');
                            const targetButton = Array.from(floorNumberButtons).find(btn => 
                                btn.dataset.floor === floorMap[currentFloor]
                            );

                            if (targetButton) {
                                targetButton.click();
                            }
                        }
                        updateStepDisplay();
                    }
                });

                closeStepsModalBtn.addEventListener('click', () => {
                    const stepsModal = document.getElementById('stepsModal');
                    if (stepsModal) stepsModal.remove();

                    if (map.getLayer('step-route-layer')) map.removeLayer('step-route-layer');
                    if (map.getSource('step-route')) map.removeSource('step-route');
                    if (map.getLayer('route-layer')) map.removeLayer('route-layer');
                    if (map.getSource('route')) map.removeSource('route');
                    if (map.getLayer('floor-transition-marker')) map.removeLayer('floor-transition-marker');
                    if (map.getSource('floor-transition')) map.removeSource('floor-transition');
                });

                // Initialize the first step display
                updateStepDisplay();
            }
        }
    }
});             
                  
 
         // Update form values
         fromNodeId.value = markerNodeId;
         fromNodeInput.value = `Custom Location Has Been Set`;
 
         // Reset UI
         isPlacingMarker = false;
         map.getCanvas().style.cursor = '';
         overlay.classList.remove('active');
         routeModal.style.display = 'flex';
     });

    // Function to get data based on category
    function getCategoryData(category) {
        switch(category) {
            case 'buildings': return buildingsData;
            case 'doctors': return doctorsData;
            case 'rooms': return roomsData;
            case 'departments': return departmentData;
            case 'others': return othersData;
            default: return [];
        }
    }
    


   
    
        // Create dropdown options
        function updateDropdown(inputElement, dropdownElement, hiddenInput, category, searchTerm) {
            dropdownElement.innerHTML = '';
            
            if (!category) return;
    
            const data = getCategoryData(category);
            const filteredItems = data.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
    
            if (filteredItems.length > 0) {
                filteredItems.forEach(item => {
                    const dropdownItem = document.createElement('div');
                    dropdownItem.classList.add('dropdown-item');
                    dropdownItem.textContent = item.name;
                    dropdownItem.addEventListener('click', () => {
                        inputElement.value = item.name;
                        hiddenInput.value = item.nodeId;
                        dropdownElement.style.display = 'none';
                    });
                    dropdownElement.appendChild(dropdownItem);
                });
                dropdownElement.style.display = 'block';
            } else {
                dropdownElement.style.display = 'none';
            }
        } 
        
       // Set up category buttons
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        
        const category = btn.dataset.category;
        const inputType = btn.dataset.input;
        
        // Update active state for buttons in the same section
        btn.closest('.category-selector').querySelectorAll('.category-btn')
            .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Clear input fields based on which category section was clicked
        if (inputType === 'from') {
            if (markerNodeId) {
                markerNodeId = null;
            }
            if (currentMarker) {
                currentMarker.remove(); 
            }
            fromNodeInput.value = ''; // Clear the input field
            fromNodeId.value = ''; // Clear the hidden input
            fromNodeDropdown.style.display = 'none'; // Hide the dropdown
            currentFromCategory = category;
        } else {
            toNodeInput.value = ''; // Clear the input field
            toNodeId.value = ''; // Clear the hidden input
            toNodeDropdown.style.display = 'none'; // Hide the dropdown
            currentToCategory = category;
        }

        // Update dropdown (will be empty since input is cleared)
        if (inputType === 'from') {
            updateDropdown(fromNodeInput, fromNodeDropdown, fromNodeId, category, '');
        } else {
            updateDropdown(toNodeInput, toNodeDropdown, toNodeId, category, '');
        }
    });
});

/*

document.addEventListener('click', (e) => {
    const fromDropdownArea = fromNodeDropdown.contains(e.target) || fromNodeInput.contains(e.target);
    const toDropdownArea = toNodeDropdown.contains(e.target) || toNodeInput.contains(e.target);

    // Only hide if dropdowns are visible and click is outside
    if (fromNodeDropdown.style.display === 'block' && !fromDropdownArea) {
        fromNodeDropdown.style.display = 'none';
    }
    if (toNodeDropdown.style.display === 'block' && !toDropdownArea) {
        toNodeDropdown.style.display = 'none';
    }
});

*/
    
        // Set up input listeners
        fromNodeInput.addEventListener('input', (e) => {
            updateDropdown(fromNodeInput, fromNodeDropdown, fromNodeId, currentFromCategory, e.target.value);
        });
    
        toNodeInput.addEventListener('input', (e) => {
            updateDropdown(toNodeInput, toNodeDropdown, toNodeId, currentToCategory, e.target.value);
        });
    


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
    window.closeRouteModal = closeModal();
    
    // Cancel button closes the modal
    cancelRouteModalBtn.addEventListener('click', closeModal);
    
    // Handle route finding
   
    findRouteModalBtn.addEventListener('click', () => {
        const startNodeId = markerNodeId || fromNodeId.value;
        const endNodeId = toNodeId.value;

        closeModal();

        console.log('Starting route calculation with:', { startNodeId, endNodeId }); // Debug log

        if (!startNodeId || !endNodeId) {
            alert("Please select valid locations from the dropdowns");
            return;
        }

        if (!graph[startNodeId] || !graph[endNodeId]) {
            alert("One or both of the specified nodes do not exist in the graph.");
            return;
        }

        const existingStepsModal = document.getElementById('stepsModal');
        if (existingStepsModal) {
            existingStepsModal.remove();
        }
    
        // Find the start node's floor
        const startNodeData = nodesData.features.find(feature => feature.properties.NODE_ID === startNodeId);
        
        if (startNodeData) {
            const floorMap = {
                '-1': 'basement',
                '0': 'ground',
                '1': 'first',
                '2': 'second'
            };

            const startFloor = startNodeData.properties.Floor;
            
            const floorNumberButtons = document.querySelectorAll('.floor-number');
            const targetButton = Array.from(floorNumberButtons).find(btn => 
                btn.dataset.floor === floorMap[startFloor]
            );

            if (targetButton) {
                targetButton.click();
            }
        }

        let routeTime = {
            minutes: timeMinutes,
            seconds: remainingSeconds
        };
    
        // Find route using Dijkstra algorithm
        
        const route = dijkstra(graph, nodesData, startNodeId, endNodeId, timeData);

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
    if (currentMarker) {
        currentMarker.remove();
    }
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

                if (currentMarker) {
                    currentMarker.remove();
                }
                if (markerNodeId) {
                    markerNodeId = null;
                }

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
    