import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { games } from "@/config/schema";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Get authenticated user ID from Clerk
    const { userId } = getAuth(req);
    
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const {
      title,
      genre,
      tone,
      plotSeed,
      difficulty,
      imagePrompt,
      mainCharacters,
      gameContent, // AI-generated game content (JSON string)
      generatedImageUrl, // URL of the generated image
    } = req.body;

    // Validate required fields
    if (!title || !genre || !tone || !plotSeed) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Generate UUID for gameId
    const gameId = uuidv4();

    // Prepare main characters data
    const charactersData = Array.isArray(mainCharacters)
      ? mainCharacters
      : mainCharacters
      ? JSON.parse(mainCharacters)
      : [];

    // Parse AI-generated game content
    let parsedGameData: any = {};
    if (gameContent) {
      try {
        // Remove markdown code blocks if present
        let cleanedContent = gameContent.trim();
        if (cleanedContent.startsWith("```json")) {
          cleanedContent = cleanedContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanedContent.startsWith("```")) {
          cleanedContent = cleanedContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        
        parsedGameData = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error("Error parsing game content:", parseError);
        // Continue without parsed data if parsing fails
      }
    }

    // Extract game data from parsed content
    const premise = parsedGameData.premise || null;
    const setting = parsedGameData.setting || null;
    const chapters = Array.isArray(parsedGameData.chapters) ? parsedGameData.chapters : [];
    const possibleEndings = Array.isArray(parsedGameData.possibleEndings) ? parsedGameData.possibleEndings : [];

    // Insert game into database
    const [insertedGame] = await db
      .insert(games)
      .values({
        userId: userId,
        title: title,
        genre: genre,
        tone: tone,
        plotSeed: plotSeed,
        difficulty: difficulty || "medium",
        imagePrompt: imagePrompt || null,
        mainCharacters: charactersData,
        premise: premise,
        setting: setting,
        chapters: chapters,
        possibleEndings: possibleEndings,
        generatedImageUrl: generatedImageUrl || null,
        status: "draft",
      })
      .returning();

    res.status(200).json({
      success: true,
      gameId: gameId,
      dbId: insertedGame.id,
      game: insertedGame,
    });
  } catch (error: any) {
    console.error("Error saving game to database:", error);
    res.status(500).json({
      error: error.message || "Failed to save game to database",
    });
  }
}

