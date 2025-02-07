(async function() {
  try {
    
    const savedData = JSON.parse(localStorage.getItem('allData')) || {};

    if (Object.keys(savedData).length > 0) {
      console.log("Загружаем данные из локального хранилища");
      processAndDisplayData(savedData, null);
    }
    
    const sync = document.getElementById('sync-container')
    sync.classList.remove('hidden')
    
    try {
      // Отправляем запрос на сервер
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
    
      const remoteData = await response.json();
      console.log("Обновлены данные с сервера");
      const nd = saveAndSortData(remoteData)
      processAndDisplayData(nd, null);
      showUpdateNotification("Данные обновлены");
      
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
})();


async function fetchData(date = null) {
  try {
    // Показать индикатор загрузки
    if (!date) {
      date = new Date().toISOString().split("T")[0]; // Формат YYYY-MM-DD
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
      console.log("Обновлены данные с сервера");
      const nd = saveAndSortData(remoteData)
      processAndDisplayData(nd, date);
      showUpdateNotification("Данные обновлены");
      
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
  }
}

// Группировка allData по датам
function groupByDate(data) {
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
  return groupedData;
}

// Обработка и отображение данных
function processAndDisplayData(data, date) {

  let swiperContainer = document.querySelector('.swiper-container');
  
  console.log(`swiperContainer: ${swiperContainer}`)

  if (!swiperContainer) {
  
    // Создаём контейнеры Swiper
    swiperContainer = document.createElement('div');
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

    content.appendChild(swiperContainer)

  }
  
  const swiperWrapper = swiperContainer.querySelector('.swiper-wrapper');
  swiperWrapper.innerHTML = '';

  const groupedData = groupByDate(data);
    
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
      const headElement = document.createElement('div')
        headElement.classList.add('nameGame')
      const header = document.createElement("h3");
        header.textContent = eventName;
        header.classList.add('subhead');
        headElement.appendChild(header);
        groupElement.appendChild(headElement);
      const tableContainer = document.createElement("div");
        tableContainer.classList.add('table-container');
      const userTable = document.createElement("table");
      const headerRow = createTableHeader();
      userTable.appendChild(headerRow);
      const tbody = createTableUsers(users, date);
      userTable.appendChild(tbody);
      handlerForSort(headerRow, tbody);
      tableContainer.appendChild(userTable);
      groupElement.appendChild(tableContainer);
      dateElement.appendChild(groupElement);
    }
    swiperSlide.appendChild(dateElement);
    swiperWrapper.appendChild(swiperSlide);
  }
  content.appendChild(swiperContainer)

  const swiper = initSwiper();
  swiper.update();
  swiper.navigation.update();

  const targetDate = date ? date : new Date().toISOString().split("T")[0];
  const slides = document.querySelectorAll('.swiper-slide');
  const slideIndex = findSlideIndexByDate(slides, targetDate);

  if (slideIndex !== -1) {
    swiper.slideTo(slideIndex[0]);
    setCalendarDate(slideIndex[1])
    console.log(`Перешли к слайду с индексом ${slideIndex[0]}`);
  } else {
    console.log('Слайды с датами не найдены');
  }
  copyTable()
}