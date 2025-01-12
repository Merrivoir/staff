const apiUrl = "https://script.google.com/macros/s/AKfycby91-z85D_pFeXLdwJJ8Ht5b5IAZWPs_Xor8IECW8d443F4ol6YA_M9mWs9Tz8tmmTZ/exec"
const loader = document.getElementById("loader");
const listContainer = document.getElementById("list-container");

async function fetchData() {
  try {
    // Показать индикатор загрузки
    loader.classList.remove("hidden");
    listContainer.classList.add("hidden");

    // Отправляем запрос на сервер
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    processAndDisplayData(data);

  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    alert("Не удалось загрузить данные.");
  } finally {
    // Скрыть индикатор загрузки
    loader.classList.add("hidden");
  }
}

// Обработка и отображение данных
function processAndDisplayData(data) {
  listContainer.innerHTML = ""; // Очистить контейнер
  const date = Object.keys(data)[0];
  const mainHead = document.getElementById('main')
  mainHead.textContent = `Список на ${date}`
  
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
    const userList = document.createElement("ul");
    users.forEach(user => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<p>${user.name} (<a href="https://wa.me/send?phone=${user.id}">${user.id}</a>, Сумма: ${user.sum})<p>`;
      userList.appendChild(listItem);
    });

    groupElement.appendChild(userList);
    listContainer.appendChild(groupElement);
  }

  listContainer.classList.remove("hidden");
}

// Вызов функции для загрузки данных
fetchData();