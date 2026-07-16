// Swap the Claude model used for meal estimation in this one place.
// claude-sonnet-5 is the current flagship vision-capable model; switch to
// a Haiku model here if estimates are good enough and cost matters more.
export const CLAUDE_MODEL = 'claude-sonnet-5';
export const ANTHROPIC_API_VERSION = '2023-06-01';
