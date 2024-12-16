import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDeos3nzMKcQHGu3qsVGXme0gglZYN7u7I",
  authDomain: "inventario-sena-b8deb.firebaseapp.com",
  projectId: "inventario-sena-b8deb",
  storageBucket: "inventario-sena-b8deb.appspot.com",
  messagingSenderId: "812582113740",
  appId: "1:812582113740:web:e305124f78a34ddb1a4d69",
  measurementId: "G-0942DDSFFY"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Función para asegurar la autenticación (temporalmente sin verificación)
export const ensureAuth = async () => {
  return true; // Temporalmente permitimos todo el acceso
};

export { db, auth };