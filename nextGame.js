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
      // Если есть локальные данные, отображаем их сразу
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

    // Отправляем запрос на сервер
    const response = await fetch(apiUrlWithDate);
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const remoteData = await response.json()

    if (!localData || JSON.stringify(localData) !== JSON.stringify(remoteData)) {
      console.log("Обновлены данные с сервера");
      localStorage.setItem(localDataKey, JSON.stringify(remoteData)); // Сохраняем новые данные
      processAndDisplayData(remoteData); // Отображаем новые данные
      listContainer.classList.remove("hidden");

      // Показываем уведомление об обновлении данных
      showUpdateNotification();
    } else {
      console.log("Данные актуальны, обновление не требуется.");
    }

  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    alert("Не удалось загрузить данные.");
  } finally {
    // Скрыть индикатор загрузки
    modal.style.display = "none"
  }
}

function showUpdateNotification() {
  const notification = document.createElement("div");
  notification.textContent = "Данные обновлены";
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
  const calendar = document.getElementById('calendar')
  if (date) {
    calendar.textContent = `Мероприятия на ${date}`
  } else {
    calendar.textContent = "Мероприятий нет"
  }
  
  // Создать структуру для группировки по columnNames
  const groupedData = {};

  // Итерация по датам
  for (const date in data) {
    const users = data[date];
    for (const userName in users) {
      const user = users[userName];
      user.events.forEach((columnName, index) => {
        const sum = user.sums[index];
        if (sum !== "0") { // Только если значение не "0"
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

  // Отображение данных
  for (const columnName in groupedData) {
    const users = groupedData[columnName];
    const groupElement = document.createElement("div");
    groupElement.classList.add("list-group");

    // Заголовок группы
    const header = document.createElement("h3");
    header.textContent = columnName;
    groupElement.appendChild(header);

    // Список пользователей
    const userTable = document.createElement("table");
    userTable.setAttribute("border", "1");
    userTable.setAttribute("id", "userTable") // добавляем рамку таблице для визуализации

// Создаем заголовок таблицы
const headerRow = document.createElement("tr");
headerRow.innerHTML = `
<thead>
  <th data-column="name" data-order="asc"><span>Имя</span><span class="sort-icon"></span></th>
  <th data-column="id" data-order="asc"><span>Номер телефона</span><span class="sort-icon"></span></th>
  <th data-column="sum" data-order="asc"><span>Оплата</span><span class="sort-icon"></span></th>
</thead>
`;

userTable.appendChild(headerRow);
const tbody = document.createElement('tbody')

// Заполняем таблицу данными пользователей
users.forEach(user => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${user.name}</td>
    <td><a href="https://api.whatsapp.com/send?phone=${user.id}">${user.id}</a></td>
    <td>${user.sum}</td>
  `;
  tbody.appendChild(row);
});

userTable.appendChild(tbody)

    groupElement.appendChild(userTable);
    listContainer.appendChild(groupElement);
  }

  listContainer.classList.remove("hidden");
}

// Вызов функции для загрузки данных
fetchData();

document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("userTable");
  const headers = table.querySelectorAll("th");
  const tbody = table.querySelector("tbody");

  headers.forEach(header => {
    header.addEventListener("click", () => {
      const column = header.getAttribute("data-column");
      const order = header.getAttribute("data-order");

      // Убираем активное состояние с других заголовков
      headers.forEach(h => {
        h.setAttribute("data-active", "false");
        h.querySelector(".sort-icon").classList.remove("asc", "desc");
      });

      // Устанавливаем активное состояние текущему заголовку
      header.setAttribute("data-active", "true");
      const icon = header.querySelector(".sort-icon");
      icon.classList.remove("asc", "desc");
      icon.classList.add(order);

      // Сортируем строки
      const rows = Array.from(tbody.querySelectorAll("tr"));
      const sortedRows = rows.sort((a, b) => {
        const aText = a.querySelector(`td:nth-child(${getColumnIndex(column)})`).innerText.trim();
        const bText = b.querySelector(`td:nth-child(${getColumnIndex(column)})`).innerText.trim();

        if (order === "asc") {
          return aText > bText ? 1 : -1;
        } else {
          return aText < bText ? 1 : -1;
        }
      });

      // Удаляем старые строки и добавляем отсортированные
      tbody.innerHTML = "";
      sortedRows.forEach(row => tbody.appendChild(row));

      // Меняем порядок сортировки для следующего клика
      header.setAttribute("data-order", order === "asc" ? "desc" : "asc");
    });
  });

  function getColumnIndex(column) {
    const columns = Array.from(headers).map(header => header.getAttribute("data-column"));
    return columns.indexOf(column) + 1;
  }
});