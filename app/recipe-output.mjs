/** Flush machine-readable output before a recipe exits, including asynchronous Unix pipes. */
export function writeRecipeJson(value) {
  return new Promise((resolve, reject) => {
    process.stdout.write(`${JSON.stringify(value)}\n`, (error) => (error ? reject(error) : resolve()));
  });
}
