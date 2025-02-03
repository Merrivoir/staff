
    const calendarInput = document.getElementById("calendar")

    flatpickr(calendarInput, {
      locale: "ru", // Понедельник первый
      dateFormat: "d.m.Y",
      defaultDate: new Date(),
      enableTime: false,
      weekNumbers: true,
      onChange: function (selectedDates, dateStr, instance) {
        console.log("Выбрана дата:", dateStr)
        fetchData(dateStr)
      },
    });