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
                    // Update the Sudoku grid with the solution
                } else {
                    // Display an error message if no solution is found
                }
            },
            error: function(xhr, status, error) {
                // Handle errors here
                console.error('AJAX error:', status, error);
            }
        });
    });
});
