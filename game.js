// 체스 말 유니코드
const pieces = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

// 게임 상태
let board = [];
let selectedSquare = null;
let currentPlayer = 'white';
let gameOver = false;
let moveHistory = [];
let capturedPieces = { white: [], black: [] };
let lastMove = null;
let enPassantTarget = null;
let kingMoved = { white: false, black: false };
let rookMoved = { white: { left: false, right: false }, black: { left: false, right: false } };
let isAIThinking = false;
let promotionPending = null;

// 초기 보드 설정
function initBoard() {
    board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    currentPlayer = 'white';
    gameOver = false;
    moveHistory = [];
    capturedPieces = { white: [], black: [] };
    lastMove = null;
    enPassantTarget = null;
    kingMoved = { white: false, black: false };
    rookMoved = { white: { left: false, right: false }, black: { left: false, right: false } };
    isAIThinking = false;
    selectedSquare = null;
    promotionPending = null;
    renderBoard();
    updateStatus();
    updateCapturedPieces();
}

// 보드 렌더링
function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.className += (row + col) % 2 === 0 ? ' light' : ' dark';
            square.dataset.row = row;
            square.dataset.col = col;

            if (lastMove && 
                ((lastMove.from.row === row && lastMove.from.col === col) ||
                 (lastMove.to.row === row && lastMove.to.col === col))) {
                square.classList.add('last-move');
            }

            const piece = board[row][col];
            if (piece) {
                square.textContent = pieces[piece];
                square.style.color = piece === piece.toUpperCase() ? '#fff' : '#000';
                square.style.textShadow = piece === piece.toUpperCase() ? 
                    '0 0 5px #000, 2px 2px 3px #000' : 
                    '0 0 5px #fff, 2px 2px 3px #888';
            }

            square.addEventListener('click', () => handleSquareClick(row, col));
            boardElement.appendChild(square);
        }
    }
}

// 칸 클릭 처리
function handleSquareClick(row, col) {
    if (gameOver) return;
    if (currentPlayer === 'black' || isAIThinking) return;

    const piece = board[row][col];

    if (selectedSquare) {
        const validMoves = getValidMoves(selectedSquare.row, selectedSquare.col);
        const moveValid = validMoves.some(m => m.row === row && m.col === col);

        if (moveValid) {
            makeMove(selectedSquare.row, selectedSquare.col, row, col);
            selectedSquare = null;
            renderBoard();

            if (!gameOver && currentPlayer === 'black') {
                setTimeout(() => {
                    aiMove();
                }, 500);
            }
        } else if (piece && isPlayerPiece(piece, currentPlayer)) {
            selectedSquare = { row, col };
            renderBoard();
            highlightValidMoves(row, col);
        } else {
            selectedSquare = null;
            renderBoard();
        }
    } else {
        if (piece && isPlayerPiece(piece, currentPlayer)) {
            selectedSquare = { row, col };
            renderBoard();
            highlightValidMoves(row, col);
        }
    }
}

// 유효한 이동 위치 강조
function highlightValidMoves(row, col) {
    const difficulty = parseInt(document.getElementById('difficulty').value);
    
    const selectedElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (selectedElement) {
        selectedElement.classList.add('selected');
    }

    if (difficulty === 1) {
        const validMoves = getValidMoves(row, col);
        validMoves.forEach(move => {
            const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (square) {
                square.classList.add('valid-move');
                if (board[move.row][move.col]) {
                    square.classList.add('capture');
                }
            }
        });
    }
}

// 플레이어의 말인지 확인
function isPlayerPiece(piece, player) {
    if (player === 'white') {
        return piece === piece.toUpperCase();
    } else {
        return piece === piece.toLowerCase();
    }
}

// 새 게임
function newGame() {
    if (confirm('새 게임을 시작하시겠습니까?')) {
        initBoard();
    }
}

// 게임 초기화
initBoard();
