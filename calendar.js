
    const calendarInput = document.getElementById("calendar")

    flatpickr(calendarInput, {
      locale: "ru", // Понедельник первый
      dateFormat: "d.m.Y",
      defaultDate: new Date(),
      firstDayOfWeek: 1,
      enableTime: false,
      onChange: function (selectedDates, dateStr, instance) {
        console.log("Выбрана дата:", dateStr)
        fetchData(dateStr)
      },
    });