const fs = require("fs");

function readCards(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function puzzles(cards) {
  let puzzle1Sum = 0;
  const copies = new Array(cards.length).fill(1);
  cards.forEach((card, index) => {
    const matches = [...card.matchAll(/:(.*)\|(.*)/g)];
    const winners = matches[0][1].match(/\d+/g);
    const players = matches[0][2].match(/\d+/g);
    const winnerMap = new Map();
    winners.forEach((winner) => {
      winnerMap.set(winner);
    });

    let puzzle1Worth = 0;
    let puzzle2Hits = 0;
    players.forEach((player) => {
      if (winnerMap.has(player)) {
        puzzle1Worth = puzzle1Worth === 0 ? 1 : puzzle1Worth * 2;
        puzzle2Hits++;
      }
    });
    puzzle1Sum = puzzle1Sum + puzzle1Worth;
    while (puzzle2Hits > 0) {
      copies[index + puzzle2Hits] = copies[index + puzzle2Hits] + copies[index];
      puzzle2Hits--;
    }
  });
  return {
    result1: puzzle1Sum,
    result2: copies.reduce((prev, curr) => prev + curr),
  };
}

const cards = readCards("d04-input.txt");
const { result1, result2 } = puzzles(cards);
console.log(result1);
console.log(result2);
