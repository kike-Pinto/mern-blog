// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'mern-blog-c55e1.firebaseapp.com',
  projectId: 'mern-blog-c55e1',
  storageBucket: 'mern-blog-c55e1.appspot.com',
  messagingSenderId: '785589544256',
  appId: '1:785589544256:web:6a7bd867bd88c7eba706a5',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
