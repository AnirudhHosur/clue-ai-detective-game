import type { NextApiRequest, NextApiResponse } from "next";

// Test endpoint to check if environment variables are loaded
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const replicateKey = process.env.REPLICATE_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const dbUrl = process.env.DATABASE_URL;

  res.status(200).json({
    message: "Environment variables check",
    replicate: {
      exists: !!replicateKey,
      length: replicateKey?.length || 0,
      preview: replicateKey ? `${replicateKey.substring(0, 10)}...` : "NOT SET"
    },
    gemini: {
      exists: !!geminiKey,
      length: geminiKey?.length || 0
    },
    database: {
      exists: !!dbUrl,
      length: dbUrl?.length || 0
    },
    allEnvKeys: Object.keys(process.env).filter(k => 
      k.includes("API") || k.includes("KEY") || k.includes("DATABASE")
    )
  });
}

