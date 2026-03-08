import { tool } from "ai";
import { z } from "zod";

/**
 * Tool definitions for the Generative UI engine.
 * These map to the AgenticGenUI component registry.
 */
export const renderDataTable = tool({
    description: "Render a data table for a specific database table.",
    inputSchema: z.object({
        table: z.string().describe("The name of the database table to display."),
        columns: z.array(z.object({
            field: z.string(),
            header: z.string(),
        })).describe("List of columns to show."),
        title: z.string().optional().describe("Title of the table component."),
    }),
    execute: async (args) => {
        // In a real scenario, this would fetch actual data from the database
        return { ...args, mockData: [] };
    },
});

export const renderMetricCard = tool({
    description: "Render a card showing a specific metric or aggregated value.",
    inputSchema: z.object({
        title: z.string().describe("The label for the metric (e.g., 'Total Users')."),
        value: z.string().describe("The formatted value to display."),
        trend: z.object({
            value: z.number(),
            isPositive: z.boolean(),
        }).optional(),
        icon: z.string().optional().describe("Icon name from Lucide (e.g., 'users', 'dollar-sign')."),
    }),
    execute: async (args) => args,
});

export const renderChart = tool({
    description: "Render a data visualization chart (bar, line, pie).",
    inputSchema: z.object({
        title: z.string(),
        type: z.enum(["bar", "line", "pie", "area"]),
        data: z.array(z.any()),
        xAxis: z.string(),
        yAxis: z.string(),
    }),
    execute: async (args) => args,
});

export const renderUserForm = tool({
    description: "Render a form to capture user input for creating or editing data.",
    inputSchema: z.object({
        title: z.string(),
        fields: z.array(z.object({
            name: z.string(),
            label: z.string(),
            type: z.enum(["text", "number", "email", "select", "date"]),
            options: z.array(z.string()).optional(),
        })),
        submitLabel: z.string().optional(),
    }),
    execute: async (args) => args,
});

export const renderToastStack = tool({
    description: "Render a stack of dismissible notifications or toasts.",
    inputSchema: z.object({
        title: z.string().describe("The titles for the notification stack."),
        description: z.string().optional().describe("Optional description for the notifications."),
        toasts: z.array(z.object({
            id: z.string(),
            message: z.string(),
            type: z.enum(["info", "success", "warning", "error"]),
            duration: z.number().optional(),
        })).optional(),
    }),
    execute: async (args) => {
        return args;
    },
});

export const renderAccordion = tool({
    description: "Render an accordion with multiple collapsible sections.",
    inputSchema: z.object({
        title: z.string().describe("The title of the accordion section."),
        description: z.string().optional().describe("A brief description of the accordion."),
        items: z.array(z.object({
            id: z.string().describe("A unique identifier for the accordion item."),
            title: z.string().describe("The title of the accordion item."),
            content: z.string().describe("The content of the accordion item."),
        })).describe("The list of items to display in the accordion."),
        defaultValue: z.string().optional().describe("The ID of the item that should be open by default."),
        collapsible: z.boolean().optional().describe("Whether the accordion can be fully collapsed (default: true)."),
    }),
    execute: async (args) => {
        return args;
    },
});

export const renderCrudDataTable = tool({
    description: "Render a table with Create, Read, Update, and Delete capabilities.",
    inputSchema: z.object({
        title: z.string(),
        description: z.string().optional(),
        columns: z.array(z.object({
            key: z.string(),
            label: z.string(),
        })).optional(),
        data: z.array(z.any()).optional(),
        formFields: z.array(z.object({
            id: z.string(),
            label: z.string(),
            type: z.enum(["text", "number", "select", "email", "tel", "date"]),
            required: z.boolean().optional(),
            options: z.array(z.string()).optional(),
        })).optional(),
    }),
    execute: async (args) => args,
});

export const renderAvatarCard = tool({
    description: "Render a user profile card with an avatar and info.",
    inputSchema: z.object({
        name: z.string(),
        role: z.string().optional(),
        imageUrl: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["online", "offline", "away", "busy"]).optional(),
        badges: z.array(z.string()).optional(),
    }),
    execute: async (args) => args,
});

export const renderCartSummaryPanel = tool({
    description: "Render a shopping cart summary with item management.",
    inputSchema: z.object({
        title: z.string(),
        description: z.string().optional(),
        items: z.array(z.object({
            id: z.string(),
            name: z.string(),
            price: z.number(),
            quantity: z.number(),
            imageUrl: z.string().optional(),
        })),
        currency: z.string().optional(),
    }),
    execute: async (args) => args,
});

export const renderChecklistWithProgress = tool({
    description: "Render a checklist that tracks progress as items are checked.",
    inputSchema: z.object({
        title: z.string(),
        description: z.string().optional(),
        items: z.array(z.object({
            id: z.string(),
            label: z.string(),
            checked: z.boolean(),
        })),
    }),
    execute: async (args) => args,
});

export const renderColumnToggleTable = tool({
    description: "Render a table where users can toggle column visibility.",
    inputSchema: z.object({
        title: z.string(),
        description: z.string().optional(),
        columns: z.array(z.object({
            key: z.string(),
            label: z.string(),
        })),
        rows: z.array(z.any()),
        visibleColumns: z.array(z.string()).optional(),
    }),
    execute: async (args) => args,
});

export const renderEditableDataTable = tool({
    description: "Render a table with in-place cell editing.",
    inputSchema: z.object({
        title: z.string(),
        description: z.string().optional(),
        columns: z.array(z.object({
            key: z.string(),
            label: z.string(),
            type: z.enum(["text", "number", "select"]).optional(),
            options: z.array(z.string()).optional(),
            editable: z.boolean().optional(),
        })).optional(),
        data: z.array(z.any()).optional(),
    }),
    execute: async (args) => args,
});

export const renderFallbackComponent = tool({
    description: "Render a fallback UI when a component fails or is unknown.",
    inputSchema: z.object({
        componentType: z.string(),
        props: z.record(z.string(), z.any()),
        error: z.string().optional(),
    }),
    execute: async (args) => args,
});

export const renderMetricCardGrid = tool({
    description: "Render a responsive grid of metric cards.",
    inputSchema: z.object({
        metrics: z.array(z.object({
            name: z.string(),
            value: z.union([z.string(), z.number()]),
            icon: z.string().optional(),
            description: z.string().optional(),
            trend: z.object({
                value: z.number(),
                isPositive: z.boolean(),
            }).optional(),
        })),
    }),
    execute: async (args) => args,
});

export const renderMultiStepForm = tool({
    description: "Render a multi-step form wizard with progress indicator.",
    inputSchema: z.object({
        title: z.string(),
        description: z.string().optional(),
        steps: z.array(z.object({
            title: z.string(),
            description: z.string().optional(),
            fields: z.array(z.object({
                id: z.string(),
                label: z.string(),
                type: z.enum(["text", "email", "number", "textarea", "select"]),
                placeholder: z.string().optional(),
                required: z.boolean().optional(),
                options: z.array(z.string()).optional(),
            })),
        })),
        submitLabel: z.string().optional(),
    }),
    execute: async (args) => args,
});

export const renderOrderStatusTracker = tool({
    description: "Render a visual tracker for order status progress.",
    inputSchema: z.object({
        title: z.string(),
        description: z.string().optional(),
        status: z.string(),
        steps: z.array(z.object({
            id: z.string(),
            label: z.string(),
            description: z.string().optional(),
            date: z.string().optional(),
            icon: z.enum(["order", "processing", "shipping", "delivered"]).optional(),
        })),
    }),
    execute: async (args) => args,
});

export const renderPaymentDetailsForm = tool({
    description: "Render a form to capture payment details securely.",
    inputSchema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        amount: z.number().optional(),
        currency: z.string().optional(),
    }),
    execute: async (args) => args,
});

export const renderProductCatalogGrid = tool({
    description: "Render a grid of products for browsing and selection.",
    inputSchema: z.object({
        title: z.string(),
        description: z.string().optional(),
        products: z.array(z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().optional(),
            price: z.number(),
            imageUrl: z.string().optional(),
            category: z.string().optional(),
            inStock: z.boolean().optional(),
        })),
        currency: z.string().optional(),
    }),
    execute: async (args) => args,
});

export const renderProgressBar = tool({
    description: "Render a progress bar to track task completion.",
    inputSchema: z.object({
        title: z.string(),
        description: z.string().optional(),
        value: z.number().min(0).max(100),
        status: z.enum(["loading", "success", "error", "default"]).optional(),
        allowCancel: z.boolean().optional(),
        allowComplete: z.boolean().optional(),
    }),
    execute: async (args) => args,
});

export const renderRatingSelector = tool({
    description: "Render a star rating selector for user feedback.",
    inputSchema: z.object({
        title: z.string(),
        description: z.string().optional(),
        initialRating: z.number().optional(),
        maxRating: z.number().optional(),
        allowHalf: z.boolean().optional(),
    }),
    execute: async (args) => args,
});

export const renderSearchWithFilters = tool({
    description: "Render a search bar with toggleable filter chips.",
    inputSchema: z.object({
        placeholder: z.string().optional(),
        initialQuery: z.string().optional(),
        filters: z.array(z.object({
            id: z.string(),
            label: z.string(),
            isActive: z.boolean(),
        })).optional(),
    }),
    execute: async (args) => args,
});

export const renderTabLayout = tool({
    description: "Render a tabbed interface for organizing content.",
    inputSchema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        tabs: z.array(z.object({
            id: z.string(),
            label: z.string(),
            content: z.string(),
        })),
        defaultTabId: z.string().optional(),
    }),
    execute: async (args) => args,
});

export const renderTeamMemberList = tool({
    description: "Render a list of team members with status and details.",
    inputSchema: z.object({
        title: z.string(),
        description: z.string().optional(),
        members: z.array(z.object({
            id: z.string(),
            name: z.string(),
            role: z.string(),
            avatarUrl: z.string().optional(),
            status: z.enum(["online", "offline", "busy", "away"]),
            skills: z.array(z.string()).optional(),
        })),
    }),
    execute: async (args) => args,
});

export const renderThemeToggle = tool({
    description: "Render a theme switcher for light, dark, or system modes.",
    inputSchema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        initialTheme: z.enum(["light", "dark", "system"]).optional(),
    }),
    execute: async (args) => args,
});

export const renderThreadedComments = tool({
    description: "Render a nested comment thread with replies and actions.",
    inputSchema: z.object({
        title: z.string(),
        description: z.string().optional(),
        comments: z.array(z.object({
            id: z.string(),
            author: z.object({
                name: z.string(),
                avatarUrl: z.string().optional(),
            }),
            content: z.string(),
            timestamp: z.string(),
            likes: z.number().optional(),
            replies: z.array(z.any()).optional(), // Recursion is tricky in Zod/Tools
        })),
    }),
    execute: async (args) => args,
});

export const renderToggleSwitch = tool({
    description: "Render a simple on/off toggle switch for a setting.",
    inputSchema: z.object({
        title: z.string(),
        description: z.string().optional(),
        initialChecked: z.boolean().optional(),
        label: z.string().optional(),
    }),
    execute: async (args) => args,
});

export const genUITools = {
    renderDataTable,
    renderMetricCard,
    renderChart,
    renderUserForm,
    renderToastStack,
    renderAccordion,
    renderCrudDataTable,
    renderAvatarCard,
    renderCartSummaryPanel,
    renderChecklistWithProgress,
    renderColumnToggleTable,
    renderEditableDataTable,
    renderFallbackComponent,
    renderMetricCardGrid,
    renderMultiStepForm,
    renderOrderStatusTracker,
    renderPaymentDetailsForm,
    renderProductCatalogGrid,
    renderProgressBar,
    renderRatingSelector,
    renderSearchWithFilters,
    renderTabLayout,
    renderTeamMemberList,
    renderThemeToggle,
    renderThreadedComments,
    renderToggleSwitch,
};
