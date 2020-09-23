"use strict";

// ========== GLOBAL FIREBASE CONFIG ========== //
// Your web app's Firebase configuration
const _firebaseConfig = {
  apiKey: "AIzaSyAumJsJC7nMNd2zwCB9sbQkUKgjG9osulg",
  authDomain: "web-app-2gather.firebaseapp.com",
  databaseURL: "https://web-app-2gather.firebaseio.com",
  projectId: "web-app-2gather",
  storageBucket: "web-app-2gather.appspot.com",
  messagingSenderId: "749134289420",
  appId: "1:749134289420:web:8d9df8a6a188eca449ec29",
  measurementId: "G-B509XNVBB4"
};
// Initialize Firebase and database references
firebase.initializeApp(_firebaseConfig);
const _db = firebase.firestore();

