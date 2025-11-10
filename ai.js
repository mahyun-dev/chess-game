// AI 이동
function aiMove() {
    if (gameOver || currentPlayer !== 'black' || isAIThinking) return;

    isAIThinking = true;
    const boardElement = document.getElementById('board');
    boardElement.classList.add('thinking');

    const difficulty = parseInt(document.getElementById('difficulty').value);

    setTimeout(() => {
        let move;
        
        switch (difficulty) {
            case 1:
                move = getRandomMove();
                break;
            case 2:
                move = getBestMove(2);
                break;
            case 3:
                move = getBestMove(3);
                break;
            case 4:
                move = getBestMove(4);
                break;
        }

        if (move) {
            makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
            renderBoard();
        }

        boardElement.classList.remove('thinking');
        isAIThinking = false;
    }, 300);
}

// 랜덤 이동
function getRandomMove() {
    const allMoves = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && isPlayerPiece(piece, 'black')) {
                const moves = getValidMoves(row, col);
                moves.forEach(move => {
                    allMoves.push({ from: { row, col }, to: move });
                });
            }
        }
    }

    return allMoves[Math.floor(Math.random() * allMoves.length)];
}

// 최선의 이동 찾기 (미니맥스)
function getBestMove(depth, player = 'black') {
    let bestMove = null;
    let bestValue = player === 'black' ? -Infinity : Infinity;

    const allMoves = getAllMoves(player);

    for (let move of allMoves) {
        const isMaximizing = player === 'black';
        const value = minimax(move, depth - 1, !isMaximizing, -Infinity, Infinity);
        
        if (player === 'black') {
            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
        } else {
            if (value < bestValue) {
                bestValue = value;
                bestMove = move;
            }
        }
    }

    return bestMove;
}

// 미니맥스 알고리즘
function minimax(move, depth, isMaximizing, alpha, beta) {
    const piece = board[move.from.row][move.from.col];
    const captured = board[move.to.row][move.to.col];
    const oldEnPassant = enPassantTarget;
    
    board[move.to.row][move.to.col] = piece;
    board[move.from.row][move.from.col] = null;

    if (depth === 0) {
        const value = evaluateBoard();
        board[move.from.row][move.from.col] = piece;
        board[move.to.row][move.to.col] = captured;
        enPassantTarget = oldEnPassant;
        return value;
    }

    const player = isMaximizing ? 'black' : 'white';
    const moves = getAllMoves(player);

    if (moves.length === 0) {
        const value = isInCheck(player) ? (isMaximizing ? -10000 : 10000) : 0;
        board[move.from.row][move.from.col] = piece;
        board[move.to.row][move.to.col] = captured;
        enPassantTarget = oldEnPassant;
        return value;
    }

    if (isMaximizing) {
        let maxValue = -Infinity;
        for (let nextMove of moves) {
            const value = minimax(nextMove, depth - 1, false, alpha, beta);
            maxValue = Math.max(maxValue, value);
            alpha = Math.max(alpha, value);
            if (beta <= alpha) break;
        }
        board[move.from.row][move.from.col] = piece;
        board[move.to.row][move.to.col] = captured;
        enPassantTarget = oldEnPassant;
        return maxValue;
    } else {
        let minValue = Infinity;
        for (let nextMove of moves) {
            const value = minimax(nextMove, depth - 1, true, alpha, beta);
            minValue = Math.min(minValue, value);
            beta = Math.min(beta, value);
            if (beta <= alpha) break;
        }
        board[move.from.row][move.from.col] = piece;
        board[move.to.row][move.to.col] = captured;
        enPassantTarget = oldEnPassant;
        return minValue;
    }
}

// 모든 가능한 이동 가져오기
function getAllMoves(player) {
    const allMoves = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && isPlayerPiece(piece, player)) {
                const moves = getValidMoves(row, col);
                moves.forEach(move => {
                    allMoves.push({ from: { row, col }, to: move });
                });
            }
        }
    }

    return allMoves;
}

// 보드 평가
function evaluateBoard() {
    const pieceValues = {
        'p': 10, 'n': 30, 'b': 30, 'r': 50, 'q': 90, 'k': 900,
        'P': -10, 'N': -30, 'B': -30, 'R': -50, 'Q': -90, 'K': -900
    };

    let score = 0;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                score += pieceValues[piece];
                
                if (piece.toLowerCase() === 'p') {
                    const isWhite = piece === piece.toUpperCase();
                    const advancement = isWhite ? (6 - row) : row - 1;
                    score += isWhite ? -advancement : advancement;
                }
                
                if (row >= 2 && row <= 5 && col >= 2 && col <= 5) {
                    score += piece === piece.toUpperCase() ? -0.5 : 0.5;
                }
            }
        }
    }

    return score;
}

// 힌트
function getHint() {
    if (currentPlayer !== 'white' || gameOver) return;

    const move = getBestMove(3, 'white');
    
    if (move) {
        selectedSquare = null;
        renderBoard();
        
        const fromSquare = document.querySelector(`[data-row="${move.from.row}"][data-col="${move.from.col}"]`);
        const toSquare = document.querySelector(`[data-row="${move.to.row}"][data-col="${move.to.col}"]`);
        
        // 출발 위치 강조
        if (fromSquare) {
            fromSquare.classList.add('hint-from');
            fromSquare.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            fromSquare.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.8), inset 0 0 20px rgba(255,255,255,0.3)';
            fromSquare.style.transform = 'scale(1.05)';
            
            // 출발 위치에 텍스트 추가
            const fromLabel = document.createElement('div');
            fromLabel.className = 'hint-label hint-from-label';
            fromLabel.textContent = '출발';
            fromSquare.appendChild(fromLabel);
        }
        
        // 도착 위치 강조
        if (toSquare) {
            toSquare.classList.add('hint-to');
            toSquare.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            toSquare.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.8), inset 0 0 20px rgba(255,255,255,0.3)';
            toSquare.style.transform = 'scale(1.05)';
            
            // 도착 위치에 텍스트 추가
            const toLabel = document.createElement('div');
            toLabel.className = 'hint-label hint-to-label';
            toLabel.textContent = '도착';
            toSquare.appendChild(toLabel);
        }
        
        // 화살표 그리기
        drawArrow(move.from.row, move.from.col, move.to.row, move.to.col);

        // 5초 후 힌트 제거
        setTimeout(() => {
            renderBoard();
            removeArrow();
        }, 5000);
    }
}

// 화살표 그리기
function drawArrow(fromRow, fromCol, toRow, toCol) {
    // 기존 화살표 제거
    removeArrow();
    
    const boardElement = document.getElementById('board');
    const boardRect = boardElement.getBoundingClientRect();
    const squareSize = 75; // CSS의 square 크기와 일치
    
    // 중심점 계산
    const fromX = (fromCol * squareSize) + (squareSize / 2);
    const fromY = (fromRow * squareSize) + (squareSize / 2);
    const toX = (toCol * squareSize) + (squareSize / 2);
    const toY = (toRow * squareSize) + (squareSize / 2);
    
    // SVG 생성
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'hintArrow';
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '5';
    
    // 화살표 경로
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // 화살표 머리 크기
    const arrowSize = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    // 화살표 끝점을 약간 짧게 (말과 겹치지 않도록)
    const endX = toX - Math.cos(angle) * 30;
    const endY = toY - Math.sin(angle) * 30;
    
    // 화살표 머리 좌표
    const arrowHead1X = endX - arrowSize * Math.cos(angle - Math.PI / 6);
    const arrowHead1Y = endY - arrowSize * Math.sin(angle - Math.PI / 6);
    const arrowHead2X = endX - arrowSize * Math.cos(angle + Math.PI / 6);
    const arrowHead2Y = endY - arrowSize * Math.sin(angle + Math.PI / 6);
    
    // 화살표 시작점을 약간 길게
    const startX = fromX + Math.cos(angle) * 30;
    const startY = fromY + Math.sin(angle) * 30;
    
    const pathData = `
        M ${startX} ${startY}
        L ${endX} ${endY}
        M ${arrowHead1X} ${arrowHead1Y}
        L ${endX} ${endY}
        L ${arrowHead2X} ${arrowHead2Y}
    `;
    
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', '#fbbf24');
    path.setAttribute('stroke-width', '6');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('fill', 'none');
    path.setAttribute('filter', 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.8))');
    
    svg.appendChild(path);
    boardElement.style.position = 'relative';
    boardElement.appendChild(svg);
}

// 화살표 제거
function removeArrow() {
    const arrow = document.getElementById('hintArrow');
    if (arrow) {
        arrow.remove();
    }
}
