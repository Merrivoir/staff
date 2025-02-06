async function fetchData(date = null) {
  try {
    // Показать индикатор загрузки
    modal.style.display = "flex";
    if (!date) {
      date = new Date().toISOString().split("T")[0]; // Формат YYYY-MM-DD
    }
    
    const savedData = JSON.parse(localStorage.getItem('allData')) || {};

    if (Object.keys(savedData).length > 0) {
      modal.style.display = "none"
      console.log("Загружаем данные из локального хранилища");
      processAndDisplayData(savedData, date);
    }
    
    const sync = document.getElementById('sync-container')
    sync.classList.remove('hidden')
    
    try {
      // Формируем URL с параметром даты, если указан
      let apiUrlWithDate = apiUrl;
      if (date) {
        const queryParams = new URLSearchParams({ date });
        apiUrlWithDate = `${apiUrl}?${queryParams}`;
      }
    
      // Отправляем запрос на сервер
      const response = await fetch(apiUrlWithDate);
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
    
      const remoteData = await response.json();
      console.log(remoteData)
    
      // Проверяем изменения в данных
      if (!savedData || JSON.stringify(savedData) !== JSON.stringify(remoteData)) {
        console.log("Обновлены данные с сервера");
        saveDataToLocalStorage(remoteData) // Сохраняем новые данные
        const nd = sortLocalStorage()
        ed = Object.keys(nd);
        eventDates = ed.map(dateStr => {
          const [year, month, day] = dateStr.split('-');
          return new Date(year, month - 1, day).toLocaleDateString('en-CA');
        });
        processAndDisplayData(nd, date);
        showUpdateNotification("Данные обновлены");
      } else {
        console.log("Данные актуальны, обновление не требуется.");
        showUpdateNotification("Данные актуальны");
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      alert("Не удалось загрузить данные.");
    } finally {
      // Скрываем элемент sync после завершения запроса
      sync.classList.add('hidden');
    }

  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    showUpdateNotification("Ошибка загрузки данных");
  } finally {
    modal.style.display = "none"
  }
}

// Обработка и отображение данных
function processAndDisplayData(data, date) {
  
  document.querySelectorAll('.swiper-container').forEach(element => {
    element.remove();
  });
  
  // Создаём контейнеры Swiper
  const swiperContainer = document.createElement('div');
  swiperContainer.classList.add('swiper-container');

  const swiperWrapper = document.createElement('div');
  swiperWrapper.classList.add('swiper-wrapper');

  swiperContainer.appendChild(swiperWrapper);

  // Добавим кнопки навигации (если нужны)
  const swiperButtonNext = document.createElement('div');
  swiperButtonNext.classList.add('swiper-button-next');
  swiperContainer.appendChild(swiperButtonNext);

  const swiperButtonPrev = document.createElement('div');
  swiperButtonPrev.classList.add('swiper-button-prev');
  swiperContainer.appendChild(swiperButtonPrev);

  // Добавим пагинацию (если нужна)
  const swiperPagination = document.createElement('div');
  swiperPagination.classList.add('swiper-pagination');
  swiperContainer.appendChild(swiperPagination);

  // Объект для хранения данных, сгруппированных по датам и событиям
  const groupedData = {};

  // Группировка данных по датам и событиям
  for (const date in data) {
    const users = data[date];
    if (!groupedData[date]) {
      groupedData[date] = {};
    }
    for (const userName in users) {
      const user = users[userName];
      user.events.forEach((eventName, index) => {
        const sum = user.sums[index];
        if (sum !== "0") {
          if (!groupedData[date][eventName]) {
            groupedData[date][eventName] = [];
          }
          groupedData[date][eventName].push({
            name: userName,
            id: user.id,
            sum
          });
        }
      });
    }
  }

  // Проходим по датам
  for (const date in groupedData) {
    const dateGroup = groupedData[date];

    // Создаём слайд для каждой даты
    const swiperSlide = document.createElement('div');
    swiperSlide.classList.add('swiper-slide');
    swiperSlide.setAttribute('data-date', date)

    const dateElement = document.createElement("div");
    dateElement.classList.add("date-group");

    // Проходим по событиям внутри даты
    for (const eventName in dateGroup) {
      const users = dateGroup[eventName];

      const groupElement = document.createElement("div");
      groupElement.classList.add("list-group");

      const header = document.createElement("h3");
      header.textContent = eventName;
      header.classList.add('subhead');
      groupElement.appendChild(header);

      const tableContainer = document.createElement("div");
      tableContainer.classList.add('table-container');

      const userTable = document.createElement("table");

      const headerRow = createTableHeader();
      userTable.appendChild(headerRow);

      const tbody = createTableUsers(users, date);
      userTable.appendChild(tbody);

      addOrdering(headerRow, tbody);

      tableContainer.appendChild(userTable);
      groupElement.appendChild(tableContainer);
      dateElement.appendChild(groupElement);
    }

    swiperSlide.appendChild(dateElement);
    swiperWrapper.appendChild(swiperSlide);
  }
  content.appendChild(swiperContainer)

  // Обновляем обработчик изменения состояния чекбоксов
  swiperContainer.addEventListener("change", function (event) {
    if (event.target.classList.contains("user-checkbox")) {
      const userId = event.target.getAttribute("data-user-id");
      const isChecked = event.target.checked;
      const date = event.target.getAttribute("data-date"); // Получаем дату из атрибута

      // Обновляем состояния в локальном хранилище для текущей даты
      const checkboxStates = JSON.parse(localStorage.getItem("checkboxStates")) || {};
      if (!checkboxStates[date]) {
        checkboxStates[date] = {};
      }
      checkboxStates[date][userId] = isChecked;
      localStorage.setItem("checkboxStates", JSON.stringify(checkboxStates));
    }
  });
  const swiper = initSwiper()
  const targetDate = date ? date : new Date().toISOString().split("T")[0];
  const slides = document.querySelectorAll('.swiper-slide');
  const slideIndex = findSlideIndexByDate(slides, targetDate);

  if (slideIndex !== -1) {
    swiper.slideTo(slideIndex[0]);
    setCalendarDate(slideIndex[1])
    console.log(`Перешли к слайду с индексом ${slideIndex}`);
  } else {
    console.log('Слайды с датами не найдены');
  }
}

processAndDisplayData(sd)
fetchData()