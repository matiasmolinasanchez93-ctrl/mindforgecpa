// Temporary verification helper: runs `tsc --noEmit` and reports the result.
// Printed to stdout so the result is always visible.
import { spawnSync } from "node:child_process";

const result = spawnSync(
  "npx",
  ["tsc", "--noEmit", "--incremental", "false"],
  { shell: true, encoding: "utf8" }
);

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
console.log("TSC_EXIT_CODE:", result.status);
if (output) {
  console.log("TSC_OUTPUT_BEGIN");
  console.log(output);
  console.log("TSC_OUTPUT_END");
} else {
  console.log("No type errors.");
}
