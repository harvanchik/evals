/**
 * Darkens a hex color by a specified percentage.
 * @param {string} hex - The hex color string (e.g., "#RRGGBB").
 * @param {number} percent - The percentage to darken by (0-100).
 * @returns {string} The new darker hex color string.
 */
export function darkenColor(hex: string, percent: number): string {
	if (!hex) return '#000000';

	let color = hex.startsWith('#') ? hex.slice(1) : hex;

	if (color.length === 3) {
		color = color
			.split('')
			.map((char) => char + char)
			.join('');
	}

	const f = parseInt(color, 16);

	const R = f >> 16;
	const G = (f >> 8) & 0x00ff;
	const B = f & 0x0000ff;

	const darkR = Math.round(R * (1 - percent / 100));
	const darkG = Math.round(G * (1 - percent / 100));
	const darkB = Math.round(B * (1 - percent / 100));

	return `#${((darkR << 16) | (darkG << 8) | darkB).toString(16).padStart(6, '0')}`;
}

/**
 * Converts a hex color string to an RGB string.
 * @param {string} hex - The hex color string (e.g., "#RRGGBB").
 * @returns {string | null} An RGB string "R, G, B" or null if invalid.
 */
export function hexToRgb(hex: string): string | null {
	if (!hex) return null;

	let color = hex.startsWith('#') ? hex.slice(1) : hex;

	if (color.length === 3) {
		color = color
			.split('')
			.map((char) => char + char)
			.join('');
	}

	if (color.length !== 6) return null;

	const f = parseInt(color, 16);
	const R = f >> 16;
	const G = (f >> 8) & 0x00ff;
	const B = f & 0x0000ff;

	return `${R}, ${G}, ${B}`;
}
