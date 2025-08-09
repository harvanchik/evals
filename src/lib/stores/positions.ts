import { writable } from 'svelte/store';

// Use any type for serialized data to avoid type conflicts
export const positions = writable<any[]>([]);

// Helper function to get position by title
export function getPositionByTitle(
	title: string | null | undefined,
	positionsData: any[]
): any | undefined {
	if (!title) return undefined;
	return positionsData.find((p) => p.title?.toLowerCase() === title.toLowerCase());
}

// Helper function to get position color by title
export function getPositionColor(title: string | null | undefined, positionsData: any[]): string {
	const position = getPositionByTitle(title, positionsData);
	return position?.color || '#6b7280'; // Default to gray-500
}

// Helper function to get border class for position
export function getPositionBorderClass(
	title: string | null | undefined,
	positionsData: any[]
): string {
	const color = getPositionColor(title, positionsData);
	return `border-[${color}]`;
}
