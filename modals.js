
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
    { name: "Azeez Shaheen Arts Building", nodeId: "NODE_011" },
    { name: "Mohamed Bamieh and Waleed Kayyali Building / Physical Education Building", nodeId: "NODE_315" },
    { name: "Shuky Azeez Shaheen Building / University Halls Building", nodeId: "NODE_316" },
    { name: "Kingdom Of Bahrain Building For Women Studies", nodeId: "NODE_640" },
    { name: "Said Khoury Building For Development Studies", nodeId: "NODE_295" },
    { name: "Mohammed Al-Masrouji Media Building", nodeId: "NODE_641" },
    { name: "Muneeb Rashid Al Masry for Construction / Information Technology Building", nodeId: "NODE_294" },
    { name: "Mohammed Imran Bamia Building/Education Building", nodeId: "NODE_292" },
    { name: "Riyadh Tawfiq Al-Sadiq Building / Law and Public Administration Building", nodeId: "NODE_291" },
    { name: "Naseeb Azeez Shaheen Auditorium", nodeId: "NODE_301" },
    { name: "Ghaleb Younis Building / Pharmacy, Nursing and Health Professions Building", nodeId: "NODE_300" },
    { name: "Samir Awida Building / Art, Music and Design Building", nodeId: "NODE_305" },
    { name: "Engineering workshop building", nodeId: "NODE_308" },
    { name: "Omar Al-Aggad Engineering Building", nodeId: "NODE_631" },
    { name: "Law Building", nodeId: "NODE_336" },
    { name: "Walid and Helen Kattan Building", nodeId: "NODE_335" },
    { name: "Naseeb Shaheen Building/Graduate Studies Building", nodeId: "NODE_327" },
    { name: "Abdul Rahman Al-Jeraisy Building / College of Business and Economics Building", nodeId: "NODE_650" },
    { name: "Abdul Hadi Building / Business and Economics Building2", nodeId: "NODE_325" },
    { name: "Sameer Abdel Hadi Building/Science Building - Mathematics Wing", nodeId: "NODE_317" },
    { name: "Faculty of Science Building", nodeId: "NODE_643" },

    // Arabic names
    { name: "عزيز شاهين مبنى الاداب", nodeId: "NODE_011" },
    { name: "مبنى محمد بامية ووليد كيالي / مبنى التربية البدنية", nodeId: "NODE_315" },
    { name: "مبنى شوكي عزيز شاهين / مبنى قاعات الجامعة", nodeId: "NODE_316" },
    { name: "مملكة البحرين مبنى لدراسات المرأة", nodeId: "NODE_640" },
    { name: "سعيد خوري مبنى لدراسات التنمية", nodeId: "NODE_295" },
    { name: "امبنى محمد المسروجي الإعلامي/الاعلام", nodeId: "NODE_641" },
    { name: "منيب راشد المصري للبناء / مبنى تكنولوجيا المعلومات", nodeId: "NODE_294" },
    { name: "محمد عمران مبنى بامية/ مبنى التعليم", nodeId: "NODE_292" },
    { name: "مبنى رياض توفيق الصادق/ مبنى القانون والادارة العامة", nodeId: "NODE_291" },
    { name: "قاعة نسيب عزيز شاهين - المسرح", nodeId: "NODE_301" },
    { name: "مبنى غالب يونس / مبنى الصيدلية والتمريض ومهن صحية", nodeId: "NODE_300" },
    { name: "مبنى سمير عويضة / مبنى الفن والموسيقى والتصميم", nodeId: "NODE_305" },
    { name: "مبنى الورش الهندسية", nodeId: "NODE_308" },
    { name: "مبنى عمر العقاد للهندسة", nodeId: "NODE_631" },
    { name: "مبنى الحقوق", nodeId: "NODE_336" },
    { name: "مبنى وليد وهيلين قطان", nodeId: "NODE_335" },
    { name: "مبنى نسيب شاهين /مبنى الدراسات العليا", nodeId: "NODE_327" },
    { name: "مبنى عبد الرحمن الجريسي / مبنى كلية الأعمال والاقتصاد/ التجارة القديم", nodeId: "NODE_650" },
    { name: " التجارة الحديث/مبنى عبد الهادي / مبنى الأعمال والاقتصاد2", nodeId: "NODE_325" },
    { name: "سمير عبد الهادي مبنى/علوم مبنى - جناح الرياضيات", nodeId: "NODE_317" },
    { name: "مبنى كلية العلوم", nodeId: "NODE_643" }
];


const doctorsData = [
    // English names
    { name: "Secretary", nodeId: "NODE_063" },
    { name: "Abdel Halim Tumeiza", nodeId: "NODE_062" },
    { name: "Marwan Ghaleb Marwan Ghaleb Abdelmohsen Ghaleb", nodeId: "NODE_066" },
    { name: "Othman Ali Othman Sharkas", nodeId: "NODE_069" },
    { name: "Mohammad Tayseer Mohammad Kattaneh", nodeId: "NODE_069" },
    { name: "Hussein Ahmad Hussein Rimawi", nodeId: "NODE_071" },
    { name: "Abdullah Saeed Naji Harzallah", nodeId: "NODE_065" },
    { name: "Ahmad Rifaat Mohammad Noubani", nodeId: "NODE_065" },
    { name: "Khalil Abdullah Mutawa Amro", nodeId: "NODE_068" },
    { name: "Omar Li Loren Tisdale", nodeId: "NODE_070" },

    // Arabic names
    { name: "سكرتيرة", nodeId: "NODE_063" },
    { name: "عبد الحليم طميزة", nodeId: "NODE_062" },
    { name: "مروان غالب مروان غالب عبدالمحسن غالب", nodeId: "NODE_066" },
    { name: "عثمان علي عثمان شركس", nodeId: "NODE_069" },
    { name: "محمد تيسير محمد كتانة", nodeId: "NODE_069" },
    { name: "حسين أحمد حسين ريماوي", nodeId: "NODE_071" },
    { name: "عبدالله سعيد ناجي حرزالله", nodeId: "NODE_065" },
    { name: "أحمد رفعت محمد نوباني", nodeId: "NODE_065" },
    { name: "خليل عبدالله مطاوع عمرو", nodeId: "NODE_068" },
    { name: "عمر لي لورين تسدال", nodeId: "NODE_070" }
];

const roomsData = [
    // English names
    { name: "A.Shaheen - Main Entrance", nodeId: "NODE_014" },
    { name: "A.Shaheen - Class - 101", nodeId: "NODE_035" },
    { name: "A.Shaheen - Class - 102", nodeId: "NODE_001" },
    { name: "A.Shaheen - Class - 112", nodeId: "NODE_034" },
    { name: "A.Shaheen - Class - 116", nodeId: "NODE_010" },
    { name: "A.Shaheen - Class - 150", nodeId: "NODE_038" },
    { name: "A.Shaheen - Class - 152", nodeId: "NODE_025" },
    { name: "A.Shaheen - Class - 152", nodeId: "NODE_027" },
    { name: "A.Shaheen - Class - 162", nodeId: "NODE_021" },
    { name: "A.Shaheen - Class - 162", nodeId: "NODE_017" },
    { name: "A.Shaheen - Class - 202", nodeId: "NODE_086" },
    { name: "A.Shaheen - Class - 206", nodeId: "NODE_088" },
    { name: "A.Shaheen - Class - 212", nodeId: "NODE_079" },
    { name: "A.Shaheen - Class - 216", nodeId: "NODE_081" },
    { name: "A.Shaheen - Class - 252", nodeId: "NODE_052" },
    { name: "A.Shaheen - Class - 256", nodeId: "NODE_054" },
    { name: "A.Shaheen - Class - 262", nodeId: "NODE_046" },
    { name: "A.Shaheen - Class - 266", nodeId: "NODE_048" },
    { name: "A.Shaheen - Class - 062", nodeId: "NODE_112" },
    { name: "A.Shaheen - Class - 064", nodeId: "NODE_109" },
    { name: "A.Shaheen - Lab - 002", nodeId: "NODE_137" },
    { name: "A.Shaheen - Lab - 004", nodeId: "NODE_135" },
    { name: "A.Shaheen - Lab - 230", nodeId: "NODE_092" },
    { name: "A.Shaheen - Lab - 231", nodeId: "NODE_091" },
    { name: "A.Shaheen - Lab - 232", nodeId: "NODE_059" },
    { name: "A.Shaheen - Lab - 233", nodeId: "NODE_060" },
    { name: "Printing Press of Arts", nodeId: "NODE_037" },
    { name: "Male Prayer Room", nodeId: "NODE_119" },
    { name: "Female Prayer Room", nodeId: "NODE_121" },
    { name: "Arts Cafeteria", nodeId: "NODE_102" },
    { name: "Arts Cafeteria", nodeId: "NODE_105" },
    { name: "Geography Library", nodeId: "NODE_089" },

    // Arabic names
    { name: "A.Shaheen - المدخل الرئيسي", nodeId: "NODE_014" },
    { name: "مطبعة الاداب", nodeId: "NODE_037" },
    { name: "مصلى الذكور", nodeId: "NODE_119" },
    { name: "مصلى الاناث", nodeId: "NODE_121" },
    { name: "كافيتيريا الاداب", nodeId: "NODE_102" },
    { name: "كافيتيريا الاداب", nodeId: "NODE_105" },
    { name: "مكتبة الجغرافيا", nodeId: "NODE_089" }
];

const departmentData = [
    // English names
    { name: "Geography and Geoinformatics", nodeId: "NODE_630" },
    { name: "Philosophy", nodeId: "NODE_248" },
    { name: "Translation", nodeId: "NODE_205" },
    { name: "History and Archaeology", nodeId: "NODE_227" },
    { name: "English Language", nodeId: "NODE_147" },
    { name: "Arabic Language", nodeId: "NODE_168" },

    // Arabic names
    { name: "الجغرافيا والجيوانفورماتكس", nodeId: "NODE_630" },
    { name: "الفلسفة", nodeId: "NODE_248" },
    { name: "الترجمة", nodeId: "NODE_205" },
    { name: "التاريخ والاثار", nodeId: "NODE_227" },
    { name: "اللغة الانجليزية", nodeId: "NODE_147" },
    { name: "العربي", nodeId: "NODE_168" }
]

const othersData = [
    // English names
    { name: "Abu Ahmed Cafeteria", nodeId: "NODE_642" },
    { name: "Al-Zaim Cafeteria", nodeId: "NODE_334" },
    { name: "The Bank", nodeId: "NODE_289" },
    { name: "Al-Sheni store", nodeId: "NODE_288" },
    { name: "Sheikh Rashid Bin Saeed Al Maktoum Building / Student Complex", nodeId: "NODE_633" },
    { name: "Deanship of Student Affairs", nodeId: "NODE_618" },
    { name: "Student lounge", nodeId: "NODE_285" },
    { name: "Retaj Hall", nodeId: "NODE_284" },
    { name: "Kamal Nasser Hall", nodeId: "NODE_283" },
    { name: "Book Store", nodeId: "NODE_290" },
    { name: "Yousef Ahmed Alghanim Library", nodeId: "NODE_638" },
    { name: "Administration and Finance Building", nodeId: "NODE_649" },
    { name: "The Palestinian Museum", nodeId: "NODE_302" },
    { name: "Birzeit University Museum", nodeId: "NODE_322" },
    { name: "Najad Zini Center of Excellence", nodeId: "NODE_293" },
    { name: "Samih Darwazeh Pharmaceutical Industries Institute", nodeId: "NODE_546" },
    { name: "Ali Al-Hajj Stadium", nodeId: "NODE_651" },
    { name: "Electric Generator", nodeId: "NODE_313" },

    // Arabic names
    { name: "كافتيريا ابو احمد", nodeId: "NODE_642" },
    { name: "كافتيريا الزعيم", nodeId: "NODE_334" },
    { name: "البنك", nodeId: "NODE_289" },
    { name: "الشني", nodeId: "NODE_288" },
    { name: "الشيخ راشد بن سعيد مبنى آل مكتوم / مجمع الطلاب", nodeId: "NODE_633" },
    { name: "عمادة شؤون الطلبة", nodeId: "NODE_618" },
    { name: "استراحة الطلبة", nodeId: "NODE_285" },
    { name: "قاعة ريتاج", nodeId: "NODE_284" },
    { name: "قاعة كمال ناصر", nodeId: "NODE_283" },
    { name: "مخزن الكتب", nodeId: "NODE_290" },
    { name: "مكتبة يوسف أحمد الغانم", nodeId: "NODE_638" },
    { name: "مبنى الادارة والمالية", nodeId: "NODE_649" },
    { name: "المتحف الفلسطيني", nodeId: "NODE_302" },
    { name: "متحف جامعة بيرزيت", nodeId: "NODE_322" },
    { name: "مركز نجاد زيني للتميز", nodeId: "NODE_293" },
    { name: "معهد سميح دروزة للصناعات الدوائية", nodeId: "NODE_546" },
    { name: "ملعب علي الحاج", nodeId: "NODE_651" },
    { name: "مولد كهربائي", nodeId: "NODE_313" }
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


    const defaultLocation = "A.Shaheen - Main Entrance";
    const defaultNodeId = "NODE_014";
    
    // Set input values
    fromNodeInput.value = defaultLocation;
    fromNodeId.value = defaultNodeId;

    
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
        
        
        const targetFloor = floor === 'basement' ? '-1' : 
                          floor === 'ground' ? '0' :
                          floor === 'first' ? '1' : 
                          floor === 'second' ? '2' : floor;
        
        
    
        // Add warning message if floor is not 'ground'
        if (floor !== 'ground') {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'warning-message';
            warningDiv.innerHTML = `
                <div class="warning-content">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <span>Please be aware that selecting a floor other than 0 will position your location automatically within the Arts Faculty building </span>
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
                    // Use innerHTML instead of textContent to preserve formatting
                    dropdownItem.innerHTML = item.name;
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
            
        }
        currentStep = [nodeID];
        currentFloor = floor;
        
    } else {
        currentStep.push(nodeID);
    }
});

// Add the last step if there are nodes in currentStep
if (currentStep.length > 0) {
    steps.push(currentStep);
    
}


    
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
    
