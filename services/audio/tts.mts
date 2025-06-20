import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
// import { error } from 'console';
import * as dotenv from 'dotenv';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const elevenlabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

export const AUDIO_DIR = join(process.cwd(), 'public/audios');
if (!existsSync(AUDIO_DIR)) mkdirSync(AUDIO_DIR, { recursive: true });

export interface AudioResult {
  id: string;        // ← the UUID
  filePath: string;  // ← full path to the saved MP3
}

export const createAudioFileFromText = async (text: string , speakerName : string): Promise<AudioResult> => {
  const id = uuid();                         // generate the UUID *once*
  const filePath = join(AUDIO_DIR, `${id}.mp3`);
  const voiceName = String(speakerName || "").toUpperCase();
  const parsedId = `${voiceName}_ID`;
  const voiceId = process.env[parsedId]; // Else use Adam Stone
  console.log(`Using voice ID: ${voiceId} for speaker: ${voiceName}`);
  
 if (!voiceId) {
    const msg = `❌ Missing voice ID in .env for speaker "${speakerName}" (expected key: ${parsedId})`;
    console.error(msg);
    throw new Error(msg);
  }
  try {
    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      modelId: 'eleven_multilingual_v2',
      text,
      outputFormat: 'mp3_44100_128',
      voiceSettings: {
        stability: 0,
        similarityBoost: 0,
        useSpeakerBoost: true,
        speed: 1.0,
      },
    });

    const reader = audio.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }

    writeFileSync(filePath, Buffer.concat(chunks));
    return { id, filePath };                 // now you get both values
  } catch (err) {
    console.error('Error creating audio file:', err);
    throw err;
  }
};

