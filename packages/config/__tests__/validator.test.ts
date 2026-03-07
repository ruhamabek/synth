import { describe, expect, it } from "vitest";
import { EXAMPLE_ECOMMERCE_CONFIG } from "../src/examples";
import { ConfigValidator } from "../src/validator";
import type { SynthConfig } from "../src/types";

describe("ConfigValidator", () => {
    it("should validate correct config", () => {
        const result = ConfigValidator.validateAll(EXAMPLE_ECOMMERCE_CONFIG);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it("should detect non-existent table reference", () => {
        const invalid: SynthConfig = {
            ...EXAMPLE_ECOMMERCE_CONFIG,
            pages: [
                {
                    ...EXAMPLE_ECOMMERCE_CONFIG.pages[0]!,
                    id: "test",
                    dataSource: {
                        ...EXAMPLE_ECOMMERCE_CONFIG.pages[0]!.dataSource,
                        table: "non_existent_table",
                    },
                },
            ],
        };

        const result = ConfigValidator.validateAll(invalid);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain("non_existent_table");
    });

    it("should detect non-existent column reference", () => {
        const invalid: SynthConfig = {
            ...EXAMPLE_ECOMMERCE_CONFIG,
            pages: [
                {
                    ...EXAMPLE_ECOMMERCE_CONFIG.pages[0]!,
                    components: [
                        {
                            type: "table" as const,
                            columns: [
                                {
                                    field: "non_existent_column",
                                    label: "Invalid",
                                    sortable: true,
                                    filterable: false,
                                },
                            ],
                            pagination: true,
                            pageSize: 10,
                        },
                    ],
                },
            ],
        };

        const result = ConfigValidator.validateAll(invalid);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });
});
