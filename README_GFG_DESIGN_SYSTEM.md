# GeeksforGeeks (GFG) Design System Implementation

This document outlines the implementation of the GeeksforGeeks (GFG) design system in the EduQuest AI application. The design system focuses on a clean, professional, and content-focused UI with a specific color palette, typography, and component styling that mirrors the GFG aesthetic.

## 1. Core Design Principles

-   **Content-First:** The UI is designed to prioritize content readability and accessibility.
-   **Clean & Minimal:** Uses a refined color palette and ample whitespace.
-   **Consistent:** Standardized spacing, typography, and component behavior.
-   **Accessible:** WCAG AA compliant contrast ratios and keyboard navigation.
-   **Themeable:** Full support for Light and Dark modes.

## 2. Color Palette

The design system uses a semantic color scale defined in `src/styles/theme.css` and extended in `tailwind.config.ts`.

### Light Mode
-   **Primary Green:** `#2f8d46` (GFG Green)
-   **Background:** `#f0f2f5` (Light Gray)
-   **Card Background:** `#ffffff` (White)
-   **Text Primary:** `#1f1f1f` (Dark Gray)
-   **Text Secondary:** `#666666` (Medium Gray)
-   **Border:** `#e0e0e0` (Light Gray)

### Dark Mode
-   **Primary Green:** `#2f8d46` (GFG Green - kept consistent for brand identity)
-   **Background:** `#1a1a1a` (Dark Gray)
-   **Card Background:** `#242526` (Darker Gray)
-   **Text Primary:** `#e4e6eb` (Off-White)
-   **Text Secondary:** `#b0b3b8` (Light Gray)
-   **Border:** `#3e4042` (Dark Gray)

## 3. Typography

-   **Font Family:** System sans-serif stack (`Segoe UI`, `Roboto`, `Helvetica Neue`, `Arial`, `sans-serif`).
-   **Scale:**
    -   `h1`: 2.25rem (36px), Bold
    -   `h2`: 1.875rem (30px), Bold
    -   `h3`: 1.5rem (24px), SemiBold
    -   `body`: 1rem (16px), Regular
    -   `small`: 0.875rem (14px), Regular

## 4. Components

### Buttons
-   **Primary (CTA):** Solid GFG Green background, white text. Hover: Darker Green.
-   **Secondary (Outline):** Transparent background, GFG Green border and text. Hover: Light Green background.
-   **Ghost:** Transparent background, text color. Hover: Light Gray background.

### Cards
-   **Style:** Rounded corners (`rounded-xl`), subtle shadow (`shadow-sm`), border (`border`).
-   **Interaction:** Hover effects for interactive cards (shadow increase, border color change).

### Inputs
-   **Style:** Clean border, rounded corners, focus ring with GFG Green.
-   **States:** Default, Focus, Error, Disabled.

### Navigation
-   **Sidebar:** Persistent left navigation with icon + label. Active state highlighted with GFG Green.
-   **Navbar:** Top navigation for global actions and theme toggle.

## 5. Theming Implementation

The theming system is built using CSS variables and a React Context provider.

-   **`src/styles/theme.css`**: Defines CSS variables for colors (e.g., `--gfg-green`, `--gfg-bg`).
-   **`tailwind.config.ts`**: Maps Tailwind utility classes to these CSS variables (e.g., `bg-gfg-green` -> `var(--gfg-green)`).
-   **`ThemeProvider`**: Manages the current theme state (`light`, `dark`, `system`) and persists it to `localStorage`.
-   **`ThemeToggle`**: A component that allows users to switch between themes.

## 6. Usage

To use the design system in new components:

1.  **Colors:** Use the `gfg-` prefixed utility classes (e.g., `text-gfg-text`, `bg-gfg-card`).
2.  **Dark Mode:** Use the `dark:` modifier (e.g., `dark:text-gfg-dark-text`, `dark:bg-gfg-dark-card`).
3.  **Components:** Import base components from `@/components/ui/...` which have been pre-styled.

## 7. File Structure

-   `client/src/index.css`: Global styles and Tailwind directives.
-   `client/src/styles/theme.css`: CSS variable definitions.
-   `client/src/components/ui/`: Reusable UI components (Button, Card, Input, etc.).
-   `client/src/components/theme-provider.tsx`: Theme context provider.
-   `client/src/components/ui/theme-toggle.tsx`: Theme switcher component.

## 8. Future Improvements

-   Add more granular spacing tokens.
-   Implement a more robust animation system.
-   Expand the icon set.
