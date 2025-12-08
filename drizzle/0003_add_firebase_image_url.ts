import { pgTable, text } from "drizzle-orm/pg-core";

export const games = pgTable("games", {
  firebaseImageUrl: text("firebase_image_url"),
});