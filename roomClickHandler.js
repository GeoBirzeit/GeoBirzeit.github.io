export function setupRoomClickHandler(map, roomToNodeMapping, nodesDataGlobal, getCurrentFloor, updateRoute) {
    let selectedRoom = null;

    map.on('click', () => {
        map.setPaintProperty('rooms-3d', 'fill-extrusion-color', '#32a852');
        map.setPaintProperty('rooms-3d', 'fill-extrusion-opacity', 0.3);
        map.setFilter('highlighted-room', ['==', ['get', 'Room_Num'], '']);
        map.setPaintProperty('highlighted-room', 'fill-extrusion-opacity', 0);
    });

    if (!map.getLayer('rooms-3d')) {
        console.error('rooms-3d layer not found!');
        return;
    }

    map.on('click', 'rooms-3d', (e) => {
        const roomFeature = e.features[0];
        const roomNumber = roomFeature.properties.Room_Num;
        selectedRoom = roomNumber;
    
        try {
            map.setPaintProperty('rooms-3d', 'fill-extrusion-color', [
                'case',
                ['==', ['get', 'Room_Num'], roomNumber],
                '#c0392b',
                '#32a852'
            ]);
        } catch (error) {
            console.error('Error setting paint properties:', error);
        }
    
        try {
            map.setFilter('highlighted-room', ['==', ['get', 'Room_Num'], roomNumber]);
        } catch (error) {
            console.error('Error setting room filter:', error);
        }
    
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            const opacity = flashCount % 2 === 0 ? 0.6 : 0;
            map.setPaintProperty('highlighted-room', 'fill-extrusion-opacity', opacity);
            flashCount++;
    
            if (flashCount >= 6) {
                clearInterval(flashInterval);
                map.setPaintProperty('highlighted-room', 'fill-extrusion-opacity', 0.6);
            }
        }, 200);

        const mappedNode = roomToNodeMapping[roomNumber];
        if (mappedNode) {
            updateRoute(null, mappedNode);
        }
    });
}