import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  projectId: "ai-analysis-e1370",
  appId: "1:726413596527:web:4692a9cb788b89b86c7a9a",
  apiKey: "AIzaSyADdHeuYlk2QfxUajWrWcTH0cGnP83Y69A",
  authDomain: "ai-analysis-e1370.firebaseapp.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  try {
    const snap = await getDocs(collection(db, "resumes"));
    console.log(`Found ${snap.size} resumes.`);
    snap.forEach(doc => console.log(doc.id, doc.data().userId));
  } catch (e) {
    console.error("Error:", e);
  }
}

check();
