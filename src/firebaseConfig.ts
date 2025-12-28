// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6TFMRXYTlrp1H6UYJErWkm_KhAdpLIbE",
  authDomain: "stay-hard-7354a.firebaseapp.com",
  projectId: "stay-hard-7354a",
  storageBucket: "stay-hard-7354a.firebasestorage.app",
  messagingSenderId: "753954105607",
  appId: "1:753954105607:web:bd9cd7b419cb6036eabda2",
  measurementId: "G-2ZQ6K8SPBP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// 👇 add these
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export default app;