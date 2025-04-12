document.addEventListener("DOMContentLoaded", function () {
    // Элементы
    const newShiftBtn = document.getElementById("newShiftBtn");
    const shiftModal = document.getElementById("shiftModal");
    const shiftType = document.getElementById("shiftType");
    const shiftDate = document.getElementById("shiftDate");
    const shiftInfo = document.getElementById("shiftInfo");
    const saveShift = document.getElementById("saveShift");

    const openShiftList = document.getElementById("openShiftList");
    const shiftListModal = document.getElementById("shiftListModal");
    const shiftList = document.getElementById("shiftList");
    const closeShiftModal = document.getElementById("closeShiftModal");
    const closeShiftList = document.getElementById("closeShiftList");
    const shiftCountDisplay = document.getElementById("shiftCount");

    // Закрываем все модалки при загрузке
    document.querySelectorAll(".modal").forEach(m => m.style.display = "none");

    // Установить сегодняшнюю дату по умолчанию
    shiftDate.value = new Date().toISOString().split("T")[0];

    // Логгер в меню
    function log(msg) {
        const box = document.getElementById("logBox");
        if (!box) return;
        const time = new Date().toLocaleTimeString();
        const div = document.createElement("div");
        div.textContent = `[${time}] ${msg}`;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }

    // Обновить отображение инфы о смене
    function updateShiftInfo() {
        const type = shiftType.value;
        const dateStr = shiftDate.value.split("-").reverse().join(".");
        const time = type === "day" ? "07:00" : "19:00";
        shiftInfo.textContent = `Смена: ${type === "day" ? "День" : "Ночь"}, Дата: ${dateStr}, Время: ${time}`;
    }

    // Обработчики
    shiftType.addEventListener("change", updateShiftInfo);
    shiftDate.addEventListener("change", updateShiftInfo);

    newShiftBtn.addEventListener("click", () => {
        shiftModal.style.display = "flex";
        shiftDate.value = new Date().toISOString().split("T")[0];
        shiftModal.dataset.editingKey = ""; // сброс редактирования
        updateShiftInfo();
        log("Открыта форма создания смены");
    });

    closeShiftModal.addEventListener("click", () => {
        shiftModal.style.display = "none";
    });

    closeShiftList.addEventListener("click", () => {
        shiftListModal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === shiftModal) shiftModal.style.display = "none";
        if (e.target === shiftListModal) shiftListModal.style.display = "none";
    });

    //1️⃣ Сохранить смену
    saveShift.addEventListener("click", () => {
        const type = shiftType.value;
        const time = type === "day" ? "07:00" : "19:00";
        const dateStr = shiftDate.value.split("-").reverse().join(".");
        const key = `shift-${shiftDate.value}`;

//2️⃣ебать тут ред в списке смен
//saveShift.replaceWith(saveShift.cloneNode(true));

//saveShift.addEventListener("click", () => {
    // Заменить старую кнопку на клон (сбросить все обработчики)
const newSaveShift = saveShift.cloneNode(true);
saveShift.parentNode.replaceChild(newSaveShift, saveShift);

// Назначить обработчик на новую кнопку
newSaveShift.addEventListener("click", () => {
 
const type = shiftType.value;
    const time = type === "day" ? "07:00" : "19:00";
    const dateStr = shiftDate.value.split("-").reverse().join(".");
    const key = `shift-${shiftDate.value}`;
    const editingKey = shiftModal.dataset.editingKey;

    let shifts = JSON.parse(localStorage.getItem("shifts") || "[]");
    
    if (editingKey) {
        shifts = shifts.filter(shift => shift.id !== Number(editingKey));
        delete shiftModal.dataset.editingKey;
    }

    const newShift = {
        id: Date.now(),
        name: type === "day" ? "День" : "Ночь",
        date: shiftDate.value,
        startTime: time,
        shiftType: type,
        remindBefore: 30,
        isDone: false
    };

    shifts.push(newShift);
    localStorage.setItem("shifts", JSON.stringify(shifts));
    localStorage.setItem(key, JSON.stringify({
        type,
        date: dateStr,
        time
    }));

    shiftModal.style.display = "none";
    log(`Смена сохранена: ${dateStr} — ${type} в ${time}`);


//renderCalendar(currentMonth, currentYear);
if (typeof renderCalendar === "function") {
  const now = new Date();
  renderCalendar(now.getMonth(), now.getFullYear());
}

    renderShiftList();
    updateNextShiftWidget();
});
    
//!!
        const shiftData = {
            type,
            date: dateStr,
            time
        };

        localStorage.setItem(key, JSON.stringify(shiftData));
//хуй
// 3️⃣Также сохраняем в массив shifts[] (для подсчётов и списка)
let shifts = JSON.parse(localStorage.getItem("shifts") || "[]");
shifts.push({
    id: Date.now(),
    name: type === "day" ? "День" : "Ночь",
    date: shiftDate.value, // YYYY-MM-DD
    startTime: time,
    shiftType: type,
    remindBefore: 30,
    isDone: false
 });
localStorage.setItem("shifts", JSON.stringify(shifts));

//
        shiftModal.style.display = "none";
        log(`Смена сохранена: ${shiftData.date} — ${shiftData.type} в ${shiftData.time}`);

        if (typeof renderCalendar === "function") {
            const now = new Date();
            renderCalendar(now.getMonth(), now.getFullYear());
        }

        renderShiftList();
updateNextShiftWidget();
    });

    // Список смен
    openShiftList.addEventListener("click", () => {
        renderShiftList();
        shiftListModal.style.display = "flex";
    });
//🤬🤬🤬🤬
function renderShiftList() {
    shiftList.innerHTML = "";
    
    // Получаем массив смен
    const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");

    if (shiftCountDisplay) {
        shiftCountDisplay.textContent = `(${shifts.length})`;
    }

    if (shifts.length === 0) {
        shiftList.innerHTML = "<p>Смен пока нет</p>";
        return;
    }

    // Перебираем массив смен
    shifts.forEach(shift => {
        const div = document.createElement("div");
        div.className = "shift-entry";
        div.innerHTML = `
            <strong>${shift.date}</strong> — ${shift.shiftType === "day" ? "День" : "Ночь"} в ${shift.startTime}
            <button class="edit-btn" data-key="${shift.id}">Редактировать</button>
            <button class="delete-btn" data-key="${shift.id}">Удалить</button>
        `;
        shiftList.appendChild(div);
    });

    // Удаление смены из календря 06.04 
    shiftList.querySelectorAll(".delete-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const id = Number(e.target.dataset.key);
    let shifts = JSON.parse(localStorage.getItem("shifts") || "[]");
    const shiftToRemove = shifts.find(s => s.id === id);

    if (shiftToRemove) {
      // Удаляем отдельную запись по дате для календаря
      const shiftDateKey = `shift-${shiftToRemove.date}`;
      localStorage.removeItem(shiftDateKey);

      // Удаляем по "человеческому" ключу, если был добавлен через календарь
      const [y, m, d] = shiftToRemove.date.split("-");
      const altKey = `${parseInt(d)}-${parseInt(m)}-${y}`;
      localStorage.removeItem(altKey);

      // Удаляем класс с ячейки календаря без полной перерисовки (по желанию)
      const dateKey = `${Number(d)}-${Number(m)}-${y}`; // Без ведущих нулей
const cell = document.querySelector(`[data-date="${dateKey}"]`);
if (cell) {
  cell.classList.remove("shift-day", "shift-night", "has-event");
}
    }

    shifts = shifts.filter(s => s.id !== id);
    localStorage.setItem("shifts", JSON.stringify(shifts));

    renderShiftList();
    renderCalendar(currentMonth, currentYear);
    updateMonthStats(currentMonth, currentYear);
    updateNextShiftWidget();
  });
});
//до сюда ❌❌❌
    // Редактирование смены
    shiftList.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.target.dataset.key);
            const shift = shifts.find(s => s.id === id);
            if (!shift) return;

            shiftType.value = shift.shiftType;
            shiftDate.value = shift.date;
            updateShiftInfo();
            shiftModal.style.display = "flex";
            shiftListModal.style.display = "none";
            shiftModal.dataset.editingKey = shift.id;
        });
    });
}
});

//😱удалить все смены из локалити 
document.getElementById("clearShiftsBtn")?.addEventListener("click", () => {
  if (confirm("Удалить все смены?")) {
    localStorage.removeItem("shifts");

    // Удаляем все ключи вида shift-YYYY-MM-DD и DD-MM-YYYY
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("shift-")) {
        localStorage.removeItem(key);
      }
      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(key)) {
        localStorage.removeItem(key);
      }
    });

    // Очистка DOM
    document.querySelectorAll(".calendar-day").forEach(day => {
      day.classList.remove("shift-day", "shift-night", "has-event");
      day.style.backgroundColor = "";
      day.style.color = "";
      if (day.dataset.day) {
        day.innerHTML = day.dataset.day;
      }
    });

    // Обновление календаря и статистики
    if (typeof renderCalendar === "function") {
      const now = new Date();
      renderCalendar(now.getMonth(), now.getFullYear());
    }
    if (typeof renderShiftsList === "function") renderShiftsList();
    if (typeof updateNextShiftWidget === "function") updateNextShiftWidget();
    if (typeof updateMonthStats === "function") {
      const now = new Date();
      updateMonthStats(now.getMonth(), now.getFullYear());
    }

    alert("Все смены удалены");
  }
});
// архив смен
const openArchiveModal = document.getElementById("openArchiveModal");
const closeArchiveModal = document.getElementById("closeArchiveModal");
const archiveModal = document.getElementById("archiveModal");
const archiveMonthSelect = document.getElementById("archiveMonthSelect");
const archiveShiftList = document.getElementById("archiveShiftList");

openArchiveModal.addEventListener("click", () => {
  archiveModal.style.display = "flex";
  fillArchiveMonths();
});

closeArchiveModal.addEventListener("click", () => {
  archiveModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === archiveModal) {
    archiveModal.style.display = "none";
  }
});

function fillArchiveMonths() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith("shift-"));
  const months = new Set(
    keys.map(k => k.slice(6, 13)) // из shift-2025-04-11 → 2025-04
  );

  archiveMonthSelect.innerHTML = "";
  months.forEach(month => {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = month;
    archiveMonthSelect.appendChild(option);
  });

  renderArchiveShifts(archiveMonthSelect.value);
}

archiveMonthSelect.addEventListener("change", () => {
  renderArchiveShifts(archiveMonthSelect.value);
});
//!!!!!!
function renderArchiveShifts(month) {
  const keys = Object.keys(localStorage);
  const result = [];

  // 1. Ищем shift-2025-04-11
  const shiftKeys = keys.filter(k => k.startsWith("shift-" + month));
  shiftKeys.forEach(k => {
    const data = JSON.parse(localStorage.getItem(k));
    result.push({
      date: data.date,
      type: data.type,
      time: data.time
    });
  });

  // 2. Ищем обычные ключи (например, 11-4-2025)
  keys.forEach(k => {
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(k)) {
      const [d, m, y] = k.split("-");
      const normalizedMonth = `${y}-${m.padStart(2, "0")}`;
      if (normalizedMonth === month) {
        const data = JSON.parse(localStorage.getItem(k));
        const shiftType = data.title?.toLowerCase().includes("ночь") ? "night" : "day";
        result.push({
          date: `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`,
          type: shiftType,
          time: data.time || ""
        });
      }
    }
  });

  if (result.length === 0) {
    archiveShiftList.innerHTML = "<p>Смен нет</p>";
    return;
  }

  archiveShiftList.innerHTML = result.map(shift => {
    return `<div><strong>${shift.date}</strong> — ${shift.type === "day" ? "День" : "Ночь"} в ${shift.time}</div>`;
  }).join("");
}

//ПОИСК СМЕН

document.getElementById("shiftSearchInput").addEventListener("change", (e) => {
  const inputDate = e.target.value; // в формате YYYY-MM-DD
  const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");

  const match = shifts.find(s => s.date === inputDate);

  const resultBox = document.getElementById("shiftSearchResult");
  if (match) {
    resultBox.innerHTML = `
    <p>✅ <b>Смена:</b> ${match.name} в ${match.startTime}</p>
  `;
} else if (match) {
  resultBox.innerHTML = `
    <p>⚠️ Смена найдена, но отсутствуют данные типа или времени.</p>
  `;
} else {
  resultBox.innerHTML = `<p>❌ Смена не найдена</p>`;
}
});

//===КТО В СМЕНЕ===

// === ИНИЦИАЛИЗАЦИЯ ===
let cachedWorkbook = null;

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('shiftFileInput').addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const monthHeader = json[0][0];
      const parsed = /([а-яА-Я]+)\s+(\d{4})/.exec(monthHeader || '');
      const monthMap = {
        'январь': '01', 'февраль': '02', 'март': '03', 'апрель': '04', 'май': '05',
        'июнь': '06', 'июль': '07', 'август': '08', 'сентябрь': '09',
        'октябрь': '10', 'ноябрь': '11', 'декабрь': '12'
      };

      const now = new Date();
      let year = now.getFullYear();
      let month = String(now.getMonth() + 1).padStart(2, '0');
      if (parsed) {
        year = parsed[2];
        month = monthMap[parsed[1].toLowerCase()] || month;
      }

      const key = `shifts_${year}_${month}`;
      localStorage.setItem(key, JSON.stringify(json));
      alert(`График за ${month}.${year} сохранён`);

      cachedWorkbook = {
        Sheets: { Sheet1: XLSX.utils.aoa_to_sheet(json) },
        SheetNames: ['Sheet1']
      };

      updateAvailableMonths();
      tryShowShifts();
    };
    reader.readAsArrayBuffer(e.target.files[0]);
  });

  document.getElementById('monthSelector').addEventListener('change', (e) => {
    const key = e.target.value;
    const saved = localStorage.getItem(key);
    if (saved) {
      const json = JSON.parse(saved);
      cachedWorkbook = {
        Sheets: { Sheet1: XLSX.utils.aoa_to_sheet(json) },
        SheetNames: ['Sheet1']
      };
      tryShowShifts();
    }
  });

  document.getElementById('shiftQueryDate')?.addEventListener('change', tryShowShifts);

  document.getElementById('whoInShiftBtn')?.addEventListener('click', () => {
    document.getElementById('whoInShiftModal').style.display = 'flex';
  });

  document.getElementById('closeWhoInShift')?.addEventListener('click', () => {
    document.getElementById('whoInShiftModal').style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    const modal = document.getElementById('whoInShiftModal');
    if (e.target === modal) modal.style.display = 'none';
  });

  updateAvailableMonths();

  // === АВТОПОДГРУЗКА ПОСЛЕДНЕГО МЕСЯЦА ===
  const keys = Object.keys(localStorage).filter(k => k.startsWith('shifts_') && !k.includes('__backup_')).sort();
  if (keys.length) {
    const latestKey = keys[keys.length - 1];
    const json = JSON.parse(localStorage.getItem(latestKey));
    cachedWorkbook = {
      Sheets: { Sheet1: XLSX.utils.aoa_to_sheet(json) },
      SheetNames: ['Sheet1']
    };
    document.getElementById('monthSelector').value = latestKey;
    tryShowShifts();
  }
});

function updateAvailableMonths() {
  const select = document.getElementById('monthSelector');
  if (!select) return;

  select.innerHTML = '';
select.style.display = 'block'; // Показываем, если был скрыт
  const keys = Object.keys(localStorage).filter(k => k.startsWith('shifts_') && !k.includes('__backup_'));
  keys.sort().reverse().forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key.replace('shifts_', '').replace('_', '.');
    select.appendChild(option);
  });
}

function tryShowShifts() {
  const dateValue = document.getElementById('shiftQueryDate').value;
  if (!cachedWorkbook || !dateValue) {
    document.getElementById('shiftResults').innerHTML = 'Нет данных: график не загружен или дата не выбрана.';
    return;
  }

  const day = new Date(dateValue).getDate();
  const sheet = cachedWorkbook.Sheets[cachedWorkbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const headerRow = json[1];

  const colDebug = headerRow.map(c => ({
    raw: c,
    number: Number(c),
    type: typeof c
  }));

  const dateColIndex = colDebug.findIndex(col => col.number === day);

  if (dateColIndex === -1) {
    document.getElementById('shiftResults').innerHTML = 'Нет данных на эту дату.';
    return;
  }

  let dayShift = [], nightShift = [];

  for (let i = 2; i < json.length; i++) {
    const row = json[i];
    const fio = row[0];
    if (!fio || typeof fio !== 'string') continue;
    if (!/^[А-ЯЁA-Z][а-яёa-z]+\s+[А-ЯЁA-Z]\.[А-ЯЁA-Z]\.$/.test(fio)) continue;

    const shift = row[dateColIndex]?.toString().trim();
    if (shift === 'Д') dayShift.push(fio);
    if (shift === 'Н') nightShift.push(fio);
  }

  const resultBox = document.getElementById("shiftResults");
  resultBox.innerHTML = `
    <h4>Дневная смена:</h4><div>${dayShift.join('<br>') || '—'}</div>
    <h4>Ночная смена:</h4><div>${nightShift.join('<br>') || '—'}</div>`;
}

// удалить все графики


document.getElementById('clearShiftGraphsBtn')?.addEventListener('click', () => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('shifts_') && !k.includes('__backup_'));
  if (!keys.length) {
    alert('Нет сохранённых графиков.');
    return;
  }

  const confirmDelete = confirm(`Удалить все графики смен (${keys.length})?`);
  if (!confirmDelete) return;

  keys.forEach(k => localStorage.removeItem(k));
  updateAvailableMonths();
  cachedWorkbook = null;
  document.getElementById('shiftResults').innerHTML = 'Графики удалены.';
});