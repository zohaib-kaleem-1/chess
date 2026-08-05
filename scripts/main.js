import * as GameEngine from "./GameEngine.js";

function init() {
  let game = new GameEngine.GameEngine("board");
  game.resetGame();
  game.init();
}

init();
