import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "0.5rem", // 8px
        md: "0.375rem", // 6px
        sm: "0.25rem", // 4px
      },
      colors: {
        // GFG Brand Colors - Mapped to CSS Variables
        "gfg-green": {
          DEFAULT: "var(--gfg-green)",
          light: "var(--gfg-green-light)",
          cta: "var(--gfg-green-cta)",
        },
        "gfg-text": {
          DEFAULT: "var(--gfg-text)",
          light: "var(--gfg-muted)",
        },
        "gfg-bg": {
          DEFAULT: "var(--gfg-bg)",
          card: "var(--gfg-card)",
          nav: "var(--gfg-nav)",
          secondary: "var(--gfg-bg)", // Fallback/alias
        },
        "gfg-border": {
          DEFAULT: "var(--gfg-border)",
          light: "var(--gfg-border)",
          medium: "var(--gfg-border)",
        },

        // Dark Mode Specific Tokens (Strict GFG Theme)
        "gfg-dark": {
          bg: "#0A0A0A",
          panel: "#0C0C0C",
          card: "#111111",
          border: "rgba(255,255,255,0.06)",
          text: "#E6F0E9",
          muted: "#9DBAA7",
          accent: "#2F8D46",
          "accent-2": "#28A745",
          positive: "#00C96B",
          warning: "#E3A008",
          danger: "#EF4444",
        },

        // Semantic Colors
        success: "#28A745",
        warning: "#FFC107",
        error: "#DC3545",
        info: "#17A2B8",

        // Keeping existing shadcn/ui variables mapped to GFG colors where appropriate
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: [
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      spacing: {
        "4px": "4px",
        "8px": "8px",
        "12px": "12px",
        "16px": "16px",
        "24px": "24px",
        "32px": "32px",
        "48px": "48px",
      },
      boxShadow: {
        "gfg-light": "0 2px 6px rgba(0,0,0,0.06)",
        "gfg-dark": "0 8px 28px rgba(0,0,0,0.65)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
