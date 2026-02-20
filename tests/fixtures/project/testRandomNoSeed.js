const { runTool, sleep } = require("./tools.js");

async function test() {
  runTool("start");
  Math.random();
  await sleep(5000);
}

module.exports = { test };
