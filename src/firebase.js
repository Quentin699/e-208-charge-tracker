import { initializeApp } from 'firebase/app';
import { getDatabase, ref } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC0Epfr_ekjAMxRvRtkV_nHo8qXpOFH7BM",
  authDomain: "kanban-board-app-4c8be.firebaseapp.com",
  databaseURL: "https://kanban-board-app-4c8be-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kanban-board-app-4c8be",
  storageBucket: "kanban-board-app-4c8be.firebasestorage.app",
  messagingSenderId: "456637701617",
  appId: "1:456637701617:web:66c726c57d3189a4af7850"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Nodes dedicated to the EV tracker to avoid colliding with Kanban
export const evHistoryRef = ref(database, 'ev-tracker/history');
export const evSettingsRef = ref(database, 'ev-tracker/settings');

export { database };
