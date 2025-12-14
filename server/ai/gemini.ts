import { GoogleGenAI } from "@google/genai";
import { AIProvider } from "./provider";

export class GeminiProvider implements AIProvider {
    private client: GoogleGenAI;

    constructor(apiKey: string) {
        this.client = new GoogleGenAI({ apiKey });
    }

    private async generate(prompt: string, systemInstruction: string): Promise<any> {
        const response = await this.client.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction,
                responseMimeType: "application/json",
            },
            contents: prompt,
        });

        return JSON.parse(response.text || "{}");
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
            easy: "basic recall and understanding questions",
            medium: "application and analysis questions",
            hard: "synthesis and evaluation questions requiring deep understanding",
        };

        const prompt = `Generate ${count} multiple choice questions about "${topic}".
${content ? `Use this content as reference:\n${content.slice(0, 3000)}\n\n` : ""}
Requirements:
- Difficulty level: ${difficulty} (${difficultyGuide[difficulty]})
- Each question must have exactly 4 options
- Only one option should be correct
- Include a brief explanation for each answer
- Questions should be clear and unambiguous

Respond with JSON in this exact format:
{
  "mcqs": [
    {
      "question": "Question text here?",
      "options": [
        {"text": "Option A", "isCorrect": false},
        {"text": "Option B", "isCorrect": true},
        {"text": "Option C", "isCorrect": false},
        {"text": "Option D", "isCorrect": false}
      ],
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}`;

        return this.generate(
            prompt,
            "You are an expert educator creating assessment questions. Generate high-quality multiple choice questions that test understanding at the appropriate difficulty level. Always respond with valid JSON only."
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
${content ? `Use this content as reference:\n${content.slice(0, 3000)}\n\n` : ""}
Requirements:
- Front: A clear question, term, or concept
- Back: The answer, definition, or explanation
- Cover key concepts comprehensively
- Make cards focused and concise
- Vary the types of questions (definitions, concepts, applications)

Respond with JSON in this exact format:
{
  "flashcards": [
    {"front": "What is X?", "back": "X is defined as..."},
    {"front": "Term or concept", "back": "Definition or explanation"}
  ]
}`;

        return this.generate(
            prompt,
            "You are an expert educator creating study materials. Generate effective flashcards that help students memorize and understand key concepts. Always respond with valid JSON only."
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
        const lengthGuide = {
            short: "50-100 words, covering only the most essential points",
            medium: "150-200 words, providing a balanced overview",
            detailed: "300-400 words, comprehensive coverage of all important aspects",
        };

        const prompt = `Create a ${mode} summary about "${topic}".
${content ? `Use this content as reference:\n${content.slice(0, 4000)}\n\n` : ""}
Requirements:
- Length: ${lengthGuide[mode]}
- Write in clear, accessible language
- Focus on the most important concepts
${includeBulletPoints ? "- Include 3-5 key takeaways as bullet points" : ""}
- Identify 3-5 key terms

Respond with JSON in this exact format:
{
  "content": "The summary text here...",
  ${includeBulletPoints ? '"bulletPoints": ["Key point 1", "Key point 2", "Key point 3"],' : ""}
  "keyTerms": ["Term1", "Term2", "Term3"]
}`;

        return this.generate(
            prompt,
            "You are an expert at summarizing educational content. Create clear, well-organized summaries that capture the essential information. Always respond with valid JSON only."
        );
    }

    async generateMindmap(
        content: string,
        topic: string
    ): Promise<{
        nodes: Array<{ id: string; label: string; x: number; y: number }>;
        edges: Array<{ source: string; target: string }>;
    }> {
        const prompt = `Create a mindmap structure for "${topic}".
${content ? `Use this content as reference:\n${content.slice(0, 3000)}\n\n` : ""}
Requirements:
- Central node should be the main topic
- Include 4-6 main branches (subtopics)
- Each branch can have 2-3 sub-branches
- Keep node labels concise (1-4 words)
- Structure should flow logically from center outward

Respond with JSON in this exact format:
{
  "nodes": [
    {"id": "1", "label": "Main Topic"},
    {"id": "2", "label": "Subtopic 1"},
    {"id": "3", "label": "Detail 1.1"}
  ],
  "edges": [
    {"source": "1", "target": "2"},
    {"source": "2", "target": "3"}
  ]
}`;

        const result = await this.generate(
            prompt,
            "You are an expert at organizing information visually. Create logical, well-structured mindmaps that help learners understand relationships between concepts. Always respond with valid JSON only."
        );

        // Calculate positions (same logic as before)
        // Calculate positions and structure for React Flow
        // Calculate positions and structure for React Flow
        const nodes = Array.isArray(result.nodes) ? result.nodes : [];
        const edges = Array.isArray(result.edges) ? result.edges : [];

        const nodesWithPositions = nodes.map((node: { id: string; label: string }, index: number) => {
            let position = { x: 400, y: 300 };
            if (index !== 0) {
                const angle = ((index - 1) / (nodes.length - 1)) * 2 * Math.PI;
                const radius = 150 + (index % 3) * 80;
                position = {
                    x: 400 + Math.cos(angle) * radius,
                    y: 300 + Math.sin(angle) * radius,
                };
            }

            return {
                id: node.id,
                position,
                data: { label: node.label }
            };
        });

        // Add IDs to edges
        const edgesWithIds = edges.map((edge: { source: string; target: string }) => ({
            ...edge,
            id: `e${edge.source}-${edge.target}`
        }));

        return { nodes: nodesWithPositions, edges: edgesWithIds };
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
        const prompt = `Extract comprehensive study notes about "${topic}".
${content ? `Use this content as reference:\n${content.slice(0, 4000)}\n\n` : ""}
Requirements:
- Identify 5-8 key points or main concepts
- Extract important definitions (term + definition pairs)
- Find 3-5 important sentences or statements
- Include any relevant formulas or equations if applicable

Respond with JSON in this exact format:
{
  "keyPoints": ["Key point 1", "Key point 2"],
  "definitions": [
    {"term": "Term", "definition": "The definition..."}
  ],
  "importantSentences": ["Important statement 1", "Important statement 2"],
  "formulas": ["Formula 1", "Formula 2"]
}`;

        return this.generate(
            prompt,
            "You are an expert at extracting and organizing educational content. Create comprehensive, well-organized study notes that capture all essential information. Always respond with valid JSON only."
        );
    }

    async chat(
        message: string,
        conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
        documentContext?: string
    ): Promise<string> {
        const systemPrompt = `You are a helpful, patient, and encouraging AI tutor. Your role is to:
- Answer questions clearly and thoroughly
- Break down complex topics into understandable parts
- Provide examples when helpful
- Encourage the student and build their confidence
- Ask follow-up questions to check understanding
${documentContext ? `\nYou have access to the following document content for reference. \nCRITICAL INSTRUCTION: When you use information from the document, you MUST cite the page number using the format [Page X] (e.g. "[Page 5]"). Place the citation immediately after the relevant sentence or paragraph.\n\nDocument Content:\n${documentContext.slice(0, 3000)}` : ""}`;

        const historyFormatted = conversationHistory.slice(-10).map((m) =>
            `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
        ).join("\n\n");

        const fullPrompt = `${historyFormatted ? `Previous conversation:\n${historyFormatted}\n\n` : ""}User: ${message}`;

        const response = await this.client.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: systemPrompt,
            },
            contents: fullPrompt,
        });

        return response.text || "I'm sorry, I couldn't generate a response. Please try again.";
    }
}
