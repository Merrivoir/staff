const apiUrl = "https://script.google.com/macros/s/AKfycby91-z85D_pFeXLdwJJ8Ht5b5IAZWPs_Xor8IECW8d443F4ol6YA_M9mWs9Tz8tmmTZ/exec"
const modal = document.getElementById("loadingModal")
const listContainer = document.getElementById("list-container")

async function fetchData(date = null) {
  try {
    // Показать индикатор загрузки
    modal.style.display = "flex";
    listContainer.classList.add("hidden");

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

    const data = await response.json()

    processAndDisplayData(data)

  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    alert("Не удалось загрузить данные.");
  } finally {
    // Скрыть индикатор загрузки
    modal.style.display = "none"
  }
}

// Обработка и отображение данных
function processAndDisplayData(data) {
  listContainer.innerHTML = ""; // Очистить контейнер
  const date = Object.keys(data)[0];
  const calendar = document.getElementById('calendar')
  calendar.textContent = `${date}`
  
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
userTable.setAttribute("border", "1"); // добавляем рамку таблице для визуализации

// Создаем заголовок таблицы
const headerRow = document.createElement("tr");
headerRow.innerHTML = `
  <th>Имя</th>
  <th>Номер телефона</th>
  <th>Оплата</th>
`;

userTable.appendChild(headerRow);

// Заполняем таблицу данными пользователей
users.forEach(user => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${user.name}</td>
    <td><a href="https://api.whatsapp.com/send?phone=${user.id}">${user.id}</a></td>
    <td>${user.sum}</td>
  `;
  userTable.appendChild(row);
});

    groupElement.appendChild(userTable);
    listContainer.appendChild(groupElement);
  }

  listContainer.classList.remove("hidden");
}

// Вызов функции для загрузки данных
fetchData();