from flask import Flask, render_template, request, jsonify
from sudoku_solver import solve_sudoku, print_board

app = Flask(__name__)

# Route for displaying the Sudoku form
@app.route('/')
def index():
    # Render the empty Sudoku board template
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve():
    # Extract puzzle data from form
    cells = [request.form[f'cell-{i}-{j}'] for i in range(9) for j in range(9)]
    puzzle = [int(cell) if cell.isdigit() else 0 for cell in cells]  # Convert to int and replace empty with 0

    # Convert the flat list to a 2D list representing the Sudoku grid
    puzzle_grid = [puzzle[i:i+9] for i in range(0, 81, 9)]

    # Solve the puzzle using your imported function
    if solve_sudoku(puzzle_grid):
        # If a solution was found, pass it back to the template
        # (You may need to adjust this to match how you want to present the solution)
        return render_template('index.html', solution=puzzle_grid)
    else:
        # If no solution exists, inform the user or handle appropriately
        return render_template('index.html', message="No solution exists for the provided puzzle.")

if __name__ == '__main__':
    app.run(debug=True)