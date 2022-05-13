var tasks = []; // The array that will hold all task objects
const addTaskButton = document.getElementById("add-task"); // HTML element for the Add Task button
const addTaskInput = document.getElementById("task-input"); // HTML element for the input text
const tasksContainer = document.getElementById("tasks-container"); // A <div> that will contain all the tasks
const maxLength = 30; // Maximum amount of characters to be displayed for each task

function Task(inputText) { // A constructor function for task objects
  this.fullText = inputText;
  if (inputText.length > maxLength) {
    // Truncate the display text so it fits the screen
    // Turn the string into an array of words, then add words from this array into a new string until maxLength is exceeded
    this.displayText = inputText.split(" ").reduce((a, b) => (a.length + b.length <= maxLength) ? a + " " + b : a, "");
    this.displayText += "…"; // Add an ellipsis at the end
    } else this.displayText = inputText;
  this.isCompleted = false;
  this.htmlElement = createDiv(this.displayText, this.fullText);
}

// Create an HTML element for the task and add it to the container
function createDiv(displayText, fullText) {
  const newDiv = document.createElement("div");
  newDiv.classList.add("cell");
  newDiv.classList.add("task");
  newDiv.innerHTML = displayText === fullText
              ? `<span>${displayText}</span>` // if displayText is same as fullText, create HTML without a tooltip
              : `<span class="tooltip">${displayText}<span class="tooltip-text">${fullText}</span></span>`; // else create HTML that will show fullText in a tooltip
  tasksContainer.appendChild(newDiv);
  newDiv.onclick = function() {
    // Toggle the "Completed" state for the element
    this.classList.toggle("completed");
    // Update the isCompleted field in the array item that corresponds to this element
    if (this.classList.contains("completed"))
      tasks[getTaskIndex(this)].isCompleted = true;
    else
      tasks[getTaskIndex(this)].isCompleted = false;
  };
  return newDiv;
}

// Create a new task when the input field loses focus (if the field is not empty)
addTaskInput.addEventListener("focusout", function() {
  let currentValue = this.value.trim(); // Remove surrounding spaces from the value
  if (currentValue.length > 0) {
    this.value = "";
    tasks.push(new Task(currentValue)); // Create a new task and add it to the global array
  }
});

// Make the input field lose focus when the Enter key is pressed
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