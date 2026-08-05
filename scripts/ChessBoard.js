export function showBoard(id) {
  document.getElementById(id).innerHTML = `
        <div class="cell" id="a8"></div>
        <div class="cell" id="b8"></div>
        <div class="cell" id="c8"></div>
        <div class="cell" id="d8"></div>
        <div class="cell" id="e8"></div>
        <div class="cell" id="f8"></div>
        <div class="cell" id="g8"></div>
        <div class="cell" id="h8"></div>
        <div class="cell hidden"></div>
        <div class="cell" id="a7"></div>
        <div class="cell" id="b7"></div>
        <div class="cell" id="c7"></div>
        <div class="cell" id="d7"></div>
        <div class="cell" id="e7"></div>
        <div class="cell" id="f7"></div>
        <div class="cell" id="g7"></div>
        <div class="cell" id="h7"></div>
        <div class="cell hidden"></div>
        <div class="cell" id="a6"></div>
        <div class="cell" id="b6"></div>
        <div class="cell" id="c6"></div>
        <div class="cell" id="d6"></div>
        <div class="cell" id="e6"></div>
        <div class="cell" id="f6"></div>
        <div class="cell" id="g6"></div>
        <div class="cell" id="h6"></div>
        <div class="cell hidden"></div>
        <div class="cell" id="a5"></div>
        <div class="cell" id="b5"></div>
        <div class="cell" id="c5"></div>
        <div class="cell" id="d5"></div>
        <div class="cell" id="e5"></div>
        <div class="cell" id="f5"></div>
        <div class="cell" id="g5"></div>
        <div class="cell" id="h5"></div>
        <div class="cell hidden"></div>
        <div class="cell" id="a4"></div>
        <div class="cell" id="b4"></div>
        <div class="cell" id="c4"></div>
        <div class="cell" id="d4"></div>
        <div class="cell" id="e4"></div>
        <div class="cell" id="f4"></div>
        <div class="cell" id="g4"></div>
        <div class="cell" id="h4"></div>
        <div class="cell hidden"></div>
        <div class="cell" id="a3"></div>
        <div class="cell" id="b3"></div>
        <div class="cell" id="c3"></div>
        <div class="cell" id="d3"></div>
        <div class="cell" id="e3"></div>
        <div class="cell" id="f3"></div>
        <div class="cell" id="g3"></div>
        <div class="cell" id="h3"></div>
        <div class="cell hidden"></div>
        <div class="cell" id="a2"></div>
        <div class="cell" id="b2"></div>
        <div class="cell" id="c2"></div>
        <div class="cell" id="d2"></div>
        <div class="cell" id="e2"></div>
        <div class="cell" id="f2"></div>
        <div class="cell" id="g2"></div>
        <div class="cell" id="h2"></div>
        <div class="cell hidden"></div>
        <div class="cell" id="a1"></div>
        <div class="cell" id="b1"></div>
        <div class="cell" id="c1"></div>
        <div class="cell" id="d1"></div>
        <div class="cell" id="e1"></div>
        <div class="cell" id="f1"></div>
        <div class="cell" id="g1"></div>
        <div class="cell" id="h1"></div>
`;
}
export function showBoardPieces(arr) {
  let cellCodeArray = ["a", "b", "c", "d", "e", "f", "g", "h"];

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let cellCode = cellCodeArray[j] + (8 - i).toString();

      switch (arr[i][j]) {
        case "p":
          document.getElementById(cellCode).innerHTML =
            '<img src="images/pieces/black-pawn.png" alt="Black Pawn" />';
          break;
        case "P":
          document.getElementById(cellCode).innerHTML =
            '<img src="images/pieces/white-pawn.png" alt="White Pawn" />';
          break;
        case "r":
          document.getElementById(cellCode).innerHTML =
            '<img src="images/pieces/black-rook.png" alt="Black Rook" />';
          break;
        case "R":
          document.getElementById(cellCode).innerHTML =
            '<img src="images/pieces/white-rook.png" alt="White Rook" />';
          break;
        case "n":
          document.getElementById(cellCode).innerHTML =
            '<img src="images/pieces/black-knight.png" alt="Black Knight" />';
          break;
        case "N":
          document.getElementById(cellCode).innerHTML =
            '<img src="images/pieces/white-knight.png" alt="White Knight" />';
          break;
        case "b":
          document.getElementById(cellCode).innerHTML =
            '<img src="images/pieces/black-bishop.png" alt="Black Bishop" />';
          break;
        case "B":
          document.getElementById(cellCode).innerHTML =
            '<img src="images/pieces/white-bishop.png" alt="White Bishop" />';
          break;
        case "q":
          document.getElementById(cellCode).innerHTML =
            '<img src="images/pieces/black-queen.png" alt="Black Queen" />';
          break;
        case "Q":
          document.getElementById(cellCode).innerHTML =
            '<img src="images/pieces/white-queen.png" alt="White Queen" />';
          break;
        case "k":
          document.getElementById(cellCode).innerHTML =
            '<img src="images/pieces/black-king.png" alt="Black King" />';
          break;
        case "K":
          document.getElementById(cellCode).innerHTML =
            '<img src="images/pieces/white-king.png" alt="White King" />';
          break;
        default:
          document.getElementById(cellCode).innerHTML = "";
      }
    }
  }
}

export function setUpTimer() {
  let timerElements = document.querySelectorAll(".timer");

  timerElements[0].style.backgroundColor = "rgb(24, 24, 24)";
  timerElements[0].style.color = "white";

  timerElements[1].style.backgroundColor = "white";
  timerElements[1].style.color = "black";
}
