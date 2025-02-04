async function fetchData(date = null) {
  try {
    // Показать индикатор загрузки
    modal.style.display = "flex";
    listContainer.classList.add("hidden");
    if (!date) {
      date = new Date().toISOString().split("T")[0]; // Формат YYYY-MM-DD
    }
    const localDataKey = `data_${date}`; // Уникальный ключ для хранения данных по дате
    const localData = JSON.parse(localStorage.getItem(localDataKey));
    
    if (localData) {
      modal.style.display = "none"
      console.log("Загружаем данные из локального хранилища");
      processAndDisplayData(localData);
      listContainer.classList.remove("hidden");
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
    
      // Проверяем изменения в данных
      if (!localData || JSON.stringify(localData) !== JSON.stringify(remoteData)) {
        console.log("Обновлены данные с сервера");
        localStorage.setItem(localDataKey, JSON.stringify(remoteData)); // Сохраняем новые данные
        processAndDisplayData(remoteData); // Отображаем новые данные
        listContainer.classList.remove("hidden");
        showUpdateNotification("Данные обновлены"); // Показываем уведомление об обновлении данных
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

function showUpdateNotification(text, level=0) {
  
  switch (level) {
    case 0:
      back = "green"
      break
    case 1:
      back = "yellow"
      break
    case 2:
      back = "red"
      break
    default:
      back = "gray"
  }

  const notification = document.createElement("div");
  notification.textContent = text;
  notification.className = `update-notification ${back}`;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("fade-out");
    // Удаляем элемент после завершения анимации
    setTimeout(() => {
      notification.remove();
    }, 800); // Время должно совпадать с длительностью transition
  }, 3000);
}

// Обработка и отображение данных
function processAndDisplayData(data) {
  listContainer.innerHTML = ""; // Очистить контейнер
  const date = Object.keys(data)[0];
  const calendar = document.getElementById('event');

  if (date) {
    calendar.textContent = `Мероприятия на:`;
  } else {
    calendar.textContent = "Мероприятий нет";
  }

  const groupedData = {};
  for (const date in data) {
    const users = data[date];
    for (const userName in users) {
      const user = users[userName];
      user.events.forEach((columnName, index) => {
        const sum = user.sums[index];
        if (sum !== "0") {
          if (!groupedData[columnName]) {
            groupedData[columnName] = [];
          }
          groupedData[columnName].push({
            name: userName,
            id: user.id,
            sum
          });
        }
      });
    }
  }

  // Загружаем состояния чекбоксов для текущей даты

  for (const columnName in groupedData) {
    const users = groupedData[columnName];
    const groupElement = document.createElement("div");
    groupElement.classList.add("list-group");

    const header = document.createElement("h3");
    header.textContent = columnName;
    header.classList.add('subhead')
    groupElement.appendChild(header);
    
    const tableContainer = document.createElement("div");
    tableContainer.classList.add('table-container')
    
    const userTable = document.createElement("table");

    const headerRow = createTable();
    userTable.appendChild(headerRow);
    
    const tbody = crUsers(users, date);
    userTable.appendChild(tbody);

    addOrdering(headerRow, tbody);

    tableContainer.appendChild(userTable)
    groupElement.appendChild(tableContainer)
    listContainer.appendChild(groupElement);
  }

  listContainer.classList.remove("hidden");

  // Добавляем обработчик изменения состояния чекбоксов
  listContainer.addEventListener("change", function (event) {
    if (event.target.classList.contains("user-checkbox")) {
      const userId = event.target.getAttribute("data-user-id");
      const isChecked = event.target.checked;

      // Обновляем состояния в локальном хранилище для текущей даты
      const checkboxStates = JSON.parse(localStorage.getItem("checkboxStates")) || {};
      if (!checkboxStates[date]) {
        checkboxStates[date] = {};
      }
      checkboxStates[date][userId] = isChecked;
      localStorage.setItem("checkboxStates", JSON.stringify(checkboxStates));
    }
  });
}

// Вызов функции для загрузки данных
fetchData();
