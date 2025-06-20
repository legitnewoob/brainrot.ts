import { Request } from "express";
import fs from "fs/promises";
import path from "path";
import { createScript as createChatGptScript } from "../../services/script-generator/createScript";

/**
 * Creates the script, saves it as a file, and returns public URL
 */
export async function createScript(
  titleText: string,
  speaker: string,
  req: Request,
): Promise<{ id: string; url: string }> {
  // Get the result from OpenAI (id + content)
  const { id, result } = await createChatGptScript(titleText, speaker);

  // Path to save the file
  const filePath = path.join(__dirname, "../../public/scripts", `${id}.txt`);

  // Ensure directory exists and write the file
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, result, "utf-8");

  // Public URL to access it
  const url = `${req.protocol}://${req.get("host")}/scripts/${id}.txt`;

  return { id, url };
}