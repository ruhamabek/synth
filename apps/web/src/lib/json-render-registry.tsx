import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import { catalog } from "./catalog";

export const { registry } = defineRegistry(catalog, {
	components: {
		// Layout components
		Card: shadcnComponents.Card,
		Stack: shadcnComponents.Stack,
		Grid: shadcnComponents.Grid,
		Heading: shadcnComponents.Heading,
		Text: shadcnComponents.Text,
		Separator: shadcnComponents.Separator,

		// Form components
		Button: shadcnComponents.Button,
		Input: shadcnComponents.Input,
		Textarea: shadcnComponents.Textarea,
		Select: shadcnComponents.Select,
		Checkbox: shadcnComponents.Checkbox,
		Switch: shadcnComponents.Switch,
		Slider: shadcnComponents.Slider,
		Radio: shadcnComponents.Radio,

		// Data display
		Table: shadcnComponents.Table,
		Badge: shadcnComponents.Badge,
		Avatar: shadcnComponents.Avatar,
		Image: shadcnComponents.Image,

		// Feedback
		Alert: shadcnComponents.Alert,
		Progress: shadcnComponents.Progress,
		Skeleton: shadcnComponents.Skeleton,
		Spinner: shadcnComponents.Spinner,

		// Navigation
		Tabs: shadcnComponents.Tabs,
		Accordion: shadcnComponents.Accordion,
		Collapsible: shadcnComponents.Collapsible,

		// Overlay
		Dialog: shadcnComponents.Dialog,
		Drawer: shadcnComponents.Drawer,
		Popover: shadcnComponents.Popover,
		Tooltip: shadcnComponents.Tooltip,
		DropdownMenu: shadcnComponents.DropdownMenu,

		// Carousel
		Carousel: shadcnComponents.Carousel,

		// Toggle components
		Toggle: shadcnComponents.Toggle,
		ToggleGroup: shadcnComponents.ToggleGroup,
		ButtonGroup: shadcnComponents.ButtonGroup,

		// Link
		Link: shadcnComponents.Link,

		// Pagination
		Pagination: shadcnComponents.Pagination,
	},
});
