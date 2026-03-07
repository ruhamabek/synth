import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

export type ReadlineInterface = ReturnType<typeof createInterface>;

export async function prompt(
	rl: ReadlineInterface,
	question: string,
	required = true,
	defaultValue = "",
) {
	while (true) {
		const answer = (await rl.question(question)).trim();
		if (answer) return answer;
		if (defaultValue) return defaultValue;
		if (!required) return "";
		console.log("This field is required.");
	}
}

export async function promptRadioOption(
	rl: ReadlineInterface,
	question: string,
	options: readonly string[],
	defaultIndex: number,
): Promise<string> {
	if (options.length === 0) {
		throw new Error("No options provided for radio selection");
	}

	while (true) {
		const answer = (await rl.question(question)).trim();

		if (!answer) {
			const index = Math.min(defaultIndex, options.length - 1);
			const selected = options[index];
			if (selected !== undefined) {
				return selected;
			}
			throw new Error("Default option index is out of bounds.");
		}

		const num = Number.parseInt(answer, 10);
		if (!Number.isNaN(num) && num >= 1 && num <= options.length) {
			const selected = options[num - 1];
			if (selected !== undefined) {
				return selected;
			}
			throw new Error("Selected option index is out of bounds.");
		}

		if (options.includes(answer)) {
			return answer;
		}

		console.log(
			`Please enter a number between 1 and ${options.length}, or one of the option names.`,
		);
	}
}

export async function promptValidated(
	rl: ReadlineInterface,
	question: string,
	validator: (value: string) => boolean,
	errorMessage: string,
) {
	while (true) {
		const answer = await prompt(rl, question, true);
		if (validator(answer)) {
			return answer;
		}
		console.log(errorMessage);
	}
}

export async function promptSecret(rl: ReadlineInterface, question: string) {
	if (typeof Bun.password === "function") {
		const value = (await Bun.password(question)).trim();
		return value;
	}

	return await prompt(rl, question, true);
}

export function createReadlineInterface() {
	return createInterface({ input, output });
}
