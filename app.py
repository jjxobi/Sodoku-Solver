from flask import Flask, render_template, request, jsonify 
from sudoku_solver import solve_sudoku, find_all_solutions, print_board

app = Flask(__name__)

# Route for displaying the Sudoku form
@app.route('/')
def index():
    # Render the empty Sudoku board template
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve():
    try:
        cells = [request.form[f'cell-{i}-{j}'] for i in range(9) for j in range(9)]
        puzzle = [int(cell) if cell.isdigit() else 0 for cell in cells]
        puzzle_grid = [puzzle[i:i+9] for i in range(0, 81, 9)]

        if solve_sudoku(puzzle_grid):
            solved_puzzle = [cell for row in puzzle_grid for cell in row]
            return jsonify({'solution': solved_puzzle})
        else:
            return jsonify({'error': "No solution exists for the provided puzzle."}), 400
    except Exception as e:
        app.logger.error(f"Error occurred: {e}")
        return jsonify({'error': "An error occurred while solving the puzzle."}), 500

    
@app.route('/find_all_solutions', methods=['POST'])
def find_all():
    try:
        # Extract puzzle data from form
        cells = [request.form[f'cell-{i}-{j}'] for i in range(9) for j in range(9)]
        puzzle = [int(cell) if cell.isdigit() else 0 for cell in cells]

        # Convert the flat list to a 2D list representing the Sudoku grid
        puzzle_grid = [puzzle[i:i+9] for i in range(0, 81, 9)]

        # A list to store all solutions
        all_solutions = []
        find_all_solutions(puzzle_grid, all_solutions)

        # Check if any solutions were found
        if all_solutions:
            # Convert the solutions to a flat list to pass them back
            solutions_flat = [[cell for row in solution for cell in row] for solution in all_solutions]
            return jsonify({'solutions': solutions_flat})
        else:
            return jsonify({'error': "No solutions exist for the provided puzzle."}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        # Log the error and provide feedback to the user
        print(f"An error occurred: {e}")

if __name__ == '__main__':
    app.run(debug=True)
