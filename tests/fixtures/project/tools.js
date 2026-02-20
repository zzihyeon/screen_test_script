export async function runTool(name) {
  return `ok:${name}`;
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
