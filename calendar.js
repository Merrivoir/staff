function initSwiper() {
// Инициализируем Swiper после добавления всех слайдов
  const swiper = new Swiper('.swiper-container', {
    // Настройки Swiper
    loop: false,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    on: {
      slideChangeTransitionEnd: function () {
        const currentSlide = swiper.slides[swiper.activeIndex];
        const dateStr = currentSlide.getAttribute('data-date');
        if (dateStr) setCalendarDate(dateStr)
      },
    }
  });
  return swiper;
}

// Инициализация календаря  
  
  const calendarInstance = flatpickr(calendarInput, {
    dateFormat: "Y-m-d",
    defaultDate: new Date(), // Устанавливаем текущую дату по умолчанию
    firstDayOfWeek: 1,
    enableTime: false,
    onChange: function(selectedDates, dateStr) {
      if (isProgrammaticChange) {
        isProgrammaticChange = false;
        return;
      }
      
      console.log("Выбрана дата пользователем:", dateStr);
      const swiper = initSwiper()
      const targetIndex = Array.from(swiper.slides).findIndex(
        slide => slide.getAttribute('data-date') === dateStr
      );
      
      targetIndex !== -1 ? swiper.slideTo(targetIndex) : fetchData(dateStr);
    },
    enable: [
      {
        from: new Date().fp_incr(-365), // Показать даты за последний год
        to: new Date().fp_incr(365),    // и следующий год
      },
      ...eventDates
    ],
    onDayCreate: function(dObj, dStr, fp, dayElem) {
      const date = dayElem.dateObj.toISOString().split('T')[0];
      if (eventDates.includes(date)) {
        dayElem.innerHTML += '<span class="event-dot"></span>';
      }
    }
  });

