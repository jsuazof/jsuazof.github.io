/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [require("@tailwindcss/typography"),require("daisyui")],
	daisyui: {
		themes: [
			"light",
			"dark",
			{
				elegant: {
					"primary": "#2563eb",
					"secondary": "#64748b",
					"accent": "#0f766e",
					"neutral": "#374151",
					"base-100": "#ffffff",
					"base-200": "#f8fafc",
					"base-300": "#e2e8f0",
					"info": "#0ea5e9",
					"success": "#059669",
					"warning": "#d97706",
					"error": "#dc2626",
				},
				"elegant-dark": {
					"primary": "#3b82f6",
					"secondary": "#94a3b8",
					"accent": "#14b8a6",
					"neutral": "#1f2937",
					"base-100": "#111827",
					"base-200": "#1f2937",
					"base-300": "#374151",
					"info": "#38bdf8",
					"success": "#10b981",
					"warning": "#f59e0b",
					"error": "#ef4444",
				},
			},
		],
		darkTheme: "elegant-dark"
	}
}
