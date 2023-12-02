const fs = require("fs");

function getItems(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function getSum(items) {
  const games = [];
  items.forEach((item) => {
    const matches = [
      ...item.matchAll(/Game (\d+)|(\d+) red|(\d+) green|(\d+) blue/g),
    ];
    const isPossible = matches.every((match) => {
      const redCubes = +match[2] || 0;
      const greenCubes = +match[3] || 0;
      const blueCubes = +match[4] || 0;
      return redCubes <= 12 && greenCubes <= 13 && blueCubes <= 14;
    });
    if (isPossible) {
      games.push(+matches[0][1]);
    }
  });
  return games.reduce((prev, curr) => prev + curr);
}

const items = getItems("d02-input.txt");
const sum = getSum(items);

console.log(sum);
