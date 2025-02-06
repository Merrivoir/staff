function initSwiper() {
// Инициализируем Swiper после добавления всех слайдов
  const swiper = new Swiper('.swiper-container', {
    // Настройки Swiper
    slidesPerView: 1, // Показывать только один слайд за раз
    spaceBetween: 10, // Расстояние между слайдами
    centeredSlides: false, // Не центрировать слайды
    loop: false, // Отключить зацикливание (если не нужно)
    freeMode: false, // Отключить свободный режим

  // Адаптивность
    breakpoints: {
      // Настройки для разных разрешений
      640: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      768: {
        slidesPerView: 1,
        spaceBetween: 15,
      },
      1024: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
    },

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
  onDayCreate: function(dObj, dStr, fp, dayElem) {
    const currentDate = flatpickr.formatDate(dayElem.dateObj, 'Y-m-d');
    if (eventDates.includes(currentDate)) {
      dayElem.innerHTML += '<span class="event-dot"></span>';
      dayElem.classList.add('has-event');
    }
  }
});

