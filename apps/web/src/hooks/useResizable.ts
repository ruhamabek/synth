import { useState, useCallback, useEffect, useRef } from "react";

export function useResizable({
	initialWidth,
	minWidth,
	maxWidth,
	direction = "left",
}: {
	initialWidth: number;
	minWidth: number;
	maxWidth?: number;
	direction?: "left" | "right";
}) {
	const [width, setWidth] = useState(initialWidth);
	const [isResizing, setIsResizing] = useState(false);
	const resizeRef = useRef<number | null>(null);

	const startResizing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
		e.preventDefault();
		setIsResizing(true);
		const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
		resizeRef.current = clientX;
	}, []);

	const stopResizing = useCallback(() => {
		setIsResizing(false);
		resizeRef.current = null;
	}, []);

	const resize = useCallback(
		(e: MouseEvent | TouchEvent) => {
			if (!isResizing || resizeRef.current === null) return;

			const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
			const delta = resizeRef.current - clientX;
			resizeRef.current = clientX;

			setWidth((prevWidth) => {
				const newWidth = direction === "left" ? prevWidth + delta : prevWidth - delta;
				if (newWidth < minWidth) return minWidth;
				if (maxWidth && newWidth > maxWidth) return maxWidth;
				return newWidth;
			});
		},
		[isResizing, minWidth, maxWidth, direction],
	);

	useEffect(() => {
		if (isResizing) {
			window.addEventListener("mousemove", resize);
			window.addEventListener("mouseup", stopResizing);
			window.addEventListener("touchmove", resize);
			window.addEventListener("touchend", stopResizing);
		} else {
			window.removeEventListener("mousemove", resize);
			window.removeEventListener("mouseup", stopResizing);
			window.removeEventListener("touchmove", resize);
			window.removeEventListener("touchend", stopResizing);
		}

		return () => {
			window.removeEventListener("mousemove", resize);
			window.removeEventListener("mouseup", stopResizing);
			window.removeEventListener("touchmove", resize);
			window.removeEventListener("touchend", stopResizing);
		};
	}, [isResizing, resize, stopResizing]);

	return { width, isResizing, startResizing };
}
