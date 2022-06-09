import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
    return (
        <button
            className="square"
            onClick={props.onClick}
            id={'square'+props.idToUse}
        >
          {props.value}
        </button>
    );
}
  
class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                key={i}
                idToUse={i}
            />
        );
    }

    // EXTRA 3: use loops to create game board
    createBoard() {
        let rows = []
        for (let i = 0; i < 3; i++) {
            let squares = [];
            for (let j = 0; j < 3; j++) {
                squares.push(this.renderSquare(i*3 + j));
            }
            rows.push(<div className="board-row" key={i}>{squares}</div>);
        }
        return rows
    }
  
    render() {
        return (
            <div>
                {this.createBoard()}
            </div>
        );
    }
}
  
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            moves: [],
            positions: Array(1).fill(null), // EXTRA 1: adding (col, row) to history
            stepNumber: 0,
            xIsNext: true
        };
    }

    componentDidMount() {
        this.calculateMoves();
    }

    // EXTRA 4: toggle order of moves
    calculateMoves() {
        var moves = this.state.history.map((step, move) => {
            const desc = move ?
                'Go to move # ' + move + " at (" + this.state.positions[move].col + ", " + this.state.positions[move].row + ")" : // EXTRA 1: adding (col, row) to history
                'Go to game start';
            return (
                <li key={move}>
                    <button
                        onClick={() => this.jumpTo(move)}
                        className="bold-text" // EXTRA 2: bold current move
                        id={'button'+move}
                    >
                        {desc}
                    </button>
                </li>
            );
        });

        this.setState({
            moves: moves,
        });
    }

    calculateWinner(squares) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                // EXTRA 5: highlight winning squares
                for (let k = 0; k < 3; k++) {
                    document.getElementById('square'+lines[i][k]).classList.add('square-win');
                }
                return squares[a];
            }
        }
        return null;
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (this.calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';

        // EXTRA 1: adding (col, row) to history
        const positions = this.state.positions.slice(0, this.state.stepNumber + 1);
        const col = (i % 3) + 1;
        const row = Math.floor(i / 3) + 1;
        positions.push({
            col: col,
            row: row,
        });

        // EXTRA 4: toggle order of moves
            // necessary to have async call to calculateMoves after setting state
            // so render function isn't called before moves buttons are mapped
        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            positions: positions,
        }, () => {
            this.calculateMoves();
        });

        // EXTRA 2: bold current move
        document.getElementById('button'+this.state.stepNumber).classList.remove("bold-text");
        try {
            document.getElementById('button'+(this.state.stepNumber + 1)).classList.add("bold-text");
        } catch (error) {}
        
        this.setState({
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });

        // EXTRA 6: report tie
        console.log(this.state.stepNumber);
        if (this.state.stepNumber == 8 && !this.calculateWinner(squares)) {
            alert("it's a cat's game!");
        }
    }

    jumpTo(step) {
        // since history is not included in setState, it is left the same
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });

        // EXTRA 2: bold current move
        for (let i = 0; i < 10; i++) {
            try {
                document.getElementById('button'+i).classList.remove("bold-text");
            } catch (error) {}
        }
        document.getElementById('button'+step).classList.add("bold-text");

        // EXTRA 5: highlight winning squares
        for (let i = 0; i < 9; i++) {
            try {
                document.getElementById('square'+i).classList.remove("square-win");
            } catch (error) {}
        }
    }

    // EXTRA 4: toggle order of moves
    reverseMoveOrder() {
        this.setState({
            moves: this.state.moves.reverse(),
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = this.calculateWinner(current.squares);

        let status;
        if (winner) {
        status = 'Winner: ' + winner;
        } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
            <div className="game-board">
                <Board
                    squares={current.squares}
                    onClick={(i) => this.handleClick(i)}
                />
            </div>
            <div className="game-info">
                <div>{status}</div>
                <ol>{this.state.moves}</ol>
            </div>
            <div>
                <button
                    onClick={() => this.reverseMoveOrder()}
                >
                    reverse order
                </button>
            </div>
            </div>
        );
    }
}
  
  // ========================================
  
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
