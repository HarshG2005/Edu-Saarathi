# Flashcards & Spaced Repetition System (SRS)

This feature allows users to create flashcards from document highlights and review them using a Spaced Repetition System (SRS) based on the SM-2 algorithm.

## Features

1.  **Create Flashcards**:
    *   Select text in a PDF document.
    *   Choose "Flashcard" from the highlight menu.
    *   Enter a question (front) and answer (back). The selected text is automatically used as the answer context.
    *   Add tags for organization.

2.  **Review Flashcards**:
    *   Go to the "Flashcards" tab in the sidebar.
    *   See a dashboard of due cards and decks (by document).
    *   Click "Review Due" to start a review session.
    *   Rate your recall:
        *   **Again (1)**: Incorrect response. Review again soon.
        *   **Hard (3)**: Correct response but with difficulty.
        *   **Good (4)**: Correct response with some hesitation.
        *   **Easy (5)**: Perfect recall.

3.  **Spaced Repetition (SM-2)**:
    *   The system schedules the next review based on your rating.
    *   Cards rated "Again" are reset.
    *   Cards rated "Easy" are pushed further into the future.
    *   The algorithm adjusts the "Ease" factor and "Interval" for each card.

## Technical Implementation

### Database Schema (`user_flashcards`)

*   `id`: UUID
*   `userId`: UUID (Owner)
*   `documentId`: UUID (Source document)
*   `highlightId`: UUID (Optional link to highlight)
*   `question`: Text
*   `answer`: Text
*   `tags`: JSONB Array
*   `difficulty`: Integer (Last rating 0-5)
*   `interval`: Integer (Days until next review)
*   `ease`: Integer (Easiness factor, scaled by 100)
*   `repetition`: Integer (Consecutive correct reviews)
*   `nextReview`: Timestamp (When the card is due)

### API Endpoints

*   `GET /api/documents/:id/flashcards`: Get all flashcards for a document.
*   `GET /api/flashcards/due`: Get all flashcards due for review (or new).
*   `POST /api/flashcards`: Create a new flashcard.
*   `PUT /api/flashcards/:id`: Update a flashcard (content or review rating).
    *   Payload for review: `{ quality: number, previous: { interval, repetition, ease } }`
*   `DELETE /api/flashcards/:id`: Delete a flashcard.

### Frontend

*   `FlashcardModal`: Component to create/edit flashcards.
*   `FlashcardsList`: Component to list flashcards in the document viewer side panel.
*   `FlashcardsPage` (`/flashcards`): Dashboard for all flashcards.
*   `FlashcardReviewPage` (`/flashcards/review`): Interface for reviewing due cards.
*   `useFlashcards`: Hook for managing flashcard state and mutations.

## Usage

1.  **Upload a PDF**.
2.  **Highlight text** and select "Flashcard".
3.  **Fill in the details** and save.
4.  **Navigate to Flashcards** section to review.
