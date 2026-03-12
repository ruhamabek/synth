import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";

// Define the catalog with shadcn/ui component definitions
// This maps JSON schema definitions to component specifications
export const catalog = defineCatalog(schema, {
	components: {
		// Layout components
		Card: shadcnComponentDefinitions.Card,
		Stack: shadcnComponentDefinitions.Stack,
		Grid: shadcnComponentDefinitions.Grid,
		Heading: shadcnComponentDefinitions.Heading,
		Text: shadcnComponentDefinitions.Text,
		Separator: shadcnComponentDefinitions.Separator,

		// Form components
		Button: shadcnComponentDefinitions.Button,
		Input: shadcnComponentDefinitions.Input,
		Textarea: shadcnComponentDefinitions.Textarea,
		Select: shadcnComponentDefinitions.Select,
		Checkbox: shadcnComponentDefinitions.Checkbox,
		Switch: shadcnComponentDefinitions.Switch,
		Slider: shadcnComponentDefinitions.Slider,
		Radio: shadcnComponentDefinitions.Radio,

		// Data display
		Table: shadcnComponentDefinitions.Table,
		Badge: shadcnComponentDefinitions.Badge,
		Avatar: shadcnComponentDefinitions.Avatar,
		Image: shadcnComponentDefinitions.Image,

		// Feedback
		Alert: shadcnComponentDefinitions.Alert,
		Progress: shadcnComponentDefinitions.Progress,
		Skeleton: shadcnComponentDefinitions.Skeleton,
		Spinner: shadcnComponentDefinitions.Spinner,

		// Navigation
		Tabs: shadcnComponentDefinitions.Tabs,
		Accordion: shadcnComponentDefinitions.Accordion,
		Collapsible: shadcnComponentDefinitions.Collapsible,

		// Overlay
		Dialog: shadcnComponentDefinitions.Dialog,
		Drawer: shadcnComponentDefinitions.Drawer,
		Popover: shadcnComponentDefinitions.Popover,
		Tooltip: shadcnComponentDefinitions.Tooltip,
		DropdownMenu: shadcnComponentDefinitions.DropdownMenu,

		// Carousel
		Carousel: shadcnComponentDefinitions.Carousel,

		// Toggle components
		Toggle: shadcnComponentDefinitions.Toggle,
		ToggleGroup: shadcnComponentDefinitions.ToggleGroup,
		ButtonGroup: shadcnComponentDefinitions.ButtonGroup,

		// Link
		Link: shadcnComponentDefinitions.Link,

		// Pagination
		Pagination: shadcnComponentDefinitions.Pagination,
	},
	actions: {},
});
