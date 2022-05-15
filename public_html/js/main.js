var tasks = []; // The array that will hold all task objects
const addTaskButton = document.getElementById("add-task"); // HTML element for the Add Task button
const addTaskInput = document.getElementById("task-input"); // HTML element for the text input field
const tasksContainer = document.getElementById("tasks-container"); // A div that will contain all the tasks
const maxLength = 35; // Maximum amount of characters to be displayed for each task

function Task(inputText) { // A constructor function for task objects
  this.fullText = inputText;
  this.displayText = shorten(inputText);
  this.isCompleted = false;
  this.created = new Date();
}

function shorten(inputText) { // If the text is too long to fit the cell, shorten it in a graceful manner
if (inputText.length > maxLength) {
    // Turn the string into an array of words
    let words = inputText.split(" ");
    //  Keep adding words from this array into a new string until maxLength is exceeded
    let result = "";
    for (let i = 0; i < words.length; i++) {
      if (result.length + words[i].length + 1 <= maxLength)
        result += " " + words[i];
      else break;
    }
    result += "…"; // Add an ellipsis at the end
    return result;
  } else return inputText;
}

function dateToText(inputDate) { // Turn a date object into a string that will be displayed in the tooltip
  var result;
  const today = new Date();
  var yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  switch (inputDate.toLocaleString()) {
    case today.toLocaleString() : result = "Today" + ", " + inputDate.toLocaleTimeString("en-US"); break;
    case yesterday.toLocaleString() : result = "Yesterday" + ", " + inputDate.toLocaleTimeString("en-US"); break;
    default: result = inputDate.toLocaleDateString("en-US");
  }
  return result;
}

function createCell(task) { // Create a DOM element for the task and add it to the container
  
  // Create new DOM elements that we'll use to construct the task cell
  const newTaskCell = document.createElement("div"); // The div that corresponds to the task. It will contain all the below elements
  const newTaskCheckmark = document.createElement("div"); // An empty circle that will contain a checkmark if the task is completed
  const newTaskText = document.createElement("span"); // This will contain the displayed text and the hidden tooltip text
  const newTaskDeleteButton = document.createElement("div"); // An empty circle with the letter X inside. This will be used as a "delete task" button.
  
  // Set their classes and innerHTML
  newTaskCell.classList.add("cell");
  newTaskCell.classList.add("task");
  newTaskDeleteButton.classList.add("delete-button");
  newTaskDeleteButton.innerHTML = "X"; // The letter X is used as a "delete" symbol;
  newTaskCheckmark.classList.add("checkmark");
  newTaskCheckmark.innerHTML = "<p>&check;</p>"; // &check; is a checkmark symbol;
  newTaskText.classList.add("tooltip");
  newTaskText.innerHTML = task.displayText === task.fullText
              ? `${task.displayText}<span class="tooltip-text">Created: ${dateToText(task.created)}</span>` // if task.displayText is same as task.fullText, create a tooltip that only shows the timestamp
              : `${task.displayText}<span class="tooltip-text">${task.fullText}<hr />Created: ${dateToText(task.created)}</span>`; // else create HTML that will show both the timestamp and task.fullText
  
  // Append each component to the new cell, then append the new cell to the tasks container
  newTaskCell.appendChild(newTaskCheckmark);
  newTaskCell.appendChild(newTaskText);
  newTaskCell.appendChild(newTaskDeleteButton);
  tasksContainer.appendChild(newTaskCell);
  
  // Set the onclick functions for the checkmark and the delete button
  newTaskCheckmark.onclick = function() {
    // Toggle the "Completed" state for the element
    const taskCell = this.parentElement;
    taskCell.classList.toggle("completed");
    // Update the isCompleted field in the array item that corresponds to this element
    if (taskCell.classList.contains("completed"))
      tasks[getTaskIndex(taskCell)].isCompleted = true;
    else
      tasks[getTaskIndex(taskCell)].isCompleted = false;
  };
  newTaskDeleteButton.onclick = function () {
    // Delete the task from the array
    let i = getTaskIndex(this.parentElement);
    tasks.splice(i, 1);
    // Remove the task cell HTML element
    this.parentElement.remove();
  };
  
  // Return a reference to the task cell DOM element we've created
  return newTaskCell;
}

addTaskInput.addEventListener("focusout", function() { // Create a new task when the input field loses focus
  let currentValue = this.value.trim(); // Remove surrounding spaces from the value
  if (currentValue.length > 0) { // Only do this if the field is not empty
    this.value = "";
    const task = new Task(currentValue); // Create a new task
    task.htmlElement = createCell(task); // Create HTML element for this new task
    tasks.push(task); // Add task data to the global array
  }
});

function getTaskIndex(element) { // Take a reference to a DOM element and find the corresponding index of a task in the global array
  var result = -1;
  for (let i = 0; i < tasks.length; i++)
    if (tasks[i].htmlElement === element) {
      result = i;
      break;
    }
  return result;
}

// Make the input field lose focus when Enter key is pressed
addTaskInput.addEventListener("keydown", function(event) {
  if (event.code === "Enter")
    this.blur();
});

// Set focus to the input field when the plus button is clicked
addTaskButton.addEventListener("click", function() {
  addTaskInput.focus();
});