import { VERSION } from "./schema";
import type { SynthConfig } from "./types";

export const EXAMPLE_ECOMMERCE_CONFIG: SynthConfig = {
	version: VERSION,
	metadata: {
		name: "E-commerce Admin",
		description: "Admin panel for managing products and orders",
		generatedAt: "2024-01-15T10:00:00Z",
		aiPrompt: "Create admin panel for products and orders",
	},
	database: {
		provider: "postgresql",
		tables: [
			{
				name: "products",
				displayName: "Products",
				primaryKey: "id",
				columns: [
					{ name: "id", type: "number", nullable: false, primaryKey: true },
					{ name: "name", type: "string", nullable: false },
					{ name: "price", type: "decimal", nullable: false },
					{ name: "stock", type: "number", nullable: false },
					{ name: "created_at", type: "datetime", nullable: false },
				],
				relations: [],
			},
			{
				name: "orders",
				displayName: "Orders",
				primaryKey: "id",
				columns: [
					{ name: "id", type: "number", nullable: false, primaryKey: true },
					{ name: "customer_name", type: "string", nullable: false },
					{ name: "total", type: "decimal", nullable: false },
					{
						name: "status",
						type: "enum",
						nullable: false,
						enumValues: ["pending", "shipped", "delivered"],
					},
					{ name: "created_at", type: "datetime", nullable: false },
				],
				relations: [],
			},
		],
	},
	auth: {
		enabled: true,
		providers: ["credentials"],
		userTable: "users",
		emailField: "email",
		plugins: {
			twoFactor: false,
			passkey: false,
			magicLink: false,
			admin: false,
			organization: false,
		},
	},
	rbac: {
		enabled: true,
		roles: [
			{
				id: "admin",
				name: "Administrator",
				permissions: [{ resource: "*", actions: ["*"] }],
			},
		],
		defaultRole: "admin",
	},
	pages: [
		{
			id: "products-list",
			path: "/products",
			title: "Products",
			layout: "table",
			dataSource: {
				table: "products",
			},
			access: {
				roles: ["admin"],
			},
			components: [
				{
					type: "table",
					columns: [
						{ field: "id", label: "ID", sortable: true, filterable: false },
						{ field: "name", label: "Name", sortable: true, filterable: false },
						{
							field: "price",
							label: "Price",
							render: "currency",
							sortable: true,
							filterable: false,
						},
						{
							field: "stock",
							label: "Stock",
							sortable: true,
							filterable: false,
						},
						{
							field: "created_at",
							label: "Created",
							render: "date",
							sortable: true,
							filterable: false,
						},
					],
					actions: [
						{ type: "edit", confirmation: false },
						{ type: "delete", confirmation: true },
					],
					pagination: true,
					pageSize: 10,
				},
			],
		},
	],
	theme: {
		layout: "sidebar",
		darkMode: false,
	},
};

export const EXAMPLE_ENTERPRISE_SAAS_CONFIG: SynthConfig = {
	version: VERSION,
	metadata: {
		name: "Enterprise SaaS CRM",
		description: "A multi-tenant CRM with search and background processing",
		generatedAt: "2024-03-01T12:00:00Z",
	},
	database: {
		provider: "postgresql",
		tables: [
			{
				name: "customers",
				displayName: "Customers",
				primaryKey: "id",
				columns: [
					{ name: "id", type: "uuid", nullable: false, primaryKey: true },
					{ name: "organization_id", type: "string", nullable: false },
					{ name: "name", type: "string", nullable: false },
					{ name: "email", type: "string", nullable: false },
					{ name: "bio", type: "text", nullable: true },
				],
				relations: [],
			},
		],
	},
	auth: {
		enabled: true,
		providers: ["credentials", "google", "passkey"],
		userTable: "users",
		emailField: "email",
		plugins: {
			twoFactor: true,
			passkey: true,
			organization: true,
			admin: true,
			magicLink: false,
		},
	},
	multiTenancy: {
		enabled: true,
		mode: "subdomain",
		orgTable: "organizations",
		memberTable: "members",
		invitationTable: "invitations",
		allowPublicOrgCreation: false,
	},
	rbac: {
		enabled: true,
		roles: [
			{
				id: "org_admin",
				name: "Organization Admin",
				permissions: [{ resource: "*", actions: ["*"] }],
			},
		],
		defaultRole: "org_admin",
	},
	billing: {
		enabled: true,
		provider: "polar",
		organizationId: "polar_org_123",
		products: [
			{
				id: "prod_basic",
				name: "Basic Plan",
				priceId: "price_basic_monthly",
				type: "subscription",
			},
			{
				id: "prod_pro",
				name: "Pro Plan",
				priceId: "price_pro_monthly",
				type: "subscription",
			},
		],
	},
	pages: [
		{
			id: "customers-list",
			path: "/customers",
			title: "Customers",
			layout: "table",
			dataSource: { table: "customers" },
			access: { roles: ["org_admin"] },
			components: [
				{
					type: "table",
					columns: [
						{ field: "name", label: "Name", sortable: true, filterable: true },
						{
							field: "email",
							label: "Email",
							sortable: true,
							filterable: true,
						},
					],
					pagination: true,
					pageSize: 20,
				},
			],
		},
	],
	theme: {
		primaryColor: "#000000",
		layout: "sidebar",
		darkMode: true,
	},
};
