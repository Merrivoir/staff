flatpickr(calendarInput, {
  dateFormat: "Y-m-d",
  defaultDate: new Date(),
  firstDayOfWeek: 1,
  enableTime: false,
  onChange: function (selectedDates, dateStr, instance) {
    console.log("Выбрана дата:", dateStr)
    fetchData(dateStr)
  },
});