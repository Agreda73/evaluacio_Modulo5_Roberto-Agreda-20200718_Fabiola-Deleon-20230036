// config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// Firebase configuration with your actual values
const firebaseConfig = {
  apiKey: "AIzaSyCBgdlf6YTXnNsJEJAO_Jush8u9OuGnk8s",
  authDomain: "app-firebase-5f390.firebaseapp.com",
  projectId: "app-firebase-5f390",
  storageBucket: "app-firebase-5f390.firebasestorage.app",
  messagingSenderId: "585622994781",
  appId: "1:585622994781:web:92eed315b31f1eda5c32b4"
};

console.log('🔥 Firebase Configuration:');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);

let app, auth, db, storage;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');

  // Initialize Firebase Authentication
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized');
  console.log('Auth app name:', auth.app.name);
  console.log('Auth project ID:', auth.app.options.projectId);

  // Initialize Cloud Firestore
  db = getFirestore(app);
  console.log('✅ Firestore initialized');
  console.log('DB project ID:', db.app.options.projectId);

  // Initialize Cloud Storage
  storage = getStorage(app);
  console.log('✅ Storage initialized');

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
}

// Additional verification
const verifyFirebaseSetup = () => {
  console.log('🔍 Verifying Firebase setup...');
  
  if (!auth) {
    console.error('❌ Auth is undefined - this will cause auth/configuration-not-found');
    return false;
  }
  
  if (!db) {
    console.error('❌ Firestore is undefined');
    return false;
  }
  
  if (!auth.app) {
    console.error('❌ Auth.app is undefined');
    return false;
  }
  
  if (!auth.app.options.projectId) {
    console.error('❌ Project ID not found in auth config');
    return false;
  }
  
  console.log('✅ Firebase setup verification passed');
  return true;
};

// Run verification
verifyFirebaseSetup();

export { auth, db, storage, app };