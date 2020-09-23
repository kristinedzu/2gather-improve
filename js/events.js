"use strict";

const _eventRef = _db.collection("Events");
let _selectedImgFile = "";
let _events = [];
let _selectedEventId = "";



function orderByUpcoming() {
    _eventRef.orderBy("date").onSnapshot(function (snapshotData) {
        _events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            _events.push(event);
        });
        appendEvents(_events);
    });
}

orderByUpcoming();


function orderByFriends() {
    _eventRef.orderBy("name").onSnapshot(function (snapshotData) {
        let events = [];
        let user = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });
        appendEvents(events);


    });
}


// append events to the DOM
function appendEvents(events) {
    let htmlTemplate = "";
    for (let event of events) {
        console.log(event);
        htmlTemplate += `
        <a href="#select-event" onclick="appendEventsDetails('${event.id}')"><article>
        <img src="${event.img}" alt="Event Photo">
            <div class="event_title">
                <h2>${event.name}</h2>
                <h4>${moment(event.date.toDate()).calendar()}</h4>
                <p class="text-adjust">Organiser: ${event.organiser}</p>
                <img class="friends_icons" src="${event.friends}">
                <h7 clas="event_price">${event.price}</h7>
            </div>
        </article></a>
        `;
    }

    document.querySelector('#event-container').innerHTML = htmlTemplate;

}

// select specific event
function appendEventsDetails(id) {
    console.log(id);
    // references to the input fields
    let specificEvent = "";
    for (let event of _events) {
        if (event.id == id) {
            specificEvent = event;
        }
    }

    let htmlTemplate = "";
    console.log();
    htmlTemplate += `
        <article>
        <button class="back-selected" onclick="goBack()"><i class="fas fa-chevron-left"></i></button>
        <img src="${specificEvent.img}" alt="Event Photo">
         <h2 class="going">GOING</h2>
            <div class="event_title">
            <div class="different-font">
            
                <h2>${specificEvent.name}</h2>
                <h4>Organiser: <span style="font-weight: 400">${specificEvent.organiser}</span></h4><br>
                <h4><i class="fas fa-calendar-day specific-event-icon"></i>${moment(specificEvent.date.toDate()).calendar()}</h4>
                <p><i class="fas fa-compass specific-event-icon"></i>${specificEvent.place}</p>
                </div>
                <div class="share_friends"
                <button class="share"><i class="fas fa-share-alt"></i></button>
                <img class="friends_icons" src="${specificEvent.friends}"> </div>
                
                <p>${specificEvent.description}</p>
                <p>${generateFavEventButton(specificEvent.id)}</p>
                
            </div>
        </article>
        `;

    document.querySelector('#select-event').innerHTML = htmlTemplate;
}

function goBack() {
    window.history.back();
}

function generateFavEventButton(specificEventId) {
    let btnTemplate = `
    <button onclick="addToFavourites('${specificEventId}'), showGoing()" class="specific-event-button">GOING</button>`;
    if (_currentUser.favEvents && _currentUser.favEvents.includes(specificEventId)) {
        btnTemplate = `
      <button onclick="removeFromFavourites('${specificEventId}'), showGoingAway()" class="rm">CANCEL</button>`;
    }
    return btnTemplate;
}

// append favourite events to the DOM
async function appendFavEvents(favEventIds = []) {
    let htmlTemplate = "";
    if (favEventIds.length === 0) {
        htmlTemplate = "";
    } else {
        for (let eventId of favEventIds) {
            await _eventRef.doc(eventId).get().then(function (doc) {
                let event = doc.data();
                console.log(event);
                event.id = doc.id;
                htmlTemplate += `
         <a href="#select-event" onclick="appendEventsDetails('${event.id}')"><article>
          <div class="ticket-text">
          <div style="float: left">
          <h4>${event.name}</h4>
          <h5>${moment(event.date.toDate()).calendar()}</h5>
          <p>${event.place}</p>
          </div>
          <div class="QR"></div>
          </div>
        </article></a>
      `;
            });
        }
    }

    document.querySelector('#calendar-container').innerHTML = htmlTemplate;
    document.querySelector('#tickets-container').innerHTML = htmlTemplate;
}
// on click add "going"
function showGoing() {
    let element = document.querySelector(".going")
    if (element.style.display === "block") {
        element.style.display = "none";
    }
    else {
        element.style.display = "block";
    }
}


function showGoingAway() {
    let element = document.querySelector(".going")
    if (element.style.display === "none") {
        element.style.display = "block";
    }
    else {
        element.style.display = "none";
    }
}
// adds a given eventId to the favEvents array inside _currentUser
function addToFavourites(eventId) {
    showLoader(true);
    _userRef.doc(_currentUser.uid).set({
        favEvents: firebase.firestore.FieldValue.arrayUnion(eventId)
    }, {
        merge: true
    });
}

// removes a given eventId to the favEvents array inside _currentUser
function removeFromFavourites(eventId) {
    showLoader(true);
    _userRef.doc(_currentUser.uid).update({
        favEvents: firebase.firestore.FieldValue.arrayRemove(eventId)
    });
}

// Buy a ticket -- leads to ticket-container

// create new event
// add a new event to firestore 

function createAnEvent() {

    let nameInput = document.querySelector('#nameevent');
    let descriptionInput = document.querySelector('#description');
    let imageInput = document.querySelector('#imagePreview');
    let priceInput = document.querySelector('#price');
    let freeInput = document.querySelector('#free');
    let categoriesInput = document.querySelector('#categories');
    let dateInput = document.querySelector('#date');
    let locationInput = document.querySelector('#location');
    let user = _currentUser;

    let newEvent = {
        name: nameInput.value,
        description: descriptionInput.value,
        img: imageInput.src,
        price: priceInput.value,
        price: freeInput.value = "FREE",
        category: categoriesInput.value,
        date: dateInput.value,
        place: locationInput.value,
        organiser: user.displayName
    };
    _eventRef.add(newEvent);
    document.getElementById("create").style.display = "none";
    document.getElementById("myForm").reset();
    document.getElementById("my-events-section").style.display = "block";
}

// add a new event to the profile page
function hostedEvents(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        let user = _currentUser;

        value = user.displayName;
        let myEvents = events.filter(event => event.organiser.includes(value));

        console.log(myEvents);
        appendMyEvents(myEvents);
    });
}

hostedEvents();

function appendMyEvents(myEvents) {
    let htmlTemplate = "";
    for (let event of myEvents) {
        console.log(event);
        htmlTemplate += `
        <a href="#select-event" onclick="appendMyEventsDetails('${event.id}')"><article>
        <img src="${event.img}" alt="Event Photo">
            <div class="event_title">
                <h2>${event.name}</h2>
                <h4>${moment(event.date.toDate()).calendar()}</h4>
                <p class="text-adjust">Organiser: ${event.organiser}</p>
                <p>${event.place}</p>
                <h7 clas="event_price">${event.price}</h7>
            </div>
        </article></a>
        `;
    }

    document.querySelector('#my-events-container').innerHTML = htmlTemplate;
}

function appendMyEventsDetails(id) {
    console.log(id);
    // references to the input fields
    let specificEvent = "";
    for (let event of _events) {
        if (event.id == id) {
            specificEvent = event;
        }
    }

    let htmlTemplate = "";
    console.log();
    htmlTemplate += `
        <article>
        <button class="back-selected" onclick="goBack()"><i class="fas fa-chevron-left"></i></button>
        <img src="${specificEvent.img}" alt="Event Photo">
            <div class="event_title">
            <div class="different-font">
                <h2>${specificEvent.name}</h2>
               
                <h4>Organiser: <span style="font-weight: 400">${specificEvent.organiser}</span></h4>
                <h4><i class="fas fa-calendar-day specific-event-icon"></i>${moment(specificEvent.date.toDate()).calendar()}</h4>
                <p><i class="fas fa-compass specific-event-icon"></i>${specificEvent.place}</p>
                </div>
                <p>${specificEvent.description}</p>
                <button class="update_event_button" onclick="updateEventOpen()">update event</button>
                <button class="delete_event_button" onclick="updateEvent()">delete event</button>
                
            </div>
        </article>
        `;

    document.querySelector('#select-event').innerHTML = htmlTemplate;
}

function updateEventOpen() {
    document.getElementById("update-event").style.display = "block";
    document.getElementById("select-event").style.display = "none";

}

function closeIconUpdate() {
    document.getElementById("update-event").style.display = "none";
    document.getElementById("select-event").style.display = "block";
}

function updateEvent() {
    document.getElementById("update-event").style.display = "none";
    document.getElementById("select-event").style.display = "block";
}




function hideCategories() {
    document.getElementById("categories-container").style.display = "none";
}

//////////SEARCHBAR FUNCIONALITY/////////
function search(searchValue) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        searchValue = searchValue.toLowerCase();
        let filteredEvents = events.filter(event => event.name.toLowerCase().includes(searchValue));

        console.log(filteredEvents);

        appendCategories(filteredEvents);


        /* searchbar appending searched events*/
        var search_input = document.getElementById('searchbar');

        if (search_input.value.length == 0) {
            closeFilteredCategories()

        } else {
            document.getElementById("filtered-events").style.display = "block";
            document.getElementById("categories-container").style.display = "none";
        };

    });
};

function previewImage(file, previewId) {
    if (file) {
        _selectedImgFile = file;
        let reader = new FileReader();
        reader.onload = event => {
            document.querySelector('#' + previewId).setAttribute('src', event.target.result);
        };
        reader.readAsDataURL(file);
    }
}


// button to open the form
function openForm() {
    document.getElementById("create").style.display = "block";
    document.getElementById("my-events-section").style.display = "none";
}


function closeIcon() {
    document.getElementById("create").style.display = "none";
    document.getElementById("my-events-section").style.display = "block";
    document.getElementById("update-event").style.display = "none";


}

function showMe() {
    document.querySelector("#party").innerHTML = "HALLOWEEN PARTY";
}


//filtering by categories

function openMusic(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        value = "music";
        let filteredEvents = events.filter(event => event.category.includes("music"));


        console.log(filteredEvents);
        appendCategories(filteredEvents);
    });
    document.getElementById("categories-container").style.display = "none";
    document.getElementById("searchbar").style.display = "none";
    document.getElementById("closeCatBut").style.display = "block";
    document.getElementById("closeCatBut").innerHTML = "&#10005;" + "&emsp;" + "Music";
    document.getElementById("filtered-events").style.display = "block";

};

function openParty(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        value = "party";
        let filteredEvents = events.filter(event => event.category.includes("party"));


        console.log(filteredEvents);
        appendCategories(filteredEvents);
    });
    document.getElementById("categories-container").style.display = "none";
    document.getElementById("searchbar").style.display = "none";
    document.getElementById("closeCatBut").style.display = "block";
    document.getElementById("closeCatBut").innerHTML = "&#10005;" + "&emsp;" + "Party";
    document.getElementById("filtered-events").style.display = "block";

};

function openSport(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        value = "sport";
        let filteredEvents = events.filter(event => event.category.includes("sport"));

        console.log(filteredEvents);
        appendCategories(filteredEvents);
    });
    document.getElementById("categories-container").style.display = "none";
    document.getElementById("searchbar").style.display = "none";
    document.getElementById("closeCatBut").style.display = "block";
    document.getElementById("closeCatBut").innerHTML = "&#10005;" + "&emsp;" + "Sport";
    document.getElementById("filtered-events").style.display = "block";

};

function openArt(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        value = "art";
        let filteredEvents = events.filter(event => event.category.includes("art"));

        console.log(filteredEvents);
        appendCategories(filteredEvents);
    });
    document.getElementById("categories-container").style.display = "none";
    document.getElementById("searchbar").style.display = "none";
    document.getElementById("closeCatBut").style.display = "block";
    document.getElementById("closeCatBut").innerHTML = "&#10005;" + "&emsp;" + "Art";
    document.getElementById("filtered-events").style.display = "block";

};

function openGames(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        value = "games";
        let filteredEvents = events.filter(event => event.category.includes("games"));

        console.log(filteredEvents);
        appendCategories(filteredEvents);
    });
    document.getElementById("categories-container").style.display = "none";
    document.getElementById("searchbar").style.display = "none";
    document.getElementById("closeCatBut").style.display = "block";
    document.getElementById("closeCatBut").innerHTML = "&#10005;" + "&emsp;" + "games";
    document.getElementById("filtered-events").style.display = "block";

};

function openFood(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        value = "food";
        let filteredEvents = events.filter(event => event.category.includes("food"));

        console.log(filteredEvents);
        appendCategories(filteredEvents);
    });
    document.getElementById("categories-container").style.display = "none";
    document.getElementById("searchbar").style.display = "none";
    document.getElementById("closeCatBut").style.display = "block";
    document.getElementById("closeCatBut").innerHTML = "&#10005;" + "&emsp;" + "food";
    document.getElementById("filtered-events").style.display = "block";

};

function openTechnology(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        value = "technology";
        let filteredEvents = events.filter(event => event.category.includes("technology"));

        console.log(filteredEvents);
        appendCategories(filteredEvents);
    });
    document.getElementById("categories-container").style.display = "none";
    document.getElementById("searchbar").style.display = "none";
    document.getElementById("closeCatBut").style.display = "block";
    document.getElementById("closeCatBut").innerHTML = "&#10005;" + "&emsp;" + "technology";
    document.getElementById("filtered-events").style.display = "block";

};

function openCulture(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        value = "culture";
        let filteredEvents = events.filter(event => event.category.includes("culture"));

        console.log(filteredEvents);
        appendCategories(filteredEvents);
    });
    document.getElementById("categories-container").style.display = "none";
    document.getElementById("searchbar").style.display = "none";
    document.getElementById("closeCatBut").style.display = "block";
    document.getElementById("closeCatBut").innerHTML = "&#10005;" + "&emsp;" + "culture";
    document.getElementById("filtered-events").style.display = "block";

};

function openEducation(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        value = "education";
        let filteredEvents = events.filter(event => event.category.includes("education"));

        console.log(filteredEvents);
        appendCategories(filteredEvents);
    });
    document.getElementById("categories-container").style.display = "none";
    document.getElementById("searchbar").style.display = "none";
    document.getElementById("closeCatBut").style.display = "block";
    document.getElementById("closeCatBut").innerHTML = "&#10005;" + "&emsp;" + "education";
    document.getElementById("filtered-events").style.display = "block";

};

function openLiterature(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        value = "literature";
        let filteredEvents = events.filter(event => event.category.includes("literature"));

        console.log(filteredEvents);
        appendCategories(filteredEvents);
    });
    document.getElementById("categories-container").style.display = "none";
    document.getElementById("searchbar").style.display = "none";
    document.getElementById("closeCatBut").style.display = "block";
    document.getElementById("closeCatBut").innerHTML = "&#10005;" + "&emsp;" + "literature";
    document.getElementById("filtered-events").style.display = "block";

};

function openShopping(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        value = "shopping";
        let filteredEvents = events.filter(event => event.category.includes("shopping"));

        console.log(filteredEvents);
        appendCategories(filteredEvents);
    });
    document.getElementById("categories-container").style.display = "none";
    document.getElementById("searchbar").style.display = "none";
    document.getElementById("closeCatBut").style.display = "block";
    document.getElementById("closeCatBut").innerHTML = "&#10005;" + "&emsp;" + "Shopping";
    document.getElementById("filtered-events").style.display = "block";

};

function openSightseeing(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        value = "sightseeing";
        let filteredEvents = events.filter(event => event.category.includes("sightseeing"));

        console.log(filteredEvents);
        appendCategories(filteredEvents);
    });
    document.getElementById("categories-container").style.display = "none";
    document.getElementById("searchbar").style.display = "none";
    document.getElementById("closeCatBut").style.display = "block";
    document.getElementById("closeCatBut").innerHTML = "&#10005;" + "&emsp;" + "sightseeing";
    document.getElementById("filtered-events").style.display = "block";

};

function openMovies(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        value = "movies";
        let filteredEvents = events.filter(event => event.category.includes("movies"));

        console.log(filteredEvents);
        appendCategories(filteredEvents);
    });
    document.getElementById("categories-container").style.display = "none";
    document.getElementById("searchbar").style.display = "none";
    document.getElementById("closeCatBut").style.display = "block";
    document.getElementById("closeCatBut").innerHTML = "&#10005;" + "&emsp;" + "movies";
    document.getElementById("filtered-events").style.display = "block";

};

function openEnvironment(value) {
    _eventRef.onSnapshot(function (snapshotData) {
        let events = [];
        snapshotData.forEach(function (doc) {
            let event = doc.data();
            event.id = doc.id;
            events.push(event);
        });

        value = "environment";
        let filteredEvents = events.filter(event => event.category.includes("environment"));

        console.log(filteredEvents);
        appendCategories(filteredEvents);
    });
    document.getElementById("categories-container").style.display = "none";
    document.getElementById("searchbar").style.display = "none";
    document.getElementById("closeCatBut").style.display = "block";
    document.getElementById("closeCatBut").innerHTML = "&#10005;" + "&emsp;" + "environment";
    document.getElementById("filtered-events").style.display = "block";
};



function appendCategories(filteredEvents) {
    let htmlTemplate = "";
    for (let event of filteredEvents) {
        htmlTemplate += `
        <a href="#select-event" onclick="appendEventsDetails('${event.id}')"><article>
        <img src="${event.img}" alt="Event Photo">
            <div class="event_title">
                <h2>${event.name}</h2>
                <h4>${moment(event.date.toDate()).calendar()}</h4>
                <p class="text-adjust">Organiser: ${event.organiser}</p>
                <p>${event.place}</p>
                <h7 clas="event_price">${event.price}</h7>
            </div>
        </article></a>
        `;
    }
    document.querySelector('#filtered-events').innerHTML = htmlTemplate;

}

function closeFilteredCategories() {
    document.getElementById("filtered-events").style.display = "none";
    document.getElementById("categories-container").style.display = "grid";
    document.getElementById("searchbar").style.display = "block";
    document.getElementById("closeCatBut").style.display = "none";
}


//CALENDAR



