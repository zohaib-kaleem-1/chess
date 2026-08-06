export function isLowerCase(text) {
  if (typeof text != "string") return false;

  return text === text.toLowerCase();
}

export function isUpperCase(text) {
  if (typeof text != "string") return false;

  return text === text.toUpperCase();
}

export function cellCodeToIndex(cellCode) {
  if (typeof cellCode != "string") return [];
  if (cellCode.length != 2) return [];

  return [
    8 - parseInt(cellCode[1]),
    cellCode[0].charCodeAt(0) - "a".charCodeAt(0),
  ];
}

export function indexToCellCode(index) {
  if (typeof index != typeof [(1, 2)]) return null;
  if (index.length != 2) return null;

  return (
    ["a", "b", "c", "d", "e", "f", "g", "h"].at(index[1]) +
    (8 - index[0]).toString()
  );
}

export function getSlidingMoves(boardArr, cellIndex, direction, piece) {
  let allowedMoves = [];

  for (let i in direction) {
    for (
      let row = cellIndex[0] + direction[i][0],
        col = cellIndex[1] + direction[i][1];
      row >= 0 && row < 8 && col >= 0 && col < 8;
      row += direction[i][0], col += direction[i][1]
    ) {
      if (boardArr[row][col] == "") allowedMoves.push([row, col]);
      else {
        if (isEnemy(piece, boardArr[row][col])) {
          allowedMoves.push([row, col]);
        }
        break;
      }
    }
  }

  return allowedMoves;
}

export function isEnemy(piece, target) {
  if (!piece || !target) return false;

  return (
    (isLowerCase(piece) && isUpperCase(target)) ||
    (isUpperCase(piece) && isLowerCase(target))
  );
}

//returns true that cell is a move
/**
 * This check if gives cell is a move by checking if cell has any element having move class that is use to show move
 * @param {string} cellCode cell address in format a1
 */
export function isMove(cellCode) {
  return (
    document.querySelectorAll(`#${cellCode} .under-attack-piece`).length == 1 ||
    document.querySelectorAll(`#${cellCode} .under-attack-dot`).length == 1
  );
}

export function log(...item) {
  item.forEach((i) => {
    console.log(i);
  });
}
