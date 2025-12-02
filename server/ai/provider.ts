export interface AIProvider {
    generateMCQs(
        content: string,
        topic: string,
        count: number,
        difficulty: "easy" | "medium" | "hard"
    ): Promise<{
        mcqs: Array<{
            question: string;
            options: Array<{ text: string; isCorrect: boolean }>;
            explanation?: string;
        }>;
    }>;

    generateFlashcards(
        content: string,
        topic: string,
        count: number
    ): Promise<{
        flashcards: Array<{ front: string; back: string }>;
    }>;

    generateSummary(
        content: string,
        topic: string,
        mode: "short" | "medium" | "detailed",
        includeBulletPoints: boolean
    ): Promise<{
        content: string;
        bulletPoints?: string[];
        keyTerms?: string[];
    }>;

    generateMindmap(
        content: string,
        topic: string
    ): Promise<{
        nodes: Array<{ id: string; label: string; x: number; y: number }>;
        edges: Array<{ source: string; target: string }>;
    }>;

    generateNotes(
        content: string,
        topic: string
    ): Promise<{
        keyPoints: string[];
        definitions: Array<{ term: string; definition: string }>;
        importantSentences: string[];
        formulas?: string[];
    }>;

    chat(
        message: string,
        conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
        documentContext?: string
    ): Promise<string>;
}
