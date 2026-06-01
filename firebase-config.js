// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQoP5spzDO_aJERtFwyrdqFAHdgPdFE40",
  authDomain: "mester-configg.firebaseapp.com",
  databaseURL: "https://mester-configg-default-rtdb.firebaseio.com",
  projectId: "mester-configg",
  storageBucket: "mester-configg.firebasestorage.app",
  messagingSenderId: "910257844237",
  appId: "1:910257844237:web:defbc7344a590d64fba544"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
