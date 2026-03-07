import { VERSION } from "./schema";
import type {
	AuthConfig,
	BillingConfig,
	MultiTenancyConfig,
	RBACConfig,
	SynthConfig,
	Theme,
} from "./types";

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
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
};

export const DEFAULT_RBAC_CONFIG: RBACConfig = {
	enabled: false,
	roles: [],
	defaultRole: "user",
};

export const DEFAULT_THEME: Theme = {
	layout: "sidebar",
	darkMode: false,
};

export const DEFAULT_MULTI_TENANCY_CONFIG: MultiTenancyConfig = {
	enabled: false,
	mode: "path",
	orgTable: "organizations",
	memberTable: "members",
	invitationTable: "invitations",
	allowPublicOrgCreation: true,
};

export const DEFAULT_BILLING_CONFIG: BillingConfig = {
	enabled: false,
	provider: "polar",
	products: [],
};

export function createDefaultConfig(
	name: string,
	database: SynthConfig["database"],
): SynthConfig {
	return {
		version: VERSION,
		metadata: {
			name,
			generatedAt: new Date().toISOString(),
		},
		database,
		auth: DEFAULT_AUTH_CONFIG,
		rbac: DEFAULT_RBAC_CONFIG,
		multiTenancy: DEFAULT_MULTI_TENANCY_CONFIG,
		billing: DEFAULT_BILLING_CONFIG,
		pages: [],
		theme: DEFAULT_THEME,
	};
}
