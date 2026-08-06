// main.js
import { GameEngine } from "./GameEngine.js";

function init() {
  // Wait for DOM to be fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const game = new GameEngine("board");
      game.init();
    });
  } else {
    const game = new GameEngine("board");
    game.init();
  }
}

init();
