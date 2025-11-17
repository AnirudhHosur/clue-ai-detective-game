import fs from "fs/promises";
import path from "path";

export async function loadCreateGamePrompt(): Promise<string> {
  const filePath = path.join(process.cwd(), "prompts", "create_game.txt");
  const content = await fs.readFile(filePath, "utf8");
  return content.trim();
}
