// Script to return results for the solve button
$(document).ready(function() {
    var allSolutions = [];
    var currentSolutionIndex = 0;

    function updateGrid(solution) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                $(`#cell-${row}-${col}`).val(solution[row * 9 + col]);
            }
        }
    }

    function updateSolutionCount(count) {
        $('#solution-count').text(count);
        if (count > 0) {
            $('#num-solutions').show();
            if (count > 1) {
                $('#prev-solution').show();
                $('#next-solution').show();
            } else {
                $('#prev-solution').hide();
                $('#next-solution').hide();
            }
        } else {
            $('#num-solutions').hide();
            $('#prev-solution').hide();
            $('#next-solution').hide();
        }
    }

    function findAllSolutions() {
        var formData = $('#sudoku-form').serialize();
        $.ajax({
            type: 'POST',
            url: '/find_all_solutions',
            data: formData,
            dataType: 'json',
            success: function(response) {
                allSolutions = response.solutions || [];
                updateSolutionCount(allSolutions.length);
                if (allSolutions.length > 0) {
                    updateGrid(allSolutions[0]);
                    currentSolutionIndex = 0;
                }
            },
            error: function(xhr, status, error) {
                console.error('An error occurred:', status, error);
                updateSolutionCount(0);
            }
        });
    }

    $('#sudoku-form').on('submit', function(event) {
        event.preventDefault();  // Prevent the default form submission
        var formData = $(this).serialize();  // Serialize the form data
        startTimer(); // Start the timer when the form is submitted

        $.ajax({
            type: 'POST',
            url: '/solve',
            data: formData,
            dataType: 'json',  // Expect a JSON response
            success: function(response) {
                stopTimer(); // Stop the timer as soon as the solution is received
                if (response.solution) {
                    console.log('Solution found:', response.solution); // Log the solution
                    updateGrid(response.solution);
                    findAllSolutions(); // Now find all solutions
                } else {
                    console.log('No solution found'); // Log the error
                    updateSolutionCount(0); // Update the solution count display
                }
            },
            error: function(xhr, status, error) {
                stopTimer(); // Stop the timer if an error occurs
                console.error('AJAX error:', status, error);
            }
        });
    });

    $('#prev-solution').click(function() {
        if (currentSolutionIndex > 0) {
            currentSolutionIndex--;
        } else {
            currentSolutionIndex = allSolutions.length - 1;
        }
        updateGrid(allSolutions[currentSolutionIndex]);
    });

    $('#next-solution').click(function() {
        currentSolutionIndex = (currentSolutionIndex + 1) % allSolutions.length;
        updateGrid(allSolutions[currentSolutionIndex]);
    });

    const resetButton = document.querySelector('#reset-button');
    resetButton.addEventListener('click', function() {
        // Clear all input cells
        const cells = document.querySelectorAll('.sudoku-cell');
        cells.forEach(function(cell) {
            cell.value = ''; // Clear the cell
        });
        $('#num-solutions').hide(); // Hide the number of solutions
        $('#prev-solution').hide(); // Hide the prev button
        $('#next-solution').hide(); // Hide the next button
        stopTimer(); // Stop and reset the timer
        document.getElementById('time').textContent = '0'; // Reset timer display
    });
});

// Timer functionality
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
