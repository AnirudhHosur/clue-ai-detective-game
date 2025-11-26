import { pgTable, serial, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Clerk user ID (format: user_xxxxx)
  title: varchar("title", { length: 120 }).notNull(),
  genre: varchar("genre", { length: 50 }).notNull(), // e.g. detective, noir, fantasy
  tone: varchar("tone", { length: 50 }).notNull(), // e.g. dark, comedic, serious
  mainCharacters: jsonb("main_characters").default([]), // [{name, role, traits}]
  plotSeed: text("plot_seed").notNull(), // user's main idea prompt for AI
  difficulty: varchar("difficulty", { length: 20 }).default("medium"), // easy, medium, hard
  imagePrompt: text("image_prompt"), // optional: for AI-generated cover
  generatedImageUrl: text("generated_image_url"), // URL of the AI-generated game image
  images: jsonb("images").default([]), // Array of base64 encoded images: ["data:image/jpeg;base64,...", ...]
  status: varchar("status", { length: 20 }).default("draft"), // draft, active, finished
  // AI-generated game content fields
  premise: text("premise"), // The game's premise/story
  setting: jsonb("setting"), // {location, description}
  chapters: jsonb("chapters").default([]), // Array of chapter objects
  possibleEndings: jsonb("possible_endings").default([]), // Array of ending objects
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
