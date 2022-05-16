let tasks = []; // The array that will hold all task objects
const addTaskButton = document.getElementById("add-task"); // DOM element for the Add Task button
const addTaskInput = document.getElementById("task-input"); // DOM element for the text input field
const tasksContainer = document.getElementById("tasks-container"); // A div that will contain all the tasks
const maxDisplayLength = 35; // Maximum amount of characters to be displayed for each task
const maxLength = 200; // Maximum amount of characters that each task can contain
const maxCookieAge = 31536000; // Expiration time to set on cookies. 31536000 seconds is 1 year.

// First, let's read the existing tasks data from a cookie file, if it exists
function populateTasksFromCookie() {
  
  // This is a function from w3schools.com that reads a property with a given name from a cookie
  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
  // Read the cookie data and populate the UI
  let cookieData = getCookie("task-data");
  if (cookieData.length > 0) {
    tasks = JSON.parse(cookieData);
    
    // For each task, convert the .created property from a JSON string to an object
    tasks.forEach(task => {
      task.created = new Date(task.created);
    });
    
    // Create a DOM element for each task
    tasks.forEach(createCell);
  }
}

// Check if cookies are enabled and display a warning if not
if (!navigator.cookieEnabled)
  window.alert("Please enable cookies to prevent losing task data when you close this page.");

// When the page loads, try to load data from cookie
try {
  populateTasksFromCookie();
} catch (error) {
  console.error(error);
}

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
  switch (inputDate.toLocaleDateString()) {
    case today.toLocaleDateString() : result = "Today" + ", " + inputDate.toLocaleTimeString("en-US"); break;
    case yesterday.toLocaleDateString() : result = "Yesterday" + ", " + inputDate.toLocaleTimeString("en-US"); break;
    default: result = inputDate.toLocaleDateString("en-US");
  }
  return result;
}

/* Unused code that I might need later
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
*/

function deleteTask(task) {
  // Remove the DOM element for the task
  task.htmlElement.remove();
  // Remove the task object from the array
  tasks = tasks.filter(element => element !== task);
  // Update the data in the cookie file
  updateCookie();
}

function updateCookie() {
  // Store the glolbal tasks object in a cookie, overwriting any previous cookie data

  // We don't want to store the htmlElement property so let's create a copy of the tasks array without this property
  let tasksCopy = tasks.map(task => {
    // Create an empty object and all properties from the task object (except for htmlElement property) into the new object
    let taskCopy = {};
    taskCopy.fullText = task.fullText;
    taskCopy.displayText = task.displayText;
    taskCopy.isCompleted = task.isCompleted;
    // We have to turn taskCopy.created into a string because otherwise it doesn't get loaded correctly when reading the cookie
    taskCopy.created = task.created.toString();
    return taskCopy;
  });
  
  // Turn the array of objects into a string and encode it
  let tasksString = JSON.stringify(tasksCopy);
   
  // Save this string to a cookie
  document.cookie = `task-data=${tasksString}; max-age=${maxCookieAge}`;
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
  if (task.isCompleted) newTaskCell.classList.add("completed");
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
  
  // Add a reference to the DOM element we created into the task object as a property
  task.htmlElement = newTaskCell;
  
  // Populate the tooltip
  updateTooltip(task);
  
  // Set event listener functions for the checkmark, text area and delete button
  newTaskCheckmark.addEventListener("click", function() {
    // Toggle "Completed" state for the element
    const taskCell = this.parentElement;
    taskCell.classList.toggle("completed");
    // Update the isCompleted field in the array item that corresponds to this element
    if (taskCell.classList.contains("completed")) {
      task.isCompleted = true;
      this.nextSibling.removeAttribute("contenteditable"); // Also make the text field non-editable while the task is in "completed" state
    } else {
      task.isCompleted = false;
      this.nextSibling.setAttribute("contenteditable", "");
    }
  });
  
  newTaskText.addEventListener("focusin", function() {
    // When the input field receives focus, replace displayText with fullText
    this.innerHTML = task.fullText;
  });
  
  newTaskText.addEventListener("focusout", function() {
  // Update the task data when the input field loses focus
  let newValue = escapeHTML(this.textContent.trim()); // Remove surrounding spaces from the input text and escape any special characters
  if (newValue.length > 0) { // Only do this if the field is not empty
    task.fullText = newValue; // Update the data in the array
    task.displayText = shorten(newValue); // Update the data in the array
    this.innerHTML = task.displayText; // Update the DOM element to display short text instead of the user input
    updateTooltip(task); // Update the tooltip
  } else deleteTask(task); // If the user fully deleted the text, delete the task
  updateCookie(); // Update the data in the cookie file
  });
  
  newTaskText.addEventListener("keydown", function(event) {
    // Make the input field lose focus when Enter key is pressed
    if (event.code === "Enter" || event.code === "NumpadEnter")
      this.blur();
  });
  
  newTaskDeleteButton.addEventListener("click", function() {
    deleteTask(task);
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
    createCell(task); // Create HTML element for this new task
    tasks.push(task); // Add task data to the global array
    updateCookie(); // Update the data in the cookie file
  }
});

// Make the input field lose focus when Enter key is pressed
addTaskInput.addEventListener("keydown", function(event) {
  if (event.code === "Enter" || event.code === "NumpadEnter")
    this.blur();
});

// Set focus to the input field when the plus button is clicked
addTaskButton.addEventListener("click", function() {
  addTaskInput.focus();
});