import Anthropic from "@anthropic-ai/sdk";

const apiKey =
  process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

export const anthropic = apiKey
  ? new Anthropic({
      apiKey,
      baseURL,
    })
  : null;
