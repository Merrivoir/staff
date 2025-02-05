function mws(show = 1) {
  if (show == 1) {
    modal.style.display = 'flex'
  } else {
    modal.style.display = 'none'
  }
}

function createTable() {
  
  const headerRow = document.createElement("tr");

  headers.forEach(header => {
    // Создаём ячейку заголовка
    const th = document.createElement('th');

    // Устанавливаем атрибуты data-column
    th.setAttribute('data-column', header.dataColumn);

    // Создаём контейнер для содержимого заголовка (для выравнивания и стилизации)
    const headerContent = document.createElement('div');
    headerContent.className = 'header-content'; // Класс для стилизации через CSS
    th.appendChild(headerContent);

    // Создаём элемент <span> с текстом заголовка
    const spanText = document.createElement('span');
    spanText.textContent = header.text;
    headerContent.appendChild(spanText);

    // Если необходима иконка сортировки, добавляем её
    if (header.hasSortIcon) {
      const sortIcon = document.createElement('span');
      sortIcon.className = 'sort-icon';
      headerContent.appendChild(sortIcon);
    }

    // Добавляем ячейку заголовка в строку заголовков
    headerRow.appendChild(th);
  });

  return headerRow
}

function crUsers(users, date) {
  const tbody = document.createElement('tbody');
  const checkboxStates = JSON.parse(localStorage.getItem("checkboxStates")) || {};
  const savedStatesForDate = checkboxStates[date] || {};

  users.forEach(user => {
    const row = document.createElement('tr');
  
    // Проверяем, установлен ли чекбокс для данного пользователя
    const isChecked = savedStatesForDate[user.id] || false;
  
    // Создаём ячейку с чекбоксом
    const tdCheckbox = document.createElement('td');
    tdCheckbox.classList.add('center');
  
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('user-checkbox');
    checkbox.dataset.userId = user.id;
    if (isChecked) {
      checkbox.checked = true;
    }
    tdCheckbox.appendChild(checkbox);
  
    // Создаём ячейку с именем
    const tdName = document.createElement('td');
    tdName.textContent = user.name;
  
    // Создаём ячейку с номером телефона и ссылкой на WhatsApp
    const tdPhone = document.createElement('td');
    const phoneLink = document.createElement('a');
    phoneLink.href = `https://api.whatsapp.com/send?phone=${user.id}`;
    phoneLink.textContent = user.id;
    tdPhone.appendChild(phoneLink);
  
    // Создаём ячейку с суммой оплаты
    const tdSum = document.createElement('td');
    tdSum.textContent = user.sum;
  
    // Добавляем ячейки в строку
    row.appendChild(tdCheckbox);
    row.appendChild(tdName);
    row.appendChild(tdPhone);
    row.appendChild(tdSum);
  
    // Добавляем строку в тело таблицы
    tbody.appendChild(row);
  });

  return tbody;

}

function addOrdering(headerRow,tbody) {
  const headers = headerRow.querySelectorAll("th");

    headers.forEach(header => {
      header.addEventListener("click", () => {
        const column = header.getAttribute("data-column");
        const order = header.getAttribute("data-order") === "asc" ? "desc" : "asc";

        // Сортировка строк таблицы
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const columnIndex = Array.from(headers).indexOf(header);
        
        if (column === "checkbox") {
          // Сортировка по состоянию чекбоксов
          rows.sort((rowA, rowB) => {
            const checkboxA = rowA.querySelector(".user-checkbox").checked ? 1 : 0;
            const checkboxB = rowB.querySelector(".user-checkbox").checked ? 1 : 0;

            return order === "asc" ? checkboxA - checkboxB : checkboxB - checkboxA;
          });
        } else {
          rows.sort((a, b) => {
            const aText = a.cells[columnIndex].innerText.trim();
            const bText = b.cells[columnIndex].innerText.trim();
        
            // Преобразуем текст в числа, если возможно
            const aNumber = parseFloat(aText);
            const bNumber = parseFloat(bText);
        
            // Проверяем, являются ли значения числами
            if (!isNaN(aNumber) && !isNaN(bNumber)) {
              return order === "asc" ? aNumber - bNumber : bNumber - aNumber;
            } else {
              // Если значения не числа, сортируем как строки
              return order === "asc" ? aText.localeCompare(bText) : bText.localeCompare(aText);
            }
          });
        }

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

}