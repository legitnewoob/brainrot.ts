import { Request } from "express";
import { createAudioFileFromText, AUDIO_DIR } from "../../services/audio/tts.mjs";

/**
 * Generate an MP3 from text using ElevenLabs and return the public URL.
 */
export async function synthesize(
  text: string, 
  req: Request , 
    options?: {speakerName?: string}
  ): Promise<{ id: string; url: string }> {
    const speaker = options?.speakerName || "adam_stone";
    
    const { id } = await createAudioFileFromText(text , speaker);
    
  // Construct the public URL
  const url = `${req.protocol}://${req.get("host")}/audios/${id}.mp3`;


  return { id, url };
}