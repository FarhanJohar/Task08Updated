const titlebox = document.getElementById("title-box");
const descriptionbox = document.getElementById("description-box");
const imagebox = document.getElementById("image-box");
const previewImage = document.getElementById("preview-image");
const taskTableBody = document.querySelector("#task-table tbody");
const taskTableContainer = document.getElementById("task-table-container");

let isUpdate = false; // Flag to check if we are updating an existing task
let currentTaskRow = null; // Store the current row for updating
let tasks = []; // Initialize tasks as an empty array
let nextTaskId = 0; // Track the next available task ID

// Load data from localStorage safely
function loadData() {
    try {
        const storedTasks = localStorage.getItem("tasks");
        if (storedTasks) {
            tasks = isValidJSON(storedTasks) ? JSON.parse(storedTasks) : [];
        }

        // Set the next available task ID
        nextTaskId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 0;

        tasks.forEach(task => {
            createTaskRow(task);
        });

        if (taskTableBody.children.length > 0) {
            taskTableContainer.style.display = "block";
        }
    } catch (e) {
        console.error("Error loading tasks from localStorage:", e);
        tasks = []; // Reset tasks in case of error
    }
}

// Utility function to check if a string is valid JSON
function isValidJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// Add a task
function addtask() {
    const title = titlebox.value.trim();
    const description = descriptionbox.value.trim();
    let imageBase64 = previewImage.src || '';  // Use preview image as base64

    let isValid = true;

    // Clear previous warnings
    document.getElementById("title-warning").style.display = 'none';
    document.getElementById("description-warning").style.display = 'none';
    document.getElementById("image-warning").style.display = 'none';
    titlebox.style.borderColor = '';
    descriptionbox.style.borderColor = '';
    imagebox.style.borderColor = '';

    // Title validation
    if (title === '') {
        document.getElementById("title-warning").style.display = 'block'; // Show warning for title
        titlebox.style.borderColor = 'red'; // Red border for empty title
        isValid = false;
    }

    // Description validation
    if (description === '') {
        document.getElementById("description-warning").style.display = 'block'; // Show warning for description
        descriptionbox.style.borderColor = 'red'; // Red border for empty description
        isValid = false;
    }

    // Image validation
    if (imageBase64 === '' || !imagebox.files.length) { // Check if image is missing or not uploaded
        document.getElementById("image-warning").style.display = 'block'; // Show warning for image
        imagebox.style.borderColor = 'red'; // Red border for empty image field
        isValid = false;
    }

    // If everything is valid, add the task
    if (isValid) {
        if (isUpdate) {
            updateTask(title, description, imageBase64);
        } else {
            const newTask = {
                id: nextTaskId,
                title: title,
                description: description,
                image: imageBase64,
                completed: false
            };
            tasks.push(newTask);
            nextTaskId++; // Increment the nextTaskId after adding a new task
            saveData();

            createTaskRow(newTask);

            taskTableContainer.style.display = "block";
        }

        clearFields();
        previewImage.style.display = 'none'; // Hide preview image after adding task
        imagebox.value = '';  // Clear file input
    }
}

// Handle Image Preview on File Input
imagebox.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = function() {
        previewImage.src = reader.result;  // Set base64 image result to preview
        previewImage.style.display = 'block';  // Show the preview

        // Clear the image warning message if image is uploaded
        document.getElementById("image-warning").style.display = 'none';
        imagebox.style.borderColor = ''; // Remove red border if image is uploaded
    };

    if (file) {
        reader.readAsDataURL(file);  // Read the image file as base64
    }
});

// Clear the input fields
function clearFields() {
    titlebox.value = '';
    descriptionbox.value = '';
    previewImage.style.display = 'none'; // Hide image preview
    imagebox.value = '';  // Clear file input
    document.getElementById("title-warning").style.display = 'none'; // Hide title warning
    document.getElementById("description-warning").style.display = 'none'; // Hide description warning
    document.getElementById("image-warning").style.display = 'none'; // Hide image warning
    titlebox.style.borderColor = '';
    descriptionbox.style.borderColor = '';
    imagebox.style.borderColor = '';
}

// Clear the input fields
function clearFields() {
    titlebox.value = '';
    descriptionbox.value = '';
    previewImage.style.display = 'none'; // Hide image preview
    imagebox.value = '';  // Clear file input
    document.getElementById("image-warning").style.display = 'none'; // Hide image warning
    titlebox.style.borderColor = '';
    descriptionbox.style.borderColor = '';
    imagebox.style.borderColor = '';
}

// Function to create a task row in the table
function createTaskRow(task) {
    const newRow = document.createElement("tr");
    newRow.dataset.id = task.id;
    newRow.innerHTML = `
        <td>${task.title}</td>
        <td><img src="${task.image}" alt="Task Image" style="max-width: 100px;"></td> <!-- Image in 2nd column -->
        <td>${task.description}</td> <!-- Description in 3rd column -->
        <td>
            <button class="complete-btn">${task.completed ? 'Completed' : 'Complete'}</button>
            <button class="update-btn">Update</button>
            <button class="delete-btn">Delete</button>
        </td>
    `;
    taskTableBody.appendChild(newRow);

    // Attach event listeners to buttons
    newRow.querySelector(".delete-btn").addEventListener("click", deleteTask);
    newRow.querySelector(".update-btn").addEventListener("click", function () {
        editTask(newRow, task.title, task.description, task.image);
    });
    newRow.querySelector(".complete-btn").addEventListener("click", function () {
        toggleComplete(newRow);
    });
}
// Edit a task (pre-fill the inputs for updating)
function editTask(row, title, description, image) {
    titlebox.value = title;
    descriptionbox.value = description;

    // Show the image inside the field
    if (image) {
        previewImage.src = image;
        previewImage.style.display = 'block';  // Show image preview
    } else {
        previewImage.style.display = 'none';  // Hide if no image
    }

    const addButton = document.querySelector(".buttons button");
    addButton.textContent = "Update Task";

    isUpdate = true;
    currentTaskRow = row;
}

// Update a task
function updateTask(title, description, image) {
    const taskId = currentTaskRow.dataset.id;
    const taskIndex = tasks.findIndex(task => task.id === parseInt(taskId));

    if (taskIndex !== -1) {
        tasks[taskIndex].title = title;
        tasks[taskIndex].description = description;
        tasks[taskIndex].image = image || '';  // Update the image if any
        tasks[taskIndex].completed = false; // Reset completion on update
    }

    // Update the task row (title and description)
    currentTaskRow.cells[0].textContent = title;
    currentTaskRow.cells[2].textContent = description;

    // Update the image cell with the correct image
    const imageCell = currentTaskRow.cells[1];
    if (image) {
        imageCell.innerHTML = `<img src="${image}" alt="Task Image" style="max-width: 100px;">`;
    } else {
        imageCell.innerHTML = ''; // If no image, clear the cell
    }

    // Reset task appearance (remove strikethrough if any)
    currentTaskRow.style.textDecoration = "none";
    currentTaskRow.style.color = "";
    currentTaskRow.querySelector(".complete-btn").textContent = "Complete"; // Show 'Complete' button

    const addButton = document.querySelector(".buttons button");
    addButton.textContent = "Add Task";
    isUpdate = false;
    currentTaskRow = null;

    saveData();
}

// Delete a task
function deleteTask(event) {
    const row = event.target.closest("tr"); // Get the task row
    const taskId = row.dataset.id; // Get the task ID from the row

    // Remove the task from the tasks array
    tasks = tasks.filter(task => task.id !== parseInt(taskId));

    // Re-index tasks to ensure IDs are continuous after deletion
    tasks.forEach((task, index) => {
        task.id = index; // Reset the task IDs to be continuous starting from 0
    });

    // Update nextTaskId based on the new tasks list
    nextTaskId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 0;

    // Remove the task row from the table
    row.remove();

    // Save the updated tasks list to localStorage
    saveData();

    // If no tasks are left, hide the task table
    if (taskTableBody.children.length === 0) {
        taskTableContainer.style.display = "none";
        localStorage.removeItem("tasks"); // Clear localStorage if all tasks are deleted
    }
}

// Toggle the completion of a task
function toggleComplete(row) {
    const taskId = row.dataset.id;
    const task = tasks.find(task => task.id === parseInt(taskId));

    if (task) {
        task.completed = !task.completed; // Toggle the completion state
    }

    // Update the appearance based on completion state
    if (task.completed) {
        row.style.textDecoration = "line-through";
        row.style.color = "#555";
        row.querySelector(".complete-btn").textContent = "Completed"; // Change button text
    } else {
        row.style.textDecoration = "none";
        row.style.color = "";
        row.querySelector(".complete-btn").textContent = "Complete"; // Change button text
    }

    saveData();
}

// Clear the input fields
function clearFields() {
    titlebox.value = '';
    descriptionbox.value = '';
    previewImage.style.display = 'none'; // Hide image preview
    imagebox.value = '';  // Clear file input
}

// Save data to localStorage
function saveData() {
    if (typeof(Storage) !== "undefined") {
        try {
            if (tasks.length > 0) {
                localStorage.setItem("tasks", JSON.stringify(tasks)); // Store tasks as JSON
            } else {
                localStorage.removeItem("tasks"); // Clear localStorage when no tasks are left
            }
        } catch (e) {
            console.error("Error saving tasks to localStorage:", e);
        }
    } else {
        alert("localStorage is not supported in this browser.");
    }
}

// Load tasks when the page loads
loadData();

// Handle Image Preview on File Input
imagebox.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = function() {
        previewImage.src = reader.result;  // Set base64 image result to preview
        previewImage.style.display = 'block';  // Show the preview
    };

    if (file) {
        reader.readAsDataURL(file);  // Read the image file as base64
    }
});