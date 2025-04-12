<!-- все для чата  -->
// Firebase конфиг
const firebaseConfig = {
  apiKey: "AIzaSyB5c6seU7AS6J9ovaR3j26ZpXIRRHfX3N4",
  authDomain: "cat-app-4b7dc.firebaseapp.com",
  projectId: "cat-app-4b7dc",
  storageBucket: "cat-app-4b7dc.appspot.com",
  messagingSenderId: "568787959338",
  appId: "1:568787959338:web:bf9f438dfb817354f30d53",
  measurementId: "G-D1KYT9TGTB",
  databaseURL: "https://cat-app-4b7dc-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const roomSelect = document.getElementById("room");
const messagesList = document.getElementById("messages");
const input = document.getElementById("m");

let username = localStorage.getItem("chat_username");
if (!username) {
  username = prompt("Введите ваше имя:");
  localStorage.setItem("chat_username", username);
}

let currentRoom = localStorage.getItem("chat_room") || "general";
let editingKey = null;

window.addEventListener("DOMContentLoaded", () => {
  roomSelect.value = currentRoom;
  loadMessages();
});

roomSelect.addEventListener("change", () => {
  currentRoom = roomSelect.value;
  localStorage.setItem("chat_room", currentRoom);
  loadMessages();
});

function stringToColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 65%)`;
}

function addMessage(msg, key) {
  const element = document.createElement("li");
  const isOwn = msg.user === username;
  const color = stringToColor(msg.user);

  element.classList.add("message");
  if (isOwn) element.classList.add("own");
  element.dataset.key = key;

  element.innerHTML = `
    <div class="msg-header">
      <span class="dot" style="background:${color};"></span>
      <strong>${msg.user}</strong>
      ${isOwn ? `
        <span class="actions">
          <button class="icon-btn edit-btn" title="Редактировать">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button class="icon-btn delete-btn" title="Удалить">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M3 6h18" />
              <path d="M8 6v14h8V6" />
              <path d="M10 10v6M14 10v6" />
            </svg>
          </button>
        </span>
      ` : ""}
    </div>
    <div class="msg-text">${msg.text}</div>
    <div class="time">${msg.time}${msg.edited ? ' (изменено)' : ''}</div>
  `;

  if (isOwn) {
    element.querySelector(".delete-btn").addEventListener("click", () => {
      db.ref(`messages/${currentRoom}/${key}`).remove();
      element.remove();
    });

    element.querySelector(".edit-btn").addEventListener("click", () => {
      input.value = msg.text;
      input.focus();
      editingKey = key;
    });
  }

  messagesList.appendChild(element);
  scrollToBottom();
}

function loadMessages() {
  messagesList.innerHTML = "";
  db.ref(`messages/${currentRoom}`).off();

  db.ref(`messages/${currentRoom}`).on("child_added", (snapshot) => {
    const msg = snapshot.val();
    const key = snapshot.key;
    addMessage(msg, key);
  });

  db.ref(`messages/${currentRoom}`).on("child_removed", (snapshot) => {
    const key = snapshot.key;
    const el = messagesList.querySelector(`[data-key="${key}"]`);
    if (el) el.remove();
  });

  db.ref(`messages/${currentRoom}`).on("child_changed", (snapshot) => {
    const msg = snapshot.val();
    const key = snapshot.key;
    const el = messagesList.querySelector(`[data-key="${key}"]`);
    if (el) {
      el.querySelector(".msg-text").textContent = msg.text;
      el.querySelector(".time").textContent = msg.time + (msg.edited ? ' (изменено)' : '');
      editingKey = null;
    }
  });
}

function send() {
  const msgText = input.value.trim();
  if (!msgText) return;

  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (editingKey) {
    db.ref(`messages/${currentRoom}/${editingKey}`).update({
      text: msgText,
      time: now,
      edited: true
    });
    editingKey = null;
  } else {
    const msg = {
      user: username,
      text: msgText,
      time: now
    };
    db.ref(`messages/${currentRoom}`).push(msg);
  }

  input.value = "";
}

function toggleChat() {
  const modal = document.getElementById("chatModal");
  if (!modal) return;

  const isOpen = modal.classList.contains("show");

  if (isOpen) {
    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
    }, 300);
  } else {
    modal.style.display = "flex";
    setTimeout(() => {
      modal.classList.add("show");
      scrollToBottom();
    }, 10);
  }
}

function scrollToBottom() {
  messagesList.scrollTop = messagesList.scrollHeight;
}

input.addEventListener("focus", () => {
  setTimeout(scrollToBottom, 300);
});