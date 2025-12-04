
import "dotenv/config";
import { generateMindmap } from "../server/openai";

async function main() {
    console.log("Testing generateMindmap...");
    try {
        const result = await generateMindmap("", "Photosynthesis", "gemini");
        console.log("Generation successful!");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Generation failed:", error);
    }
}

main();
