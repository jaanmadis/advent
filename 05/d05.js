const fs = require("fs");

function readInstructions(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

const seeds = [];
const seedRanges = [];
const almanac = [];

function initInstructions(instructions) {
  instructions[0].match(/\d+/g).forEach((seed) => seeds.push(+seed));
  seeds.forEach((seed, index) => {
    if (index % 2 === 0) {
      seedRanges.push({ start: seed, range: seeds[index + 1] });
    }
  });
  var index = -1;
  instructions.forEach((instruction) => {
    if (instruction.includes("map:")) {
      index++;
      almanac[index] = [];
    } else if (instruction && almanac[index]) {
      almanac[index].push(instruction.match(/\d+/g).map((number) => +number));
    }
  });
  almanac.forEach((conversions) => {
    conversions.sort((itemA, itemB) => {
      return itemA[1] - itemB[1];
    });
  });
}

function puzzle1() {
  let smallestValue = Number.MAX_SAFE_INTEGER;
  seeds.forEach((seed) => {
    let value = seed;
    almanac.forEach((conversions) => {
      conversions.some((conversion) => {
        // Value is too small for conversion. This is a sorted list, return and take the next conversion.
        if (value < conversion[1]) {
          return true;
        }
        // Value fits in conversion
        if (conversion[1] + conversion[2] > value) {
          value = value + conversion[0] - conversion[1];
          return true;
        }
      });
    });
    if (value < smallestValue) {
      smallestValue = value;
    }
  });
  return smallestValue;
}

function puzzle2() {
  let currRanges = seedRanges.map((seedRange) => ({
    start: seedRange.start,
    range: seedRange.range,
  }));

  almanac.forEach((conversions) => {
    const nextRanges = [];
    while (currRanges.length > 0) {
      const currRange = currRanges.pop();
      conversions.some((conversion, index) => {
        // Some elements of currRange are before conversion
        if (currRange.start < conversion[1]) {
          nextRanges.push({
            start: currRange.start,
            range: conversion[1] - currRange.start,
          });
          // All elements of currRange are before conversion
          if (currRange.range < conversion[1]) {
            return true;
          }
          currRange.start = conversion[1];
          currRange.range = currRange.range - conversion[1] + 1;
        }

        // Some elements of currRange are in conversion
        if (currRange.start <= conversion[1] + conversion[2] - 1) {
          const snippedRange = conversion[1] + conversion[2] - currRange.start;
          nextRanges.push({
            start: currRange.start + conversion[0] - conversion[1],
            range: Math.min(snippedRange, currRange.range),
          });
          // All elements of currRange are in conversion
          if (currRange.range <= snippedRange) {
            return true;
          }
          currRange.start = conversion[1] + conversion[2];
          currRange.range = currRange.range - snippedRange;
        }

        // Leftovers that didn't fit into conversion
        if (index === conversions.length - 1) {
          nextRanges.push({
            start: currRange.start,
            range: currRange.range,
          });
        }
      });
    }
    currRanges = nextRanges;
  });

  let smallest = Number.MAX_SAFE_INTEGER;
  currRanges.forEach((currRange) => {
    if (currRange.start < smallest) {
      smallest = currRange.start;
    }
  });
  return smallest;
}

const instructions = readInstructions("d05-input.txt");
initInstructions(instructions);

const smallestValue1 = puzzle1();
const smallestValue2 = puzzle2();

console.log(smallestValue1);
console.log(smallestValue2);
