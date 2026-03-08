import { google } from "@ai-sdk/google";
import { genUITools } from "@synth/ai";
import { schemaToPrompt } from "@synth/core";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

export const Route = createFileRoute("/api/gen-ui")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                try {
                    const body = await request.json();
                    const messages: UIMessage[] = body.messages;
                    const schema = body.schema || (messages[messages.length - 1] as any)?.data?.schema;

                    if (!schema) {
                        throw new Error("No database schema provided in request context.");
                    }

                    const schemaContext = schemaToPrompt(schema);

                    const result = streamText({
                        model: google("gemini-2.5-flash"),
                        system: `You are Synth, an expert AI assistant that generates admin panel UIs.
            Use the provided DATABASE SCHEMA to inform your UI choices.
            When the user asks to see data, use renderDataTable.
            When they ask for metrics, use renderMetricCard or renderChart.
            When they want to input data, use renderUserForm.
            To display a stack of notifications, alerts, or status messages, use renderToastStack.
            To organize content into collapsible sections (like FAQs or documentation), use renderAccordion.
            To provide a full CRUD interface for a dataset (Create, Read, Update, Delete), use renderCrudDataTable.
            To show a user profile or person info, use renderAvatarCard.
            To display a shopping cart or order summary, use renderCartSummaryPanel.
            To show a task list or checklist with a progress bar, use renderChecklistWithProgress.
            To show a table with user-toggleable columns, use renderColumnToggleTable.
            To show a table where cells can be edited in-place, use renderEditableDataTable.
            If you encounter an error or need a fallback UI, use renderFallbackComponent.
            To show multiple metrics in a grid layout, use renderMetricCardGrid.
            To capture complex information across multiple steps, use renderMultiStepForm.
            To track the progress of an order or shipment, use renderOrderStatusTracker.
            To safely collect payment card details for processing, use renderPaymentDetailsForm.
            To show a grid of products for shopping or selection, use renderProductCatalogGrid.
            To show a task or upload progress bar, use renderProgressBar.
            To ask the user for a star rating or feedback, use renderRatingSelector.
            To provide a search bar with toggleable category/filter chips, use renderSearchWithFilters.
            To organize content into tabs, use renderTabLayout.
            To show a list of team members or users with status, use renderTeamMemberList.
            To provide common theme customization (Light/Dark/System), use renderThemeToggle.
            To show a nested comment or discussion thread, use renderThreadedComments.
            To provide a single on/off toggle for a specific setting, use renderToggleSwitch.
            
            ${schemaContext}`,
                        messages: await convertToModelMessages(messages || []),
                        tools: genUITools,
                    });

                    return result.toUIMessageStreamResponse();
                } catch (error: any) {
                    console.error("Gen UI API error stack:", error?.stack);
                    return new Response(
                        JSON.stringify({
                            error: "Failed to process Gen UI request",
                            message: error?.message || String(error),
                            stack: error?.stack
                        }),
                        {
                            status: 500,
                            headers: { "Content-Type": "application/json" },
                        },
                    );
                }
            },
        },
    },
});
