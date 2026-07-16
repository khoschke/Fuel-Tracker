import { File } from 'expo-file-system';
import { getApiKey } from '../storage';
import { MealEstimate } from '../types';
import { MEAL_ESTIMATE_SYSTEM_PROMPT, buildUserNote } from './prompt';
import { CLAUDE_MODEL, ANTHROPIC_API_VERSION } from './config';

export type EstimateErrorKind = 'no-api-key' | 'network' | 'api' | 'parse';

export class EstimateError extends Error {
  kind: EstimateErrorKind;
  constructor(kind: EstimateErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

function guessMediaType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  return 'image/jpeg';
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) return fenced[1];
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

function toWholeNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export async function estimateMeal(photoUri: string, note?: string): Promise<MealEstimate> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new EstimateError('no-api-key', 'No Anthropic API key is set. Add one in Settings.');
  }

  let base64: string;
  try {
    base64 = await new File(photoUri).base64();
  } catch {
    throw new EstimateError('network', 'Could not read the photo file.');
  }

  const userNote = buildUserNote(note);
  const textContent = userNote
    ? `Estimate this meal.\n${userNote}`
    : 'Estimate this meal.';

  let response: Response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_API_VERSION,
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        system: MEAL_ESTIMATE_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: guessMediaType(photoUri),
                  data: base64,
                },
              },
              { type: 'text', text: textContent },
            ],
          },
        ],
      }),
    });
  } catch {
    throw new EstimateError('network', 'Could not reach the internet. Check your connection and try again.');
  }

  if (!response.ok) {
    let detail = '';
    try {
      const errBody = await response.json();
      detail = errBody?.error?.message ?? '';
    } catch {
      // ignore, use status-based message below
    }
    if (response.status === 401) {
      throw new EstimateError('no-api-key', 'That API key was rejected. Check it in Settings.');
    }
    throw new EstimateError('api', detail || `The estimate service returned an error (${response.status}).`);
  }

  const body = await response.json();
  const text: string = body?.content?.[0]?.text ?? '';

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(extractJson(text));
  } catch {
    throw new EstimateError('parse', 'Could not understand the estimate. Try again or enter numbers manually.');
  }

  const confidence = parsed.confidence === 'high' || parsed.confidence === 'medium' || parsed.confidence === 'low'
    ? parsed.confidence
    : 'low';

  return {
    description: typeof parsed.description === 'string' && parsed.description
      ? parsed.description
      : 'Meal',
    calories: toWholeNumber(parsed.calories),
    protein_g: toWholeNumber(parsed.protein_g),
    carbs_g: toWholeNumber(parsed.carbs_g),
    fat_g: toWholeNumber(parsed.fat_g),
    confidence,
    notes: typeof parsed.notes === 'string' ? parsed.notes : '',
  };
}
