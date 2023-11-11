// Script to return results for the solve button
$(document).ready(function() {
    $('#sudoku-form').on('submit', function(event) {
        event.preventDefault();  // Prevent the default form submission

        var formData = $(this).serialize();  // Serialize the form data

        $.ajax({
            type: 'POST',
            url: '/solve',
            data: formData,
            dataType: 'json',  // Expect a JSON response
            success: function(response) {
                // Handle the response here
                if (response.solution) {
                    console.log('Solution found:', response.solution); // Log the solution

                    // Loop through the input elements and set their values
                    for (let row = 0; row < 9; row++) {
                        for (let col = 0; col < 9; col++) {
                            const cellValue = response.solution[row * 9 + col];
                            $(`#cell-${row}-${col}`).val(cellValue); // Update the input value
                        }
                    }
                } else {
                    // Display an error message if no solution is found
                    console.log('No solution found'); // Log the error
                    // You can add code here to display an error message to the user
                }
            },
            error: function(xhr, status, error) {
                // Handle errors here
                console.error('AJAX error:', status, error);
                // You can add code here to handle and display AJAX errors
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {

const resetButton = document.querySelector('#reset-button');
resetButton.addEventListener('click', function () {
    // Clear all input cells
    const cells = document.querySelectorAll('.sudoku-cell');
    cells.forEach(function (cell) {
        cell.value = ''; // Clear the cell
    });
});
});

// Timer
var timerInterval;
var startTime;

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(function() {
        var elapsedTime = Date.now() - startTime;
        document.getElementById('time').textContent = (elapsedTime / 1000).toFixed(2);
    }, 100); // Update the timer every 100 ms
}

function stopTimer() {
    clearInterval(timerInterval);
    var elapsedTime = Date.now() - startTime;
    document.getElementById('time').textContent = (elapsedTime / 1000).toFixed(2);
}

// Modify your existing $(document).ready function
$(document).ready(function() {
    $('#sudoku-form').on('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // ... existing code ...

        // Start the timer when the form is submitted
        startTimer();

        $.ajax({
            // ... existing AJAX setup ...
            success: function(response) {
                // Stop the timer as soon as the solution is received
                stopTimer();

                // ... existing code for updating the grid ...
            },
            error: function(xhr, status, error) {
                // ... existing error handling ...

                // Stop the timer if an error occurs
                stopTimer();
            }
        });
    });
});