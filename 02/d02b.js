const fs = require("fs");

function getItems(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function getSum(items) {
  const games = [];
  items.forEach((item) => {
    const matches = [...item.matchAll(/(\d+) red|(\d+) green|(\d+) blue/g)];

    // He will hide a secret number of cubes of *each* color in the bag
    let redMax = 1;
    let greenMax = 1;
    let blueMax = 1;

    matches.forEach((match) => {
      const redCubes = +match[1] || 0;
      const greenCubes = +match[2] || 0;
      const blueCubes = +match[3] || 0;
      redMax = Math.max(redMax, redCubes);
      greenMax = Math.max(greenMax, greenCubes);
      blueMax = Math.max(blueMax, blueCubes);
    });
    games.push(redMax * greenMax * blueMax);
  });
  return games.reduce((prev, curr) => prev + curr);
}

const items = getItems("d02-input.txt");
const sum = getSum(items);

console.log(sum);
