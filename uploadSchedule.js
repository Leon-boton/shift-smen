document.addEventListener("DOMContentLoaded", () => {
    const uploadBtn = document.getElementById("uploadScheduleBtn");
    const fileInput = document.getElementById("scheduleFileInput");
    const fioSelect = document.getElementById("fioSelect");
    const importModal = document.getElementById("scheduleImportModal");
    const closeModal = document.getElementById("closeImportModal");

    let parsedData = [];
    let month = null;
    let year = null;

    uploadBtn.addEventListener("click", () => {
        importModal.style.display = "flex";
    });

    closeModal.addEventListener("click", () => {
        importModal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === importModal) importModal.style.display = "none";
    });

    fileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const reader = new FileReader();
        reader.onload = async function () {
            const buffer = reader.result;
            const wb = await window.XLSX.read(buffer, { type: "array" });
            const sheetName = "Краткий отчет";
            const sheet = wb.Sheets[sheetName];
            const json = window.XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const headerRow = json[0];
            const dataRows = json.slice(1);

            parsedData = [];
            fioSelect.innerHTML = "";

            for (let row of dataRows) {
                const fio = row[0];
                if (typeof fio === "string" && /^[А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.[А-ЯЁ]\.$/.test(fio)) {
                    parsedData.push({ fio, row });
                    const opt = document.createElement("option");
                    opt.value = fio;
                    opt.textContent = fio;
                    fioSelect.appendChild(opt);
                }
            }

            const now = new Date();
            month = now.getMonth();
            year = now.getFullYear();

            alert("Файл загружен! Выберите сотрудника для импорта смен.");
        };
        reader.readAsArrayBuffer(file);
    });

    document.getElementById("importShifts").addEventListener("click", () => {
        const selectedFio = fioSelect.value;
        const match = parsedData.find(d => d.fio === selectedFio);
        if (!match) return;

        const days = parsedData[0].row.map((_, i) => i).slice(1); // предполагаем даты начинаются со 2-й колонки
        const row = match.row;

        for (let i = 1; i < row.length; i++) {
            const val = String(row[i]).trim().toUpperCase();
            if (val === "Д" || val === "Н") {
                const day = i;
                const dateStr = new Date(year, month, day + 1).toISOString().split("T")[0];
                const key = `shift-${dateStr}`;
                const shiftData = {
                    type: val === "Д" ? "day" : "night",
                    date: dateStr.split("-").reverse().join("."),
                    time: val === "Д" ? "07:00" : "19:00"
                };
                localStorage.setItem(key, JSON.stringify(shiftData));

//хуй
// Добавляем смену также в shifts[]
let shifts = JSON.parse(localStorage.getItem("shifts") || "[]");
shifts.push({
    id: Date.now() + i,
    name: shiftData.type === "day" ? "День" : "Ночь",
    date: dateStr, // уже YYYY-MM-DD
    startTime: shiftData.time,
    shiftType: shiftData.type,
    remindBefore: 30,
    isDone: false
});
localStorage.setItem("shifts", JSON.stringify(shifts));

//
            }
        }

        alert("Смены успешно импортированы!");
        importModal.style.display = "none";

        if (typeof renderCalendar === "function") {
            const now = new Date();
            renderCalendar(now.getMonth(), now.getFullYear());
        }
    });
});
