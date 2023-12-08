const fs = require("fs");

function readInput(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function cardToValue(card, withJokers) {
  const value = +card;
  if (Number.isNaN(value)) {
    switch (card) {
      case "T":
        return 10;
      case "J":
        return withJokers ? 1 : 11;
      case "Q":
        return 12;
      case "K":
        return 13;
      case "A":
        return 14;
    }
  } else {
    return value;
  }
}

function compareCards(cardA, cardB, withJokers) {
  for (let index = 0; index < cardA.length; index++) {
    const valueA = cardToValue(cardA[index], withJokers);
    const valueB = cardToValue(cardB[index], withJokers);
    if (valueA !== valueB) {
      return valueA - valueB;
    }
  }
}

/**
 * Maps hand to an object cards become keys and occurrences become values:
 *
 * eg: AT997 becomes:
 *
 * {
 *   '8': 1
 *   '9': 2
 *   A: 1
 *   T: 1
 * }
 */
function getHandMap(hand) {
  return [...hand].reduce((prev, curr) => {
    prev[curr] = prev[curr] + 1 || 1;
    return prev;
  }, {});
}

function getHandStrength(handMap) {
  const handMapValues = Object.values(handMap);
  switch (handMapValues.length) {
    case 5:
      return 1; // High card
    case 4:
      return 2; // One pair
    case 3:
      if (handMapValues.find((value) => value === 3)) {
        return 4; // Three of a kind
      } else {
        return 3; // Two pair
      }
    case 2:
      if (handMapValues.find((value) => value === 4)) {
        return 6; // Four of a kind
      } else {
        return 5; // Full house
      }
    case 1:
      return 7; // Five of a kind
  }
  return 0;
}

/**
 * For puzzle 2, finite combinations can be brute forced.
 *
 * High card (1) & Joker = One pair (2)
 * One pair (2) & Joker = Three of a kind (4)
 * Two pair (3) & Joker = Full house (5)
 * Three of a kind (4) & Joker = Four of a kind (6)
 * Full house (5) & Joker = Four of a kind (6)
 * Four of a kind (6) & Joker = Five of a kind (7)
 *
 * High card (1) & 2 Jokers is impossible
 * One pair (2) & 2 Jokers = Three of a kind (4) (jokers are the pair)
 * Two pair (3) & 2 Jokers = Four of a kind (6)
 * Three of a kind (4) & 2 Jokers is impossible
 * Full house (5) & 2 Jokers = Five of a kind (7)
 * Four of a kind (6) + 2 Jokers is impossible
 *
 * High card (1) & 3 Jokers is impossible
 * One pair (2) & 3 Jokers is impossible
 * Two pair (3) & 3 Jokers is impossible
 * Three of a kind (4) & 3 Jokers = Four of a kind (6) (jokers are the three)
 * Full house (5) & 3 Jokers = Five of a kind (7)
 * Four of a kind (6) + 3 Jokers is impossible
 *
 * High card (1) & 4 Jokers is impossible
 * One pair (2) & 4 Jokers is impossible
 * Two pair (3) & 4 Jokers is impossible
 * Three of a kind (4) & 4 Jokers is impossible
 * Full house (5) & 4 Jokers is impossible
 * Four of a kind (6) + 4 Jokers = Five of a kind (7)
 *
 * 5 Jokers is Five of a kind
 */
function getJokerStrength(handMap, strength) {
  switch (handMap.J) {
    case 1:
      switch (strength) {
        case 1:
          return 2;
        case 2:
          return 4;
        case 3:
          return 5;
        case 4:
          return 6;
        case 5:
          return 6;
        case 6:
          return 7;
        case 7:
          throw "Impossible - Five of a kind with one joker";
        default:
          throw "Unknown combo";
      }
    case 2:
      switch (strength) {
        case 1:
          throw "Impossible - High card with two jokers";
        case 2:
          return 4;
        case 3:
          return 6;
        case 4:
          throw "Impossible - Three of a kind with two jokers";
        case 5:
          return 7;
        case 6:
          throw "Impossible - Four of a kind with two jokers";
        case 7:
          throw "Impossible - Five of a kind with two jokers";
        default:
          throw "Unknown combo";
      }
    case 3:
      switch (strength) {
        case 1:
          throw "Impossible - High card with three jokers";
        case 2:
          throw "Impossible - One pair with three jokers";
        case 3:
          throw "Impossible - Two pair with three jokers";
        case 4:
          return 6;
        case 5:
          return 7;
        case 6:
          throw "Impossible - Four of a kind with three jokers";
        case 7:
          throw "Impossible - Five of a kind with three jokers";
        default:
          throw "Unknown combo";
      }
    case 4:
      switch (strength) {
        case 1:
          throw "Impossible - High card with four jokers";
        case 2:
          throw "Impossible - One pair with four jokers";
        case 3:
          throw "Impossible - Two pair with four jokers";
        case 4:
          throw "Impossible - Three of a kind with four jokers";
        case 5:
          throw "Impossible - Full house with four jokers";
        case 6:
          return 7;
        case 7:
          throw "Impossible - Five of a kind with three jokers";
        default:
          throw "Unknown combo";
      }
  }
  return strength;
}

function process(input) {
  performance.mark("Function_Start");

  const processed = [];
  input.forEach((handAndBid) => {
    const split = handAndBid.split(" ");
    const hand = split[0];
    const bid = +split[1];

    const handMap = getHandMap(hand);
    const strength = getHandStrength(handMap);
    const jokerStrength = getJokerStrength(handMap, strength);

    processed.push({ hand, bid, strength, jokerStrength });
  });

  performance.mark("Function_End");

  performance.mark("Function_Sort_1_Start");
  processed.sort((itemA, itemB) => {
    if (itemA.strength === itemB.strength) {
      return compareCards(itemA.hand, itemB.hand, false);
    }
    return itemA.strength - itemB.strength;
  });
  const result1 = processed.reduce(
    (prev, curr, index) => prev + curr.bid * (index + 1),
    0
  );
  console.log("result1", result1); // 250898830 // 6440
  performance.mark("Function_Sort_1_End");

  performance.mark("Function_Sort_2_Start");

  // list should be mostly sorted from the first puzzle
  processed.sort((itemA, itemB) => {
    if (itemA.jokerStrength === itemB.jokerStrength) {
      return compareCards(itemA.hand, itemB.hand, true);
    }
    return itemA.jokerStrength - itemB.jokerStrength;
  });

  const result2 = processed.reduce(
    (prev, curr, index) => prev + curr.bid * (index + 1),
    0
  );
  console.log("result2", result2); // 252127335 // 5905
  performance.mark("Function_Sort_2_End");

  const measurePre = performance.measure(
    "Measure",
    "Function_Start",
    "Function_End"
  );
  const measureOne = performance.measure(
    "Measure",
    "Function_Sort_1_Start",
    "Function_Sort_1_End"
  );
  const measureTwo = performance.measure(
    "Measure",
    "Function_Sort_2_Start",
    "Function_Sort_2_End"
  );

  console.log("Processing took: " + measurePre.duration);
  console.log("Sorting puzzle 1 took: " + measureOne.duration);
  console.log("Sorting puzzle 2 took: " + measureTwo.duration);
}

const input = readInput("d07-input.txt");
process(input);
