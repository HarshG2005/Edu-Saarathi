# EduQuest UI Transformation - GeeksforGeeks Design System

This document outlines the design system and UI transformation applied to the EduQuest application to match the GeeksforGeeks (GFG) aesthetic.

## 🎨 Design Philosophy
The new design focuses on:
- **Cleanliness & Readability**: High contrast text on neutral backgrounds.
- **Professionalism**: A restrained color palette dominated by the GFG Green (#2F8D46) and neutral grays.
- **Consistency**: Unified spacing, typography, and component styling.
- **Functionality**: Clear visual hierarchy for educational content.

## 🛠️ Configuration & Tokens

### Colors
All colors are defined in `tailwind.config.ts` under `theme.extend.colors`.

| Token | Value | Usage |
|-------|-------|-------|
| `gfg-green` | `#2F8D46` | Primary brand color, buttons, active states |
| `gfg-green-light` | `#28A745` | Accents, success messages |
| `gfg-green-cta` | `#00A15C` | Call-to-action buttons |
| `gfg-text` | `#333333` | Primary text, headings |
| `gfg-text-light` | `#6A6A6A` | Secondary text, descriptions |
| `gfg-bg` | `#F7F7F7` | Page background, section background |
| `gfg-card` | `#FFFFFF` | Card background |
| `gfg-nav` | `#0F0F0F` | Navbar background |
| `gfg-border-light` | `#E5E5E5` | Subtle borders |
| `gfg-border-medium` | `#CCCCCC` | Input borders, dividers |

### Typography
Font Family: `"Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"`

| Element | Size | Weight | Class |
|---------|------|--------|-------|
| H1 | 32-36px | Semibold (600) | `text-3xl font-semibold` |
| H2 | 28px | Semibold (600) | `text-2xl font-semibold` |
| H3 | 22-24px | Semibold (600) | `text-xl font-semibold` |
| Body | 14-16px | Normal (400) | `text-base` |
| Small | 12-13px | Medium (500) | `text-sm font-medium` |

### Spacing System
Based on a 4px grid: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`.

## 🧩 Component Guidelines

### Buttons (`src/components/ui/button.tsx`)
- **Primary**: Green background, white text. Used for main actions.
- **Secondary**: Green border, green text. Used for alternative actions.
- **Tertiary**: Text only, hover underline. Used for less important links.

### Cards (`src/components/ui/card.tsx`)
- White background (`#FFFFFF`)
- 1px solid light border (`#E5E5E5`)
- Subtle shadow (`0px 2px 6px rgba(0,0,0,0.06)`)
- Hover: Slight lift and increased shadow.

### Inputs (`src/components/ui/input.tsx`)
- White background
- Border `#CCCCCC`
- Focus: Green border `#2F8D46`
- Padding: `10-14px`

### Navbar (`src/components/ui/navbar.tsx`)
- Dark background (`#0F0F0F`)
- Sticky positioning
- Responsive hamburger menu on mobile

## 📄 How to Extend
1. **New Colors**: Add to `tailwind.config.ts` using the `gfg-` prefix.
2. **New Components**: Build using the `gfg-card` and `gfg-text` utility classes.
3. **Layouts**: Use the `Section` component to ensure max-width and centering.

## ↩️ Reverting Changes
To revert to the previous design:
1. Revert `tailwind.config.ts` to the previous commit.
2. Revert `src/index.css`.
3. Restore original component files in `src/components/ui/`.
