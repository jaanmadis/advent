const fs = require("fs");

function readInput(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function gcd(a, b) {
  if (b === 0) return a;
  else return gcd(b, a % b);
}

// a x b = LCM(a, b) x GCD(a, b)
function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

function getNodes(input) {
  const nodes = new Map();
  const starts = [];
  input.forEach((line, index) => {
    if (index < 2) {
      return;
    }
    const nodeKey = line.substring(0, 3);
    nodes.set(nodeKey, [line.substring(7, 10), line.substring(12, 15)]);
    if (nodeKey[2] === "A") {
      starts.push(nodeKey);
    }
  });
  return { nodes, starts };
}

function travel(directions, nodes, startingNode) {
  let steps = 0;
  let index = 0;
  let node = startingNode;
  while (true) {
    steps++;
    let direction = +directions[index];
    if (node[direction][2] === "Z") {
      break;
    }
    node = nodes.get(node[direction]);
    index++;
    if (index === directions.length) {
      index = 0;
    }
  }
  return steps;
}

function puzzle(input) {
  const { nodes, starts } = getNodes(input);

  // Convert L and R to 0 and 1 so they can be used as indices
  const directions = input[0].replaceAll("L", "0").replaceAll("R", "1");

  // Puzzle 1 - travel from AAA to Z
  console.log(travel(directions, nodes, nodes.get("AAA")));

  // Puzzle 2 - get the number of travel steps for each starting point separately and then LCM them together
  const steps = [];
  starts.forEach((start) => {
    steps.push(travel(directions, nodes, nodes.get(start)));
  });
  console.log(steps.reduce((prev, curr) => lcm(prev, curr)));
}

const input = readInput("d08-input.txt");
puzzle(input);
