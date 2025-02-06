const apiUrl = "https://script.google.com/macros/s/AKfycby91-z85D_pFeXLdwJJ8Ht5b5IAZWPs_Xor8IECW8d443F4ol6YA_M9mWs9Tz8tmmTZ/exec"
const modal = document.getElementById("loadingModal");
const listContainer = document.getElementById("list-container");
const calendarInput = document.getElementById("calendar");
const content = document.getElementById('content');
let isProgrammaticChange = false;
let eventDates = [];

const headers = [
    { 
      text: 'Check', 
      dataColumn: 'checkbox',  
      hasSortIcon: true 
    },
    { 
      text: 'Имя', 
      dataColumn: 'name',
      hasSortIcon: true 
    },
    { 
      text: 'Телефон', 
      dataColumn: 'phone',
      hasSortIcon: true 
    },
    { 
      text: 'Оплата', 
      dataColumn: 'pay',
      hasSortIcon: true 
    }
  ];