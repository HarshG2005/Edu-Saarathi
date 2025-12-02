# PDF Viewer & Annotation Tools

This update adds a fully functional PDF viewer with text highlighting, note taking, and flashcard creation capabilities.

## Features
- **PDF Viewer**: Renders PDF documents with lazy loading.
- **Text Highlighting**: Select text to highlight it in Yellow, Orange (Important), or Purple (Question).
- **Notes**: Add notes to specific highlights.
- **Flashcards**: Create flashcards directly from highlighted text.
- **Persistence**: All highlights, notes, and flashcards are saved to the database.

## Changed Files
- `client/src/components/pdf/PdfViewer.tsx`: Main PDF viewer component.
- `client/src/components/pdf/HighlightLayer.tsx`: Renders highlights on PDF pages.
- `client/src/components/pdf/HighlightMenu.tsx`: Floating action menu.
- `client/src/components/notes/NoteEditor.tsx`: Modal for editing notes.
- `client/src/components/flashcards/FlashcardCreator.tsx`: Modal for creating flashcards.
- `client/src/pages/document-viewer.tsx`: Page component integrating everything.
- `client/src/App.tsx`: Added route `/documents/:id`.
- `server/routes.ts`: Added routes for highlights, user notes, user flashcards, and PDF data storage/retrieval.
- `server/storage.ts` & `server/storage-db.ts`: Added storage methods.
- `shared/schema.ts`: Added `highlights`, `user_notes`, `user_flashcards` tables and `pdfData` column to `documents`.

## Database Schema Updates
New tables added:
- `highlights`: Stores text highlights (page, bbox, color, text).
- `user_notes`: Stores notes linked to highlights.
- `user_flashcards`: Stores flashcards linked to highlights.

Updated `documents` table:
- Added `pdfData` (text) to store Base64 encoded PDF file.

## Manual QA Steps

### 1. Upload a PDF
- Go to the Library page.
- Upload a new PDF file.
- **Note**: Existing documents uploaded before this change will NOT work because they lack the `pdfData`. You must upload a new one.

### 2. Open Document
- Click on the newly uploaded document card.
- Verify that the PDF viewer opens and renders the document.

### 3. Highlight Text
- Select some text in the PDF.
- A floating menu should appear.
- Click the Yellow Highlighter icon.
- Verify the text is highlighted in yellow.
- Reload the page. Verify the highlight persists.

### 4. Create a Note
- Select text.
- Click the "Note" icon (Sticky Note).
- A modal should open with the selected text quoted.
- Enter a note and click "Save".
- Verify "Note saved successfully" toast appears.

### 5. Create a Flashcard
- Select text.
- Click the "Flashcard" icon (Sparkles).
- A modal should open with "Explain: [text]" as the question and the text as the answer.
- Edit if needed and click "Create Flashcard".
- Verify "Flashcard created successfully" toast appears.

## Curl Commands

### Get Highlights
```bash
curl http://localhost:5000/api/documents/[DOC_ID]/highlights \
  -H "Cookie: connect.sid=[SESSION_ID]"
```

### Create Highlight
```bash
curl -X POST http://localhost:5000/api/documents/[DOC_ID]/highlights \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=[SESSION_ID]" \
  -d '{
    "page": 1,
    "text": "Sample text",
    "color": "yellow",
    "bbox": {"x": 0.1, "y": 0.1, "width": 0.2, "height": 0.05}
  }'
```

### Create Flashcard
```bash
curl -X POST http://localhost:5000/api/user-flashcards \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=[SESSION_ID]" \
  -d '{
    "documentId": "[DOC_ID]",
    "highlightId": "[HIGHLIGHT_ID]",
    "question": "What is X?",
    "answer": "X is Y"
  }'
```

## Revert Instructions
To revert changes, you can use `git` if initialized, or manually:
1. Remove the new components in `client/src/components/pdf`, `client/src/components/notes`, `client/src/components/flashcards`.
2. Remove `client/src/pages/document-viewer.tsx`.
3. Revert `client/src/App.tsx`, `server/routes.ts`, `server/storage.ts`, `server/storage-db.ts`, `shared/schema.ts` to their previous states.
