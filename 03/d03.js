const fs = require("fs");

function readSchematic(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function checkForSymbol(
  partNumber,
  schematic,
  lineIndex,
  symbolIndex,
  gearMap
) {
  const line = schematic[lineIndex];

  const result =
    symbolIndex > 0 &&
    symbolIndex < line.length &&
    line[symbolIndex] !== "." &&
    Number.isNaN(+line[symbolIndex]);

  if (result) {
    if (line[symbolIndex] === "*") {
      const gearId = `${lineIndex}-${symbolIndex}`;
      if (gearMap.has(gearId)) {
        gearMap.get(gearId).push(partNumber);
      } else {
        gearMap.set(gearId, [partNumber]);
      }
    }
  }

  return result;
}

function checkForSymbolsRange(
  partNumber,
  schematic,
  lineIndex,
  start,
  end,
  gearMap
) {
  let result = false;
  let index = start - 1;
  while (index <= end + 1) {
    if (checkForSymbol(partNumber, schematic, lineIndex, index, gearMap)) {
      result = true;
    }
    index++;
  }
  return result;
}

function checkPartNumber(
  partNumber,
  schematic,
  lineIndex,
  start,
  end,
  gearMap
) {
  const symbolBeforeOrAfter =
    checkForSymbol(partNumber, schematic, lineIndex, start - 1, gearMap) ||
    checkForSymbol(partNumber, schematic, lineIndex, end + 1, gearMap);

  const symbolAbove =
    lineIndex - 1 >= 0 &&
    checkForSymbolsRange(
      partNumber,
      schematic,
      lineIndex - 1,
      start,
      end,
      gearMap
    );

  const symbolBelow =
    lineIndex + 1 < schematic.length &&
    checkForSymbolsRange(
      partNumber,
      schematic,
      lineIndex + 1,
      start,
      end,
      gearMap
    );

  // No early exit since, we need to scan for gears
  return symbolBeforeOrAfter || symbolAbove || symbolBelow;
}

function getSums(schematic) {
  const gearMap = new Map();
  let gearSum = 0;
  let partSum = 0;

  schematic.forEach((line, lineIndex) => {
    let ptrCurr = 0;
    let ptrStart = 0;
    let currentNumber = 0;
    while (ptrCurr < line.length + 1) {
      const digit = +line[ptrCurr];
      if (Number.isNaN(digit)) {
        if (currentNumber !== 0) {
          if (
            checkPartNumber(
              currentNumber,
              schematic,
              lineIndex,
              ptrStart,
              ptrCurr - 1,
              gearMap
            )
          ) {
            partSum = partSum + currentNumber;
          }
          currentNumber = 0;
        }
      } else {
        if (currentNumber === 0) {
          ptrStart = ptrCurr;
        }
        currentNumber = currentNumber * 10 + digit;
      }
      ptrCurr++;
    }
  });

  gearMap.forEach((gears) => {
    if (gears.length === 2) {
      gearSum = gearSum + gears[0] * gears[1];
    }
  });
  return { partSum, gearSum };
}

const schematic = readSchematic("d03-input.txt");
const { partSum, gearSum } = getSums(schematic);
console.log(partSum);
console.log(gearSum);
