// 유효한 이동 가져오기
function getValidMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];

    let moves = [];
    const pieceType = piece.toLowerCase();

    switch (pieceType) {
        case 'p': moves = getPawnMoves(row, col); break;
        case 'n': moves = getKnightMoves(row, col); break;
        case 'b': moves = getBishopMoves(row, col); break;
        case 'r': moves = getRookMoves(row, col); break;
        case 'q': moves = getQueenMoves(row, col); break;
        case 'k': moves = getKingMoves(row, col); break;
    }

    return moves.filter(move => !wouldBeInCheck(row, col, move.row, move.col));
}

// 폰 이동
function getPawnMoves(row, col) {
    const moves = [];
    const piece = board[row][col];
    const isWhite = piece === piece.toUpperCase();
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    const oneStepRow = row + direction;
    if (isValidSquare(oneStepRow, col) && !board[oneStepRow][col]) {
        moves.push({ row: oneStepRow, col });
        
        const twoStepRow = row + 2 * direction;
        if (row === startRow && !board[twoStepRow][col]) {
            moves.push({ row: twoStepRow, col });
        }
    }

    for (let dcol of [-1, 1]) {
        const newRow = row + direction;
        const newCol = col + dcol;
        if (isValidSquare(newRow, newCol)) {
            const target = board[newRow][newCol];
            if (target && isPlayerPiece(target, isWhite ? 'black' : 'white')) {
                moves.push({ row: newRow, col: newCol });
            }
            
            if (enPassantTarget && enPassantTarget.row === newRow && enPassantTarget.col === newCol) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }

    return moves;
}

// 나이트 이동
function getKnightMoves(row, col) {
    const moves = [];
    const piece = board[row][col];
    const player = piece === piece.toUpperCase() ? 'white' : 'black';
    const directions = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
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

// 비숍 이동
function getBishopMoves(row, col) {
    return getSlidingMoves(row, col, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
}

// 룩 이동
function getRookMoves(row, col) {
    return getSlidingMoves(row, col, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
}

// 퀸 이동
function getQueenMoves(row, col) {
    return getSlidingMoves(row, col, [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ]);
}

// 슬라이딩 말 이동
function getSlidingMoves(row, col, directions) {
    const moves = [];
    const piece = board[row][col];
    const player = piece === piece.toUpperCase() ? 'white' : 'black';

    for (let [drow, dcol] of directions) {
        let newRow = row + drow;
        let newCol = col + dcol;

        while (isValidSquare(newRow, newCol)) {
            const target = board[newRow][newCol];
            if (!target) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (!isPlayerPiece(target, player)) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
            newRow += drow;
            newCol += dcol;
        }
    }

    return moves;
}

// 킹 이동
function getKingMoves(row, col) {
    const moves = [];
    const piece = board[row][col];
    const player = piece === piece.toUpperCase() ? 'white' : 'black';
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

    if (!kingMoved[player] && !isInCheck(player)) {
        if (!rookMoved[player].right && 
            !board[row][col + 1] && !board[row][col + 2] &&
            !wouldBeInCheck(row, col, row, col + 1)) {
            moves.push({ row, col: col + 2 });
        }
        
        if (!rookMoved[player].left && 
            !board[row][col - 1] && !board[row][col - 2] && !board[row][col - 3] &&
            !wouldBeInCheck(row, col, row, col - 1)) {
            moves.push({ row, col: col - 2 });
        }
    }

    return moves;
}

// 유효한 칸인지 확인
function isValidSquare(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}
