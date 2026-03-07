import { describe, expect, it } from "vitest";
import {
	EXAMPLE_ECOMMERCE_CONFIG,
	EXAMPLE_ENTERPRISE_SAAS_CONFIG,
} from "../src/examples";
import { SynthConfigSchema } from "../src/schema";

describe("SynthConfigSchema", () => {
	it("should validate a correct e-commerce config", () => {
		const result = SynthConfigSchema.safeParse(EXAMPLE_ECOMMERCE_CONFIG);
		expect(result.success).toBe(true);
	});

	it("should validate a complex enterprise SaaS config", () => {
		const result = SynthConfigSchema.safeParse(EXAMPLE_ENTERPRISE_SAAS_CONFIG);
		if (!result.success) {
			console.error(JSON.stringify(result.error.format(), null, 2));
		}
		expect(result.success).toBe(true);
	});

	it("should reject invalid version", () => {
		const invalid = {
			...EXAMPLE_ECOMMERCE_CONFIG,
			version: "2.0",
		};

		const result = SynthConfigSchema.safeParse(invalid);
		expect(result.success).toBe(false);
	});

	it("should accept config with optional sections", () => {
		const { billing, multiTenancy, ...minimal } =
			EXAMPLE_ENTERPRISE_SAAS_CONFIG;

		const result = SynthConfigSchema.safeParse(minimal);
		expect(result.success).toBe(true);
	});
});
