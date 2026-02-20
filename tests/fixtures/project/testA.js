import { runTool } from "./tools.js";

export async function main(args = {}) {
  if (args.mode === "random") {
    await runTool("shuffle");
  } else {
    await runTool("seq");
  }
  await runTool("end");
}
