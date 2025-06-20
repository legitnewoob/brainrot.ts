import OpenAI from "openai";
import crypto from "node:crypto";

export async function createScript(
  titleText: string,
  speaker: string
): Promise<{ id: string; result: string }> {
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,   // ← make sure this env var is set
  });

  const response = await openai.responses.create({
  prompt: {
    "id": "pmpt_68558c7d12cc8193a5fece5948e0f8870c740748fdfd1067",
    "version": process.env.OPENAI_PROMPT_VERSION,
    "variables": {
      "topic": titleText,
      "speaker_name": speaker,
    }
  },
  input: [],
  reasoning: {},
  max_output_tokens: 2048,
  store: true
});
  console.log(response);
  return {
    id: crypto.randomUUID(),
    // depending on the “response_format” you chose when saving the prompt
    // you’ll either get `completion.choices[0].message.content` (chat) or
    // `completion.text` (text) – adjust as necessary:
    result: response.output?.[0]?.content[0]?.text ?? (response as any).text,
  };
}