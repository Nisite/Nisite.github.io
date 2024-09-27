const adminEmail = "ilyaparf2021@gmail.com"; // Укажите email администратора
const adminPassword = "i2l0y1a0"; // Укажите пароль администратора

const events = JSON.parse(localStorage.getItem('events')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let isAdmin = false;
let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;
let deleteEventIndex = null; // Индекс мероприятия для удаления
let editEventIndex = null;   // Индекс мероприятия для редактирования

// Сохраняем мероприятия в локальное хранилище
function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

// Загружаем мероприятия на страницу
function loadEvents() {
    const eventList = document.getElementById("event-list");
    eventList.innerHTML = "<h3>Предстоящие мероприятия:</h3>";
    if (events.length === 0) {
        eventList.innerHTML += `<p>Нет предстоящих мероприятий.</p>`;
    } else {
        events.forEach((event, index) => {
            eventList.innerHTML += `
                <div class="event-item" style="background-image: url('${event.image}');" onclick="openEventInfoModal(${index})">
                    <div class="event-details">
                        <h4>${event.name}</h4>
                        <p>Дата: ${event.date} Время: ${event.time}</p>
                    </div>
                    ${isAdmin ? `<div class="event-actions">
                        <button onclick="openConfirmModal(${index}); event.stopPropagation();">Удалить</button>
                        <button onclick="openEditModal(${index}); event.stopPropagation();">Редактировать</button>
                    </div>` : ''}
                </div>
            `;
        });
    }
}

// Открытие модального окна для редактирования мероприятия
function openEditModal(index) {
    editEventIndex = index; // Устанавливаем индекс редактируемого мероприятия
    const event = events[index];

    // Заполняем форму данными мероприятия
    document.getElementById("event-name").value = event.name;
    document.getElementById("event-date").value = event.date;
    document.getElementById("event-time").value = event.time;
    document.getElementById("event-description").value = event.description;

    // Открываем модальное окно
    document.getElementById("modal").style.display = "block";
}

// Функция для добавления или редактирования мероприятия
function addOrEditEvent(event) {
    event.preventDefault();
    const eventName = document.getElementById("event-name").value.trim();
    const eventDate = document.getElementById("event-date").value;
    const eventTime = document.getElementById("event-time").value;
    const eventDescription = document.getElementById("event-description").value.trim();
    const eventImageInput = document.getElementById("event-image");

    let eventImage = null;

    if (eventImageInput.files && eventImageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            eventImage = e.target.result;
            saveNewEvent(eventName, eventDate, eventTime, eventDescription, eventImage);
        };
        reader.readAsDataURL(eventImageInput.files[0]);
    } else {
        saveNewEvent(eventName, eventDate, eventTime, eventDescription, eventImage);
    }
}

// Сохраняем новое или редактируемое мероприятие
function saveNewEvent(name, date, time, description, image) {
    if (editEventIndex !== null) {
        events[editEventIndex] = { name, date, time, description, image }; // Обновляем существующее мероприятие
        editEventIndex = null; // Сбрасываем индекс после редактирования
    } else {
        events.push({ name, date, time, description, image }); // Добавляем новое мероприятие
    }
    saveEvents();
    loadEvents();
    closeModal(); // Закрываем модальное окно после сохранения
}

// Открываем модальное окно для подтверждения удаления
function openConfirmModal(index) {
    deleteEventIndex = index;
    document.getElementById("confirm-modal").style.display = "block";
}

// Закрываем модальное окно подтверждения удаления
function closeConfirmModal() {
    deleteEventIndex = null;
    document.getElementById("confirm-modal").style.display = "none";
}

// Подтверждение удаления мероприятия
document.getElementById("confirm-delete-button").onclick = function() {
    if (deleteEventIndex !== null) {
        deleteEvent(deleteEventIndex);
        closeConfirmModal();
    }
};

// Удаление мероприятия
function deleteEvent(index) {
    events.splice(index, 1); // Удаляем мероприятие по индексу
    saveEvents(); // Сохраняем изменения
    loadEvents(); // Обновляем список мероприятий
}

// Закрываем модальное окно мероприятия
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Открываем модальное окно информации о мероприятии
function openEventInfoModal(index) {
    const event = events[index];
    document.getElementById("event-info-name").textContent = event.name;
    document.getElementById("event-info-date").textContent = `Дата: ${event.date}`;
    document.getElementById("event-info-time").textContent = `Время: ${event.time}`;
    document.getElementById("event-info-description").textContent = event.description;
    document.getElementById("event-info-modal").style.display = "block";
}

// Закрываем модальное окно с информацией о мероприятии
function closeEventInfoModal() {
    document.getElementById("event-info-modal").style.display = "none";
}

// Загрузка информации о текущем пользователе
function loadUser() {
    if (loggedInUser) {
        document.getElementById("user-email").textContent = `Привет, ${loggedInUser.email}!`;
        document.getElementById("user-info").style.display = "block";
        isAdmin = loggedInUser.isAdmin;
        document.getElementById("admin-controls").style.display = isAdmin ? "block" : "none";
        loadEvents(); // Загружаем мероприятия с учетом прав администратора
    } else {
        document.getElementById("user-info").style.display = "none";
        isAdmin = false;
        document.getElementById("admin-controls").style.display = "none";
        loadEvents(); // Обновляем мероприятия при выходе
    }
}

// Инициализация страницы
loadUser(); // Загружаем информацию о пользователе при загрузке страницы
loadEvents(); // Загружаем мероприятия
