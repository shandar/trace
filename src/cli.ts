#!/usr/bin/env node
import { Command } from "commander";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { review } from "./review.js";

const TEMPLATE = `# TRACE — Living PRD

## 1. One-liner

<!-- fill me -->

---

## 2. Problem

<!-- fill me -->

---

## 3. Target user

<!-- fill me -->

---

## 4. Core insight

<!-- fill me -->

---

## 5. MVP scope

<!-- fill me -->

---

## 6. Stretch scope

<!-- fill me -->

---

## 7. Out of scope

<!-- fill me -->
`;

const program = new Command();

program
  .name("trace")
  .description("Every decision traced from intent to ship.")
  .version("0.0.1");

program
  .command("init")
  .description("Scaffold a TRACE.md in the current directory.")
  .action(() => {
    const target = resolve(process.cwd(), "TRACE.md");
    try {
      writeFileSync(target, TEMPLATE, { flag: "wx" });
      console.log(`trace: wrote ${target}`);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === "EEXIST") {
        console.error(
          `trace: refusing to overwrite existing TRACE.md at ${target}`,
        );
        process.exit(1);
      }
      throw err;
    }
  });

program
  .command("review")
  .description("Review pending proposed edits and append accepted ones to TRACE.md.")
  .action(async () => {
    await review(process.cwd());
  });

program.parseAsync();
