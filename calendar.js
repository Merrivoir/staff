
    const calendarInput = document.getElementById("calendar")
    flatpickr(calendarInput, {
      dateFormat: "Y-m-d", // Формат даты: Год-месяц-день
      defaultDate: new Date(), // Устанавливаем текущую дату по умолчанию
      onChange: function (selectedDates, dateStr, instance) {
        console.log("Выбрана дата:", dateStr)
        fetchData(dateStr)
      },
    });