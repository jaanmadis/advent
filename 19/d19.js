const fs = require("fs");

function readInput(fileName) {
  const lines = fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
  let partsSection = false;
  lines.forEach((line) => {
    if (line === "") {
      partsSection = true;
      return;
    }
    if (partsSection) {
      addPart(line);
    } else {
      addWorkflow(line);
    }
  });
}

/**
 * Keep parts as objects in an array.
 * Keep workflows as an array or steps in a map.
 * Each step in a workflow is an object with category, operation, value, and name of the next workflow.
 */
const parts = [];
const workflows = {};

function addPart(line) {
  const part = {};
  const splits = line.split(",");
  part.x = +splits[0].substring(3);
  part.m = +splits[1].substring(2);
  part.a = +splits[2].substring(2);
  part.s = +splits[3].substring(2, splits[3].length - 1);
  parts.push(part);
}

function addWorkflow(line) {
  const nameAndSteps = line.match(/(.*){(.*)}/);
  const name = nameAndSteps[1];
  const allSteps = nameAndSteps[2].split(",");
  const steps = [];
  allSteps.forEach((oneStep) => {
    if (oneStep[1] === "<" || oneStep[1] === ">") {
      const stepDetails = oneStep.match(/(.)(<|>)(\d*)(:)(.*)/);
      steps.push({
        category: stepDetails[1],
        op: stepDetails[2],
        value: +stepDetails[3],
        next: stepDetails[5],
      });
    } else {
      steps.push({ next: oneStep });
    }
  });
  workflows[name] = steps;
}

/**
 * Process part starting with "in" workflow.
 * Go though steps and find the next workflow until A or R is found.
 * Return true if A was reached, else false.
 */
function process1(part) {
  let workflowName = "in";
  while (workflowName !== "A" && workflowName !== "R") {
    let workflow = workflows[workflowName];
    workflow.some((step) => {
      const category = step["category"];
      const op = step["op"];
      const value = step["value"];
      const next = step["next"];
      if (step["category"] === undefined) {
        workflowName = next;
        return true;
      } else {
        if (
          (op === ">" && part[category] > value) ||
          (op === "<" && part[category] < value)
        ) {
          workflowName = next;
          return true;
        }
      }
    });
  }
  return workflowName === "A";
}

/**
 * Recursively go though every step of given workflow, split the given range based on operations.
 */
function process2(workflowName, ranges) {
  if (workflowName === "A") {
    const x = ranges.x.max - ranges.x.min + 1;
    const m = ranges.m.max - ranges.m.min + 1;
    const a = ranges.a.max - ranges.a.min + 1;
    const s = ranges.s.max - ranges.s.min + 1;
    return x * m * a * s;
  }

  if (workflowName === "R") {
    return 0;
  }

  const currentRanges = {
    x: { min: ranges.x.min, max: ranges.x.max },
    m: { min: ranges.m.min, max: ranges.m.max },
    a: { min: ranges.a.min, max: ranges.a.max },
    s: { min: ranges.s.min, max: ranges.s.max },
  };

  let result = 0;
  let workflow = workflows[workflowName];
  workflow.forEach((step) => {
    const category = step["category"];
    const op = step["op"];
    const value = step["value"];
    const next = step["next"];
    if (step["category"] === undefined) {
      result += process2(next, currentRanges);
    } else {
      const newRanges = {
        x: { min: currentRanges.x.min, max: currentRanges.x.max },
        m: { min: currentRanges.m.min, max: currentRanges.m.max },
        a: { min: currentRanges.a.min, max: currentRanges.a.max },
        s: { min: currentRanges.s.min, max: currentRanges.s.max },
      };

      if (op === ">") {
        newRanges[category].min = value + 1;
        currentRanges[category].max = value;
      } else if (op === "<") {
        newRanges[category].max = value - 1;
        currentRanges[category].min = value;
      }

      result += process2(next, newRanges);
    }
  });
  return result;
}

/**
 * Process each part and sum the result.
 */
function puzzle1() {
  let result = 0;
  parts.forEach((part) => {
    if (process1(part)) {
      result += part.x + part.m + part.a + part.s;
    }
  });
  console.log("Puzzle 1", result);
}

/**
 * Start with ranges 1 to 4000 in each category.
 */
function puzzle2() {
  const ranges = {
    x: { min: 1, max: 4000 },
    m: { min: 1, max: 4000 },
    a: { min: 1, max: 4000 },
    s: { min: 1, max: 4000 },
  };
  const result = process2("in", ranges);
  console.log("Puzzle 2", result);
}

// readInput("d19-input-smol.txt");
readInput("d19-input.txt");
puzzle1(); // 19114, 397643
puzzle2(); // 167409079868000, 132392981697081
