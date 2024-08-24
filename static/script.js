// Global variables to hold all solutions and the current solution index
var allSolutions = [];
var currentSolutionIndex = 0;
var timerInterval;
var startTime;
var isPaused = false;

// Function to update the number of solutions
function updateSolutionCount(count) {
    $('#num-solutions').show();
    $('#solution-count').text(`Solution ${currentSolutionIndex + 1} of ${count}`);
    toggleNavigationButtons();
}

// Function to handle displaying the next solution
function showNextSolution() {
    if (currentSolutionIndex < allSolutions.length - 1) {
        currentSolutionIndex++;
        updateGrid(allSolutions[currentSolutionIndex]);
        toggleNavigationButtons();
    }
}

// Function to handle displaying the previous solution
function showPrevSolution() {
    if (currentSolutionIndex > 0) {
        currentSolutionIndex--;
        updateGrid(allSolutions[currentSolutionIndex]);
        toggleNavigationButtons();
    }
}

// Function to toggle navigation buttons based on the current solution index
function toggleNavigationButtons() {
    $('#prev-solution').prop('disabled', currentSolutionIndex === 0);
    $('#next-solution').prop('disabled', currentSolutionIndex === allSolutions.length - 1);
}

// Timer functionality
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(function() {
        var elapsedTime = Date.now() - startTime;
        $('#time').text((elapsedTime / 1000).toFixed(2));
    }, 100);
}

function stopTimer() {
    clearInterval(timerInterval);
    var elapsedTime = Date.now() - startTime;
    $('#time').text((elapsedTime / 1000).toFixed(2));
}

// Reset timer to 0
function resetTimer() {
    clearInterval(timerInterval);
    $('#time').text('0');
}

// Function to validate the grid (refined to check within rows, columns, and 3x3 sub-grids)
function isValidGrid() {
    let grid = [];

    for (let row = 0; row < 9; row++) {
        grid.push([]);
        for (let col = 0; col < 9; col++) {
            let value = $(`#cell-${row}-${col}`).val();
            if (value) {
                grid[row][col] = parseInt(value, 10);
            } else {
                grid[row][col] = 0;
            }
        }
    }

    // Check rows
    for (let row = 0; row < 9; row++) {
        let seen = new Set();
        for (let col = 0; col < 9; col++) {
            let value = grid[row][col];
            if (value !== 0) {
                if (seen.has(value)) return false; // Duplicate in row
                seen.add(value);
            }
        }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
        let seen = new Set();
        for (let row = 0; row < 9; row++) {
            let value = grid[row][col];
            if (value !== 0) {
                if (seen.has(value)) return false; // Duplicate in column
                seen.add(value);
            }
        }
    }

    // Check 3x3 sub-grids
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            let seen = new Set();
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    let value = grid[boxRow * 3 + row][boxCol * 3 + col];
                    if (value !== 0) {
                        if (seen.has(value)) return false; // Duplicate in sub-grid
                        seen.add(value);
                    }
                }
            }
        }
    }

    return true; // No duplicates found
}

// When the DOM is ready, configure the form submission and button actions
$(document).ready(function() {
    $('#sudoku-form').on('submit', function(event) {
        event.preventDefault();  // Prevent the default form submission
        resetTimer(); // Reset the timer before solving

        if (!isValidGrid()) {
            alert('Invalid grid: Please correct the puzzle and try again.');
            return;
        }

        // Only start the timer if the grid is valid
        startTimer(); // Start the timer when the form is validated and submitted

        var formData = $(this).serialize();  // Serialize the form data

        $.ajax({
            type: 'POST',
            url: '/solve',
            data: formData,
            dataType: 'json',
            beforeSend: function() {
                // Show loading indicator
                $('#loading').show();
            },
            success: function(response) {
                stopTimer(); // Stop the timer as soon as the solution is received

                if (response.solution) {
                    updateGrid(response.solution);
                } 
                findAllSolutions(formData);
            },
            error: function(xhr, status, error) {
                stopTimer(); // Stop the timer if there's an error
                console.error('AJAX error:', status, error);
                alert('An error occurred while solving the puzzle. Please check your input and try again.');
            },
            complete: function() {
                // Hide loading indicator
                $('#loading').hide();
            }
        });
    });

    // Bind click actions for the Previous and Next solution buttons
    $('#prev-solution').click(showPrevSolution);
    $('#next-solution').click(showNextSolution);

    // Bind click action for the Pause/Resume button
    $('#pause-resume-button').click(function() {
        if (isPaused) {
            // Resume the timer
            startTimer();
            $(this).text('Pause');
            isPaused = false;
        } else {
            // Pause the timer
            clearInterval(timerInterval);
            $(this).text('Resume');
            isPaused = true;
        }
    });

    // Add the reset button functionality
    $('#reset-button').click(function() {
        // Clear all the cells and remove input classes
        $('.sudoku-cell').each(function() {
            $(this).val(''); 
            $(this).removeClass('solver-input user-input'); // Remove any classes related to input origin
        });

        // Reset the timer
        resetTimer();

        // Reset isPaused and pause/resume button
        isPaused = false;
        $('#pause-resume-button').text('Pause');

        // Hide solution-related UI elements
        $('#num-solutions').hide(); // Hide the number of solutions
        $('#prev-solution').hide(); // Hide the previous solution button
        $('#next-solution').hide(); // Hide the next solution button
    });

    // Input validation to allow only digits
    $('.sudoku-cell').on('input', function() {
        this.value = this.value.replace(/[^1-9]/g, '');
        $(this).addClass('user-input');
    });
});

// Function to update the Sudoku grid with a solution
function updateGrid(solution) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            var cell = $(`#cell-${row}-${col}`);
            if (!cell.hasClass('user-input')) { // Only update empty cells or those not modified by the user
                cell.val(solution[row * 9 + col]).addClass('solver-input');
            }
        }
    }
}

// AJAX call to find all solutions
function findAllSolutions(formData) {
    console.log("findAllSolutions function called with formData:", formData); // Debugging line
    $.ajax({
        type: 'POST',
        url: '/find_all_solutions',
        data: formData,
        dataType: 'json',
        beforeSend: function() {
            // Show loading indicator
            $('#loading').show();
        },
        success: function(response) {
            allSolutions = response.solutions || [];
            console.log('All solutions found:', allSolutions.length);
            updateSolutionCount(allSolutions.length);
        },
        error: function(xhr, status, error) {
            console.error('An error occurred while finding all solutions:', status, error);
            alert('An error occurred while finding all solutions. Please try again.');
            updateSolutionCount(0);
        },
        complete: function() {
            // Hide loading indicator
            $('#loading').hide();
        }
    });
}

// Function to provide a hint for the next logical number
$('#hint-button').click(function() {
    var formData = $('#sudoku-form').serialize();

    $.ajax({
        type: 'POST',
        url: '/hint',
        data: formData,
        dataType: 'json',
        success: function(response) {
            if (response.hint) {
                var cellId = `#cell-${response.hint.row}-${response.hint.col}`;
                $(cellId).val(response.hint.value).addClass('solver-input');
            } else {
                alert('No hints available.');
            }
        },
        error: function(xhr, status, error) {
            console.error('An error occurred while getting a hint:', status, error);
            alert('An error occurred while getting a hint. Please try again.');
        }
    });
});
