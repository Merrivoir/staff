
    const calendarInput = document.getElementById("calendar")

    flatpickr(calendarInput, {
      dateFormat: "d.m.Y",
      defaultDate: new Date(),
      firstDayOfWeek: 1,
      enableTime: false,
      onChange: function (selectedDates, dateStr, instance) {
        console.log("Выбрана дата:", dateStr)
        fetchData(dateStr)
      },
    });