import * as GameEngine from "./GameEngine.js";

function init() {
  let game = new GameEngine.GameEngine("board");
  let arr = [
    ["", "", "", "", "", "", "", "K"],
    ["", "", "P", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "k", "", "", ""],
    ["", "", "", "", "", "", "", ""],
  ];
  game.resetGame();
  game.setCustomPosition(arr, false);
  game.init();
}

init();
