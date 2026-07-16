import OpenAI from "openai";

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey || !model) {
    throw new Error("AI drafting is not configured. Add OPENAI_API_KEY and OPENAI_MODEL to the server environment.");
  }

  return { client: new OpenAI({ apiKey }), model };
}
