"use strict";

function openSettings() {
    document.getElementById("settings").style.display = "block";
    document.getElementById("my-events-section").style.display = "none";
}

function closeSettings() {
    document.getElementById("settings").style.display = "none";
    document.getElementById("update-user-form").style.display = "none";
    document.getElementById("my-events-section").style.display = "block";

    document.getElementById("my-events-section").style.display = "block";
}

function openUpdateUser() {
    document.getElementById("update-user-form").style.display = "block";
    document.getElementById("my-events-section").style.display = "none";
}


// update user data
function updateUser() {
    let user = firebase.auth().currentUser;

    // update auth user
    user.updateProfile({
        displayName: document.querySelector('#username').value,

    });
}

