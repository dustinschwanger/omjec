import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'ohio-red': '#BA0C2F',
        'ohio-blue': '#003B7A',
        'text-dark': '#2C3E50',
        'text-light': '#6C757D',
        'bg-light': '#F8F9FA',
      },
    },
  },
  plugins: [],
};

export default config;
