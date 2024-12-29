
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

];


const doctorsData = [
{ name: "Dr. Smith - Computer Science", nodeId: [NODE_010] },
{ name: "Dr. Johnson - Mathematics", nodeId: "NODE_017" },
