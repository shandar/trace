#!/usr/bin/env node
import { Command } from "commander";
import { readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { review } from "./review.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf8")) as { version: string };

const TEMPLATE = `# TRACE — Living PRD

## Intent

<!-- What are you building and why? -->

## Users

<!-- Who is this for? -->

## In scope

<!-- What must ship? -->

## Out of scope

<!-- What are you explicitly not doing? -->

## Open questions

<!-- Unresolved decisions that could affect the build. -->

## Decision log

<!-- Accepted decisions go here, appended by \`trace-prd review\`. -->

## Assumption ledger

<!-- Surfaced assumptions go here, appended by \`trace-prd review\`. -->
`;

const program = new Command();

program
  .name("trace")
  .description("Every decision traced from intent to ship.")
  .version(version, "--version", "Print the version and exit");

program
  .command("init")
  .description("Scaffold a TRACE.md in the current directory.")
  .action(async () => {
    const target = resolve(process.cwd(), "TRACE.md");
    try {
      writeFileSync(target, TEMPLATE, { flag: "wx" });
      console.log(`trace: wrote ${target}`);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;

      const rl = createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise<string>((resolve) =>
        rl.question(`trace: TRACE.md already exists at ${target}. Overwrite? [y/N] `, resolve),
      );
      rl.close();

      if (answer.trim().toLowerCase() !== "y") {
        console.log("trace: aborted.");
        process.exit(0);
      }

      writeFileSync(target, TEMPLATE);
      console.log(`trace: overwrote ${target}`);
    }
  });

program
  .command("review")
  .description("Review pending proposed edits and append accepted ones to TRACE.md.")
  .action(async () => {
    await review(process.cwd());
  });

program.parseAsync();
