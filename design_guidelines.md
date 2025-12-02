# EduQuest Local — Design Guidelines

## Design Approach

**Selected Approach**: Design System + Reference-Based Hybrid  
**Primary References**: Notion (document organization), Linear (clean functionality), Obsidian (knowledge management)  
**Justification**: This is a utility-focused, information-dense productivity tool where efficiency, learnability, and focus are paramount. Users need clear navigation between multiple feature modes while maintaining a distraction-free study environment.

## Core Design Principles

1. **Clarity Over Decoration**: Every element serves a functional purpose
2. **Cognitive Load Reduction**: Clear visual hierarchy minimizes decision fatigue during study sessions
3. **Feature Accessibility**: All major features (MCQ, flashcards, mindmap, etc.) easily discoverable and switchable
4. **Content-First**: The user's study materials take center stage, UI recedes into background

## Typography

**Font Stack**:
- **Primary**: Inter (via Google Fonts CDN) - body text, UI elements, data displays
- **Headings**: Inter Semi-Bold/Bold - maintains cohesive, professional look
- **Monospace**: JetBrains Mono - for any code snippets or technical content in PDFs

**Type Scale**:
- Display (page titles): text-3xl (30px) font-bold
- Section headers: text-2xl (24px) font-semibold
- Card titles: text-lg (18px) font-medium
- Body text: text-base (16px) font-normal
- Small text/metadata: text-sm (14px) font-normal
- Captions: text-xs (12px)

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20** consistently
- Micro spacing (within components): p-2, gap-2
- Component padding: p-4, p-6
- Section spacing: p-8, py-12
- Major layout gaps: gap-6, gap-8
- Page margins: px-6, px-8

**Grid Structure**:
- Main app uses sidebar + content area layout (not traditional landing page)
- Sidebar: fixed w-64 on desktop, collapsible on mobile
- Content area: flex-1 with max-w-7xl container, px-6 py-8
- Feature grids (MCQ, flashcards): grid with gap-6, responsive cols (1/2/3)

## Application Shell

**Primary Layout**:
```
┌─────────────┬──────────────────────────┐
│             │                          │
│  Sidebar    │    Main Content Area     │
│  (w-64)     │    (flex-1, max-w-7xl)   │
│             │                          │
│  - Library  │    Feature-specific      │
│  - Features │    content with          │
│  - Settings │    breadcrumbs + actions │
│             │                          │
└─────────────┴──────────────────────────┘
```

**Sidebar Structure**:
- App logo/title at top (h-16)
- Primary navigation sections with clear icons (Heroicons)
- Document library with search/filter
- Feature selector (MCQ, Flashcards, Mindmap, Summary, Notes, Tutor, Quiz)
- Progress indicator at bottom
- Settings/preferences toggle

**Top Bar** (within content area):
- Breadcrumb navigation (text-sm)
- Current document/feature title (text-2xl font-bold)
- Action buttons (Export, Regenerate, Settings) aligned right

## Component Library

### Document Cards (Library View)
- Rounded corners (rounded-lg)
- Subtle border
- Padding: p-6
- Document icon + title (text-lg font-semibold)
- Metadata row: file size, page count, date uploaded (text-sm)
- Quick actions: View, Generate MCQ, Create Flashcards
- Hover state: slight elevation, cursor pointer

### Feature Mode Cards
**MCQ Display**:
- Question container: rounded-lg border p-6 mb-4
- Question number + difficulty badge (top-left)
- Question text: text-lg leading-relaxed mb-6
- Answer options: 4 buttons in vertical stack, gap-3
- Each option: rounded-md border p-4, hover state, selected state
- Navigation: Previous/Next buttons with question counter

**Flashcard View**:
- Large centered card (max-w-2xl)
- Front/Back toggle with smooth transition
- Card content: centered text, generous padding (p-12)
- Navigation arrows on sides
- Progress indicator (3/50 cards)
- Shuffle and Mark as Mastered buttons

**Mindmap Interface**:
- Full viewport canvas with React Flow
- Minimal UI overlay: zoom controls, export button (top-right)
- Node styling: rounded rectangles, hierarchical layout
- Edge styling: smooth curves with arrows

**Summary Display**:
- Clean reading layout (max-w-prose)
- Summary mode selector (Short/Medium/Detailed) as tab buttons
- Content in readable paragraphs with line-height-relaxed
- Key terms highlighted with subtle background
- Copy and Export buttons at bottom

### Forms & Inputs
**File Upload**:
- Drag-and-drop zone: dashed border, rounded-lg, min-h-64
- Icon + "Drop PDF here or click to browse"
- Accepted file types display (text-sm)
- Upload progress bar when processing

**Quiz Configuration**:
- Compact form: max-w-xl
- Input groups with labels (text-sm font-medium)
- Number inputs for question count
- Radio buttons for difficulty
- Checkbox for timed mode with time input
- Start Quiz button (primary CTA)

### Navigation & Controls
**Feature Tabs** (when showing multiple sub-features):
- Horizontal tab bar below page title
- Active tab: border-b-2 with offset
- Inactive tabs: hover state
- Gap-8 between tabs

**Action Buttons**:
- Primary: rounded-md px-6 py-3, font-medium
- Secondary: rounded-md px-4 py-2 with border
- Icon-only: square with rounded, p-2
- Button groups: gap-3 flex layout

### Data Display
**Progress Dashboard**:
- Stat cards in grid (grid-cols-1 md:grid-cols-3, gap-6)
- Each card: rounded-lg p-6
- Large number display (text-4xl font-bold)
- Label below (text-sm)
- Optional mini chart/progress bar

**Quiz Results**:
- Score prominently displayed (text-6xl font-bold, centered)
- Breakdown table: border with alternating rows
- Per-topic accuracy bars
- Weak topics section with suggestions

**Recent Activity List**:
- List items: flex justify-between, py-4, border-b
- Icon + description on left
- Timestamp on right (text-sm)
- Hover: slight background change

## Accessibility
- All interactive elements have min-height of h-11 (44px)
- Form inputs include visible labels and placeholders
- Focus states: visible outline offset
- Icon buttons include aria-labels
- Color is never the only indicator of state
- Keyboard navigation fully supported
- Screen reader friendly semantic HTML

## Icons
**Library**: Heroicons (via CDN)
- Use outline variants for sidebar navigation
- Use solid variants for action buttons
- Icon size: h-5 w-5 for UI elements, h-6 w-6 for headers

## Images
This application does not require hero images or marketing imagery. The focus is on functional UI for study tools. Any images used are user-uploaded PDFs or generated diagrams (mindmaps).

## Responsive Behavior
- Desktop (lg+): Full sidebar visible, multi-column grids
- Tablet (md): Sidebar toggles to overlay, 2-column grids
- Mobile (base): Sidebar as drawer, single column stacks, bottom navigation for features