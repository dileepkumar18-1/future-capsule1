import { db, auth } from './firebase-config.js';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

// 🔐 AUTH FUNCTIONS
window.signUp = function () {
  const email = document.getElementById('email').value;
  const password = document.getElementById('userPassword').value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      document.getElementById('authStatus').innerText = "✅ Signed up successfully!";
    })
    .catch(error => {
      document.getElementById('authStatus').innerText = "❌ " + error.message;
    });
};

window.logIn = function () {
  const email = document.getElementById('email').value;
  const password = document.getElementById('userPassword').value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      document.getElementById('authStatus').innerText = "✅ Logged in!";
    })
    .catch(error => {
      document.getElementById('authStatus').innerText = "❌ " + error.message;
    });
};

window.logOut = function () {
  signOut(auth).then(() => {
    document.getElementById('authStatus').innerText = "👋 Logged out.";
  });
};

// 📦 SAVE CAPSULE
window.saveCapsule = async function () {
  const name = document.getElementById('capsuleName').value;
  const message = document.getElementById('message').value;
  const unlockDate = document.getElementById('unlockDate').value;
  const password = document.getElementById('capsulePassword').value;
  const fileInput = document.getElementById('fileUpload');
  const user = auth.currentUser;

  if (!user || !name || !message || !unlockDate || !password) {
    alert("Please fill in all fields and log in.");
    return;
  }

  let fileData = "";
  if (fileInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = async function (e) {
      fileData = e.target.result;
      await setDoc(doc(db, "users", user.uid, "capsules", name), {
        name,
        message,
        unlockDate,
        password,
        created: new Date().toLocaleString(),
        file: fileData
      });
      document.getElementById('output').innerText = `✅ Capsule '${name}' saved to cloud!`;
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    await setDoc(doc(db, "users", user.uid, "capsules", name), {
      name,
      message,
      unlockDate,
      password,
      created: new Date().toLocaleString(),
      file: ""
    });
    document.getElementById('output').innerText = `✅ Capsule '${name}' saved to cloud!`;
  }
};

// 📋 LIST CAPSULES
window.listCapsules = async function () {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to view your capsules.");
    return;
  }

  const listDiv = document.getElementById('capsuleList');
  listDiv.innerHTML = "<h3>🗂️ Your Capsules</h3>";
  const q = query(collection(db, "users", user.uid, "capsules"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnap) => {
    const capsule = docSnap.data();
    listDiv.innerHTML += `
      <p><strong>${capsule.name}</strong> - Unlock on ${capsule.unlockDate}
      <br><input type="password" placeholder="Enter password" id="pass_${capsule.name}">
      <button onclick="openCapsule('${capsule.name}')">Open</button></p>`;
  });
};

// 🔓 OPEN CAPSULE
window.openCapsule = async function (name) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to open capsules.");
    return;
  }

  const docRef = doc(db, "users", user.uid, "capsules", name);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    document.getElementById('output').innerText = "❌ Capsule not found.";
    return;
  }

  const capsule = docSnap.data();
  const now = new Date();
  const unlockTime = new Date(capsule.unlockDate);
  const enteredPass = document.getElementById("pass_" + name).value;

  if (enteredPass !== capsule.password) {
    alert("❌ Incorrect password.");
    return;
  }

  if (now >= unlockTime) {
    let output = `<h3>📬 Message from ${capsule.created}</h3><p>${capsule.message}</p>`;
    if (capsule.file) {
      output += `<p>📎 Attached Image:</p><img src="${capsule.file}" alt="Attached Image">`;
    }
    document.getElementById('output').innerHTML = output;
  } else {
    document.getElementById('output').innerHTML = `⏳ Too early! Come back on ${capsule.unlockDate}.`;
  }
};
