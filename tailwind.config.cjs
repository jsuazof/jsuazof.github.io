/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [require("@tailwindcss/typography"),require("daisyui")],
	daisyui: {
		themes: [
			{
				elegant: {
					"primary": "#2563eb",      // Sophisticated blue
					"secondary": "#64748b",    // Elegant slate gray
					"accent": "#0f766e",       // Professional teal
					"neutral": "#374151",      // Refined dark gray
					"base-100": "#ffffff",     // Clean white
					"base-200": "#f8fafc",     // Subtle light gray
					"base-300": "#e2e8f0",     // Soft border gray
					"info": "#0ea5e9",         // Information blue
					"success": "#059669",      // Success green
					"warning": "#d97706",      // Warning amber
					"error": "#dc2626",        // Error red
				},
			},
			{
				"elegant-dark": {
					"primary": "#3b82f6",      // Bright blue for dark mode
					"secondary": "#94a3b8",    // Light slate for contrast
					"accent": "#14b8a6",       // Bright teal
					"neutral": "#1f2937",      // Dark neutral
					"base-100": "#111827",     // Dark background
					"base-200": "#1f2937",     // Slightly lighter dark
					"base-300": "#374151",     // Border gray for dark
					"info": "#38bdf8",         // Light blue
					"success": "#10b981",      // Bright green
					"warning": "#f59e0b",      // Bright amber
					"error": "#ef4444",        // Bright red
				},
			},
		],
		darkTheme: "elegant-dark",
		logs: false,
	}
}
