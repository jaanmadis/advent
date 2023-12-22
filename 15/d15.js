const fs = require("fs");

function readInput(fileName) {
  return fs.readFileSync(fileName, { encoding: "utf8", flag: "r" }).split(",");
}

function getHash(input) {
  let result = 0;
  for (let i = 0; i < input.length; i++) {
    result = ((result + input.charCodeAt(i)) * 17) % 256;
  }
  return result;
}

function puzzle1(input) {
  let result = 0;
  input.forEach((item) => (result += getHash(item)));
  console.log("Result1: ", result);
}

function addLens(boxes, label, focal) {
  const box = boxes[getHash(label)];
  const idxLens = box.findIndex((lens) => lens.label === label);
  /**
   * If lens with this label is found in this box.
   * Then change focal of the existing lens.
   * Else push the lens to the end of box's array.
   */
  if (idxLens >= 0) {
    box[idxLens].focal = focal;
  } else {
    box.push({ label, focal });
  }
}

function removeLens(boxes, label) {
  const box = boxes[getHash(label)];
  const idxLens = box.findIndex((lens) => lens.label === label);
  /**
   * If lens with this label is found in this box.
   * Then remove it and shift other lenses to remove the gap.
   */
  if (idxLens >= 0) {
    box.splice(idxLens, 1);
  }
}

function puzzle2(input) {
  let result = 0;
  const boxes = new Array(256).fill("").map(() => []);

  input.forEach((item) => {
    const addIdx = item.indexOf("=");
    if (addIdx >= 0) {
      addLens(boxes, item.slice(0, addIdx), item.slice(addIdx + 1));
    } else {
      removeLens(boxes, item.slice(0, item.indexOf("-")));
    }
  });

  boxes.forEach((box, idxBox) => {
    if (box.length > 0) {
      box.forEach((lens, idxLens) => {
        result += (idxBox + 1) * (idxLens + 1) * lens.focal;
      });
    }
  });

  console.log("Result2: ", result);
}

// const input = readInput("d15-input-smol.txt");
const input = readInput("d15-input.txt");
puzzle1(input); // 517315
puzzle2(input); // 247763
