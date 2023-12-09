const fs = require("fs");

function readInput(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function addEndValues(curr) {
  if (curr.every((value) => value === 0 || value === "")) {
    curr[0] = 0;
    curr[curr.length - 1] = 0;
    return;
  }
  const next = [""];
  curr.forEach((value, index) => {
    if (index <= 1 || index === curr.length - 1) {
      return;
    }
    next.push(value - curr[index - 1]);
  });
  next.push("");
  addEndValues(next);
  curr[curr.length - 1] = curr[curr.length - 2] + next[next.length - 1];
  curr[0] = curr[1] - next[0];
  return { first: curr[0], final: curr[curr.length - 1] };
}

function puzzle(input) {
  const histories = [];
  input.forEach((line) => {
    const history = line.split(" ").map((item) => +item);
    histories.push(["", ...history, ""]);
  });
  let sumFinal = 0;
  let sumFirst = 0;
  histories.forEach((history) => {
    const { first, final } = addEndValues(history);
    sumFinal = sumFinal + final;
    sumFirst = sumFirst + first;
  });
  console.log("Result1:", sumFinal); // 2105961943
  console.log("Result2:", sumFirst); // 1019
}

const input = readInput("d09-input.txt");
puzzle(input);
