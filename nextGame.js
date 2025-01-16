const apiUrl = "https://script.google.com/macros/s/AKfycby91-z85D_pFeXLdwJJ8Ht5b5IAZWPs_Xor8IECW8d443F4ol6YA_M9mWs9Tz8tmmTZ/exec"
const modal = document.getElementById("loadingModal")
const listContainer = document.getElementById("list-container")

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

    // Отправляем запрос на сервер
    let apiUrlWithDate = apiUrl;
    if (date) {
      const queryParams = new URLSearchParams({ date });
      apiUrlWithDate = `${apiUrl}?${queryParams}`;
    }
    const response = await fetch(apiUrlWithDate);
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    const remoteData = await response.json()

    if (!localData || JSON.stringify(localData) !== JSON.stringify(remoteData)) {
      console.log("Обновлены данные с сервера")
      localStorage.setItem(localDataKey, JSON.stringify(remoteData)) // Сохраняем новые данные
      processAndDisplayData(remoteData) // Отображаем новые данные
      listContainer.classList.remove("hidden")
      showUpdateNotification("Данные обновлены") // Показываем уведомление об обновлении данных
    } else {
      console.log("Данные актуальны, обновление не требуется.");
    }

  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    showUpdateNotification("Ошибка загрузки данных");
  } finally {
    modal.style.display = "none"
  }
}

function showUpdateNotification(text) {
  const notification = document.createElement("div");
  notification.textContent = text;
  notification.className = "update-notification";
  document.body.appendChild(notification);

  // Убираем уведомление через 3 секунды
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Обработка и отображение данных
function processAndDisplayData(data) {
  listContainer.innerHTML = ""; // Очистить контейнер
  const date = Object.keys(data)[0];
  const calendar = document.getElementById('calendar');

  if (date) {
    calendar.textContent = `Мероприятия на ${date}`;
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
  const checkboxStates = JSON.parse(localStorage.getItem("checkboxStates")) || {};
  const savedStatesForDate = checkboxStates[date] || {};

  for (const columnName in groupedData) {
    const users = groupedData[columnName];
    const groupElement = document.createElement("div");
    groupElement.classList.add("list-group");

    const header = document.createElement("h3");
    header.textContent = columnName;
    groupElement.appendChild(header);

    const userTable = document.createElement("table");
    userTable.setAttribute("border", "1");

    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
      <th><span>Имя</span><span class="sort-icon"></span></th>
      <th><span>Номер телефона</span><span class="sort-icon"></span></th>
      <th><span>Оплата</span><span class="sort-icon"></span></th>
      <th><span>Участие</span><span class="sort-icon"></span></th>
    `;
    userTable.appendChild(headerRow);
    const tbody = document.createElement('tbody');

    users.forEach(user => {
      const row = document.createElement("tr");
      const isChecked = savedStatesForDate[user.id] || false;

      row.innerHTML = `
        <td>${user.name}</td>
        <td><a href="https://api.whatsapp.com/send?phone=${user.id}">${user.id}</a></td>
        <td>${user.sum}</td>
        <td class="center">
          <input type="checkbox" class="user-checkbox" 
                 data-user-id="${user.id}" ${isChecked ? "checked" : ""}>
        </td>
      `;
      tbody.appendChild(row);
    });

    userTable.appendChild(tbody);
    const headers = headerRow.querySelectorAll("th");
    headers.forEach(header => {
      header.addEventListener("click", () => {
        const column = header.getAttribute("data-column");
        const order = header.getAttribute("data-order") === "asc" ? "desc" : "asc";

        // Сортировка строк таблицы
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const columnIndex = Array.from(headers).indexOf(header);

        rows.sort((a, b) => {
          const aText = a.cells[columnIndex].innerText.trim();
          const bText = b.cells[columnIndex].innerText.trim();

          return order === "asc" ? aText.localeCompare(bText) : bText.localeCompare(aText);
        });

        // Перерисовываем строки
        tbody.innerHTML = "";
        rows.forEach(row => tbody.appendChild(row));

        // Обновляем атрибут порядка
        header.setAttribute("data-order", order);

        // Обновляем визуализацию стрелок
        headers.forEach(h => h.querySelector(".sort-icon").classList.remove("asc", "desc"));
        header.querySelector(".sort-icon").classList.add(order);
      });
    });
    groupElement.appendChild(userTable);
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
