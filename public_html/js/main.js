var tasks = []; // The array that will hold all task objects
const addTaskButton = document.getElementById("add-task"); // HTML element for the Add Task button
const addTaskInput = document.getElementById("task-input"); // HTML element for the input text
const tasksContainer = document.getElementById("tasks-container"); // A <div> that will contain all the tasks
const maxLength = 35; // Maximum amount of characters to be displayed for each task

function Task(inputText) { // A constructor function for task objects
  this.fullText = inputText;
  if (inputText.length > maxLength) {
    // Truncate the display text so it fits the screen
    // Turn the string into an array of words, then add words from this array into a new string until maxLength is exceeded
    this.displayText = inputText.split(" ").reduce((a, b) => (a.length + b.length <= maxLength) ? a + " " + b : a, "");
    this.displayText += "…"; // Add an ellipsis at the end
    } else this.displayText = inputText;
  this.isCompleted = false;
  this.htmlElement = createCell(this.displayText, this.fullText);
}

// Create an HTML element for the task and add it to the container
function createCell(displayText, fullText) {
  // Create new HTML elements that we'll use to construct the task cell
  const newTaskCell = document.createElement("div");
  const newTaskCheckmark = document.createElement("div");
  const newTaskText = document.createElement("span");
  const newTaskDeleteButton = document.createElement("div");
  // Set their classes and innerHTML
  newTaskCell.classList.add("cell");
  newTaskCell.classList.add("task");
  newTaskDeleteButton.classList.add("delete-button");
  newTaskDeleteButton.innerHTML = "X";
  newTaskCheckmark.classList.add("checkmark");
  newTaskCheckmark.innerHTML = "<p>&check;</p>"; // &check; is a checkmark symbol;
  newTaskText.classList.add("tooltip");
  newTaskText.innerHTML = displayText === fullText
              ? displayText // if displayText is same as fullText, create HTML without a tooltip
              : `${displayText}<span class="tooltip-text">${fullText}</span>`; // else create HTML that will show fullText in a tooltip
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
  // Return a reference to the task cell we've created
  return newTaskCell;
}

// Create a new task when the input field loses focus (if the field is not empty)
addTaskInput.addEventListener("focusout", function() {
  let currentValue = this.value.trim(); // Remove surrounding spaces from the value
  if (currentValue.length > 0) {
    this.value = "";
    tasks.push(new Task(currentValue)); // Create a new task and add it to the global array
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

// Take a reference to a DOM element and find the corresponding index of a task in the global "tasks" array
function getTaskIndex(element) {
  var result = -1;
  for (let i = 0; i < tasks.length; i++)
    if (tasks[i].htmlElement === element) {
      result = i;
      break;
    }
  return result;
}