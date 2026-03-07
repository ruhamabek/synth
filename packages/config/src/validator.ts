import { SynthConfigSchema } from "./schema";
import type { SynthConfig, Table } from "./types";

export class ConfigValidator {
    /**
     * Validate a SynthConfig object
     */
    static validate(config: unknown): SynthConfig {
        return SynthConfigSchema.parse(config);
    }

    /**
     * Safely validate without throwing
     */
    static safeParse(config: unknown) {
        return SynthConfigSchema.safeParse(config);
    }

    /**
     * Check if a table reference exists in the schema
     */
    static tableExists(config: SynthConfig, tableName: string): boolean {
        return config.database.tables.some((t: Table) => t.name === tableName);
    }

    /**
     * Check if a column exists in a table
     */
    static columnExists(table: Table, columnName: string): boolean {
        return table.columns.some((c) => c.name === columnName);
    }

    /**
     * Validate that all page data sources reference valid tables
     */
    static validatePageReferences(config: SynthConfig): string[] {
        const errors: string[] = [];

        for (const page of config.pages) {
            // Check if table exists
            if (!this.tableExists(config, page.dataSource.table)) {
                errors.push(
                    `Page "${page.id}" references non-existent table "${page.dataSource.table}"`,
                );
            }

            // Check relations
            if (page.dataSource.relations) {
                const table = config.database.tables.find(
                    (t: Table) => t.name === page.dataSource.table,
                );

                if (table) {
                    for (const relation of page.dataSource.relations) {
                        const relationExists = table.relations.some(
                            (r: { target: string }) => r.target === relation,
                        );

                        if (!relationExists) {
                            errors.push(
                                `Page "${page.id}" references non-existent relation "${relation}"`,
                            );
                        }
                    }
                }
            }
        }

        return errors;
    }

    /**
     * Validate that all component field references are valid
     */
    static validateComponentReferences(config: SynthConfig): string[] {
        const errors: string[] = [];

        for (const page of config.pages) {
            const table = config.database.tables.find(
                (t: Table) => t.name === page.dataSource.table,
            );

            if (!table) continue;

            for (const component of page.components) {
                if (component.type === "table") {
                    // Validate table columns
                    for (const col of component.columns) {
                        if (!this.columnExists(table, col.field)) {
                            errors.push(
                                `Component in page "${page.id}" references non-existent column "${col.field}"`,
                            );
                        }
                    }
                } else if (component.type === "form") {
                    // Validate form fields
                    for (const field of component.fields) {
                        if (!this.columnExists(table, field.name)) {
                            errors.push(
                                `Form in page "${page.id}" references non-existent field "${field.name}"`,
                            );
                        }
                    }
                }
            }
        }

        return errors;
    }

    /**
     * Run all validations
     */
    static validateAll(config: SynthConfig): {
        valid: boolean;
        errors: string[];
    } {
        const errors = [
            ...this.validatePageReferences(config),
            ...this.validateComponentReferences(config),
        ];

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
