// GameEngine.js
import { setUpTimer, showBoard, showBoardPieces } from "./ChessBoard.js";
import { Game } from "./ChessGame.js";
import {
  selectCell,
  showLastMove,
  showMoves,
  hideMoves,
  showCheck,
} from "./ChessUI.js";
import { cellCodeToIndex, indexToCellCode, isMove, log } from "./Helper.js";
import { DrawValidator } from "./DrawValidator.js";
import { SoundManager } from "./SoundManager.js";

export class GameEngine {
  constructor(boardElementId) {
    this.boardElementId = boardElementId;
    this.game = new Game();
    this.gameStatus = "continue";
    this.isGameOver = false;
    this.moveHistory = [];
    this.moveHistoryData = [];
    this.moveCount = 1;
    this.drawValidator = new DrawValidator(this.game);
    this.promotionCallback = null;
    this.timerInterval = null;
    this.whiteTime = 600;
    this.blackTime = 600;
    this.initialWhiteTime = 600;
    this.initialBlackTime = 600;
    this.whiteName = "White";
    this.blackName = "Black";
    this.initialized = false;
    this.positionHistory = [];
    this.isPaused = false;
    this.warningShown = {
      white: false,
      black: false,
    };
    this.soundManager = new SoundManager();
  }

  resetGame() {
    this.game.resetPosition();
    this.isGameOver = false;
    this.moveHistory = [];
    this.moveHistoryData = [];
    this.positionHistory = [];
    this.moveCount = 1;
    this.stopTimer();
    this.warningShown = { white: false, black: false };

    if (this.initialized) {
      this.hideNotification();
      this.updateMoveHistory();
      this.updateTimerDisplay();
      const panel = document.getElementById("move-history-panel");
      if (panel) {
        panel.innerHTML = "<h3>Move History</h3>";
      }
      showBoardPieces(this.game.gameBoardArr);
      this.updatePlayerNames();
    }
  }

  setCustomPosition(arr, playerTurn) {
    this.game.setCustomGamePosition(arr, playerTurn);
    this.game.playerTurn = playerTurn;
    this.storePosition();
  }

  storePosition() {
    const pos = this.getPositionString();
    this.positionHistory.push(pos);
  }

  getPositionString() {
    const board = this.game.gameBoardArr;
    let pos = "";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        pos += board[row][col] || ".";
      }
    }
    pos += this.game.whiteShortCastle ? "K" : "";
    pos += this.game.whiteLongCastle ? "Q" : "";
    pos += this.game.blackShortCastle ? "k" : "";
    pos += this.game.blackLongCastle ? "q" : "";
    pos += this.game.enPassantCol >= 0 ? this.game.enPassantCol : "";
    pos += this.game.playerTurn ? "w" : "b";
    return pos;
  }

  init() {
    this.soundManager.init();
    this.showNewGameDialog();
  }

  startGame(player1Name, player2Name, timeLimit) {
    this.whiteName = player1Name || "White";
    this.blackName = player2Name || "Black";
    this.whiteTime = timeLimit;
    this.blackTime = timeLimit;
    this.initialWhiteTime = timeLimit;
    this.initialBlackTime = timeLimit;
    this.warningShown = { white: false, black: false };

    this.game.resetPosition();
    this.isGameOver = false;
    this.moveHistory = [];
    this.moveHistoryData = [];
    this.positionHistory = [];
    this.moveCount = 1;
    this.game.playerTurn = true;

    showBoard(this.boardElementId);
    showBoardPieces(this.game.gameBoardArr);
    setUpTimer();

    this.createMoveHistoryPanel();
    this.createPromotionModal();
    this.createNotificationOverlay();
    this.createStatusBar();
    this.createControlButtons();

    this.initialized = true;

    this.storePosition();
    this.updateMoveHistory();
    this.updateTimerDisplay();
    this.updatePlayerNames();

    // Remove old event listeners by cloning and replacing
    const board = document.getElementById(this.boardElementId);
    if (board) {
      const newBoard = board.cloneNode(true);
      board.parentNode.replaceChild(newBoard, board);
    }

    // Re-add event listeners
    document.querySelectorAll(".cell").forEach((cellElement) => {
      cellElement.addEventListener("click", () => {
        if (this.isGameOver || this.isPaused) return;

        const cellId = cellElement.id;
        if (!cellId) return;

        if (isMove(cellId)) {
          this.executeMove(cellId);
        } else {
          selectCell(cellId, this.game);
        }
      });
    });

    this.startTimer();
    this.hideNewGameDialog();
  }

  createControlButtons() {
    if (document.getElementById("game-controls")) return;

    const controls = document.createElement("div");
    controls.id = "game-controls";
    controls.style.cssText = `
      display: flex;
      gap: 10px;
      margin-top: 15px;
      justify-content: center;
      width: 100%;
      flex-wrap: wrap;
    `;

    const newGameBtn = document.createElement("button");
    newGameBtn.textContent = "New Game";
    newGameBtn.style.cssText = `
      padding: 10px 25px;
      background: #7b61ff;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    newGameBtn.onmouseover = () => (newGameBtn.style.background = "#6a4feb");
    newGameBtn.onmouseout = () => (newGameBtn.style.background = "#7b61ff");
    newGameBtn.onclick = () => this.showNewGameDialog();

    const undoBtn = document.createElement("button");
    undoBtn.textContent = "Undo Move";
    undoBtn.style.cssText = `
      padding: 10px 25px;
      background: #555;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    undoBtn.onmouseover = () => (undoBtn.style.background = "#666");
    undoBtn.onmouseout = () => (undoBtn.style.background = "#555");
    undoBtn.onclick = () => this.undoMove();

    const pauseBtn = document.createElement("button");
    pauseBtn.textContent = "⏸ Pause";
    pauseBtn.id = "pause-btn";
    pauseBtn.style.cssText = `
      padding: 10px 25px;
      background: #444;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    pauseBtn.onmouseover = () => (pauseBtn.style.background = "#555");
    pauseBtn.onmouseout = () => (pauseBtn.style.background = "#444");
    pauseBtn.onclick = () => this.togglePause();

    controls.appendChild(newGameBtn);
    controls.appendChild(undoBtn);
    controls.appendChild(pauseBtn);

    const boardContainer = document.querySelector(".boardContainer");
    if (boardContainer) {
      boardContainer.appendChild(controls);
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const btn = document.getElementById("pause-btn");
    if (btn) {
      btn.textContent = this.isPaused ? "▶ Resume" : "⏸ Pause";
      btn.style.background = this.isPaused ? "#f44336" : "#444";
    }
    if (this.isPaused) {
      this.stopTimer();
      this.updateStatus("Game Paused", true);
    } else {
      this.startTimer();
      this.updateStatus("Game Resumed", true);
    }
  }

  undoMove() {
    if (this.moveHistoryData.length === 0 || this.isGameOver) return;

    const lastMoveData = this.moveHistoryData.pop();
    if (!lastMoveData) return;

    const {
      startRow,
      startCol,
      endRow,
      endCol,
      piece,
      capturedPiece,
      wasPromotion,
    } = lastMoveData;

    this.game.gameBoardArr[startRow][startCol] = piece;
    this.game.gameBoardArr[endRow][endCol] = capturedPiece || "";

    if (wasPromotion) {
      const isWhite = piece === piece.toUpperCase();
      this.game.gameBoardArr[endRow][endCol] = isWhite ? "P" : "p";
    }

    this.game.playerTurn = !this.game.playerTurn;
    this.game.halfMove = lastMoveData.halfMove || 0;
    this.game.fullMoveCount = lastMoveData.fullMoveCount || 0;
    this.game.enPassantCol = lastMoveData.enPassantCol || -2;
    this.game.whiteShortCastle =
      lastMoveData.whiteShortCastle !== undefined
        ? lastMoveData.whiteShortCastle
        : this.game.whiteShortCastle;
    this.game.whiteLongCastle =
      lastMoveData.whiteLongCastle !== undefined
        ? lastMoveData.whiteLongCastle
        : this.game.whiteLongCastle;
    this.game.blackShortCastle =
      lastMoveData.blackShortCastle !== undefined
        ? lastMoveData.blackShortCastle
        : this.game.blackShortCastle;
    this.game.blackLongCastle =
      lastMoveData.blackLongCastle !== undefined
        ? lastMoveData.blackLongCastle
        : this.game.blackLongCastle;

    this.moveHistory.pop();
    this.positionHistory.pop();
    this.moveCount = Math.max(1, this.moveCount - 1);

    showBoardPieces(this.game.gameBoardArr);
    this.updateMoveHistory();
    this.updateTimerDisplay();

    document.querySelectorAll("#last-move").forEach((el) => el.remove());
    document.querySelectorAll("#cell-check").forEach((el) => el.remove());

    this.isGameOver = false;
    this.game.isGameOver = false;
    this.hideNotification();

    this.updateStatus("Move undone", true);

    if (this.isPaused) {
      this.togglePause();
    }
  }

  animatePiece(fromCell, toCell, isCapture) {
    const fromElement = document.getElementById(fromCell);
    const toElement = document.getElementById(toCell);

    if (fromElement) {
      fromElement.classList.add("moving");
      setTimeout(() => fromElement.classList.remove("moving"), 300);
    }

    if (toElement) {
      if (isCapture) {
        toElement.classList.add("capturing");
        setTimeout(() => toElement.classList.remove("capturing"), 400);
      } else {
        toElement.classList.add("spawning");
        setTimeout(() => toElement.classList.remove("spawning"), 250);
      }
    }
  }

  playSound(isCapture, isCheck, isGameOver, isPromote, isCastle) {
    // Resume audio context on user interaction
    this.soundManager.resume();

    if (isGameOver) {
      this.soundManager.playSound("gameOver");
    } else if (isCheck) {
      this.soundManager.playSound("check");
    } else if (isCapture) {
      this.soundManager.playSound("capture");
    } else if (isPromote) {
      this.soundManager.playSound("promote");
    } else if (isCastle) {
      this.soundManager.playSound("castle");
    } else {
      this.soundManager.playSound("move");
    }
  }

  executeMove(cellId) {
    const [startRow, startCol] = cellCodeToIndex(this.game.selectedCell);
    const [endRow, endCol] = cellCodeToIndex(cellId);
    const piece = this.game.gameBoardArr[startRow][startCol];
    const capturedPiece = this.game.gameBoardArr[endRow][endCol];

    const gameState = {
      startRow,
      startCol,
      endRow,
      endCol,
      piece: piece,
      capturedPiece: capturedPiece,
      halfMove: this.game.halfMove,
      fullMoveCount: this.game.fullMoveCount,
      enPassantCol: this.game.enPassantCol,
      whiteShortCastle: this.game.whiteShortCastle,
      whiteLongCastle: this.game.whiteLongCastle,
      blackShortCastle: this.game.blackShortCastle,
      blackLongCastle: this.game.blackLongCastle,
      wasPromotion: false,
      promotionPiece: null,
    };

    if (piece.toLowerCase() === "p" && (endRow === 0 || endRow === 7)) {
      this.showPromotionModal((promotionPiece) => {
        gameState.wasPromotion = true;
        gameState.promotionPiece = promotionPiece;
        this.moveHistoryData.push(gameState);

        this.game.playMove(cellId);
        const isWhite = piece === piece.toUpperCase();
        const promotionChar = isWhite
          ? promotionPiece.toUpperCase()
          : promotionPiece.toLowerCase();
        this.game.gameBoardArr[endRow][endCol] = promotionChar;
        this.finishMove(capturedPiece !== "");
      });
      return;
    }

    this.moveHistoryData.push(gameState);
    this.game.playMove(cellId);
    this.finishMove(capturedPiece !== "");
  }

  finishMove(isCapture) {
    const lastMove = this.game.lastMove;
    if (lastMove && lastMove[0] && lastMove[1]) {
      this.animatePiece(lastMove[0], lastMove[1], isCapture);
    }

    showBoardPieces(this.game.gameBoardArr);
    showLastMove(this.game.lastMove);

    this.storePosition();
    this.addMoveToHistory();

    let isPromote = false;
    let isCastle = false;
    if (lastMove && lastMove[0] && lastMove[1]) {
      const [startRow, startCol] = cellCodeToIndex(lastMove[0]);
      const [endRow, endCol] = cellCodeToIndex(lastMove[1]);
      const piece = this.game.gameBoardArr[endRow][endCol];

      if (
        piece &&
        piece.toLowerCase() === "p" &&
        (endRow === 0 || endRow === 7)
      ) {
        isPromote = true;
      }

      if (
        piece &&
        piece.toLowerCase() === "k" &&
        Math.abs(startCol - endCol) === 2
      ) {
        isCastle = true;
      }
    }

    const kingPos = this.game.getKingCell();
    let inCheck = false;
    if (kingPos) {
      const currentColor = this.game.playerTurn ? "w" : "b";
      inCheck = this.game.inCheck(kingPos, currentColor);
    }

    this.game.playerTurn = !this.game.playerTurn;

    if (inCheck) {
      this.playSound(false, true, false, false, false);
    } else if (isPromote) {
      this.playSound(false, false, false, true, false);
    } else if (isCastle) {
      this.playSound(false, false, false, false, true);
    } else {
      this.playSound(isCapture, false, false, false, false);
    }

    this.checkGameState();
  }

  addMoveToHistory() {
    const lastMove = this.game.lastMove;
    if (!lastMove || !lastMove[0] || !lastMove[1]) return;

    const [startRow, startCol] = cellCodeToIndex(lastMove[0]);
    const [endRow, endCol] = cellCodeToIndex(lastMove[1]);
    const piece = this.game.gameBoardArr[endRow][endCol];

    let pieceSymbol = "";
    if (piece) {
      const p = piece.toUpperCase();
      if (p === "K") pieceSymbol = "K";
      else if (p === "Q") pieceSymbol = "Q";
      else if (p === "R") pieceSymbol = "R";
      else if (p === "B") pieceSymbol = "B";
      else if (p === "N") pieceSymbol = "N";
    }

    let moveStr = pieceSymbol;

    if (lastMove[2] !== "") {
      if (pieceSymbol) {
        moveStr += lastMove[0][0] + "x";
      } else {
        moveStr += lastMove[0][0] + "x";
      }
    }

    moveStr += lastMove[1];

    // FIX: The move was made by the player whose turn it was
    // If it was White's turn (playerTurn === true), this is a White move
    // If it was Black's turn (playerTurn === false), this is a Black move
    const wasWhiteMove = this.game.playerTurn;

    if (wasWhiteMove) {
      // WHITE MOVE - goes on the LEFT
      const lastEntry = this.moveHistory[this.moveHistory.length - 1];
      if (lastEntry && !lastEntry.white) {
        // Fill in the white move for the last entry
        lastEntry.white = moveStr;
        lastEntry.number = this.moveCount;
      } else {
        // Create a new entry with white move
        this.moveHistory.push({
          number: this.moveCount,
          white: moveStr,
          black: "",
        });
      }
    } else {
      // BLACK MOVE - goes on the RIGHT
      const lastEntry = this.moveHistory[this.moveHistory.length - 1];
      if (lastEntry && lastEntry.white && !lastEntry.black) {
        // Fill in the black move for the last entry
        lastEntry.black = moveStr;
        this.moveCount++;
      } else {
        // Create a new entry with black move
        this.moveHistory.push({
          number: this.moveCount,
          white: "",
          black: moveStr,
        });
      }
    }

    this.updateMoveHistory();
  }
  showNewGameDialog() {
    const existingDialog = document.getElementById("new-game-dialog");
    if (existingDialog) existingDialog.remove();

    const dialog = document.createElement("div");
    dialog.id = "new-game-dialog";
    dialog.innerHTML = `
      <div class="dialog-box">
        <h2>♚ New Game</h2>
        
        <div class="form-group">
          <label>White Player Name (Bottom)</label>
          <input id="white-name" type="text" placeholder="White" value="White">
        </div>
        
        <div class="form-group">
          <label>Black Player Name (Top)</label>
          <input id="black-name" type="text" placeholder="Black" value="Black">
        </div>
        
        <div class="form-group">
          <label>Time Limit</label>
          <select id="time-limit">
            <option value="60">1 minute</option>
            <option value="180">3 minutes</option>
            <option value="300">5 minutes</option>
            <option value="600" selected>10 minutes</option>
            <option value="900">15 minutes</option>
            <option value="1800">30 minutes</option>
            <option value="3600">60 minutes</option>
          </select>
        </div>
        
        <button class="start-btn" id="start-game-btn">Start Game</button>
      </div>
    `;

    document.body.appendChild(dialog);

    document.getElementById("start-game-btn").onclick = () => {
      const whiteName = document.getElementById("white-name").value || "White";
      const blackName = document.getElementById("black-name").value || "Black";
      const timeLimit = parseInt(document.getElementById("time-limit").value);
      this.startGame(whiteName, blackName, timeLimit);
    };

    document.querySelectorAll("#new-game-dialog input").forEach((input) => {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          document.getElementById("start-game-btn").click();
        }
      });
    });
  }

  hideNewGameDialog() {
    const dialog = document.getElementById("new-game-dialog");
    if (dialog) dialog.remove();
  }

  updatePlayerNames() {
    const nameElements = document.querySelectorAll(".user-name");
    if (nameElements.length >= 2) {
      nameElements[0].textContent = this.blackName;
      nameElements[1].textContent = this.whiteName;
    }
  }

  createMoveHistoryPanel() {
    let panel = document.getElementById("move-history-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "move-history-panel";
      panel.id = "move-history-panel";
      panel.innerHTML = "<h3>Move History</h3>";
      document.body.appendChild(panel);
    }
  }

  updateMoveHistory() {
    const panel = document.getElementById("move-history-panel");
    if (!panel) return;

    let html = "<h3>Move History</h3>";
    for (let i = 0; i < this.moveHistory.length; i++) {
      const move = this.moveHistory[i];
      if (move.white || move.black) {
        html += `<div class="move-row">
          <span class="move-number">${move.number}.</span>
          <span class="move-white">${move.white || ""}</span>
          <span class="move-black">${move.black || ""}</span>
        </div>`;
      }
    }
    panel.innerHTML = html;
    panel.scrollTop = panel.scrollHeight;
  }

  createPromotionModal() {
    if (document.getElementById("promotion-modal")) return;

    const modal = document.createElement("div");
    modal.className = "promotion-modal";
    modal.id = "promotion-modal";
    modal.innerHTML = `
      <div class="promotion-choices">
        <img src="images/pieces/white-queen.png" data-piece="q" alt="Queen">
        <img src="images/pieces/white-rook.png" data-piece="r" alt="Rook">
        <img src="images/pieces/white-bishop.png" data-piece="b" alt="Bishop">
        <img src="images/pieces/white-knight.png" data-piece="n" alt="Knight">
      </div>
    `;
    document.body.appendChild(modal);
  }

  showPromotionModal(callback) {
    const modal = document.getElementById("promotion-modal");
    if (!modal) return;

    const isWhite = this.game.playerTurn;
    const color = isWhite ? "white" : "black";
    const pieces = ["queen", "rook", "bishop", "knight"];
    const images = modal.querySelectorAll("img");

    images.forEach((img, index) => {
      img.src = `images/pieces/${color}-${pieces[index]}.png`;
    });

    modal.classList.add("active");

    images.forEach((img) => {
      img.replaceWith(img.cloneNode(true));
    });

    modal.querySelectorAll("img").forEach((img) => {
      img.addEventListener("click", () => {
        const piece = img.dataset.piece;
        modal.classList.remove("active");
        callback(piece);
      });
    });
  }

  createNotificationOverlay() {
    if (document.getElementById("notification-overlay")) return;

    const overlay = document.createElement("div");
    overlay.className = "notification-overlay";
    overlay.id = "notification-overlay";
    overlay.innerHTML = `
      <div class="notification-box">
        <h2 id="notification-title">Game Over</h2>
        <div class="result" id="notification-result"></div>
        <div class="sub-result" id="notification-sub"></div>
        <button class="new-game-btn" id="new-game-btn">New Game</button>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById("new-game-btn").addEventListener("click", () => {
      this.hideNotification();
      this.showNewGameDialog();
    });
  }

  showNotification(title, result, sub) {
    const overlay = document.getElementById("notification-overlay");
    if (!overlay) return;

    document.getElementById("notification-title").textContent = title;
    document.getElementById("notification-result").textContent = result;
    document.getElementById("notification-sub").textContent = sub || "";
    overlay.classList.add("active");
    this.playSound(false, false, true, false, false);
  }

  hideNotification() {
    const overlay = document.getElementById("notification-overlay");
    if (overlay) {
      overlay.classList.remove("active");
    }
  }

  createStatusBar() {
    if (document.getElementById("status-bar")) return;

    const bar = document.createElement("div");
    bar.className = "status-bar hidden";
    bar.id = "status-bar";
    document.body.appendChild(bar);
  }

  updateStatus(message, show = true) {
    const bar = document.getElementById("status-bar");
    if (!bar) return;

    bar.textContent = message;
    if (show) {
      bar.classList.remove("hidden");
      clearTimeout(this.statusTimeout);
      this.statusTimeout = setTimeout(() => {
        bar.classList.add("hidden");
      }, 3000);
    } else {
      bar.classList.add("hidden");
    }
  }

  checkGameState() {
    const kingPos = this.game.getKingCell();

    if (!kingPos) {
      this.isGameOver = true;
      this.game.isGameOver = true;
      this.game.gameResult = this.game.playerTurn ? "white" : "black";
      this.stopTimer();
      this.showNotification(
        "Game Over",
        `${this.game.playerTurn ? this.whiteName : this.blackName} wins!`,
        "King captured",
      );
      return;
    }

    const currentColor = this.game.playerTurn ? "w" : "b";
    const inCheck = this.game.inCheck(kingPos, currentColor);

    if (this.checkThreefoldRepetition()) {
      this.isGameOver = true;
      this.game.isGameOver = true;
      this.game.gameResult = "draw";
      this.stopTimer();
      this.showNotification("Draw", "Game drawn", "Threefold repetition");
      this.updateStatus("Threefold repetition - Draw");
      return;
    }

    const drawResult = this.drawValidator.checkDraw();
    if (drawResult.isDraw) {
      this.isGameOver = true;
      this.game.isGameOver = true;
      this.game.gameResult = "draw";
      this.stopTimer();
      this.showNotification("Draw", "Game drawn", drawResult.reason);
      this.updateStatus(drawResult.reason);
      return;
    }

    let hasLegalMoves = false;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.game.gameBoardArr[row][col];
        if (piece === "") continue;

        const isWhite = piece === piece.toUpperCase();
        if (
          (this.game.playerTurn && !isWhite) ||
          (!this.game.playerTurn && isWhite)
        ) {
          continue;
        }

        const cellCode = indexToCellCode([row, col]);
        const moves = this.game.getLegalMoves(cellCode);
        const legalMoves = moves.filter(([endRow, endCol]) => {
          return this.game.isMoveLegal(row, col, endRow, endCol);
        });

        if (legalMoves.length > 0) {
          hasLegalMoves = true;
          break;
        }
      }
      if (hasLegalMoves) break;
    }

    if (inCheck) {
      showCheck(kingPos);
      this.updateStatus("Check!", true);
    }

    if (!hasLegalMoves) {
      this.isGameOver = true;
      this.game.isGameOver = true;
      this.stopTimer();

      if (inCheck) {
        this.game.gameResult = this.game.playerTurn ? "black" : "white";
        const winner = this.game.playerTurn ? this.blackName : this.whiteName;
        this.showNotification("Checkmate!", `${winner} wins!`, "Game over");
        this.updateStatus(`Checkmate! ${winner} wins!`);
      } else {
        this.game.gameResult = "draw";
        this.showNotification(
          "Stalemate",
          "It's a draw!",
          "No legal moves available",
        );
        this.updateStatus("Stalemate - Draw");
      }
    }
  }

  checkThreefoldRepetition() {
    const currentPos = this.getPositionString();
    let count = 0;

    for (let i = 0; i < this.positionHistory.length; i++) {
      if (this.positionHistory[i] === currentPos) {
        count++;
      }
    }

    return count >= 3;
  }

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.isPaused) return;

      if (this.game.playerTurn) {
        this.whiteTime--;
        this.checkTimerWarning("white");
      } else {
        this.blackTime--;
        this.checkTimerWarning("black");
      }
      this.updateTimerDisplay();

      if (this.whiteTime <= 0 || this.blackTime <= 0) {
        this.stopTimer();
        this.isGameOver = true;
        this.game.isGameOver = true;
        const winner = this.whiteTime <= 0 ? this.blackName : this.whiteName;
        const loser = this.whiteTime <= 0 ? this.whiteName : this.blackName;
        this.showNotification(
          "Time Out!",
          `${winner} wins on time!`,
          `${loser} ran out of time`,
        );
        this.updateStatus(`${winner} wins on time!`);
      }
    }, 1000);
  }

  checkTimerWarning(color) {
    const time = color === "white" ? this.whiteTime : this.blackTime;
    const initialTime =
      color === "white" ? this.initialWhiteTime : this.initialBlackTime;
    const percentage = (time / initialTime) * 100;

    const timerId = color === "white" ? "white-timer" : "black-timer";
    const timerElement = document.getElementById(timerId);

    if (percentage <= 10 && !this.warningShown[color]) {
      this.warningShown[color] = true;
      const playerName = color === "white" ? this.whiteName : this.blackName;
      this.updateStatus(
        `⚠️ ${playerName} has only ${Math.round(percentage)}% time remaining!`,
        true,
      );

      if (timerElement) {
        timerElement.classList.add("danger");
        setTimeout(() => {
          this.warningShown[color] = false;
        }, 5000);
      }
    } else if (
      percentage <= 20 &&
      percentage > 10 &&
      !this.warningShown[color]
    ) {
      this.warningShown[color] = true;
      const playerName = color === "white" ? this.whiteName : this.blackName;
      this.updateStatus(
        `⏰ ${playerName} has ${Math.round(percentage)}% time remaining`,
        true,
      );

      if (timerElement) {
        timerElement.classList.add("warning");
        setTimeout(() => {
          this.warningShown[color] = false;
        }, 5000);
      }
    }
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    const whiteTimerElement = document.getElementById("white-timer");
    const blackTimerElement = document.getElementById("black-timer");

    if (whiteTimerElement) {
      const whiteMinutes = Math.floor(this.whiteTime / 60);
      const whiteSeconds = this.whiteTime % 60;
      const timeElement = whiteTimerElement.querySelector(".time");
      if (timeElement) {
        timeElement.textContent = `${String(whiteMinutes).padStart(2, "0")}:${String(whiteSeconds).padStart(2, "0")}`;
      }
    }

    if (blackTimerElement) {
      const blackMinutes = Math.floor(this.blackTime / 60);
      const blackSeconds = this.blackTime % 60;
      const timeElement = blackTimerElement.querySelector(".time");
      if (timeElement) {
        timeElement.textContent = `${String(blackMinutes).padStart(2, "0")}:${String(blackSeconds).padStart(2, "0")}`;
      }
    }
  }
}
