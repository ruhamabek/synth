#!/usr/bin/env bun
import { Command } from "commander";
import { startCommand } from "./commands/start";

const program = new Command();

program
	.name("synth")
	.description("AI-powered database dashboard and tool builder")
	.version("0.0.1")
	.argument("[project]", "Name of the project", "default")
	.action(startCommand);

program.parse();
