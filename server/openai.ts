import { AIProvider } from "./ai/provider";
import { GeminiProvider } from "./ai/gemini";
import { OllamaProvider } from "./ai/ollama";

export type ProviderType = "gemini" | "ollama";

function getProvider(type: ProviderType = "gemini"): AIProvider {
  if (type === "ollama") {
    return new OllamaProvider();
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GeminiProvider(process.env.GEMINI_API_KEY);
}

export async function generateMCQs(
  content: string,
  topic: string,
  count: number,
  difficulty: "easy" | "medium" | "hard",
  provider: ProviderType = "gemini"
) {
  return getProvider(provider).generateMCQs(content, topic, count, difficulty);
}

export async function generateFlashcards(
  content: string,
  topic: string,
  count: number,
  provider: ProviderType = "gemini"
) {
  return getProvider(provider).generateFlashcards(content, topic, count);
}

export async function generateSummary(
  content: string,
  topic: string,
  mode: "short" | "medium" | "detailed",
  includeBulletPoints: boolean,
  provider: ProviderType = "gemini"
) {
  return getProvider(provider).generateSummary(content, topic, mode, includeBulletPoints);
}

export async function generateMindmap(
  content: string,
  topic: string,
  provider: ProviderType = "gemini"
) {
  return getProvider(provider).generateMindmap(content, topic);
}

export async function generateNotes(
  content: string,
  topic: string,
  provider: ProviderType = "gemini"
) {
  return getProvider(provider).generateNotes(content, topic);
}

export async function tutorChat(
  message: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  documentContext?: string,
  provider: ProviderType = "gemini"
) {
  return getProvider(provider).chat(message, conversationHistory, documentContext);
}
