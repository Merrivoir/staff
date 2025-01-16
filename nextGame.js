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
    userTable.classList.add("sortable-table"); // Класс для таблицы, чтобы добавлять обработчики событий

    // Создаем заголовок таблицы
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = ` 
      <th data-column="name" data-order="asc"><span>Имя</span><span class="sort-icon"></span></th>
      <th data-column="id" data-order="asc"><span>Номер телефона</span><span class="sort-icon"></span></th>
      <th data-column="sum" data-order="asc"><span>Оплата</span><span class="sort-icon"></span></th>
    `;
    thead.appendChild(headerRow);
    userTable.appendChild(thead);

    const tbody = document.createElement('tbody');

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

    userTable.appendChild(tbody);

    // Внедряем обработчики сортировки
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
}


// Вызов функции для загрузки данных
fetchData();