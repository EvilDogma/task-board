// Retrieve tasks and nextId from localStorage
// added default values if local storage is empty
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 0;
// Todo: create a function to generate a unique task id
function generateTaskId() {
    // generate a new Id for the next task incremented from the previous Id value. since it is set to 0 if there is nothing in local storage the first id is 1 
    nextId++
    localStorage.setItem('nextId', JSON.stringify(nextId));
    return nextId
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    // determine what bootstrap color class to apply to the card based on when it is due or if it is already done
    let bgColor = ''
    if (task.taskGroup !== 'done') {

        if (dayjs().isBefore(dayjs(task.taskDueDate))) {
            bgColor = 'bg-warning'
        } else {
            bgColor = 'bg-danger'
        }

    }
    // Creat card with a template literal string. included draggable class to make draggable and bootstrap classes for styling
    const card = `
        <div class="card task-card ${bgColor} mb-2 draggable">
            <h4 class = "card-header">${task.taskName}</h4>
            <p>${task.taskDescription}</p>
            <p>${task.taskDueDate}</p>
            <a class="btn btn-danger delete-button" id="${task.taskId}">Delete</a>
        </div>
        `
    // append it to the correct task group
    if (task.taskGroup === 'to-do') {
        $('#to-do .card-body').append(card)
    } else if (task.taskGroup === 'in-progress') {
        $('#in-progress .card-body').append(card)
    } else {
        $('#done .card-body').append(card)
    }


}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    // use map to render each task in local storage using creatTaskCard
    taskList.map(task => createTaskCard(task))
}
// added to reset the form
function resetForm() {
    $('#taskName').val(''),
        $('#taskDueDate').val(''),
        $('#taskDescription').val('')
}


// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    // button is part of the modal not the form so
    // event.preventDefault() is not needed

    // define a new task option with the following values
    const newTask = {
        taskName: $('#taskName').val(),
        taskDueDate: $('#taskDueDate').val(),
        taskDescription: $('#taskDescription').val(),
        taskId: generateTaskId(),
        taskGroup: 'to-do'
    };

    // Call Creat Task Card on the new task to render it to the DOM
    createTaskCard(newTask)

    // add the newly added task to the task list and update local storage
    taskList.push(newTask)
    localStorage.setItem('tasks', JSON.stringify(taskList))

}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
    //remove item from DOM
    $(this).parent().remove()
    //remove item from taskList using filter
    taskList = taskList.filter(task => task.taskId != this.id)
    //update local storage
    localStorage.setItem('tasks', JSON.stringify(taskList))
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    // get the dragged item and the dropzone and their respective ids. use detatch method to separate the card from its orignal parent
    let card = $(ui.draggable.detach())
    let cardId = card.find('.delete-button').attr('id');
    let dZone = $(event.target)
    let dZoneId = $(this).parent().attr('id');
    // append the card to the drop zome
    card.appendTo(dZone)
    // Jquery UI adds position styles to the draggable item. This resets the dragged items position relative to the drop zone
    card.css({
        position: 'relative',
        top: 0,
        left: 0
    });
    // Remove Bootstrap color classes from items dropped in the done zone
    if (dZoneId == 'done') {
        card.removeClass('bg-danger bg-warning')
    }
    // get the index of the dropped task in the task list
    taskIndex = taskList.findIndex(task => task.taskId == cardId)
    // update the task group of the dropped task and update the task list in local storage
    taskList[taskIndex].taskGroup = dZoneId
    localStorage.setItem('tasks', JSON.stringify(taskList))
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    // Render tasks from local storage
    renderTaskList()
     // Listener for draggable
    //  added revert invalid to return the draggable to its original position if dropped out of dropzone
     $('.swim-lanes').on('mouseover', '.draggable', function () {
        $(this).draggable({
             revert: "invalid" 
        })
    });
    // Add task listener on click since the button is part of the modal not the form.
    $('#submit').on('click', handleAddTask)
    // reset form on modal close
    $('.close-modal').on('click', resetForm)
    // delete task listener
    $(".swim-lanes").on("click", '.delete-button', handleDeleteTask)
    // drop listener
    $(".card-body").droppable({
        accept: '.task-card',
        drop: handleDrop
    });
});
