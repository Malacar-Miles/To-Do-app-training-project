let tasks = []; // The array that will hold all task objects
const addTaskButton = document.getElementById("add-task"); // HTML element for the Add Task button
const addTaskInput = document.getElementById("task-input"); // HTML element for the text input field
const tasksContainer = document.getElementById("tasks-container"); // A div that will contain all the tasks
const maxDisplayLength = 35; // Maximum amount of characters to be displayed for each task
const maxLength = 200; // Maximum amount of characters that each task can contain

function Task(inputText) { // A constructor function for task objects
  this.fullText = inputText;
  this.displayText = shorten(inputText);
  this.isCompleted = false;
  this.created = new Date();
}

function shorten(inputText) { // If the text is too long to fit the cell, shorten it in a graceful manner
if (inputText.length > maxDisplayLength) {
    // Turn the string into an array of words
    let words = inputText.split(" ");
    //  Keep adding words from this array into a new string until maxDisplayLength is exceeded
    let result = "";
    for (let i = 0; i < words.length; i++) {
      if (result.length + words[i].length + 1 <= maxDisplayLength)
        result += " " + words[i];
      else break;
    }
    result += "…"; // Add an ellipsis at the end
    return result;
  } else return inputText;
}

function escapeHTML(unsafe) // We'll use this to process all user input
{
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

function dateToText(inputDate) { // Turn a date object into a string that will be displayed in the tooltip
  let result;
  const today = new Date();
  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  switch (inputDate.toLocaleString()) {
    case today.toLocaleString() : result = "Today" + ", " + inputDate.toLocaleTimeString("en-US"); break;
    case yesterday.toLocaleString() : result = "Yesterday" + ", " + inputDate.toLocaleTimeString("en-US"); break;
    default: result = inputDate.toLocaleDateString("en-US");
  }
  return result;
}

function getTaskIndex(element) {
  // Take a reference to a DOM element and find the corresponding index of a task in the global array
  let result = -1;
  for (let i = 0; i < tasks.length; i++)
    if (tasks[i].htmlElement === element) {
      result = i;
      break;
    }
  return result;
}

function deleteTask(task) {
  // Remove the DOM element for the task
  task.htmlElement.remove();
  // Remove the task object from the array
  tasks = tasks.filter(element => element !== task);
}

function createCell(task) {
  // Create a DOM element for the task
  
  // Create new DOM elements that we'll use to construct the task cell
  const newTaskCell = document.createElement("div"); // The div that corresponds to the task. It will contain all the below elements
  const newTaskCheckmark = document.createElement("div"); // An empty circle that will contain a checkmark if the task is completed
  const newTaskText = document.createElement("span"); // This will contain the displayed text and it will be user-editable
  const newTaskTooltip = document.createElement("div"); // This will contain tooltip text
  const newTaskDeleteButton = document.createElement("div"); // An empty circle with the letter X inside. This will be used as a "delete task" button.
  
  // Set their classes, attributes and innerHTML
  newTaskCell.classList.add("cell");
  newTaskCell.classList.add("task");
  newTaskDeleteButton.classList.add("circle");
  newTaskDeleteButton.classList.add("delete-button");
  newTaskDeleteButton.innerHTML = "X"; // The letter X is used as a "delete" symbol;
  newTaskCheckmark.classList.add("circle");
  newTaskCheckmark.classList.add("checkmark");
  newTaskCheckmark.innerHTML = "<p>&check;</p>"; // &check; is a checkmark symbol;
  newTaskText.classList.add("textarea");
  newTaskText.innerHTML = task.displayText;
  newTaskText.setAttribute("role", "textbox"); // make this <span> behave like <textarea>
  newTaskText.setAttribute("contenteditable", ""); // make it user-editable
  newTaskTooltip.classList.add("tooltip"); // The tooltip is empty for now, we'll create its content later
  
  // Append each component to the new cell, then append the new cell to the tasks container
  newTaskCell.appendChild(newTaskCheckmark);
  newTaskCell.appendChild(newTaskText);
  newTaskCell.appendChild(newTaskTooltip);
  newTaskCell.appendChild(newTaskDeleteButton);
  tasksContainer.appendChild(newTaskCell);
  
  // Set event listener functions for the checkmark, text area and delete button
  newTaskCheckmark.addEventListener("click", function() {
    // Toggle "Completed" state for the element
    const taskCell = this.parentElement;
    taskCell.classList.toggle("completed");
    // Update the isCompleted field in the array item that corresponds to this element
    if (taskCell.classList.contains("completed")) {
      tasks[getTaskIndex(taskCell)].isCompleted = true;
      this.nextSibling.removeAttribute("contenteditable"); // Also make the text field non-editable while the task is in "completed" state
    } else {
      tasks[getTaskIndex(taskCell)].isCompleted = false;
      this.nextSibling.setAttribute("contenteditable", "");
    }
  });
  
  newTaskText.addEventListener("focusin", function() {
    // When the input field receives focus, replace displayText with fullText
    let currentTask = tasks[getTaskIndex(this.parentElement)]; // Get the task object from global array
    this.innerHTML = currentTask.fullText;
  });
  
  newTaskText.addEventListener("focusout", function() {
  // Update the task data when the input field loses focus
  let newValue = escapeHTML(this.textContent.trim()); // Remove surrounding spaces from the input text and escape any special characters
  let currentTask = tasks[getTaskIndex(this.parentElement)];
  if (newValue.length > 0) { // Only do this if the field is not empty
    currentTask.fullText = newValue; // Update the data in the array
    currentTask.displayText = shorten(newValue); // Update the data in the array
    this.innerHTML = currentTask.displayText; // Update the DOM element to display short text instead of the user input
    updateTooltip(task); // Update the tooltip
  } else deleteTask(currentTask); // If the user fully deleted the text, delete the task
  });
  
  newTaskText.addEventListener("keydown", function(event) {
    // Make the input field lose focus when Enter key is pressed
    if (event.code === "Enter")
      this.blur();
  });
  
  newTaskDeleteButton.addEventListener("click", function() {
    // Get the index for the task in the array
    let i = getTaskIndex(this.parentElement);
    // Delete the task
    deleteTask(tasks[i]);
  });
  
  // Return a reference to the task cell DOM element we've created
  return newTaskCell;
}

function updateTooltip(task) {
  // Get the reference to the <div> that acts as a tooltip
  const tooltip = task.htmlElement.children[2]; // The tooltip should be the third element inside the cell div
  tooltip.innerHTML = (task.displayText === task.fullText) // If displayText equals fullText...
              ? `Created: ${dateToText(task.created)}` // ...the tooltip will only show creation date/time... 
              : `${task.fullText}<hr />Created: ${dateToText(task.created)}`; // ...else it will also show fullText
}

addTaskInput.addEventListener("focusout", function() {
  // Create a new task when the input field loses focus
  let currentValue = escapeHTML(this.textContent.trim()); // Remove surrounding spaces from the input text and escape any special characters
  if (currentValue.length > 0) { // Only do this if the field is not empty
    this.innerHTML = "";
    const task = new Task(currentValue); // Create a new task
    task.htmlElement = createCell(task); // Create HTML element for this new task
    updateTooltip(task); // Populate the tooltip
    tasks.push(task); // Add task data to the global array
  }
});

// Make the input field lose focus when Enter key is pressed
addTaskInput.addEventListener("keydown", function(event) {
  if (event.code === "Enter")
    this.blur();
});

// Set focus to the input field when the plus button is clicked
addTaskButton.addEventListener("click", function() {
  addTaskInput.focus();
});