const { initializeApp } = require("firebase/app");
const {
  getStorage,
  
} = require("firebase/storage");

// Initialize Firebase Admin SDK

const firebaseConfig = {
    "projectId": "taste1-b57c8",
    "appId": "1:664630414416:android:5a9ef1b73c5a9e19c89555",
    "storageBucket": "taste1-b57c8.appspot.com",
    "apiKey": "AIzaSyAAfqY1mkX0fFY15i-1JkV1nudD3cktY0U",
    "authDomain": "taste1-b57c8.firebaseapp.com",
    "messagingSenderId": "664630414416"
  }

try {
  initializeApp(firebaseConfig);

  console.log("===========> connected to FIREBASE <===========");
} catch (error) {
  console.log(error);
}

const storage = getStorage();

module.exports = { storage };
