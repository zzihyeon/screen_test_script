import { runTool } from "./tools.js";

export async function run() {
  await runTool("seq");
  await runTool("end");
}
