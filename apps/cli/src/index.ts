#!/usr/bin/env bun
import { printUsage, runInit, runStart } from "./commands/index.js";

const command = process.argv[2] ?? "init";
const commandArg = process.argv[3];

if (command === "--help" || command === "-h") {
	printUsage();
} else if (command === "init") {
	if (commandArg === "--help" || commandArg === "-h") {
		printUsage();
	} else {
		await runInit();
	}
} else if (command === "start") {
	if (commandArg === "--help" || commandArg === "-h") {
		printUsage();
	} else {
		await runStart(commandArg);
	}
} else {
	printUsage();
	process.exitCode = 1;
}
