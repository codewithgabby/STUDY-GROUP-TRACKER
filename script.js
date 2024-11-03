// JavaScript: Study Tracker

const logForm = document.getElementById("logForm");
const dateInput = document.getElementById("date");
const subjectInput = document.getElementById("subject");
const hoursInput = document.getElementById("hours");
const sessionList = document.getElementById("sessionList");
const totalHoursElement = document.getElementById("totalHours");
const streakElement = document.getElementById("streak");
const subjectProgressContainer = document.getElementById("subjectProgressContainer");
const hoursPerSubjectElement = document.getElementById("hoursPerSubject");
const taskNameInput = document.getElementById("task-name");
const taskList = document.getElementById("task-list");

let studySessions = JSON.parse(localStorage.getItem('studySessions')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Load existing sessions and tasks from local storage
window.onload = () => {
    studySessions.forEach(displaySession);
    updateTotalHours();
    updateProgressBars();
    updateStreak();
    updateAnalytics();

    tasks.forEach(displayTask);
    updateTaskAnalytics();
};

// Function to log a study session
logForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const session = {
        date: dateInput.value,
        subject: subjectInput.value,
        hours: parseFloat(hoursInput.value)
    };

    studySessions.push(session);
    localStorage.setItem('studySessions', JSON.stringify(studySessions)); // Save to local storage
    displaySession(session);
    updateTotalHours();
    updateProgressBars();
    updateStreak();
    updateAnalytics();

    // Clear form
    logForm.reset();
});

function displaySession(session) {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
        ${session.date} - ${session.subject}: ${session.hours} hrs
        <button class="deleteButton" onclick="deleteSession(this, ${session.hours})">Delete</button>
    `;
    sessionList.appendChild(listItem);
}

function deleteSession(button, hours) {
    button.parentElement.remove();
    const sessionIndex = studySessions.findIndex(
        (s) => s.hours === hours && s.subject === button.parentElement.textContent.split(":")[0].split("-")[1].trim()
    );
    if (sessionIndex > -1) {
        studySessions.splice(sessionIndex, 1);
        localStorage.setItem('studySessions', JSON.stringify(studySessions)); // Update local storage
    }

    updateTotalHours();
    updateProgressBars();
    updateStreak();
    updateAnalytics();
}

function updateTotalHours() {
    const totalHours = studySessions.reduce((total, session) => total + session.hours, 0);
    totalHoursElement.textContent = totalHours;
}

// Progress Bars
function updateProgressBars() {
    subjectProgressContainer.innerHTML = '';
    const hoursPerSubject = studySessions.reduce((acc, session) => {
        acc[session.subject] = (acc[session.subject] || 0) + session.hours;
        return acc;
    }, {});

    for (const [subject, hours] of Object.entries(hoursPerSubject)) {
        const progressContainer = document.createElement("div");
        progressContainer.className = "progress-container";

        const label = document.createElement("p");
        label.textContent = `${subject} (${hours} hrs)`;

        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        progressBar.style.width = `${Math.min((hours / 10) * 100, 100).toFixed(0)}%`;
        progressBar.textContent = `${Math.min((hours / 10) * 100, 100).toFixed(0)}%`;

        progressContainer.appendChild(label);
        progressContainer.appendChild(progressBar);
        subjectProgressContainer.appendChild(progressContainer);
    }
}

// Streak Calculation
function updateStreak() {
    if (studySessions.length === 0) {
        streakElement.textContent = "0";
        return;
    }

    studySessions.sort((a, b) => new Date(a.date) - new Date(b.date));
    let streak = 1;
    let maxStreak = 1;

    for (let i = 1; i < studySessions.length; i++) {
        const prevDate = new Date(studySessions[i - 1].date);
        const currDate = new Date(studySessions[i].date);

        if ((currDate - prevDate) / (1000 * 60 * 60 * 24) === 1) {
            streak++;
            maxStreak = Math.max(maxStreak, streak);
        } else if ((currDate - prevDate) / (1000 * 60 * 60 * 24) > 1) {
            streak = 1;
        }
    }

    streakElement.textContent = maxStreak;
}

// Analytics
function updateAnalytics() {
    hoursPerSubjectElement.innerHTML = '';
    const hoursPerSubject = studySessions.reduce((acc, session) => {
        acc[session.subject] = (acc[session.subject] || 0) + session.hours;
        return acc;
    }, {});

    for (const [subject, hours] of Object.entries(hoursPerSubject)) {
        const subjectData = document.createElement("p");
        subjectData.textContent = `${subject}: ${hours} hrs`;
        subjectData.style.color = getRandomColor(); // Adds a random color for each subject
        hoursPerSubjectElement.appendChild(subjectData);
    }
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Task Tracker
function addTask() {
    if (taskNameInput.value.trim() !== "") {
        const newTask = {
            name: taskNameInput.value,
            completed: false
        };

        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Save to local storage
        displayTask(newTask);

        // Clear the input field after adding the task
        taskNameInput.value = "";
        
        // Update the analytics data
        updateTaskAnalytics();
    } else {
        alert("Please enter a task name.");
    }
}

function displayTask(task) {
    const taskItem = document.createElement("li");
    taskItem.classList.add("task-item");

    // Checkbox to mark task as completed
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("task-checkbox");
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", updateTaskAnalytics);

    // Task name text
    const taskText = document.createElement("span");
    taskText.classList.add("task-text");
    taskText.textContent = task.name;

    // Delete button for the task
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-task-btn");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function() {
        taskList.removeChild(taskItem);
        tasks = tasks.filter(t => t.name !== task.name); // Remove the task from the array
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Update local storage
        updateTaskAnalytics();
    });

    // Append elements to the new task item
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(deleteButton);
    taskList.appendChild(taskItem);
}

function updateTaskAnalytics() {
    const taskItems = document.querySelectorAll(".task-item");
    const totalTasks = taskItems.length;
    const completedTasks = document.querySelectorAll(".task-checkbox:checked").length;
    const remainingTasks = totalTasks - completedTasks;

    // Display the updated analytics
    document.getElementById("total-tasks").textContent = totalTasks;
    document.getElementById("completed-tasks").textContent = completedTasks;
    document.getElementById("remaining-tasks").textContent = remainingTasks;
}

// Event listener for the "Add Task" button
document.getElementById("add-task-btn").addEventListener("click", addTask);

// Load tasks from local storage on page load
tasks.forEach(displayTask);