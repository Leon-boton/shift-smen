document.addEventListener("DOMContentLoaded", function () {
    const calcBtn = document.getElementById("calcSalaryBtn");
    const salaryModal = document.getElementById("salaryModal");
    const closeModal = document.getElementById("closeSalaryModal");
    const calcSalaryBtn = document.getElementById("calcSalary");
    const salaryRateInput = document.getElementById("salaryRate");
    const salaryMonthInput = document.getElementById("salaryMonth");
    const salaryResult = document.getElementById("salaryResult");

//🇦🇲🇦🇲
    calcBtn.addEventListener("click", () => {
    salaryModal.style.display = "flex";
    setTimeout(() => {
        document.getElementById("salaryRate").focus();
    }, 300); // ← задержка, чтобы модалка точно отобразилась
});
    closeModal.addEventListener("click", () => {
        salaryModal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === salaryModal) salaryModal.style.display = "none";
    });

    const HOLIDAYS_2025 = [
        "2025-01-01", "2025-01-02", "2025-01-03", "2025-01-04", "2025-01-05",
        "2025-01-06", "2025-01-07", "2025-01-08", "2025-02-23", "2025-03-08",
        "2025-05-01", "2025-05-09", "2025-06-12", "2025-11-04"
    ];

    calcSalaryBtn.addEventListener("click", () => {
        const rate = parseFloat(salaryRateInput.value);
        const monthStr = salaryMonthInput.value;

        if (!rate || !monthStr) {
            salaryResult.textContent = "Введите ставку и выберите месяц.";

            return;
        }

        const ktu = 1.3;
        const regionCoef = 1.15;
        const harmfulPercent = 0.04;
        const ndfl = 0.13;

        // Получаем смены из ключей shift-YYYY-MM-DD
        const keyShifts = Object.keys(localStorage)
            .filter(key => key.startsWith("shift-") && key.includes(monthStr))
            .map(key => {
                const shift = JSON.parse(localStorage.getItem(key));
                return { ...shift, date: key.replace("shift-", "") };
            });

        // Получаем смены из массива shifts[]
        const arrayShifts = JSON.parse(localStorage.getItem("shifts") || "[]")
            .filter(shift => shift.date && shift.date.startsWith(monthStr));

        // Объединяем и убираем дубликаты по дате
        // Объединяем смены, учитывая shiftType как type
const allShifts = [...keyShifts, ...arrayShifts].map(shift => ({
    ...shift,
    type: shift.type || shift.shiftType
}));

// Убираем дубликаты по дате
const seen = new Set();
const shifts = allShifts.filter(shift => {
    if (seen.has(shift.date)) return false;
    seen.add(shift.date);
    return true;
});

        let dayHours = 0;
        let nightBonusHours = 0;
        let holidayDayHours = 0;
        let holidayNightBonusHours = 0;

        shifts.forEach(shift => {
            const date = shift.date;
            const isHoliday = HOLIDAYS_2025.includes(date);

            if (shift.type === "day") {
                if (isHoliday) {
                    holidayDayHours += 12;
                } else {
                    dayHours += 12;
                }
            } else if (shift.type === "night") {
                if (isHoliday) {
                    dayHours += 12;
                    holidayNightBonusHours += 8;
                } else {
                    dayHours += 12;
                    nightBonusHours += 8;
                }
            }
        });

        const shiftCount = shifts.length;
        const basePay = dayHours * rate;
        const nightBonusPay = nightBonusHours * rate;
        const holidayDayPay = holidayDayHours * rate * 2;
        const holidayNightBonusPay = holidayNightBonusHours * rate * 2;

        const harmful = basePay * harmfulPercent;
        const ktuBonus = basePay * (ktu - 1);
        const regionBonus = (basePay + nightBonusPay + holidayDayPay + holidayNightBonusPay + harmful + ktuBonus) * (regionCoef - 1);
        const premium = shiftCount >= 20 ? 7000 : 0;

        const gross = basePay + nightBonusPay + holidayDayPay + holidayNightBonusPay + harmful + ktuBonus + regionBonus + premium;
        const tax = gross * ndfl;
        const net = gross - tax;

        salaryResult.innerHTML = `
            <p><strong>Смен: ${shiftCount}</strong></p>
            <p>Обычные часы: ${dayHours} ч × ${rate}₽ = <strong>${basePay.toFixed(2)}₽</strong></p>
            <p>Ночные часы: ${nightBonusHours} ч × ${rate}₽ = <strong>${nightBonusPay.toFixed(2)}₽</strong></p>
            <p>Праздничные (день): ${holidayDayHours} ч × ${rate * 2}₽ = <strong>${holidayDayPay.toFixed(2)}₽</strong></p>
            <p>Праздничные (ночь): ${holidayNightBonusHours} ч × ${rate * 2}₽ = <strong>${holidayNightBonusPay.toFixed(2)}₽</strong></p>
            <hr>
            <p>КТУ (30%): <strong>${ktuBonus.toFixed(2)}₽</strong></p>
            <p>Вредные условия (4%): <strong>${harmful.toFixed(2)}₽</strong></p>
            <p>Районный коэффициент (15%): <strong>${regionBonus.toFixed(2)}₽</strong></p>
            <p>Премия за 20 смен: <strong>${premium.toFixed(2)}₽</strong></p>
            <p><strong>Итого начислено: ${gross.toFixed(2)}₽</strong></p>
            <p>НДФЛ (13%): <strong>-${tax.toFixed(2)}₽</strong></p>
            <hr>
            <p><strong>К выплате: ${net.toFixed(2)}₽</strong></p>
        `;
localStorage.setItem(`salary_${monthStr}`, gross.toFixed(2));
calculateVacationPay(monthStr);
    });
});

// Функция расчёта отпускных
function calculateVacationPay(monthStr) {
  const input = prompt("Введите количество дней отпуска:");
  if (input === null) return; // Нажали "Отмена"

  const daysOfVacation = parseInt(input);
  if (!daysOfVacation || daysOfVacation <= 0) {
    alert('Пожалуйста, введите корректное количество дней.');
    return;
  }

  const date = new Date(monthStr);
  let totalSalary = 0;

  for (let i = 0; i < 12; i++) {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const salary = parseFloat(localStorage.getItem(`salary_${key}`)) || 0;
    totalSalary += salary;
    date.setMonth(date.getMonth() - 1);
  }

  if (totalSalary === 0) {
    alert("Нет данных о зарплате за последние 12 месяцев.");
    return;
  }

  const avgDaily = totalSalary / (12 * 29.3);
  const vacationPay = avgDaily * daysOfVacation;
  const vacationTax = vacationPay * 0.13;
  const vacationNet = vacationPay - vacationTax;

  const vacationResult = `
    <hr>
    <p><strong>Отпускные:</strong></p>
    <p>Сумма за 12 месяцев: <strong>${totalSalary.toFixed(2)} ₽</strong></p>
    <p>Среднедневной заработок: <strong>${avgDaily.toFixed(2)} ₽</strong></p>
    <p>Начислено: <strong>${vacationPay.toFixed(2)} ₽</strong></p>
    <p>НДФЛ (13%): <strong>-${vacationTax.toFixed(2)} ₽</strong></p>
    <p><strong>К выплате: ${vacationNet.toFixed(2)} ₽</strong></p>
  `;

  document.getElementById("salaryResult").innerHTML += vacationResult;
}