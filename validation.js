// 이동하면 체크 상태가 되는지 확인
function wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const player = piece === piece.toUpperCase() ? 'white' : 'black';
    
    const originalPiece = board[toRow][toCol];
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;

    const inCheck = isInCheck(player);

    board[fromRow][fromCol] = piece;
    board[toRow][toCol] = originalPiece;

    return inCheck;
}

// 체크 상태인지 확인
function isInCheck(player) {
    const kingPos = findKing(player);
    if (!kingPos) return false;

    const opponent = player === 'white' ? 'black' : 'white';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && isPlayerPiece(piece, opponent)) {
                const moves = getRawMoves(row, col);
                if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
                    return true;
                }
            }
        }
    }

    return false;
}

// 원시 이동 (체크 검사 없이)
function getRawMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];

    const pieceType = piece.toLowerCase();
    const player = piece === piece.toUpperCase() ? 'white' : 'black';

    switch (pieceType) {
        case 'p': return getPawnMoves(row, col);
        case 'n': return getKnightMoves(row, col);
        case 'b': return getBishopMoves(row, col);
        case 'r': return getRookMoves(row, col);
        case 'q': return getQueenMoves(row, col);
        case 'k': 
            const moves = [];
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];
            for (let [drow, dcol] of directions) {
                const newRow = row + drow;
                const newCol = col + dcol;
                if (isValidSquare(newRow, newCol)) {
                    const target = board[newRow][newCol];
                    if (!target || !isPlayerPiece(target, player)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
            return moves;
    }

    return [];
}

// 킹 찾기
function findKing(player) {
    const kingSymbol = player === 'white' ? 'K' : 'k';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === kingSymbol) {
                return { row, col };
            }
        }
    }
    return null;
}

// 체크메이트 확인
function isCheckmate(player) {
    if (!isInCheck(player)) return false;
    return !hasLegalMoves(player);
}

// 스테일메이트 확인
function isStalemate(player) {
    if (isInCheck(player)) return false;
    return !hasLegalMoves(player);
}

// 합법적인 이동이 있는지 확인
function hasLegalMoves(player) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && isPlayerPiece(piece, player)) {
                const moves = getValidMoves(row, col);
                if (moves.length > 0) return true;
            }
        }
    }
    return false;
}

// 상태 업데이트
function updateStatus() {
    const turnElement = document.getElementById('turn');
    turnElement.textContent = currentPlayer === 'white' ? '백' : '흑';
    console.log('현재 턴:', currentPlayer);
    
    const statusElement = document.getElementById('status');
    
    if (isCheckmate(currentPlayer)) {
        const winner = currentPlayer === 'white' ? '흑' : '백';
        statusElement.textContent = `체크메이트! ${winner} 승리!`;
        statusElement.className = 'status checkmate';
        gameOver = true;
    } else if (isStalemate(currentPlayer)) {
        statusElement.textContent = '스테일메이트! 무승부!';
        statusElement.className = 'status';
        gameOver = true;
    } else if (isInCheck(currentPlayer)) {
        statusElement.textContent = '체크!';
        statusElement.className = 'status check';
    } else {
        statusElement.textContent = '게임 진행 중';
        statusElement.className = 'status';
    }
}
