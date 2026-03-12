import type { z } from "zod";
import type * as schemas from "./schema";

// Export all inferred types
export type SynthConfig = z.infer<typeof schemas.SynthConfigSchema>;
export type DatabaseSchema = z.infer<typeof schemas.DatabaseSchemaSchema>;
export type Table = z.infer<typeof schemas.TableSchema>;
export type Column = z.infer<typeof schemas.ColumnSchema>;
export type Relation = z.infer<typeof schemas.RelationSchema>;
export type Role = z.infer<typeof schemas.RoleSchema>;
export type Permission = z.infer<typeof schemas.PermissionSchema>;
export type Page = z.infer<typeof schemas.PageSchema>;
export type Component = z.infer<typeof schemas.ComponentSchema>;
export type TableComponent = z.infer<typeof schemas.TableComponentSchema>;
export type FormComponent = z.infer<typeof schemas.FormComponentSchema>;
export type MetricComponent = z.infer<typeof schemas.MetricComponentSchema>;
export type ChartComponent = z.infer<typeof schemas.ChartComponentSchema>;

// Export advanced types
export type MultiTenancyConfig = z.infer<typeof schemas.MultiTenancySchema>;
export type BillingConfig = z.infer<typeof schemas.BillingConfigSchema>;
export type PolarProduct = z.infer<typeof schemas.PolarProductSchema>;

// Export enums as types
export type DataType = z.infer<typeof schemas.DataTypeSchema>;
export type RelationType = z.infer<typeof schemas.RelationTypeSchema>;
export type Action = z.infer<typeof schemas.ActionSchema>;
export type PageLayout = z.infer<typeof schemas.PageLayoutSchema>;
export type RenderType = z.infer<typeof schemas.RenderTypeSchema>;
export type Theme = z.infer<typeof schemas.ThemeSchema>;
export type AuthConfig = z.infer<typeof schemas.AuthConfigSchema>;
export type RBACConfig = z.infer<typeof schemas.RBACConfigSchema>;
