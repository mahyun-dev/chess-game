// 이동 실행
function makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const captured = board[toRow][toCol];
    const player = piece === piece.toUpperCase() ? 'white' : 'black';

    let enPassantCapture = null;
    if (piece.toLowerCase() === 'p' && enPassantTarget && 
        toRow === enPassantTarget.row && toCol === enPassantTarget.col) {
        const capturedPawnRow = player === 'white' ? toRow + 1 : toRow - 1;
        enPassantCapture = { row: capturedPawnRow, col: toCol, piece: board[capturedPawnRow][toCol] };
    }

    let castlingMove = null;
    if (piece.toLowerCase() === 'k' && Math.abs(toCol - fromCol) === 2) {
        castlingMove = {
            rookFromCol: toCol > fromCol ? 7 : 0,
            rookToCol: toCol > fromCol ? toCol - 1 : toCol + 1
        };
    }

    moveHistory.push({
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        piece,
        captured,
        enPassantTarget: enPassantTarget,
        enPassantCapture: enPassantCapture,
        castlingMove: castlingMove,
        kingMoved: { ...kingMoved },
        rookMoved: { white: { ...rookMoved.white }, black: { ...rookMoved.black } }
    });

    if (captured) {
        const capturedPlayer = captured === captured.toUpperCase() ? 'white' : 'black';
        const opponent = capturedPlayer === 'white' ? 'black' : 'white';
        capturedPieces[opponent].push(captured);
    }

    if (enPassantCapture) {
        capturedPieces[player].push(enPassantCapture.piece);
        board[enPassantCapture.row][enPassantCapture.col] = null;
    }

    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;

    if (piece.toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
        if (player === 'white') {
            promotionPending = { row: toRow, col: toCol, player: player };
            showPromotionModal(player);
            return;
        } else {
            board[toRow][toCol] = 'q';
        }
    }

    if (castlingMove) {
        const row = toRow;
        board[row][castlingMove.rookToCol] = board[row][castlingMove.rookFromCol];
        board[row][castlingMove.rookFromCol] = null;
    }

    if (piece.toLowerCase() === 'k') {
        kingMoved[player] = true;
    }
    if (piece.toLowerCase() === 'r') {
        if (fromCol === 0) rookMoved[player].left = true;
        if (fromCol === 7) rookMoved[player].right = true;
    }

    enPassantTarget = null;
    if (piece.toLowerCase() === 'p' && Math.abs(toRow - fromRow) === 2) {
        enPassantTarget = { row: (fromRow + toRow) / 2, col: toCol };
    }

    lastMove = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };

    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';

    updateStatus();
    updateCapturedPieces();
}

// 폰 프로모션 모달 표시
function showPromotionModal(player) {
    const modal = document.getElementById('promotionModal');
    const piecesContainer = document.getElementById('promotionPieces');
    piecesContainer.innerHTML = '';

    const promotionOptions = player === 'white' 
        ? ['Q', 'R', 'B', 'N'] 
        : ['q', 'r', 'b', 'n'];
    
    const names = ['퀸', '룩', '비숍', '나이트'];

    promotionOptions.forEach((pieceCode, index) => {
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'promotion-piece';
        pieceDiv.textContent = pieces[pieceCode];
        pieceDiv.title = names[index];
        pieceDiv.onclick = () => selectPromotion(pieceCode);
        piecesContainer.appendChild(pieceDiv);
    });

    modal.classList.add('show');
}

// 프로모션 선택
function selectPromotion(pieceCode) {
    if (!promotionPending) return;

    board[promotionPending.row][promotionPending.col] = pieceCode;
    
    document.getElementById('promotionModal').classList.remove('show');
    
    const player = promotionPending.player;
    promotionPending = null;

    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    
    renderBoard();
    updateStatus();
    updateCapturedPieces();

    if (!gameOver && currentPlayer === 'black') {
        setTimeout(() => {
            aiMove();
        }, 500);
    }
}

// 무르기
function undoMove() {
    if (moveHistory.length < 2 || isAIThinking) return;

    for (let i = 0; i < 2; i++) {
        if (moveHistory.length === 0) break;

        const move = moveHistory.pop();
        
        board[move.from.row][move.from.col] = move.piece;
        board[move.to.row][move.to.col] = move.captured;

        if (move.captured) {
            const capturedPlayer = move.captured === move.captured.toUpperCase() ? 'white' : 'black';
            const opponent = capturedPlayer === 'white' ? 'black' : 'white';
            capturedPieces[opponent].pop();
        }

        if (move.enPassantCapture) {
            board[move.enPassantCapture.row][move.enPassantCapture.col] = move.enPassantCapture.piece;
            const player = move.piece === move.piece.toUpperCase() ? 'white' : 'black';
            capturedPieces[player].pop();
        }

        if (move.castlingMove) {
            const row = move.to.row;
            board[row][move.castlingMove.rookFromCol] = board[row][move.castlingMove.rookToCol];
            board[row][move.castlingMove.rookToCol] = null;
        }

        if (move.piece.toLowerCase() === 'p' && (move.to.row === 0 || move.to.row === 7)) {
            board[move.from.row][move.from.col] = move.piece;
        }

        enPassantTarget = move.enPassantTarget;
        kingMoved = move.kingMoved;
        rookMoved = move.rookMoved;
    }

    currentPlayer = 'white';
    selectedSquare = null;
    gameOver = false;
    lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;

    renderBoard();
    updateStatus();
    updateCapturedPieces();
}

// 잡힌 말 업데이트
function updateCapturedPieces() {
    document.getElementById('whiteCaptured').textContent = 
        capturedPieces.white.map(p => pieces[p]).join(' ');
    document.getElementById('blackCaptured').textContent = 
        capturedPieces.black.map(p => pieces[p]).join(' ');
}
