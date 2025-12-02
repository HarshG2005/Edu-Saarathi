# EduQuest Local - AI Study Buddy

## Getting Started

### Prerequisites
- Node.js (v20 or later)
- PostgreSQL Database

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory.
2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Configuration

1.  Create a `.env` file in the root directory (`EduQuestAI/`).
2.  Add the following environment variables:
    ```env
    DATABASE_URL=postgresql://user:password@host:port/dbname
    GEMINI_API_KEY=your_gemini_api_key
    SESSION_SECRET=your_session_secret
    PORT=5000
    ```

### Database Setup

Push the database schema to your PostgreSQL instance:
```bash
npm run db:push
```

### Running the Application

**Standard (Linux/Mac/Git Bash):**
```bash
npm run dev
```

**Windows (PowerShell):**
```powershell
$env:NODE_ENV="development"; npx tsx server/index.ts
```

### Accessing the Application

- **Frontend & Backend**: Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Overview

EduQuest Local is a local-first AI-powered study companion application that helps students learn from PDF textbooks. The application runs entirely on the user's device with no authentication requirements and minimal external dependencies (only optional AI APIs). Users can upload PDFs and generate various study materials including MCQs, flashcards, summaries, mindmaps, notes, and interact with an AI tutor. All data is stored locally for privacy and offline access.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**State Management**: 
- Zustand for global application state with persistence middleware
- Local storage persistence for offline-first functionality
- TanStack Query for server state management and API caching

**UI System**:
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Design approach follows "Design System + Reference-Based Hybrid" inspired by Notion, Linear, and Obsidian
- Typography uses Inter font family for consistency
- Custom color system with CSS variables supporting light/dark themes
- Responsive layout with sidebar navigation (16rem desktop, collapsible mobile)

**Routing**: Single-page application with feature-based routing managed through application state (no traditional router)

**Key Features Pages**:
- Library: Document upload and management
- MCQ Generator: Multiple choice question creation and practice
- Flashcards: Spaced repetition study tool
- Summary: Content summarization with customizable lengths
- Mindmap: Visual knowledge mapping using React Flow
- Notes: Structured note extraction
- Tutor: AI chat interface for Q&A
- Quiz: Timed assessment mode
- Progress: Analytics and performance tracking

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**Language**: TypeScript with ES modules

**API Design**: RESTful API with JSON payloads

**File Upload**: Multer middleware for PDF handling (50MB limit, memory storage)

**PDF Processing**: pdf.js library for text extraction from uploaded documents

**Build System**: 
- Vite for client-side bundling
- esbuild for server-side bundling with selective dependency bundling for performance
- Production builds output to `dist/` directory

**Session Management**: The application architecture supports optional session management with connect-pg-simple and express-session, though authentication is intentionally disabled per product requirements

**Error Handling**: Custom error overlay in development via Replit plugin

### Data Storage Solutions

**Architecture**: Local-first storage pattern with in-memory fallback

**Storage Interface** (`IStorage`):
- Documents (PDFs with extracted text and metadata)
- MCQ Sets (questions, options, difficulty levels, explanations)
- Flashcard Sets (cards with front/back content, mastery tracking)
- Summaries (generated content with metadata)
- Mindmaps (node/edge graph data)
- Notes (structured content with sections)
- Quiz Results (performance tracking)
- Chat Sessions (tutor conversation history)

**Database**:
- Configured for PostgreSQL via Drizzle ORM
- Schema defined in `shared/schema.ts` using Zod for validation
- Neon serverless PostgreSQL client for database connectivity
- Migration system via drizzle-kit

**Rationale**: While the current implementation uses an in-memory storage interface, the database configuration allows for future persistence. This supports the local-first philosophy while enabling optional cloud sync if needed.

### AI Integration

**Primary Provider**: Google Gemini API (configured via `GEMINI_API_KEY`)

**AI Capabilities**:
- MCQ Generation: Creates multiple choice questions with difficulty levels and explanations
- Flashcard Generation: Produces question/answer pairs for spaced repetition
- Summary Generation: Provides short/medium/detailed summaries with optional bullet points
- Mindmap Generation: Creates hierarchical knowledge structures
- Note Extraction: Structures content into organized notes with key points and formulas
- Tutor Chat: Context-aware Q&A with document reference support

**Error Handling**: Graceful fallbacks when API keys are not configured, with user-friendly error messages

**Context Management**: Content chunking for API token limits (3000 character slices for context)

## External Dependencies

### Third-Party Services

**AI/ML**:
- Google Generative AI library - Primary AI provider option (requires GEMINI_API_KEY)

**Database**:
- Neon Serverless PostgreSQL - Cloud-hosted PostgreSQL database
- Requires DATABASE_URL environment variable

### Key NPM Packages

**UI/Frontend**:
- @radix-ui/* - Accessible UI component primitives (18+ packages)
- @tanstack/react-query - Server state management
- @xyflow/react - Mindmap visualization
- framer-motion - Animation library (implicit from flashcards implementation)
- react-day-picker - Calendar component
- recharts - Data visualization for progress tracking
- zustand - State management

**Backend**:
- express - Web framework
- multer - File upload handling
- pdfjs-dist - PDF text extraction
- drizzle-orm - Database ORM
- zod - Schema validation

**Development**:
- vite - Build tool and dev server
- tsx - TypeScript execution
- tailwindcss - CSS framework
- @replit/* plugins - Replit-specific development tooling

### Configuration Requirements

**Environment Variables**:
- `GEMINI_API_KEY` - Required for AI features
- `DATABASE_URL` - Required for PostgreSQL connection
- `NODE_ENV` - Environment mode (development/production)

**Build Configuration**:
- TypeScript with strict mode enabled
- Module resolution set to "bundler" for compatibility
- Path aliases configured for clean imports (@/, @shared/, @assets/)
- PostCSS with Tailwind and Autoprefixer
