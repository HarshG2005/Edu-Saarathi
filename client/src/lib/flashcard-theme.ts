export interface FlashcardTheme {
    id: string;
    name: string;
    class: string;
    preview: string; // Color for the preview circle
}

export const FLASHCARD_THEMES: FlashcardTheme[] = [
    {
        id: 'default',
        name: 'Classic',
        class: 'bg-card text-card-foreground border-border',
        preview: 'bg-white border-gray-200'
    },
    {
        id: 'blue',
        name: 'Ocean',
        class: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-slate-900 dark:text-blue-50',
        preview: 'bg-blue-50 border-blue-200'
    },
    {
        id: 'green',
        name: 'Mint',
        class: 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-slate-900 dark:text-green-50',
        preview: 'bg-green-50 border-green-200'
    },
    {
        id: 'amber',
        name: 'Warm',
        class: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-slate-900 dark:text-amber-50',
        preview: 'bg-amber-50 border-amber-200'
    },
    {
        id: 'purple',
        name: 'Lavender',
        class: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-slate-900 dark:text-purple-50',
        preview: 'bg-purple-50 border-purple-200'
    },
    {
        id: 'rose',
        name: 'Rose',
        class: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-slate-900 dark:text-rose-50',
        preview: 'bg-rose-50 border-rose-200'
    },
];

export function getFlashcardTheme(id: string): FlashcardTheme {
    return FLASHCARD_THEMES.find(t => t.id === id) || FLASHCARD_THEMES[0];
}
