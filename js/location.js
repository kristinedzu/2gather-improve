
let _locations = [];

/**
 * Get current device location
 */
async function getCurrentLocation() {
    const location = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    return {
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
    };
}

/**
 * Load locations from Firebase and watch for changes
 */
async function loadLocations() {
    let currentLocation = await getCurrentLocation();

    // watch the database ref for changes
    _eventRef.onSnapshot(snapshotData => {
        _locations = [];
        snapshotData.forEach(doc => {
            let location = doc.data();
            location.id = doc.id;
            //adding the property distance - calculated by current lat and long + the object's (doc from Firebase) lat and long
            location.distance = calcDistance(currentLocation.latitude, currentLocation.longitude, location.location.latitude, location.location.longitude);
            _locations.push(location);
        });

        // Sorting the array _locations by the distance property 
        _locations.sort(function (a, b) {
            return a.distance - b.distance;
        });

        console.log(_locations);
        appendLocations();
    });
}



/**
 * Calculating the distance from on location to another: lat1 & lon1 to lat2 & lon2
 * Used to calculate the distance between the device and the location
 */
function calcDistance(lat1, lon1, lat2, lon2, unit = "K") {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        let radlat1 = Math.PI * lat1 / 180;
        let radlat2 = Math.PI * lat2 / 180;
        let theta = lon1 - lon2;
        let radtheta = Math.PI * theta / 180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "N") { dist = dist * 0.8684 }
        return dist;
    }
}


function appendLocations() {
    let template = "";
    for (const event of _locations) {
        template += /*html*/`
      <a href="#select-event" onclick="appendEventsDetails('${event.id}')"><article>
        <img src="${event.img}">
            <div class="event_title">
                <h2>${event.name}</h2>
                <h4>${moment(event.date.toDate()).calendar()}</h4>
                <p class="text-adjust">Organiser: ${event.organiser}</p>
                <p>${event.place}</p>
                <img src="${event.friends}">
                <h7 clas="event_price">${event.price}</h7>
            </div>
        </article></a>
    `;
    }
    document.getElementById("event-container").innerHTML = template;
}