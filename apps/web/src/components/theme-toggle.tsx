import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const [isDark, setIsDark] = useState(true);

	useEffect(() => {
		const html = document.documentElement;
		setIsDark(html.classList.contains("dark"));
	}, []);

	const toggle = () => {
		const html = document.documentElement;
		const next = !isDark;
		if (next) {
			html.classList.add("dark");
		} else {
			html.classList.remove("dark");
		}
		setIsDark(next);
	};

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label="Toggle theme"
			className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
		>
			{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
		</button>
	);
}
