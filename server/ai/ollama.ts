import { AIProvider } from "./provider";

export class OllamaProvider implements AIProvider {
    private model: string;
    private baseUrl: string;

    constructor(model: string = "llama3", baseUrl: string = "http://localhost:11434") {
        this.model = model;
        this.baseUrl = baseUrl;
    }

    private async generate(prompt: string, system: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: this.model,
                    prompt,
                    system,
                    stream: false,
                    format: "json", // Enforce JSON mode
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const data = await response.json();
            return JSON.parse(data.response);
        } catch (error) {
            console.error("Ollama generation failed:", error);
            throw new Error("Failed to generate content with Ollama. Is it running?");
        }
    }

    async generateMCQs(
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
    }> {
        const difficultyGuide = {
            easy: "basic recall",
            medium: "analysis",
            hard: "evaluation",
        };

        const prompt = `Generate ${count} multiple choice questions about "${topic}".
${content ? `Content: ${content.slice(0, 2000)}` : ""}
Difficulty: ${difficulty} (${difficultyGuide[difficulty]})
Format: JSON with "mcqs" array. Each item has "question", "options" (4 items, "text", "isCorrect"), "explanation".`;

        return this.generate(
            prompt,
            "You are a teacher. Generate valid JSON only."
        );
    }

    async generateFlashcards(
        content: string,
        topic: string,
        count: number
    ): Promise<{
        flashcards: Array<{ front: string; back: string }>;
    }> {
        const prompt = `Generate ${count} flashcards about "${topic}".
${content ? `Content: ${content.slice(0, 2000)}` : ""}
Format: JSON with "flashcards" array. Each item has "front" and "back".`;

        return this.generate(
            prompt,
            "You are a teacher. Generate valid JSON only."
        );
    }

    async generateSummary(
        content: string,
        topic: string,
        mode: "short" | "medium" | "detailed",
        includeBulletPoints: boolean
    ): Promise<{
        content: string;
        bulletPoints?: string[];
        keyTerms?: string[];
    }> {
        const prompt = `Summarize "${topic}" (${mode} length).
${content ? `Content: ${content.slice(0, 3000)}` : ""}
${includeBulletPoints ? "Include bullet points." : ""}
Format: JSON with "content", "keyTerms"${includeBulletPoints ? ', "bulletPoints"' : ""}.`;

        return this.generate(
            prompt,
            "You are a summarizer. Generate valid JSON only."
        );
    }

    async generateMindmap(
        content: string,
        topic: string
    ): Promise<{
        nodes: Array<{ id: string; label: string; x: number; y: number }>;
        edges: Array<{ source: string; target: string }>;
    }> {
        const prompt = `Create a mindmap for "${topic}".
${content ? `Content: ${content.slice(0, 2000)}` : ""}
Format: JSON with "nodes" (id, label) and "edges" (source, target).`;

        const result = await this.generate(
            prompt,
            "You are a visual organizer. Generate valid JSON only."
        );

        // Calculate positions
        const nodesWithPositions = result.nodes.map((node: { id: string; label: string }, index: number) => {
            if (index === 0) {
                return { ...node, x: 400, y: 300 };
            }
            const angle = ((index - 1) / (result.nodes.length - 1)) * 2 * Math.PI;
            const radius = 150 + (index % 3) * 80;
            return {
                ...node,
                x: 400 + Math.cos(angle) * radius,
                y: 300 + Math.sin(angle) * radius,
            };
        });

        return { nodes: nodesWithPositions, edges: result.edges };
    }

    async generateNotes(
        content: string,
        topic: string
    ): Promise<{
        keyPoints: string[];
        definitions: Array<{ term: string; definition: string }>;
        importantSentences: string[];
        formulas?: string[];
    }> {
        const prompt = `Create study notes for "${topic}".
${content ? `Content: ${content.slice(0, 3000)}` : ""}
Format: JSON with "keyPoints", "definitions" (term, definition), "importantSentences", "formulas".`;

        return this.generate(
            prompt,
            "You are a note taker. Generate valid JSON only."
        );
    }

    async chat(
        message: string,
        conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
        documentContext?: string
    ): Promise<string> {
        const system = `You are a helpful AI tutor.
${documentContext ? `Context: ${documentContext.slice(0, 2000)}` : ""}`;

        const historyFormatted = conversationHistory.slice(-5).map((m) =>
            `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
        ).join("\n");

        const prompt = `${historyFormatted}\nUser: ${message}\nAssistant:`;

        try {
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: this.model,
                    prompt,
                    system,
                    stream: false,
                }),
            });

            if (!response.ok) throw new Error(response.statusText);
            const data = await response.json();
            return data.response;
        } catch (error) {
            return "Error: Could not connect to Ollama. Is it running?";
        }
    }
}
