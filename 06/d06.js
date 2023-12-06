const fs = require("fs");

function readDocument(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function getRaces(document) {
  const times = document[0].match(/\d+/g);
  const distances = document[1].match(/\d+/g);
  const races = [];
  for (let index = 0; index < times.length; index++) {
    races.push({ time: +times[index], distance: +distances[index] });
  }
  return races;
}

function getRaceBadKerning(document) {
  const time = document[0].replace(/ /g, "").match(/\d+/g);
  const distance = document[1].replace(/ /g, "").match(/\d+/g);
  return { time: +time, distance: +distance };
}

/**
 * All strategies arranged in a table:
 *
 * Hold (Speed) Time Remainig   Distance
 * 0	        7		        0
 * 1	        6		        6
 * 2	        5		        10 -- viable
 * 3	        4		        12 -- viable
 * 4	        3		        12 -- viable
 * 5	        2		        10 -- viable
 * 6	        1		        6
 * 7	        0		        0
 *
 * Viable strategies are in the middle of the list and the list is symmetrical.
 * This solution will cut the list in half and use binary search to find the index of the first viable strategy.
 * First viable is a strategy where distance beats the record and where prior strategy's distance fails to beat the record.
 *
 * Number of viable strateges is then from first viable to the end of the (half) list, multiplied by 2 (the other half).
 * If time is an odd number, then list has two records in the middle.
 * If time is an even number, then list has exactly one record in the middle, a duplicate needs to be snipped when putting the result back together.
 *
 * There is no data structure to operate on, values are calculated on the fly.
 *
 * Alternatively we can just use math:
 *
 * s = t * v
 * distance = timeLeft * speed
 *
 * timeLeft  ->   time - holdTime
 * speed     ->   holdTime
 * distance  ->   record
 *
 * record = (time - holdTime) * holdTime
 * record = time*holdTime - holdTime^2
 *
 * -holdTime^2 + time*holdTime -record = 0
 * ax^2 + bx + c = 0
 *
 */
function puzzle(time, record) {
  const lastGoodIndex = Math.floor(time / 2);
  let start = 0;
  let end = lastGoodIndex;
  let index;

  while (true) {
    index = Math.floor((start + end) / 2);
    currValue = (time - index) * index;
    prevValue = (time - (index - 1)) * (index - 1);

    if (currValue > record && prevValue <= record) {
      console.log("first good ->", index);
      console.log("last good ->", lastGoodIndex);
      let viable = (lastGoodIndex - index + 1) * 2;

      // Snip the duplicate
      if (time % 2 === 0) {
        viable--;
      }
      return viable;
    } else if (record < currValue) {
      if (end === index) {
        throw "Bad search";
      }
      end = index;
    } else if (currValue < record) {
      if (start === index) {
        throw "Bad search";
      }
      start = index;
    }
  }
}

const document = readDocument("d06-input.txt");

const races = getRaces(document);
const raceBadKerning = getRaceBadKerning(document);

const result1 = races.reduce((prevValue, currValue) => {
  const viable = puzzle(currValue.time, currValue.distance);
  console.log("viable", viable);
  return prevValue * viable;
}, 1);
console.log("result1", result1); // 840336 // 288

const result2 = puzzle(raceBadKerning.time, raceBadKerning.distance);
console.log("result2", result2); // 41382569 // 71503
