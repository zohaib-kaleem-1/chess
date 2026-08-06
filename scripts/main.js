import * as GameEngine from "./GameEngine.js";

function init() {
  let game = new GameEngine.GameEngine("board");

  let arr = [
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["R", "", "", "", "K", "", "n", "R"],
  ];

  game.resetGame();
  game.setCustomPosition(arr, true);
  game.init();
}

init();
