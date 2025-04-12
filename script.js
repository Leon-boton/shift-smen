const debugShiftsBtn = document.getElementById("debugShiftsBtn");
const debugShiftsModal = document.getElementById("debugShiftsModal");
const closeDebugShiftsModal = document.getElementById("closeDebugShiftsModal");
const debugShiftsList = document.getElementById("debugShiftsList");

document.getElementById("openDebugShifts").addEventListener("click", () => {
    document.getElementById("debugShiftsModal").style.display = "flex";

  
const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");

  if (!shifts.length) {
    debugShiftsList.innerHTML = "<i>Нет сохранённых смен</i>";
  } else {
    debugShiftsList.innerHTML = shifts.map(s => `
      <div class="${s.shiftType}">
        <b>${s.date}</b> — ${s.name} (${s.startTime})
      </div>
    `).join("");
  }

  debugShiftsModal.style.display = "flex";
});

closeDebugShiftsModal.addEventListener("click", () => {
  debugShiftsModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === debugShiftsModal) {
    debugShiftsModal.style.display = "none";
  }
});
//🤨🤨🤨сох нахуй
function renderShiftsList() {
    const debugShiftsList = document.getElementById("debugShiftsList");
    const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");

    if (!shifts.length) {
        debugShiftsList.innerHTML = "<i>Нет сохранённых смен</i>";
    } else {
        debugShiftsList.innerHTML = shifts.map(s => `
            <div class="${s.shiftType}">
                <b>${s.date}</b> — ${s.name} (${s.startTime})
            </div>
        `).join("");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderShiftsList();
});
//!

document.addEventListener("DOMContentLoaded", function () {
    const calendarGrid = document.getElementById("calendarGrid");
    const monthYear = document.getElementById("monthYear");
    const prevMonth = document.getElementById("prevMonth");
    const nextMonth = document.getElementById("nextMonth");
    const modal = document.getElementById("modal");
    const modalDate = document.getElementById("modal-date");
    const eventTitle = document.getElementById("eventTitle");
    const eventTime = document.getElementById("eventTime");
    const saveEventBtn = document.getElementById("saveEvent");
    const deleteEventBtn = document.getElementById("deleteEvent");
    const closeModal = document.querySelector(".close");

    let date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();
    let selectedDate = null;

    modal.style.display = "none";

    function renderCalendar(month, year) {
        calendarGrid.innerHTML = "";

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const prevLastDate = new Date(year, month, 0).getDate();
        let offset = firstDay === 0 ? 6 : firstDay - 1;

        monthYear.textContent = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(new Date(year, month));

        let days = [];

        // Предыдущий месяц
        for (let i = offset; i > 0; i--) {
            days.push(`<div class="gray">${prevLastDate - i + 1}</div>`);
        }

        // Текущий месяц
        for (let i = 1; i <= lastDate; i++) {
    let today = new Date();
    let isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
    let dateKey = `${i}-${month + 1}-${year}`;
    let storedEvent = JSON.parse(localStorage.getItem(dateKey));

    let hasEvent = "";
    let isoDateKey = `${year}-${(month + 1).toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;
    
    // Если ты используешь массив shifts:
    const allShifts = JSON.parse(localStorage.getItem("shifts") || "[]");
    const shift = allShifts.find(s => s.date === isoDateKey);

    if (shift) {
        hasEvent = shift.shiftType === "day" ? "shift-day" : "shift-night";
    } else if (storedEvent) {
        hasEvent = "has-event";
    }

    let todayClass = isToday ? "today" : "";

    days.push(`<div class="${hasEvent} ${todayClass}" data-date="${dateKey}">${i}</div>`);
}

        // Следующий месяц
        let totalCells = days.length;
        let nextMonthDays = totalCells < 42 ? 42 - totalCells : 0;

        for (let i = 1; i <= nextMonthDays; i++) {
            days.push(`<div class="gray">${i}</div>`);
        }

        calendarGrid.innerHTML = days.join("");

        document.querySelectorAll(".calendar-grid div").forEach(day => {
  if (day.dataset.date) {
    day.addEventListener("click", function () {
      selectedDate = this.dataset.date;
      modalDate.textContent = `Смена на ${selectedDate}`;

      const shiftTypeSelect = document.getElementById("shiftTypeSelect");
shiftTypeSelect.addEventListener("change", () => {
  shiftTypeSelect.classList.remove("shift-day", "shift-night");
  shiftTypeSelect.classList.add(
    shiftTypeSelect.value === "night" ? "shift-night" : "shift-day"
  );
});
      const storedEvent = JSON.parse(localStorage.getItem(selectedDate));

      // Автоматически выбрать тип смены
      shiftTypeSelect.value = storedEvent?.time === "19:00" ? "night" : "day";

      // Обновить цвет
      shiftTypeSelect.classList.remove("shift-day", "shift-night");
      shiftTypeSelect.classList.add(
        shiftTypeSelect.value === "night" ? "shift-night" : "shift-day"
      );

      modal.style.display = "flex";
    });
  }
});
    }

    prevMonth.addEventListener("click", () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    nextMonth.addEventListener("click", () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });

//хуй там пел
saveEventBtn.addEventListener("click", () => {
    if (selectedDate) {
        const shiftType = document.getElementById("shiftTypeSelect").value;

        const shiftName = shiftType === "night" ? "Ночь" : "День";
        const shiftTime = shiftType === "night" ? "19:00" : "07:00";

        // Сохраняем как событие (для клика по дате)
        localStorage.setItem(selectedDate, JSON.stringify({
            title: shiftName,
            time: shiftTime
        }));

        // Преобразуем дату в формат YYYY-MM-DD
        const [day, month, year] = selectedDate.split("-");
        const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

        // Добавляем в shifts[]
        const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");

        const exists = shifts.some(s => s.date === formattedDate);
        if (!exists) {
            shifts.push({
    id: Date.now(),
    date: formattedDate,
    name: shiftName,
    startTime: shiftTime,
    shiftType
});
            localStorage.setItem("shifts", JSON.stringify(shifts));
        }

        modal.style.display = "none";
        renderCalendar(currentMonth, currentYear);
        updateMonthStats(currentMonth, currentYear);

updateNextShiftWidget();
    }
});
//стоп нах
    deleteEventBtn.addEventListener("click", () => {
    if (selectedDate) {
        // Удалить из обычного localStorage
        localStorage.removeItem(selectedDate);

        // Удалить из массива shifts[]
        const [d, m, y] = selectedDate.split("-");
        const formattedDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;

        let shifts = JSON.parse(localStorage.getItem("shifts") || "[]");
        shifts = shifts.filter(s => s.date !== formattedDate);
        localStorage.setItem("shifts", JSON.stringify(shifts));

        modal.style.display = "none";
        renderCalendar(currentMonth, currentYear);
        updateMonthStats(currentMonth, currentYear);
        updateNextShiftWidget();
    }
});

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    renderCalendar(currentMonth, currentYear);
updateMonthStats(currentMonth, currentYear);
updateNextShiftWidget();
    window.renderCalendar = renderCalendar;
});
//счетчик смен

function updateMonthStats(month, year) {
  const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");

  const filtered = shifts.filter(s => {
    if (!s.date) return false;

    const d = new Date(s.date);
    return !isNaN(d) && d.getMonth() === month && d.getFullYear() === year;
  });

  const totalShifts = filtered.length;

  let totalHours = 0;
  for (let shift of filtered) {
    if (shift.shiftType === "day") totalHours += 12;
    else if (shift.shiftType === "night") totalHours += 20;
  }

  document.getElementById("totalShifts").textContent = totalShifts;
  document.getElementById("totalHours").textContent = `${totalHours} `;
}

// гамбургер
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
//!!!
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  sidebar.classList.toggle("active");

  const statsBox = document.getElementById("statsBox");
  if (sidebar.classList.contains("active")) {
    statsBox.style.display = "none";
  } else {
    statsBox.style.display = "";
  }
});

//след смена
function updateNextShiftWidget() {
  const shifts = JSON.parse(localStorage.getItem("shifts") || "[]");
  if (!shifts.length) return;

  const now = new Date();
  const upcoming = shifts
    .map(s => ({ ...s, dateObj: new Date(s.date + "T" + s.startTime) }))
    .filter(s => s.dateObj > now)
    .sort((a, b) => a.dateObj - b.dateObj)[0];

  if (upcoming) {
    document.getElementById("nextShiftDate").textContent = new Intl.DateTimeFormat("ru-RU", {
      day: "numeric", month: "long", weekday: "short"
    }).format(upcoming.dateObj);

    document.getElementById("nextShiftType").textContent =
      (upcoming.shiftType === "night" ? "Ночная" : "Дневная") + " смена в " + upcoming.startTime;
  } else {
    document.getElementById("nextShiftDate").textContent = "—";
    document.getElementById("nextShiftType").textContent = "Смен нет";
  }
}

// погода
async function updateWeatherWidget() {
  const apiKey = "989fb75ff4a0931e5f5636e6009c8de4";
  const city = "Biysk"; // английское написание
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const temp = Math.round(data.main.temp) + "°";
    const desc = data.weather[0].description;
    const cityName = data.name;

    document.getElementById("weatherTemp").textContent = temp;
    document.getElementById("weatherDesc").textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
    document.getElementById("weatherCity").textContent = cityName;
  } catch (err) {
    console.error("Ошибка погоды:", err);
    document.getElementById("weatherDesc").textContent = "Недоступно";
  }
}

updateWeatherWidget();