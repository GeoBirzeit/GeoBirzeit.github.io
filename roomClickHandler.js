export function setupRoomClickHandler(map, roomToNodeMapping, findClosestNode, nodesDataGlobal, getCurrentFloor) {
    let selectedRoom = null;
    const floors = ['ground', 'first', 'basement', 'second'];
    
    // Define layer names for each floor
    const getLayerNames = (floor) => ({
        roomLayer: `rooms-${floor}-3d`,
        highlightLayer: `highlighted-room-${floor}`,
        labelLayer: `room-labels-${floor}`
    });

    // Helper function to validate layer existence
    function layerExists(layerId) {
        if (!map.getLayer(layerId)) {
            console.warn(`Layer ${layerId} not found!`);
            return false;
        }
        return true;
    }

    // Helper function to safely update layer properties
    function safeLayerUpdate(layerId, updateType, ...args) {
        if (!layerExists(layerId)) return;
        
        try {
            switch (updateType) {
                case 'paint':
                    map.setPaintProperty(layerId, ...args);
                    break;
                case 'filter':
                    map.setFilter(layerId, ...args);
                    break;
                case 'layout':
                    map.setLayoutProperty(layerId, ...args);
                    break;
                default:
                    console.warn(`Unknown update type: ${updateType}`);
            }
        } catch (error) {
            console.error(`Error updating ${layerId} (${updateType}):`, error);
        }
    }

    // Reset all floor rooms
    function resetAllFloors() {
        floors.forEach(floor => {
            const { roomLayer, highlightLayer } = getLayerNames(floor);

            safeLayerUpdate(roomLayer, 'paint', 'fill-extrusion-color', '#32a852');
            safeLayerUpdate(roomLayer, 'paint', 'fill-extrusion-opacity', 0.3);
            safeLayerUpdate(highlightLayer, 'filter', ['==', ['get', floor === 'basement' ? 'n' : 'N'], '']);
            safeLayerUpdate(highlightLayer, 'paint', 'fill-extrusion-opacity', 0);
        });
    }

    // Handle global map clicks
    map.on('click', (e) => {
        // Query all room layers
        const features = map.queryRenderedFeatures(e.point, {
            layers: floors.map(floor => `rooms-${floor}-3d`)
        });
        
        if (features.length === 0) {
            resetAllFloors();
            selectedRoom = null;
        }
    });

    // Setup flash animation
    function flashRoom(highlightedLayerId) {
        let flashCount = 0;
        const maxFlashes = 6;
        const flashDuration = 200;
        let flashInterval;

        // Clear any existing interval
        if (window.activeFlashInterval) {
            clearInterval(window.activeFlashInterval);
        }

        flashInterval = setInterval(() => {
            if (!layerExists(highlightedLayerId)) {
                clearInterval(flashInterval);
                return;
            }

            const opacity = flashCount % 2 === 0 ? 0.6 : 0;
            safeLayerUpdate(highlightedLayerId, 'paint', 'fill-extrusion-opacity', opacity);
            flashCount++;

            if (flashCount >= maxFlashes) {
                clearInterval(flashInterval);
                safeLayerUpdate(highlightedLayerId, 'paint', 'fill-extrusion-opacity', 0.6);
            }
        }, flashDuration);

        window.activeFlashInterval = flashInterval;
    }

    // Handle room clicks for a specific floor
    function setupFloorRoomClickHandler(floor) {
        const { roomLayer, highlightLayer } = getLayerNames(floor);
        const propertyKey = floor === 'basement' ? 'n' : 'N';

        if (!layerExists(roomLayer)) return;

        // Use mouseenter to highlight rooms
        map.on('mouseenter', roomLayer, () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', roomLayer, () => {
            map.getCanvas().style.cursor = '';
        });

        // Handle room clicks
        map.on('click', roomLayer, (e) => {
            if (!e.features || !e.features[0]) {
                console.warn('No features found in click event');
                return;
            }

            const roomFeature = e.features[0];
            const roomNumber = roomFeature.properties[propertyKey];
            
            if (!roomNumber) {
                console.warn('No room number found in feature properties');
                return;
            }

            // Prevent the click event from bubbling
            if (e.originalEvent) {
                e.originalEvent.stopPropagation();
            }

            selectedRoom = roomNumber;

            // Update room colors
            safeLayerUpdate(roomLayer, 'paint', 'fill-extrusion-color', [
                'case',
                ['==', ['get', propertyKey], roomNumber],
                '#c0392b',
                '#32a852'
            ]);

            // Update highlighted room
            safeLayerUpdate(highlightLayer, 'filter', ['==', ['get', propertyKey], roomNumber]);
            flashRoom(highlightLayer);

            // Handle routing
           
        });
    }

    // Initialize handlers for all floors
    floors.forEach(setupFloorRoomClickHandler);
}