import { dijkstra, buildGraph } from './dijkstra.js'; 
import { initializeRouteModal } from './modals.js';
import { setupRoomClickHandler } from './roomClickHandler.js';


mapboxgl.accessToken = 'pk.eyJ1IjoiaGFtZWRoYWRhZCIsImEiOiJjbTNsdHBwaG4wbXo1MmxzZHQ2bGM2azFvIn0.pp7ow3gyNYL7pIA0ZQmHuw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/hamedhadad/cm3xvrod9003g01sgap1cftwo',
    center: [35.1820, 31.96000],
    zoom: 16,
    pitch: 0,
    bearing: 0,
    doubleClickZoom: false
});

let currentView = 'building';
let nodesDataGlobal = null;
let graphGlobal = null;
let buildingFloor = 'ground';


// Create a room to node mapping
const roomToNodeMapping = {
    '162': 'NODE_017',
    '150': 'NODE_041',
    '152': 'NODE_027',
    '101': 'NODE_035',
    '102': 'NODE_001',
    '112': 'NODE_034',
    '116': 'NODE_010',

    // Add more mappings as needed
};

function calculateDistance(point1, point2) {
    const [x1, y1] = point1;
    const [x2, y2] = point2;
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Function to find the closest node
function findClosestNode(coordinates, nodesData) {
    let closestNode = null;
    let minDistance = Infinity;

    nodesData.features.forEach(node => {
        const nodeCoords = [node.properties.X, node.properties.Y];
        const distance = calculateDistance(coordinates, nodeCoords);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestNode = node.properties.NODE_ID;
        }
    });

    return closestNode;
}

map.on('load', function() {
    // Create an array to track loaded data sources
    const dataSources = [
        { url: 'assets/Basement_Floor.geojson', type: 'basement-floor' },  
        { url: 'assets/Ground_Floor.geojson', type: 'ground-floor' },
        { url: 'assets/First_Floor.geojson', type: 'first-floor' },
        { url: 'assets/Second_Floor.geojson', type: 'second-floor' },
        { url: 'assets/BZUBuildings.geojson', type: 'building-layer' },
        { url: 'assets/Nodes.geojson', type: 'nodes' },
        { url: 'assets/Edges.geojson', type: 'edges' },
        { url: 'assets/Stairs.geojson', type: 'stairs' },
        { url: 'assets/Rooms_B.geojson', type: 'rooms-basement' },
        { url: 'assets/Rooms_G.geojson', type: 'rooms-ground' },
        { url: 'assets/Rooms_F.geojson', type: 'rooms-first' },
        { url: 'assets/Rooms_S.geojson', type: 'rooms-second' }
    
    ];

    // Function to load a single data source
    async function loadDataSource(sourceConfig) {
        try {
            const response = await fetch(sourceConfig.url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Add source to map
            map.addSource(sourceConfig.type, {
                type: 'geojson',
                data: data
            });

            // Add layers based on source type
            switch (sourceConfig.type) {
                case 'ground-floor':
                    map.addLayer({
                        id: 'ground-floor-3d',
                        type: 'fill-extrusion',
                        source: 'ground-floor',
                        layout: { visibility: 'none' },
                        paint: {
                            'fill-extrusion-color': '#9c9292',
                            'fill-extrusion-opacity': 1,
                            'fill-extrusion-height': 2,
                            'fill-extrusion-base': 0
                        }
                    });
                    break;

                case 'first-floor':
                    map.addLayer({
                        id: 'first-floor-3d',
                        type: 'fill-extrusion',
                        source: 'first-floor',
                        layout: { visibility: 'none' },
                        paint: {
                            'fill-extrusion-color': '#9c9292',
                            'fill-extrusion-opacity': 1,
                            'fill-extrusion-height': 2,
                            'fill-extrusion-base': 0
                        }
                    });
                    break;

                case 'second-floor':
                    map.addLayer({
                        id: 'second-floor-3d',
                        type: 'fill-extrusion',
                        source: 'second-floor',
                        layout: { visibility: 'none' },
                        paint: {
                            'fill-extrusion-color': '#9c9292',
                            'fill-extrusion-opacity': 1,
                            'fill-extrusion-height': 2,
                            'fill-extrusion-base': 0
                        }
                    });
                    break;

                case 'basement-floor':
                    map.addLayer({
                        id: 'basement-floor-3d',
                        type: 'fill-extrusion',
                        source: 'basement-floor',
                        layout: { visibility: 'none' },
                        paint: {
                            'fill-extrusion-color': '#9c9292',
                            'fill-extrusion-opacity': 1,
                            'fill-extrusion-height': 2,
                            'fill-extrusion-base': 0
                        }
                    });
                    break;

                case 'building-layer':
                    map.addLayer({
                        id: 'building-layer-3d',
                        type: 'fill-extrusion',
                        source: 'building-layer',
                        paint: {
                            'fill-extrusion-color': '#e0d8d3',
                            'fill-extrusion-opacity': 1,
                            'fill-extrusion-height': 15,
                            'fill-extrusion-base': 0,
                            // Shadow-like effect
                            'fill-extrusion-color-transition': {
                                duration: 500
                            },
                            'fill-extrusion-vertical-gradient': true // Creates a gradient effect that mimics shadowing
                        }
                    });

                    map.setLight({
                        anchor: 'viewport',
                        color: 'white',
                        intensity: 0.3,
                        position: [190, 30, 60]
                    });

                    break;

                case 'nodes':
                    map.addLayer({
                        id: 'nodes-layer',
                        type: 'circle',
                        source: 'nodes',
                        layout: { visibility: 'none' },
                        paint: {
                            'circle-radius': 6,
                            'circle-color': '#ff5733'
                        }
                    });

                    map.addLayer({
                        id: 'node-labels',
                        type: 'symbol',
                        source: 'nodes',
                        layout: {
                            visibility: 'none',
                            'text-field': ['get', 'NODE_ID'],
                            'text-size': 12,
                            'text-anchor': 'top',
                            'text-offset': [0, 1.5]
                        },
                        paint: {
                            'text-color': '#000000',
                            'text-halo-color': '#ffffff',
                            'text-halo-width': 2
                        }
                    });
                    break;

                case 'edges':
                    map.addLayer({
                        id: 'edges-layer',
                        type: 'line',
                        source: 'edges',
                        layout: { visibility: 'none' },
                        paint: {
                            'line-color': '#00f',
                            'line-width': 2
                        }
                    });
                    break;

                case 'stairs':
                    map.addLayer({
                        id: 'stairs-3d',
                        type: 'fill-extrusion',
                        source: 'stairs',
                        layout: { visibility: 'none' },
                        paint: {
                            'fill-extrusion-color': '#9c9292',
                            'fill-extrusion-opacity': 0.7,
                            'fill-extrusion-height': ['get', 'Height'],
                            'fill-extrusion-base': 0
                        }
                    });

                    break;

                    case 'rooms-ground':
                        map.addLayer({
                            id: 'rooms-ground-3d',
                            type: 'fill-extrusion',
                            source: 'rooms-ground',
                            layout: { visibility: 'none' },
                            paint: {
                                'fill-extrusion-color': '#32a852',
                                'fill-extrusion-opacity': 0.3,
                                'fill-extrusion-height': 2,
                                'fill-extrusion-base': 0
                            }
                        });
                    
                        map.addLayer({
                            id: 'highlighted-room-ground',
                            type: 'fill-extrusion',
                            source: 'rooms-ground',
                            layout: { visibility: 'none' },
                            paint: {
                                'fill-extrusion-color': '#c0392b',
                                'fill-extrusion-height': 2,
                                'fill-extrusion-opacity': 0,
                            }
                        }, 'rooms-ground-3d');
                    
                        map.addLayer({
                            id: 'room-labels-ground',
                            type: 'symbol',
                            source: 'rooms-ground',
                            layout: {
                                visibility: 'none',
                                'text-field': ['get', 'N'],
                                'text-size': 14,
                                'text-anchor': 'center'
                            },
                            paint: {
                                'text-color': '#000000',
                                'text-halo-color': '#ffffff',
                                'text-halo-width': 2
                            }
                        });
                        break;
                    
                    case 'rooms-basement':
                        // Same structure as rooms-ground but with basement-specific IDs
                        map.addLayer({
                            id: 'rooms-basement-3d',
                            type: 'fill-extrusion',
                            source: 'rooms-basement',
                            layout: { visibility: 'none' },
                            paint: {
                                'fill-extrusion-color': '#32a852',
                                'fill-extrusion-opacity': 0.3,
                                'fill-extrusion-height': 2,
                                'fill-extrusion-base': 0
                            }
                        });
                    
                        map.addLayer({
                            id: 'highlighted-room-basement',
                            type: 'fill-extrusion',
                            source: 'rooms-basement',
                            layout: { visibility: 'none' },
                            paint: {
                                'fill-extrusion-color': '#c0392b',
                                'fill-extrusion-height': 2,
                                'fill-extrusion-opacity': 0,
                            }
                        }, 'rooms-basement-3d');
                    
                        map.addLayer({
                            id: 'room-labels-basement',
                            type: 'symbol',
                            source: 'rooms-basement',
                            layout: {
                                visibility: 'none',
                                'text-field': ['get', 'n'],
                                'text-size': 14,
                                'text-anchor': 'center'
                            },
                            paint: {
                                'text-color': '#000000',
                                'text-halo-color': '#ffffff',
                                'text-halo-width': 2
                            }
                        });
                        break;
                    
                    case 'rooms-first':
                        // Same structure for first floor
                        map.addLayer({
                            id: 'rooms-first-3d',
                            type: 'fill-extrusion',
                            source: 'rooms-first',
                            layout: { visibility: 'none' },
                            paint: {
                                'fill-extrusion-color': '#32a852',
                                'fill-extrusion-opacity': 0.3,
                                'fill-extrusion-height': 2,
                                'fill-extrusion-base': 0
                            }
                        });
                    
                        map.addLayer({
                            id: 'highlighted-room-first',
                            type: 'fill-extrusion',
                            source: 'rooms-first',
                            layout: { visibility: 'none' },
                            paint: {
                                'fill-extrusion-color': '#c0392b',
                                'fill-extrusion-height': 2,
                                'fill-extrusion-opacity': 0,
                            }
                        }, 'rooms-first-3d');
                    
                        map.addLayer({
                            id: 'room-labels-first',
                            type: 'symbol',
                            source: 'rooms-first',
                            layout: {
                                visibility: 'none',
                                'text-field': ['get', 'N'],
                                'text-size': 14,
                                'text-anchor': 'center'
                            },
                            paint: {
                                'text-color': '#000000',
                                'text-halo-color': '#ffffff',
                                'text-halo-width': 2
                            }
                        });
                        break;
                    
                    case 'rooms-second':
                        // Same structure for second floor
                        map.addLayer({
                            id: 'rooms-second-3d',
                            type: 'fill-extrusion',
                            source: 'rooms-second',
                            layout: { visibility: 'none' },
                            paint: {
                                'fill-extrusion-color': '#32a852',
                                'fill-extrusion-opacity': 0.3,
                                'fill-extrusion-height': 2,
                                'fill-extrusion-base': 0
                            }
                        });
                    
                        map.addLayer({
                            id: 'highlighted-room-second',
                            type: 'fill-extrusion',
                            source: 'rooms-second',
                            layout: { visibility: 'none' },
                            paint: {
                                'fill-extrusion-color': '#c0392b',
                                'fill-extrusion-height': 2,
                                'fill-extrusion-opacity': 0,
                            }
                        }, 'rooms-second-3d');
                    
                        map.addLayer({
                            id: 'room-labels-second',
                            type: 'symbol',
                            source: 'rooms-second',
                            layout: {
                                visibility: 'none',
                                'text-field': ['get', 'N'],
                                'text-size': 14,
                                'text-anchor': 'center'
                            },
                            paint: {
                                'text-color': '#000000',
                                'text-halo-color': '#ffffff',
                                'text-halo-width': 2
                            }
                            
                        });
                        break;
            }
            return data;
        } catch (error) {
            console.error(`Error loading ${sourceConfig.url}:`, error);
        }
    }
    

    // Load all data sources
    Promise.all(dataSources.map(loadDataSource))
        .then(results => {
            const nodesData = results.find(data => data && data.type === 'FeatureCollection' && data.features[0]?.properties.NODE_ID);
            const edgesData = results.find(data => data && data.type === 'FeatureCollection' && data.features[0]?.properties.Start_NODE);

            if (nodesData && edgesData) {
                const graph = buildGraph(edgesData);

                
                nodesDataGlobal = nodesData; 

                graphGlobal = graph;
                const getCurrentFloor = () => buildingFloor;
                initializeRouteModal(map, graph, nodesData, dijkstra, getCurrentFloor);

                
                // Set up room click handler with the extracted function
                setupRoomClickHandler(map, roomToNodeMapping, findClosestNode, nodesDataGlobal, getCurrentFloor);
            }
        });

    // Toggle View Button
    document.getElementById('toggleViewButton').addEventListener('click', function () {
        if (window.clearRouteLayers) {
            window.clearRouteLayers();
        }
        
        const currentFloor = buildingFloor;
    
        if (currentView === 'building') {
            // Hide Building layer
            map.setLayoutProperty('building-layer-3d', 'visibility', 'none');
            
            // Hide all floor layers first
            map.setLayoutProperty('ground-floor-3d', 'visibility', 'none');
            map.setLayoutProperty('first-floor-3d', 'visibility', 'none');
            map.setLayoutProperty('basement-floor-3d', 'visibility', 'none');
            map.setLayoutProperty('second-floor-3d', 'visibility', 'none');
            
            // Hide all room layers first
            ['ground', 'first', 'basement', 'second'].forEach(floor => {
                map.setLayoutProperty(`rooms-${floor}-3d`, 'visibility', 'none');
                map.setLayoutProperty(`room-labels-${floor}`, 'visibility', 'none');
                map.setLayoutProperty(`highlighted-room-${floor}`, 'visibility', 'none');
            });
            
            // Show layers based on current floor
            if (currentFloor === 'ground') {
                map.setLayoutProperty('ground-floor-3d', 'visibility', 'visible');
                map.setLayoutProperty('rooms-ground-3d', 'visibility', 'visible');
                map.setLayoutProperty('room-labels-ground', 'visibility', 'visible');
                map.setLayoutProperty('highlighted-room-ground', 'visibility', 'visible');
            } else if (currentFloor === 'first') {
                map.setLayoutProperty('first-floor-3d', 'visibility', 'visible');
                map.setLayoutProperty('rooms-first-3d', 'visibility', 'visible');
                map.setLayoutProperty('room-labels-first', 'visibility', 'visible');
                map.setLayoutProperty('highlighted-room-first', 'visibility', 'visible');
            } else if (currentFloor === 'basement') {
                map.setLayoutProperty('basement-floor-3d', 'visibility', 'visible');
                map.setLayoutProperty('rooms-basement-3d', 'visibility', 'visible');
                map.setLayoutProperty('room-labels-basement', 'visibility', 'visible');
                map.setLayoutProperty('highlighted-room-basement', 'visibility', 'visible');
            } else if (currentFloor === 'second') {
                map.setLayoutProperty('second-floor-3d', 'visibility', 'visible');
                map.setLayoutProperty('rooms-second-3d', 'visibility', 'visible');
                map.setLayoutProperty('room-labels-second', 'visibility', 'visible');
                map.setLayoutProperty('highlighted-room-second', 'visibility', 'visible');
            }
    
            // Show common elements
            map.setLayoutProperty('stairs-3d', 'visibility', 'visible');
            
            map.flyTo({ center: [35.1826, 31.96065], zoom: 20.5 });
            currentView = 'floor-view';
    
        } else {
            // Hide all floor layers
            map.setLayoutProperty('ground-floor-3d', 'visibility', 'none');
            map.setLayoutProperty('first-floor-3d', 'visibility', 'none');
            map.setLayoutProperty('basement-floor-3d', 'visibility', 'none');
            map.setLayoutProperty('second-floor-3d', 'visibility', 'none');
            map.setLayoutProperty('stairs-3d', 'visibility', 'none');
    
            // Hide all room layers for all floors
            ['ground', 'first', 'basement', 'second'].forEach(floor => {
                map.setLayoutProperty(`rooms-${floor}-3d`, 'visibility', 'none');
                map.setLayoutProperty(`room-labels-${floor}`, 'visibility', 'none');
                map.setLayoutProperty(`highlighted-room-${floor}`, 'visibility', 'none');
            });
    
            // Show building
            map.setLayoutProperty('building-layer-3d', 'visibility', 'visible');
            
            map.flyTo({ center: [35.1820, 31.96000], zoom: 17 });
            currentView = 'building';
        }
    });

    // Pitch Toggle Button
    document.getElementById('togglePitchButton').addEventListener('click', function() {
        const currentPitch = map.getPitch();
        if (currentPitch === 0) {
            map.setPitch(45);
        } else {
            map.setPitch(0);
        }
    });
});



// Floor Selector Logic
document.addEventListener('DOMContentLoaded', () => {
    const floorSelector = document.querySelector('.floor-selector');
    const floorNumbers = document.querySelector('.floor-numbers');
    const floorNumberButtons = document.querySelectorAll('.floor-number');
    const currentFloorSpan = document.querySelector('.current-floor');


    

    // Toggle floor numbers dropdown
    floorSelector.addEventListener('click', (e) => {
        if (e.target.closest('.floor-selector-icon') || e.target.closest('.floor-selector')) {
            floorNumbers.classList.toggle('active');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        
        if (!floorSelector.contains(e.target)) {
            floorNumbers.classList.remove('active');
        }
    });

    // Floor selection logic
    // Floor selection logic
floorNumberButtons.forEach(button => {
    button.addEventListener('click', () => {
        const floor = button.dataset.floor;
        
        buildingFloor = floor;
        console.log('Updated Current Floor:', buildingFloor);

        // Remove active state from all buttons
        floorNumberButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Update current floor span
        currentFloorSpan.textContent = button.textContent;

        // Hide all floor layers
        map.setLayoutProperty('ground-floor-3d', 'visibility', 'none');
        map.setLayoutProperty('first-floor-3d', 'visibility', 'none');
        map.setLayoutProperty('basement-floor-3d', 'visibility', 'none');
        map.setLayoutProperty('second-floor-3d', 'visibility', 'none');

        // Hide all room layers for every floor
        // Ground floor rooms
        map.setLayoutProperty('rooms-ground-3d', 'visibility', 'none');
        map.setLayoutProperty('room-labels-ground', 'visibility', 'none');
        map.setLayoutProperty('highlighted-room-ground', 'visibility', 'none');

        // First floor rooms
        map.setLayoutProperty('rooms-first-3d', 'visibility', 'none');
        map.setLayoutProperty('room-labels-first', 'visibility', 'none');
        map.setLayoutProperty('highlighted-room-first', 'visibility', 'none');

        // Basement rooms
        map.setLayoutProperty('rooms-basement-3d', 'visibility', 'none');
        map.setLayoutProperty('room-labels-basement', 'visibility', 'none');
        map.setLayoutProperty('highlighted-room-basement', 'visibility', 'none');

        // Second floor rooms
        map.setLayoutProperty('rooms-second-3d', 'visibility', 'none');
        map.setLayoutProperty('room-labels-second', 'visibility', 'none');
        map.setLayoutProperty('highlighted-room-second', 'visibility', 'none');

        // Show selected floor layers and its corresponding rooms
        if (floor === 'ground') {
            map.setLayoutProperty('building-layer-3d', 'visibility', 'none');
            map.setLayoutProperty('stairs-3d', 'visibility', 'visible');
            map.setLayoutProperty('ground-floor-3d', 'visibility', 'visible');
            map.setLayoutProperty('rooms-ground-3d', 'visibility', 'visible');
            map.setLayoutProperty('room-labels-ground', 'visibility', 'visible');
            map.setLayoutProperty('highlighted-room-ground', 'visibility', 'visible');
            
            // Reset room colors and highlighting
            map.setPaintProperty('rooms-ground-3d', 'fill-extrusion-color', '#32a852');
            map.setPaintProperty('rooms-ground-3d', 'fill-extrusion-opacity', 0.3);
            map.setFilter('highlighted-room-ground', ['==', ['get', 'N'], '']);
            map.setPaintProperty('highlighted-room-ground', 'fill-extrusion-opacity', 0);

        } else if (floor === 'first') {
            map.setLayoutProperty('building-layer-3d', 'visibility', 'none');
            map.setLayoutProperty('stairs-3d', 'visibility', 'visible');
            map.setLayoutProperty('first-floor-3d', 'visibility', 'visible');
            map.setLayoutProperty('rooms-first-3d', 'visibility', 'visible');
            map.setLayoutProperty('room-labels-first', 'visibility', 'visible');
            map.setLayoutProperty('highlighted-room-first', 'visibility', 'visible');
            
            // Reset room colors and highlighting
            map.setPaintProperty('rooms-first-3d', 'fill-extrusion-color', '#32a852');
            map.setPaintProperty('rooms-first-3d', 'fill-extrusion-opacity', 0.3);
            map.setFilter('highlighted-room-first', ['==', ['get', 'N'], '']);
            map.setPaintProperty('highlighted-room-first', 'fill-extrusion-opacity', 0);

        } else if (floor === 'basement') {
            map.setLayoutProperty('building-layer-3d', 'visibility', 'none');
            map.setLayoutProperty('stairs-3d', 'visibility', 'visible');
            map.setLayoutProperty('basement-floor-3d', 'visibility', 'visible');
            map.setLayoutProperty('rooms-basement-3d', 'visibility', 'visible');
            map.setLayoutProperty('room-labels-basement', 'visibility', 'visible');
            map.setLayoutProperty('highlighted-room-basement', 'visibility', 'visible');
            
            // Reset room colors and highlighting
            map.setPaintProperty('rooms-basement-3d', 'fill-extrusion-color', '#32a852');
            map.setPaintProperty('rooms-basement-3d', 'fill-extrusion-opacity', 0.3);
            map.setFilter('highlighted-room-basement', ['==', ['get', 'n'], '']);
            map.setPaintProperty('highlighted-room-basement', 'fill-extrusion-opacity', 0);

        } else if (floor === 'second') {
            map.setLayoutProperty('building-layer-3d', 'visibility', 'none');
            map.setLayoutProperty('stairs-3d', 'visibility', 'visible');
            map.setLayoutProperty('second-floor-3d', 'visibility', 'visible');
            map.setLayoutProperty('rooms-second-3d', 'visibility', 'visible');
            map.setLayoutProperty('room-labels-second', 'visibility', 'visible');
            map.setLayoutProperty('highlighted-room-second', 'visibility', 'visible');
            
            // Reset room colors and highlighting
            map.setPaintProperty('rooms-second-3d', 'fill-extrusion-color', '#32a852');
            map.setPaintProperty('rooms-second-3d', 'fill-extrusion-opacity', 0.3);
            map.setFilter('highlighted-room-second', ['==', ['get', 'N'], '']);
            map.setPaintProperty('highlighted-room-second', 'fill-extrusion-opacity', 0);
        }

        // Close dropdown
        floorNumbers.classList.remove('active');
    });
});
});

document.querySelectorAll('.floor-number').forEach(button => {
    button.addEventListener('mousedown', (e) => {
        // This event will only trigger on actual user clicks
        if (window.clearRouteLayers) {
            window.clearRouteLayers();
            console.log('Route modal closed by user click');
        }
    });
});




