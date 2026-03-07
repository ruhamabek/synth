import { z } from "zod";

// ============================================
// VERSION
// ============================================

export const VERSION = "1.0" as const;

// ============================================
// DATABASE TYPES
// ============================================

export const DataTypeSchema = z.enum([
    "string",
    "number",
    "boolean",
    "date",
    "datetime",
    "json",
    "enum",
    "uuid",
    "text",
    "decimal",
]);

export const ColumnSchema = z.object({
    name: z.string(),
    type: DataTypeSchema,
    nullable: z.boolean().default(false),
    primaryKey: z.boolean().optional(),
    unique: z.boolean().optional(),
    defaultValue: z.any().optional(),
    enumValues: z.array(z.string()).optional(),
    displayName: z.string().optional(),
});

export const RelationTypeSchema = z.enum(["hasMany", "belongsTo", "manyToMany"]);

export const RelationSchema = z.object({
    type: RelationTypeSchema,
    target: z.string(), // Target table name
    foreignKey: z.string(),
    targetKey: z.string().optional(),
    through: z.string().optional(), // For many-to-many
});

export const TableSchema = z.object({
    name: z.string(),
    displayName: z.string().optional(),
    columns: z.array(ColumnSchema),
    relations: z.array(RelationSchema).default([]),
    primaryKey: z.string(), // Column name of primary key
});

export const DatabaseSchemaSchema = z.object({
    provider: z.enum(["postgresql", "mysql", "sqlite"]),
    tables: z.array(TableSchema),
});

// ============================================
// AUTH & RBAC (Better Auth Integration)
// ============================================

export const ActionSchema = z.enum(["create", "read", "update", "delete", "*"]);

export const ConditionSchema = z.object({
    field: z.string(),
    operator: z.enum(["equals", "not_equals", "in", "not_in", "contains"]),
    value: z.any(),
});

export const PermissionSchema = z.object({
    resource: z.string(), // Table name or "*"
    actions: z.array(ActionSchema),
    conditions: z.array(ConditionSchema).optional(),
});

export const RoleSchema = z.object({
    id: z.string(),
    name: z.string(),
    permissions: z.array(PermissionSchema),
});

export const AuthConfigSchema = z.object({
    enabled: z.boolean().default(true),
    providers: z
        .array(z.enum(["credentials", "github", "google", "passkey"]))
        .default(["credentials"]),
    userTable: z.string().default("users"),
    emailField: z.string().default("email"),
    passwordField: z.string().optional(),
    plugins: z
        .object({
            twoFactor: z.boolean().default(false),
            passkey: z.boolean().default(false),
            magicLink: z.boolean().default(false),
            admin: z.boolean().default(false),
            organization: z.boolean().default(false), // Linked to MultiTenancySchema
        })
        .default({
            twoFactor: false,
            passkey: false,
            magicLink: false,
            admin: false,
            organization: false,
        }),
});

export const MultiTenancySchema = z.object({
    enabled: z.boolean().default(false),
    mode: z.enum(["subdomain", "path"]).default("path"),
    orgTable: z.string().default("organizations"),
    memberTable: z.string().default("members"),
    invitationTable: z.string().default("invitations"),
    allowPublicOrgCreation: z.boolean().default(true),
});

export const RBACConfigSchema = z.object({
    enabled: z.boolean().default(false),
    roles: z.array(RoleSchema).default([]),
    defaultRole: z.string().default("user"),
});

// ============================================
// BILLING (Polar Integration)
// ============================================

export const PolarProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    priceId: z.string(),
    type: z.enum(["one_time", "subscription"]),
});

export const BillingConfigSchema = z.object({
    enabled: z.boolean().default(false),
    provider: z.literal("polar"),
    organizationId: z.string().optional(),
    products: z.array(PolarProductSchema).default([]),
    successUrl: z.string().optional(),
    cancelUrl: z.string().optional(),
});

// ============================================
// COMPONENTS
// ============================================

export const RenderTypeSchema = z.enum([
    "text",
    "number",
    "currency",
    "date",
    "datetime",
    "badge",
    "boolean",
    "image",
    "link",
    "relation",
]);

export const TableColumnSchema = z.object({
    field: z.string(),
    label: z.string().optional(),
    sortable: z.boolean().default(true),
    filterable: z.boolean().default(false),
    render: RenderTypeSchema.optional(),
    relationDisplay: z.string().optional(), // For relations: "customer.name"
    width: z.string().optional(),
});

export const TableActionSchema = z.object({
    type: z.enum(["view", "edit", "delete", "custom"]),
    label: z.string().optional(),
    icon: z.string().optional(),
    confirmation: z.boolean().default(false),
    confirmationMessage: z.string().optional(),
});

export const FilterConfigSchema = z.object({
    field: z.string(),
    type: z.enum(["select", "search", "date-range", "number-range"]),
    label: z.string().optional(),
    options: z
        .array(
            z.object({
                label: z.string(),
                value: z.any(),
            }),
        )
        .optional(),
});

export const TableComponentSchema = z.object({
    type: z.literal("table"),
    columns: z.array(TableColumnSchema),
    actions: z.array(TableActionSchema).optional(),
    pagination: z.boolean().default(true),
    pageSize: z.number().default(10),
    search: z
        .object({
            enabled: z.boolean(),
            fields: z.array(z.string()),
            placeholder: z.string().optional(),
        })
        .optional(),
    filters: z.array(FilterConfigSchema).optional(),
});

export const FormFieldTypeSchema = z.enum([
    "text",
    "email",
    "password",
    "number",
    "textarea",
    "select",
    "multi-select",
    "date",
    "datetime",
    "checkbox",
    "radio",
    "file",
    "relation",
]);

export const ValidationRuleSchema = z.object({
    type: z.enum(["required", "email", "min", "max", "pattern", "custom"]),
    value: z.any().optional(),
    message: z.string().optional(),
});

export const FormFieldSchema = z.object({
    name: z.string(),
    label: z.string().optional(),
    type: FormFieldTypeSchema,
    placeholder: z.string().optional(),
    required: z.boolean().default(false),
    disabled: z.boolean().default(false),
    validation: z.array(ValidationRuleSchema).optional(),
    relationConfig: z
        .object({
            table: z.string(),
            valueField: z.string(),
            displayField: z.string(),
            searchable: z.boolean().optional(),
        })
        .optional(),
});

export const FormComponentSchema = z.object({
    type: z.literal("form"),
    fields: z.array(FormFieldSchema),
    layout: z.enum(["vertical", "horizontal", "grid"]).default("vertical"),
    submitLabel: z.string().default("Submit"),
    cancelLabel: z.string().default("Cancel"),
    onSuccess: z.enum(["redirect", "message", "close"]).default("redirect"),
    redirectTo: z.string().optional(),
});

export const MetricComponentSchema = z.object({
    type: z.literal("metric"),
    label: z.string(),
    table: z.string(),
    aggregation: z.enum(["count", "sum", "avg", "min", "max"]),
    field: z.string().optional(),
    filters: z
        .array(
            z.object({
                field: z.string(),
                operator: z.string(),
                value: z.any(),
            }),
        )
        .optional(),
    format: z.enum(["number", "currency", "percentage"]).optional(),
    trend: z.boolean().default(false),
});

export const ChartComponentSchema = z.object({
    type: z.literal("chart"),
    chartType: z.enum(["line", "bar", "pie", "area", "donut"]),
    table: z.string(),
    xAxis: z.string(),
    yAxis: z.union([z.string(), z.array(z.string())]),
    groupBy: z.string().optional(),
    filters: z.array(z.any()).optional(),
});

// Union of all component types
export const ComponentSchema = z.discriminatedUnion("type", [
    TableComponentSchema,
    FormComponentSchema,
    MetricComponentSchema,
    ChartComponentSchema,
]);

// ============================================
// PAGES
// ============================================

export const PageLayoutSchema = z.enum([
    "table",
    "form",
    "detail",
    "dashboard",
    "custom",
]);

export const DataSourceSchema = z.object({
    table: z.string(),
    relations: z.array(z.string()).optional(),
    defaultFilters: z.array(z.any()).optional(),
    defaultSort: z
        .object({
            field: z.string(),
            direction: z.enum(["asc", "desc"]),
        })
        .optional(),
});

export const AccessControlSchema = z.object({
    roles: z.array(z.string()),
    conditions: z.array(ConditionSchema).optional(),
});

export const PageSchema = z.object({
    id: z.string(),
    path: z.string(),
    title: z.string(),
    icon: z.string().optional(),
    layout: PageLayoutSchema,
    dataSource: DataSourceSchema,
    access: AccessControlSchema,
    components: z.array(ComponentSchema),
});

// ============================================
// THEME
// ============================================

export const ThemeSchema = z.object({
    primaryColor: z.string().optional(),
    accentColor: z.string().optional(),
    layout: z.enum(["sidebar", "topnav"]).default("sidebar"),
    darkMode: z.boolean().default(false),
    logo: z.string().optional(),
    favicon: z.string().optional(),
});

// ============================================
// MAIN CONFIG
// ============================================

export const MetadataSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    generatedAt: z.string(),
    aiPrompt: z.string().optional(),
});

export const SynthConfigSchema = z.object({
    version: z.literal(VERSION),
    metadata: MetadataSchema,
    database: DatabaseSchemaSchema,
    auth: AuthConfigSchema,
    multiTenancy: MultiTenancySchema.optional(),
    rbac: RBACConfigSchema,
    billing: BillingConfigSchema.optional(),
    pages: z.array(PageSchema),
    theme: ThemeSchema.optional(),
});
