// const fs = require("fs");

// function readInput(fileName) {
//   return fs
//     .readFileSync(fileName, { encoding: "utf8", flag: "r" })
//     .split("\r\n");
// }

// /**
//  * Travel the map and record light's path.
//  * Stop tracing when light goes off the edge of map.
//  *
// //  * If splitter is encountered and it isn't "active".
//  * Then add two new light rays and add this splitter to list of "active" splitters.
//  * And stop tracing this light ray.
//  */
// function travel(input, map, rays, index, splitters) {
//   const ray = rays[index];
//   while (
//     0 <= ray.row &&
//     ray.row < map.length &&
//     0 <= ray.col &&
//     ray.col < map[ray.row].length
//   ) {
//     map[ray.row][ray.col] = "#";
//     switch (input[ray.row][ray.col]) {
//       case "|": {
//         if (ray.vc != 0) {
//           if (
//             !splitters.find(
//               (splitter) => splitter.row === ray.row && splitter.col === ray.col
//             )
//           ) {
//             rays.push({ row: ray.row - 1, col: ray.col, vr: -1, vc: 0 });
//             rays.push({ row: ray.row + 1, col: ray.col, vr: 1, vc: 0 });
//             splitters.push({ row: ray.row, col: ray.col });
//           }
//           return;
//         }
//         break;
//       }
//       case "-": {
//         if (ray.vr != 0) {
//           if (
//             !splitters.find(
//               (splitter) => splitter.row === ray.row && splitter.col === ray.col
//             )
//           ) {
//             rays.push({ row: ray.row, col: ray.col - 1, vr: 0, vc: -1 });
//             rays.push({ row: ray.row, col: ray.col + 1, vr: 0, vc: 1 });
//             splitters.push({ row: ray.row, col: ray.col });
//           }
//           return;
//         }
//         break;
//       }
//       case "/": {
//         if (ray.vr === 1) {
//           /** Travel from top, turn left */
//           ray.vr = 0;
//           ray.vc = -1;
//         } else if (ray.vr === -1) {
//           /** Travel from bottom, turn right */
//           ray.vr = 0;
//           ray.vc = 1;
//         } else if (ray.vc === 1) {
//           /** Travel from left, turn top */
//           ray.vr = -1;
//           ray.vc = 0;
//         } else if (ray.vc === -1) {
//           /** Travel from right, turn bottom */
//           ray.vr = 1;
//           ray.vc = 0;
//         }
//         break;
//       }
//       case "\\": {
//         if (ray.vr === 1) {
//           /** Travel from top, turn right */
//           ray.vr = 0;
//           ray.vc = 1;
//         } else if (ray.vr === -1) {
//           /** Travel from bottom, turn left */
//           ray.vr = 0;
//           ray.vc = -1;
//         } else if (ray.vc === 1) {
//           /** Travel from left, turn bottom */
//           ray.vr = 1;
//           ray.vc = 0;
//         } else if (ray.vc === -1) {
//           /** Travel from right, turn top */
//           ray.vr = -1;
//           ray.vc = 0;
//         }
//         break;
//       }
//     }
//     ray.row += ray.vr;
//     ray.col += ray.vc;
//   }
// }

// /**
//  * Start with one light ray and travel until all light rays have gone off the map or hit an already active splitter.
//  */
// function solve(input, lightRay) {
//   const lightMap = input.map((line) => new Array(line.length).fill("."));
//   const lightRays = [];
//   const activeSplitters = [];

//   lightRays.push(lightRay);

//   let lightIndex = 0;
//   while (lightIndex < lightRays.length) {
//     travel(input, lightMap, lightRays, lightIndex, activeSplitters);
//     lightIndex++;
//   }

//   const result = lightMap.reduce(
//     (acc, next) => acc + (next.join("").match(/#/g) || []).length,
//     0
//   );

//   return result;
// }

// /**
//  * Solve for one light ray.
//  */
// function puzzle1(input) {
//   const result = solve(input, { row: 0, col: 0, vr: 0, vc: 1 });
//   console.log(result); // 7307
// }

// /**
//  * Brute force all possibilities.
//  */
// function puzzle2(input) {
//   let result = 0;
//   let entry;

//   for (let i = 0; i < input.length; i++) {
//     entry = { row: i, col: 0, vr: 0, vc: 1 };
//     result = Math.max(result, solve(input, entry));
//     entry = { row: i, col: input.length - 1, vr: 0, vc: -1 };
//     result = Math.max(result, solve(input, entry));
//   }

//   for (let j = 0; j < input[0].length; j++) {
//     entry = { row: 0, col: j, vr: 1, vc: 0 };
//     result = Math.max(result, solve(input, entry));
//     entry = { row: input[0].length - 1, col: j, vr: -1, vc: 0 };
//     result = Math.max(result, solve(input, entry));
//   }

//   console.log(result); // 7635
// }

// // const input = readInput("d16-input-smol.txt");
// const input = readInput("d16-input.txt");
// puzzle1(input);
// puzzle2(input);
