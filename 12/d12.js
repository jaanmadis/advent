const fs = require("fs");

function readInput(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function puzzle(input, unfold = false) {
  let result = 0;
  let resultTest;
  input.forEach((line) => {
    const inputSprings = line.split(" ")[0];
    const inputNumbers = line.match(/\d+/g).map((number) => +number);

    let springs = inputSprings;
    let numbers = inputNumbers;

    /**
     * For Part 2
     */
    if (unfold) {
      for (unfoldTimes = 1; unfoldTimes < 5; unfoldTimes++) {
        springs = springs.concat("?" + inputSprings);
        numbers = numbers.concat(inputNumbers);
      }
    }

    /**
     * Table of arrangements for each input line
     *
     * Rows represent spring data for a line, starting from single unit of space, increasing.
     * Columns are for the numbers (contiguous group of damaged springs)
     *
     * Table value is the sum of arrangements possible for each number at .
     *
     * 012345
     * ?????. 3,1
     *
     *          "3"                              "1"
     * 0  ?      0 // won't fit                   0 // won't fit
     * 1  ??     0 // won't fit                   0 // won't fit
     * 2  ???    1 // 333 fits exactly            0 // won't fit
     * 3  ????   2 // 333? or ?333                0 // won't fit, space is required between 333 and 1
     * 4  ?????  3 // 333?? or ?333? or ??333     1 // 333?1
     * 5  ?????. 3 // 333??. or ?333?. or ??333.  1 // 333?1.
     *
     * Solution for this line is on the last row of last column
     */
    const table = new Array(springs.length)
      .fill(0)
      .map(() => new Array(numbers.length).fill(-1));

    /**
     * Mandatory space between hashes.
     */
    const buff = 1;

    for (let idxN = 0; idxN < numbers.length; idxN++) {
      let availableSpace = 0;
      let removedSpace = 0;
      let hashes = [];
      for (let idxS = 0; idxS < springs.length; idxS++) {
        /**
         * Encountering . can be seen as resetting the available space back to nothing.
         * Arrangements that were before . are still valid, but the growth will be reset.
         */
        availableSpace = idxS + 1;
        if (springs[idxS] === ".") {
          removedSpace = availableSpace;
        }

        /**
         * If there is not enough space to fit the number.
         * Then keep filling the table with previous result (or zero).
         * Else keep filling the table with increasing numbers.
         * Increase by adding the number of arrangements from the previous row to number of valid arrangements from previous numbers
         *
         * ?????? 3,1
         *
         * Column 1
         * Space 1: ? 3 -> won't fit (0 arrangements)
         * Space 2: ?? 3 -> won't fit (0 arrangements)
         * Space 3: ??? 3 -> 333 (1 arrangement)
         * Space 4: ???? 3 -> 333? or ?333 (2 arrangements)
         * Space 5: ????? 3 -> 333?? or ?333? or ??333 (3 arrangements)
         * Space 6: ?????? 3 -> 333??? or ?333?? or ??333? or ???333 (4 arrangements)
         *
         * Column 2
         * Space 1: ? 1 -> won't fit because 333 has to fit before 1 (0 arrangements)
         * Space 2: ?? 1 -> won't fit because 333 has to fit before 1 (0 arrangements)
         * Space 3: ??? 1 -> won't fit because 333 has to fit before 1 (0 arrangements)
         * Space 4: ???? 1 -> won't fit because empty space is needed between 333 and 1 (0 arrangements)
         * Space 5: ????? 1 -> 333?1 (1 arrangement = 0 (from this column previous value) + 1 (from previous column at space 3))
         * Space 6: ?????? 1 -> 333?1? or 333??1 or ?333?1 (3 arrangements = 1 (from this column previous value) + 2 (from previous column at space 4))
         */
        if (availableSpace - removedSpace < numbers[idxN]) {
          table[idxS][idxN] = idxS - 1 >= 0 ? table[idxS - 1][idxN] : 0;
        } else if (idxN - 1 >= 0) {
          table[idxS][idxN] =
            idxS - 1 >= 0 && idxS - numbers[idxN] - buff >= 0
              ? table[idxS - 1][idxN] +
                table[idxS - numbers[idxN] - buff][idxN - 1]
              : 0;
        } else {
          table[idxS][idxN] = (idxS - 1 >= 0 ? table[idxS - 1][idxN] : 0) + 1;
        }

        /**
         * Modify the arrangements, if # is encountered
         */
        if (springs[idxS] === "#") {
          hashes.push(idxS);

          /**
           * If number cannot enclose this new #.
           * Then there are no valid arrangements, set to zero.
           * Else there are two options.
           */
          if (availableSpace - removedSpace < numbers[idxN]) {
            table[idxS][idxN] = 0;
          } else {
            /**
             * Number could enclose this new #.
             *
             * If this is not the first columns of numbers.
             * Then current number must enclose this new # doesn't increase the number valid arrangements.
             * Number of valid arrangements comes from prior columns.
             * Else this is the first column, there can only be one valid arrangement.
             *
             * ???.?# 2,1
             *
             * Column 2
             * Space 5: ???.? 1 -> 22?.1 or ?22.1 (2 arrangements)
             * Space 6: ???.?# 1 -> 22?.?1 or ?22.?1 (2 arrangements)
             *
             * "1" must always enclose # and doesn't increase the number valid arrangements by itself.
             * Number of valid arrangements is what previous column had at "Space 4"
             */
            if (idxN - 1 >= 0) {
              table[idxS][idxN] =
                idxS - numbers[idxN] - buff >= 0
                  ? table[idxS - numbers[idxN] - buff][idxN - 1]
                  : 0;
            } else {
              table[idxS][idxN] = 1;
            }
          }
        }

        /**
         * While previous numbers have valid arrangements for the oldest #.
         * Do shift the # off the hashes queue, because these #-s don't need to be enclosed by current number.
         */
        while (
          hashes[0] <= idxS - numbers[idxN] - buff &&
          idxS - numbers[idxN] - buff >= 0 &&
          idxN - 1 >= 0 &&
          table[idxS - numbers[idxN] - buff][idxN - 1] !== 0
        ) {
          hashes.shift();
        }

        /**
         * If the oldest # can't be enclosed by number.
         * Then the number of arrangements remains the same as previous row.
         */
        if (hashes[0] <= idxS - numbers[idxN]) {
          table[idxS][idxN] = idxS - 1 >= 0 ? table[idxS - 1][idxN] : 0;
        }

        /**
         * If the oldest # and the most recent # cannot be enclosed by number.
         * Then there are no valid arrangements.
         */
        if (hashes[hashes.length - 1] - hashes[0] + 1 > numbers[idxN]) {
          table[idxS][idxN] = 0;
        }
      }
    }
    console.log(line);
    table.forEach((row, idx) => console.log(`${idx + 1}: ${row}`));

    /**
     * Sum the final elements of the final arrays to get puzzle result
     */
    result += table[table.length - 1][table[table.length - 1].length - 1];
    resultTest = table[table.length - 1];
  });
  console.log("Puzzle Result: ", result);
  return resultTest;
}

function myTest(a, b) {
  a.forEach((_, index) => {
    if (a[index] !== b[index]) {
      throw new Error(`${a} is not ${b}!`);
    }
  });
}

/*
myTest(puzzle(["?? 3"]), [0]);
myTest(puzzle(["??. 3"]), [0]);
myTest(puzzle(["???. 3"]), [1]);
myTest(puzzle(["????..???? 3"]), [4]);
myTest(puzzle(["????. 3"]), [2]);
myTest(puzzle(["????.? 3"]), [2]);
myTest(puzzle(["????.?? 3"]), [2]);
myTest(puzzle(["????.??? 3"]), [3]);
myTest(puzzle(["????.???. 3"]), [3]);
myTest(puzzle(["????.????. 3"]), [4]);
myTest(puzzle(["????.????.. 3"]), [4]);
myTest(puzzle(["????.????... 3"]), [4]);
myTest(puzzle(["????.????.... 3"]), [4]);
myTest(puzzle(["????.????....?. 3"]), [4]);
myTest(puzzle(["????.????....?..?.?.???.... 3"]), [5]);

myTest(puzzle(["????????.??# 3"]), [1]);
myTest(puzzle(["????????.?#? 3"]), [1]);
myTest(puzzle(["????????.#?? 3"]), [1]);
myTest(puzzle(["????????.#??? 3"]), [1]);
myTest(puzzle(["????????.#???? 3"]), [1]);

myTest(puzzle(["????????.??#.??# 3"]), [0]);
myTest(puzzle(["????????.?#?.?#? 3"]), [0]);
myTest(puzzle(["????????.#??.#?? 3"]), [0]);

myTest(puzzle(["??????###???? 3"]), [1]);
myTest(puzzle(["??????###???# 3"]), [0]);
myTest(puzzle(["#?????###???? 3"]), [0]);
myTest(puzzle(["??????###???? 6"]), [4]);

myTest(puzzle(["#?? 3"]), [1]);
myTest(puzzle(["#???????? 3"]), [1]);
myTest(puzzle(["?#? 3"]), [1]);
myTest(puzzle(["??# 3"]), [1]);

myTest(puzzle(["?## 3"]), [1]);
myTest(puzzle(["#?# 3"]), [1]);
myTest(puzzle(["##? 3"]), [1]);

myTest(puzzle(["#??? 3"]), [1]);
myTest(puzzle(["?#?? 3"]), [2]);
myTest(puzzle(["??#? 3"]), [2]);
myTest(puzzle(["??#?? 3"]), [3]);
myTest(puzzle(["??#?????????? 3"]), [3]);

myTest(puzzle(["?##? 3"]), [2]);
myTest(puzzle(["#?#? 3"]), [1]);
myTest(puzzle(["##?? 3"]), [1]);
myTest(puzzle(["##??# 3"]), [0]);
myTest(puzzle(["?????#????#?# 3"]), [0]);

myTest(puzzle(["??? 3,1"]), [1, 0]);
myTest(puzzle(["???? 3,1"]), [2, 0]);
myTest(puzzle(["????? 3,1"]), [3, 1]);
myTest(puzzle(["?????? 3,1"]), [4, 3]);
myTest(puzzle(["??????? 3,1"]), [5, 6]);
myTest(puzzle(["??? 3,2"]), [1, 0]);
myTest(puzzle(["???? 3,2"]), [2, 0]);
myTest(puzzle(["????? 3,2"]), [3, 0]);
myTest(puzzle(["?????? 3,2"]), [4, 1]);
myTest(puzzle(["??????? 3,2"]), [5, 3]);
myTest(puzzle(["???????????? 3,2,1"]), [10, 28, 35]);

myTest(puzzle(["????.????? 3,1"]), [5, 11]);
myTest(puzzle(["????.???.? 3,1"]), [3, 9]);
myTest(puzzle(["????.???.? 3,2"]), [3, 4]);
myTest(puzzle([".??..??...???. 1,1,3"]), [7, 17, 4]);
myTest(puzzle(["?????. 3,1"]), [3, 1]);

myTest(puzzle(["#################, 3"]), [0]);
myTest(puzzle(["?????#?????? 3,1"]), [3, 14]);
myTest(puzzle(["?????#?..... 3,1"]), [2, 2]);
myTest(puzzle(["?????#?????? 3,2"]), [3, 12]);
myTest(puzzle(["?????#?????? 3,3"]), [3, 9]);

myTest(puzzle(["???#?? 2,1"]), [2, 2]);
myTest(puzzle(["???##?? 2,1"]), [1, 1]);
myTest(puzzle(["???.##.?.???.. 2,1"]), [1, 4]);
myTest(puzzle(["???#????????#. 7,1"]), [0, 4]);

myTest(puzzle(["???.### 1,1,3"]), [0, 0, 1]);
myTest(puzzle([".??..??...?##. 1,1,3"]), [0, 0, 4]);
myTest(puzzle(["?#?#?#?#?#?#?#? 1,3,1,6"]), [0, 0, 0, 1]);
myTest(puzzle(["????.#...#... 4,1,1"]), [0, 0, 1]);
myTest(puzzle(["????.######..#####. 1,6,5"]), [0, 0, 4]);
myTest(puzzle(["?###???????? 3,2,1"]), [1, 6, 10]);
*/

// const input = readInput("d12-input-no-hash.txt"); // 1599
// const input = readInput("d12-input-one-hash.txt"); // 1953
// const input = readInput("d12-input-smol.txt"); // 21
const input = readInput("d12-input.txt"); // 7379 vs 7732028747925
// puzzle(input);
puzzle(input, true);
