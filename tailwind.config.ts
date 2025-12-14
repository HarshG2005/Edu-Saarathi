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
        // SAJID METHOD - Core Mapping
        background: "var(--bg-base)",
        foreground: "var(--text-primary)",

        card: {
          DEFAULT: "var(--bg-surface)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--text-primary)",
        },
        primary: {
          DEFAULT: "var(--brand-primary)",
          foreground: "var(--brand-primary-text)",
        },
        secondary: {
          DEFAULT: "var(--bg-elevated)", // Secondary actions often on elevated surfaces
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "var(--bg-surface)", // Muted backgrounds usually match card surface
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--bg-elevated)", // Accents often hover states
          foreground: "var(--brand-primary)",
        },
        destructive: {
          DEFAULT: "oklch(0.5 0.2 25)", // Accessible Red
          foreground: "oklch(0.98 0 0)",
        },
        border: "var(--border-subtle)",
        input: "var(--border-subtle)",
        ring: "var(--brand-primary)",

        // Chart colors - keeping standard HSL for now or mapping specific palette if needed
        // For strict Sajid method we would restrict these, but let's leave them for charts
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },

        // Sidebar - Mapping to Surface/Base
        sidebar: {
          DEFAULT: "var(--bg-base)",
          foreground: "var(--text-primary)",
          primary: "var(--brand-primary)",
          "primary-foreground": "var(--brand-primary-text)",
          accent: "var(--bg-elevated)",
          "accent-foreground": "var(--text-primary)",
          border: "var(--border-subtle)",
          ring: "var(--brand-primary)",
        },

        // Legacy GFG Tokens - Remapped for Backward Compatibility
        "gfg-green": {
          DEFAULT: "var(--brand-primary)",
          light: "var(--brand-primary-hover)",
          cta: "var(--brand-primary)",
        },
        "gfg-text": {
          DEFAULT: "var(--text-primary)",
          light: "var(--text-secondary)",
        },
        "gfg-bg": {
          DEFAULT: "var(--bg-base)",
          card: "var(--bg-surface)",
          nav: "var(--bg-elevated)",
          secondary: "var(--bg-surface)",
        },
        "gfg-border": {
          DEFAULT: "var(--border-subtle)",
          light: "var(--border-subtle)",
          medium: "var(--highlight-top)",
        },
        // Dark Mode Specific Tokens (Strict GFG Theme) - Remapped to Sajid Method
        "gfg-dark": {
          bg: "var(--bg-base)",
          panel: "var(--bg-elevated)", // Panels often elevated
          card: "var(--bg-surface)",
          border: "var(--border-subtle)",
          text: "var(--text-primary)",
          muted: "var(--text-secondary)",
          accent: "var(--brand-primary)",
          "accent-2": "var(--brand-primary-hover)",
          positive: "var(--gfg-dark-positive)", // Keep specific colors if variables not defined, or define them
          warning: "var(--gfg-dark-warning)",
          danger: "var(--gfg-dark-danger)",
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
        "gfg-light": "var(--shadow-card)",
        "gfg-dark": "var(--shadow-elevated)",
        "sm": "var(--shadow-card)",
        "md": "var(--shadow-elevated)",
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
