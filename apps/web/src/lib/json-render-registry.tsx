"use client";

import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";
import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";

// Define the catalog with shadcn/ui component definitions
// This maps JSON schema definitions to component specifications
const catalog = defineCatalog(schema, {
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

// Create the registry with actual React component implementations
// This connects the catalog definitions to real UI components
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
