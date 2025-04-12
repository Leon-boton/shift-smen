let tempImages = [];

let editIndex = null;

function openTaskModal(index = null) {
  const modal = document.getElementById("taskModal");
  modal.style.display = "flex";
  editIndex = index;
  tempImages = [];

  if (index !== null) {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const task = tasks[index];
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDesc").value = task.desc || "";
    tempImages = [...(task.images || [])];
  } else {
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDesc").value = "";
    tempImages = [];
  }

  renderImagePreview();
}

function closeTaskModal() {
  document.getElementById("taskModal").style.display = "none";
  editIndex = null;
}

//сохран

function saveTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const fileInput = document.getElementById("taskImage");
  const files = fileInput.files;

  if (!title) return alert("Введите название задачи");

  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  const saveData = (images) => {
    const task = { title, desc, images, pinned: editIndex !== null ? tasks[editIndex].pinned : false};

    if (editIndex !== null) {
      tasks[editIndex] = task;
    } else {
      tasks.push(task);
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    closeTaskModal();
  };

  if (files.length > 0) {
  const compressions = [];

  for (let i = 0; i < files.length; i++) {
    compressions.push(compressImage(files[i], 1024, 0.7)); // сжатие с качеством 0.7
  }

  Promise.all(compressions)
    .then((newImages) => {
      const combined = [...tempImages, ...newImages];
      saveData(combined);
    })
    .catch((err) => {
      console.error(err);
      alert("Не удалось сжать изображение");
    });
} else {
  saveData(tempImages);
}

  // Очистка file input
  const newInput = fileInput.cloneNode(true);
  fileInput.parentNode.replaceChild(newInput, fileInput);
}


//фун удалять 
function deleteTask(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const deleted = JSON.parse(localStorage.getItem("deletedTasks")) || [];

  const taskToDelete = { ...tasks[index] };
  taskToDelete.deletedAt = new Date().toISOString();

  // Если у задачи есть фото — спрашиваем пользователя
  if (taskToDelete.images && taskToDelete.images.length > 0) {
    if (confirm("Удалить задачу с фотографиями? Фото будут утеряны.")) {
      delete taskToDelete.images;
    }
  }

  deleted.push(taskToDelete);
  localStorage.setItem("deletedTasks", JSON.stringify(deleted));

  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}
//😱

function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  const query = document.getElementById("taskSearchInput")?.value.toLowerCase() || "";

  tasks
    .filter(task =>
      task.title.toLowerCase().includes(query) ||
      (task.desc || "").toLowerCase().includes(query)
    )
  .sort((a, b) => (b.pinned === true) - (a.pinned === true))
    .forEach((task, index) => {
      const div = document.createElement("div");
      div.className = "task-item";
      div.addEventListener("click", () => openBottomSheet(index));

      div.innerHTML = `
  ${(task.images || []).length ? `
    <img src="${task.images[0]}" alt="img"
      onclick="event.stopPropagation(); openFullImage('${task.images[0]}')" />
  ` : ""}
  <div class="task-text">
    <div class="task-title">${task.title}</div>
    <div class="task-desc">${task.desc || ""}</div>
    <div class="task-actions">
  <button class="icon-btn" onclick="event.stopPropagation(); openTaskModal(${index})">
    <i class="fas fa-edit"></i>
  </button>
  <button class="icon-btn" onclick="event.stopPropagation(); deleteTask(${index})">
    <i class="fas fa-trash-alt"></i>
  </button>
  <button class="icon-btn" onclick="event.stopPropagation(); togglePin(${index})">
    <i class="${task.pinned ? 'fas fa-thumbtack' : 'far fa-thumbtack'}"></i>
  </button>
</div>
  </div>
`;

      taskList.appendChild(div);
    });
}


document.getElementById("taskSearchInput")?.addEventListener("input", () => {
  renderTasks();
});


function showRecentlyDeleted() {
  const deleted = JSON.parse(localStorage.getItem("deletedTasks") || "[]");
  const list = document.getElementById("deletedList");
  list.innerHTML = "";

  if (deleted.length === 0) {
    list.innerHTML = "<p>Пусто</p>";
  } else {
    deleted.slice().reverse().forEach((task, index) => {
      const item = document.createElement("div");
      item.className = "task-card ios-style";
      item.innerHTML = `
        <strong>${task.title}</strong><br>
        <span>${task.desc || ""}</span><br>
        <small>${new Date(task.deletedAt).toLocaleString()}</small>
        <div class="task-actions">
          <button onclick="restoreDeletedTask(${index})">Восстановить</button>
         <button onclick="editDeletedTask(${index})" style="
  font-size: 16px;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: inherit;
">
  <i class="fas fa-edit"></i>
</button>
        </div>
      `;
      list.appendChild(item);
    });
  }

  document.getElementById("deletedModal").style.display = "flex";
}

function closeDeletedModal() {
  document.getElementById("deletedModal").style.display = "none";
}

function restoreDeletedTask(index) {
  const deleted = JSON.parse(localStorage.getItem("deletedTasks") || "[]");
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  const restored = deleted.splice(index, 1)[0];
  delete restored.deletedAt;
  tasks.push(restored);

  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("deletedTasks", JSON.stringify(deleted));
  renderTasks();
  showRecentlyDeleted();
}

function editDeletedTask(index) {
  const deleted = JSON.parse(localStorage.getItem("deletedTasks") || "[]");
  const task = deleted[index];

  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDesc").value = task.desc || "";

  deleted.splice(index, 1);
  localStorage.setItem("deletedTasks", JSON.stringify(deleted));
  localStorage.setItem("tempRestoreEdit", JSON.stringify(task));

  closeDeletedModal();
  document.getElementById("taskModal").style.display = "flex";
}

function clearDeletedTasks() {
  if (confirm("Удалить всё из корзины?")) {
    localStorage.removeItem("deletedTasks");
    showRecentlyDeleted();
  }
}

function handleRestoreOnSave() {
  const task = JSON.parse(localStorage.getItem("tempRestoreEdit"));
  if (task) {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.removeItem("tempRestoreEdit");
    renderTasks();
  }
}

renderTasks();
handleRestoreOnSave();


// клик по фото
function openFullImage(src) {
  const viewer = document.getElementById("imageViewer");
  const img = document.getElementById("imageViewerImg");
  img.src = src;
  viewer.style.display = "flex";
  closeBottomSheet?.();
}

function closeImageViewer() {
  document.getElementById("imageViewer").style.display = "none";
}
//выезжает 🔍

const toggleBtn = document.getElementById("toggleSearch");
const floatingSearch = document.getElementById("floatingSearch");
const searchInput = document.getElementById("taskSearchInput");

toggleBtn.addEventListener("click", () => {
  floatingSearch.classList.toggle("active");
  if (floatingSearch.classList.contains("active")) {
    setTimeout(() => {
      searchInput.focus();
    }, 200);
  } else {
    searchInput.value = "";
    renderTasks();
  }
});

searchInput.addEventListener("input", () => {
  renderTasks();
});


// открыть модель
let currentTaskIndex = null;

function openBottomSheet(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const task = tasks[index];
  currentTaskIndex = index;

  document.getElementById("previewTitle").textContent = task.title;
  document.getElementById("previewDesc").textContent = task.desc || "";

  const imgEl = document.getElementById("previewImg");
  let currentImageIndex = 0;
  let images = task.images || [];

  if (images.length > 0) {
    imgEl.src = images[currentImageIndex];
    imgEl.style.display = "block";

    imgEl.onclick = (e) => {
      e.stopPropagation();
      openFullImage(images[currentImageIndex]);
    };

    let startX = null;

    imgEl.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    imgEl.addEventListener("touchend", (e) => {
      if (!startX) return;
      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;

      if (Math.abs(deltaX) > 30) {
        if (deltaX < 0 && currentImageIndex < images.length - 1) {
          currentImageIndex++;
        } else if (deltaX > 0 && currentImageIndex > 0) {
          currentImageIndex--;
        }
        imgEl.src = images[currentImageIndex];
      }

      startX = null;
    });

  } else {
    imgEl.style.display = "none";
  }

  document.getElementById("taskPreviewSheet").classList.add("active");
}

function closeBottomSheet() {
  document.getElementById("taskPreviewSheet")?.classList.remove("active");
}

function editCurrentTask() {
  openTaskModal(currentTaskIndex);
  closeBottomSheet();
}

function deleteCurrentTask() {
  deleteTask(currentTaskIndex);
  closeBottomSheet();
}
document.getElementById("deleteTaskFromSheet").addEventListener("click", () => {
  if (currentTaskIndex !== null) {
    deleteTask(currentTaskIndex);
    closeBottomSheet();
renderTasks();
  }
});

//❌
function togglePin(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks[index].pinned = !tasks[index].pinned;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

//свайп в низ
let startY = null;

const sheet = document.getElementById("taskPreviewSheet");

sheet.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
});

sheet.addEventListener("touchend", (e) => {
  const endY = e.changedTouches[0].clientY;
  if (startY && endY - startY > 50) {
    closeBottomSheet();
  }
  startY = null;
});


// обработчик
function renderImagePreview() {
  const container = document.getElementById("imagePreviewContainer");
  container.innerHTML = "";

  tempImages.forEach((src, i) => {
    const div = document.createElement("div");
    div.className = "image-preview";
    div.innerHTML = `
      <img src="${src}" alt="img" onclick="openFullImage('${src}')">
      <button onclick="removeImage(${i})">&times;</button>
    `;
    container.appendChild(div);
  });
}

function removeImage(index) {
  tempImages.splice(index, 1);
  renderImagePreview();
}

//сжатие фото 
function compressImage(file, maxSize = 1024, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = () => reject("Ошибка чтения файла");
    reader.readAsDataURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject("Ошибка загрузки изображения");
  });
}