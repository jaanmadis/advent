const fs = require("fs");

function readInput(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

const button = "button";
const broadcaster = "broadcaster";

let modules = {};
let signals = [];

class Module {
  constructor(name) {
    this.name = name;
    this.inputs = {};
  }

  addInput(input) {
    this.inputs[input] = 0;
  }

  addDestinations(destinations) {
    this.destinations = destinations;
  }

  addSignals(newPulse) {
    this.destinations.forEach((destination) =>
      signals.push({ pulse: newPulse, from: this.name, to: destination })
    );
  }

  signal() {}
}

class Button extends Module {
  signal() {
    this.addSignals(0);
  }
}

class Broadcaster extends Module {
  signal(pulse) {
    this.addSignals(pulse);
  }
}

class FlipFlop extends Module {
  constructor(name) {
    super(name);
    this.state = 0;
  }

  /**
   * If a flip-flop module receives a high pulse, it is ignored and nothing happens.
   * If a flip-flop module receives a low pulse...
   * ...if it was off, it turns on and sends a high pulse.
   * ...if it was on, it turns off and sends a low pulse.
   */
  signal(pulse) {
    if (pulse === 0) {
      let newPulse;
      if (this.state === 0) {
        newPulse = 1;
        this.state = 1;
      } else if (this.state === 1) {
        newPulse = 0;
        this.state = 0;
      }
      this.addSignals(newPulse);
    }
  }
}

class Conjunction extends Module {
  /**
   * When a pulse is received, the conjunction module first updates its memory for that input.
   * Then, if it remembers high pulses for all inputs, it sends a low pulse; otherwise, it sends a high pulse.
   */
  signal(pulse, from) {
    if (this.inputs[from] === undefined) {
      throw `${from} not found in ${this.name}`;
    }
    this.inputs[from] = pulse;
    let allHighs = true;
    for (const input in this.inputs) {
      if (this.inputs[input] === 0) {
        allHighs = false;
        break;
      }
    }
    const newPulse = allHighs ? 0 : 1;
    this.addSignals(newPulse);
  }
}

function resetModules(input) {
  modules = {};
  modules[button] = new Button(button);
  modules[button].addDestinations([broadcaster]);

  // Add modules first
  input.forEach((line) => {
    const splits = line.split(" -> ");
    if (splits[0] === broadcaster) {
      modules[broadcaster] = new Broadcaster(broadcaster);
    } else {
      const name = splits[0].substring(1);
      if (splits[0][0] === "%") {
        modules[name] = new FlipFlop(name);
      } else if (splits[0][0] === "&") {
        modules[name] = new Conjunction(name);
      }
    }
  });

  // Then add inputs and outputs
  input.forEach((line) => {
    const splits = line.split(" -> ");
    const name =
      splits[0] === "broadcaster" ? splits[0] : splits[0].substring(1);
    const destinations = splits[1].split(", ");
    modules[name].addDestinations(destinations);
    destinations.forEach((destination) => {
      if (modules[destination] === undefined) {
        modules[destination] = new Module(destination);
      }
      modules[destination].addInput(name);
    });
  });
}

/**
 * Construct the classes and simulate the pulses.
 */
function puzzle1(input) {
  resetModules(input);

  let loCtr = 0;
  let hiCtr = 0;

  signals = [];
  for (let press = 1; press <= 1000; press++) {
    modules[button].signal();
    while (signals.length > 0) {
      const signal = signals.shift();
      if (signal.pulse === 0) loCtr++;
      if (signal.pulse === 1) hiCtr++;
      modules[signal.to].signal(signal.pulse, signal.from);
    }
  }

  console.log("loCtr", loCtr);
  console.log("hiCtr", hiCtr);
  console.log("Result 1", loCtr * hiCtr);
}

/**
 * Manually analyze the input.
 *
 * rx wants low -> hb needs all high
 *
 * js needs to send high -> gr must send low
 * zb needs to send high -> st must send low
 * bs needs to send high -> bn must send low
 * rr needs to send high -> lg must send low
 *
 * Run the cycle and find the intervals.
 * Result is the product of all intervals.
 */
function puzzle2() {
  resetModules(input);

  signals = [];

  let grjs = 0;
  let stzb = 0;
  let bnbs = 0;
  let lgrr = 0;

  for (let press = 1; ; press++) {
    modules[button].signal();

    while (signals.length > 0) {
      const signal = signals.shift();

      if (signal.from === "gr" && signal.to === "js" && signal.pulse === 0) {
        console.log("Found grjs", press);
        grjs = press;
      }
      if (signal.from === "st" && signal.to === "zb" && signal.pulse === 0) {
        console.log("Found stzb", press);
        stzb = press;
      }
      if (signal.from === "bn" && signal.to === "bs" && signal.pulse === 0) {
        console.log("Found bnbs", press);
        bnbs = press;
      }
      if (signal.from === "lg" && signal.to === "rr" && signal.pulse === 0) {
        console.log("Found lgrr", press);
        lgrr = press;
      }

      if (grjs > 0 && stzb > 0 && bnbs > 0 && lgrr > 0) {
        console.log("Result 2", grjs * stzb * bnbs * lgrr);
        return;
      }

      modules[signal.to].signal(signal.pulse, signal.from);
    }
  }
}

// const input = readInput("d20-input-smol.txt");
// const input = readInput("d20-input-smol-2.txt");
const input = readInput("d20-input.txt");
puzzle1(input); // 32000000, 11687500, 684125385
puzzle2(input); // 225872806380073
