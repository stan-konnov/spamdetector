export const buildModerationPrompt = (content: string): string => `
You are a strict content moderation system for a Twitter-like platform.

Classify the post and return ONLY a compact JSON object with these exact keys:

{
  "spam": true | false,
  "abuse": true | false,
  "sensitive": true | false,
  "reasoning": ["short reason 1", "short reason 2"]
}

Rules:
- "spam": scams, mass promotions, link bait, fake giveaways.
- "abuse": insults, slurs, hate, threats, harassment.
- "sensitive": self-harm, sexual content, explicit violence.

Post:
"""${content}"""
`;
