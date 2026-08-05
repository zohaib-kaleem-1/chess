import * as GameEngine from "./GameEngine.js";

function init() {
  let game = new GameEngine.GameEngine("board");
  //   game.resetGame();
  let arr = [
    ["", "K", "", "", "", "", "", ""],
    ["p", "p", "", "", "", "", "k", ""],
    ["", "", "P", "", "", "B", "", ""],
    ["", "p", "P", "N", "n", "", "", ""],
    ["", "p", "P", "", "Q", "", "", ""],
    ["", "", "r", "", "", "Q", "", ""],
    ["", "", "", "", "", "", "", "P"],
    ["", "", "", "", "", "", "q", ""],
  ];
  game.setCustomPosition(arr, false);
  game.showBoard();

  document.querySelectorAll(".cell").forEach((cellElement) =>
    cellElement.addEventListener("click", () => {
      let cellId = cellElement.id;
      let moves = game.getMoves(cellId);

      if (false) {
      } else {
        game.showMoves(moves);
      }
    }),
  );
}

init();
