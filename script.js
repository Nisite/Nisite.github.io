const adminEmail = "ilyaparf2021@gmail.com"; // Email администратора
const adminPassword = "i2l0y1a0"; // Пароль администратора

const events = JSON.parse(localStorage.getItem('events')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;
let isAdmin = false;
let deleteEventIndex = null;
let editEventIndex = null;

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
                    ${isAdmin ? `
                    <div class="event-actions">
                        <button onclick="openConfirmModal(${index}); event.stopPropagation();">Удалить</button>
                        <button onclick="openEditModal(${index}); event.stopPropagation();">Редактировать</button>
                    </div>` : ''}
                </div>
            `;
        });
    }
}

// Открытие модального окна для редактирования мероприятия
function openEditModal(index = null) {
    editEventIndex = index;
    const modalTitle = document.querySelector("#modal h2");

    if (index !== null) {
        const event = events[index];
        document.getElementById("event-name").value = event.name;
        document.getElementById("event-date").value = event.date;
        document.getElementById("event-time").value = event.time;
        document.getElementById("event-description").value = event.description;
        modalTitle.textContent = "Редактировать мероприятие";
    } else {
        document.getElementById("event-name").value = '';
        document.getElementById("event-date").value = '';
        document.getElementById("event-time").value = '';
        document.getElementById("event-description").value = '';
        modalTitle.textContent = "Добавить мероприятие";
    }

    document.getElementById("modal").style.display = "block";
}

// Добавление или редактирование мероприятия
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

// Сохранение нового или редактируемого мероприятия
function saveNewEvent(name, date, time, description, image) {
    if (editEventIndex !== null) {
        events[editEventIndex] = { name, date, time, description, image }; // Обновление мероприятия
        editEventIndex = null; // Сброс индекса редактирования
    } else {
        events.push({ name, date, time, description, image }); // Добавление нового мероприятия
    }
    saveEvents();
    loadEvents();
    closeModal();
}

// Открытие модального окна для подтверждения удаления
function openConfirmModal(index) {
    deleteEventIndex = index;
    document.getElementById("confirm-modal").style.display = "block";
}

// Закрытие модального окна подтверждения удаления
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
    events.splice(index, 1); // Удаление мероприятия
    saveEvents(); // Сохранение изменений
    loadEvents(); // Обновление списка мероприятий
}

// Закрытие модального окна
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Открытие модального окна с информацией о мероприятии
function openEventInfoModal(index) {
    const event = events[index];
    document.getElementById("event-info-name").textContent = event.name;
    document.getElementById("event-info-date").textContent = `Дата: ${event.date}`;
    document.getElementById("event-info-time").textContent = `Время: ${event.time}`;
    document.getElementById("event-info-description").textContent = event.description;
    document.getElementById("event-info-modal").style.display = "block";
}

// Закрытие модального окна с информацией о мероприятии
function closeEventInfoModal() {
    document.getElementById("event-info-modal").style.display = "none";
}

// Обработка входа
document.getElementById("auth-form").onsubmit = function(event) {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === adminEmail && password === adminPassword) {
        loggedInUser = { email: adminEmail, isAdmin: true };
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        alert("Вы вошли как администратор.");
    } else {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            loggedInUser = { email: user.email, isAdmin: false };
            localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
            alert("Вы вошли как пользователь.");
        } else {
            alert("Неверный email или пароль.");
        }
    }
    loadUser(); // Обновляем информацию о пользователе
};

// Регистрация нового пользователя
document.getElementById("register-button").onclick = function() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Введите email и пароль.");
        return;
    }

    const userExists = users.some(u => u.email === email);
    if (userExists) {
        alert("Пользователь с таким email уже зарегистрирован.");
    } else {
        users.push({ email, password });
        localStorage.setItem('users', JSON.stringify(users));
        alert("Регистрация прошла успешно.");
    }
};

// Загрузка информации о пользователе
function loadUser() {
    if (loggedInUser) {
        document.getElementById("user-email").textContent = `Привет, ${loggedInUser.email}!`;
        document.getElementById("user-info").style.display = "block";
        isAdmin = loggedInUser.isAdmin;
        document.getElementById("admin-controls").style.display = isAdmin ? "block" : "none";
        loadEvents();
    } else {
        document.getElementById("user-info").style.display = "none";
        isAdmin = false;
        document.getElementById("admin-controls").style.display = "none";
        loadEvents();
    }
}

// Выход из системы
function logout() {
    loggedInUser = null;
    localStorage.removeItem('loggedInUser');
    loadUser();
}

// Инициализация страницы
loadUser();
loadEvents();
