/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

// Fetches data from the job board and displays it
async function fetchAndDisplayUsers() {
    const tableElement = document.getElementById('jobBoard');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/jobboard', {
        method: 'GET'
    });

    const responseData = await response.json();
    const jobBoardContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    jobBoardContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// This function resets or initializes the job board
async function resetJobBoard() {
    const response = await fetch("/initiate-jobboard", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "Job board initiated successfully!";
        fetchTableData();
    } else {
        alert("Error initiating table!");
    }
}

// Inserts new job posting into the job board
async function insertJobBoard(event) {
    event.preventDefault();

    const idValue = document.getElementById('insertId').value;
    const companyValue = document.getElementById('insertCompany').value;
    const positionValue = document.getElementById('insertPosition').value;
    const deadlineValue = document.getElementById('insertDeadline').value;

    // termsList returns array of radio buttons (winter, spring, summer)
    const termsList = document.getElementsByName('term');
    let termValue; // termValue will be set to the radio button value that is checked (Winter, Spring, Summer)
    for (let i=0; i<termsList.length; ++i) {
        if (termsList[i].checked) { // finding the button that was checked
            termValue = termsList[i].value;
        }
    }

    // durationList is array of radio buttons with values of either 4, 8, or 12
    const durationList = document.getElementsByName('duration');
    let durationValue; // durationValue will be the selected button's value
    for (let i=0; i<durationList.length; ++i) {
        if (durationList[i].checked) { // finding the button that was checked
            durationValue = durationList[i].value;
        }
    }

    // gives todays date; when a user inserts a job posting, todays date will automatically be used as the job posted date
    const currentDate = new Date().toDateString();

    const response = await fetch('/insert-jobboard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: idValue,
            company: companyValue,
            position: positionValue,
            deadline: deadlineValue,
            term: termValue,
            duration: durationValue,
            datePosted: currentDate
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
}

// WIP
async function filterJobBoard() {
    const columnInput = document.getElementById('filterInput').value;
    const response = await fetch("/filter-jobboard", {
        method: 'POST',
        body: JSON.stringify({
            columnName: columnInput,
        })
    });
    const responseData = await response.json();

    const messageElement = document.getElementById('filterResultMsg');
    if (responseData.success) {
        messageElement.textContent = "filtered successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error filtering table!";
    }
}

// Removes job postings with corresponding ID
async function removeIDJobBoard(event) {
    event.preventDefault();

    const idToFind = document.getElementById('removeID').value;
    const response = await fetch('/remove-id-jobboard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            removeID: idToFind,
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateRemoveIDResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Removed Job Posting!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error finding ID!";
    }
}

// Updates names in the job board
async function updatePositionDetail(event) {
    event.preventDefault();

    const targetID = document.getElementById('targetID').value;
    const newNameValue = document.getElementById('updateNewPositionDetails').value;

    const response = await fetch('/update-name-jobpostingofferedposted', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            targetID: parseInt(targetID),
            newName: newNameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateNameResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Name updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating name!";
    }
}

// Counts rows in the job board.
// Modify the function accordingly if using different aggregate functions or procedures.
async function countJobBoard() {
    const response = await fetch("/count-jobboard", {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('countResultMsg');

    if (responseData.success) {
        const tupleCount = responseData.count;
        messageElement.textContent = `The number of job postings in the job board: ${tupleCount}`;
    } else {
        alert("Error in count!");
    }
}


// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    fetchTableData();
    document.getElementById("resetBtn").addEventListener("click", resetJobBoard);
    document.getElementById("insertJobBoard").addEventListener("submit", insertJobBoard);
    document.getElementById("filterBtn").addEventListener("submit", filterJobBoard);
    document.getElementById("removeIDJobBoard").addEventListener("submit", removeIDJobBoard);
    document.getElementById("updatePositionDetails").addEventListener("submit", updatePositionDetail);
    document.getElementById("countJobBoard").addEventListener("click", countJobBoard);
};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayUsers();
}
