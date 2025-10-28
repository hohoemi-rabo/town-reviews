import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Washi theme colors
        washi: {
          beige: '#f5ebe0',
          'beige-dark': '#e8dcc8',
          green: '#2d5016',
          'green-light': '#4a7c2c',
          orange: '#ff8c42',
          'orange-light': '#ffa566',
        },
      },
      fontFamily: {
        sans: ["var(--font-zen-maru-gothic)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'washi': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
};

export default config;
