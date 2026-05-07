/**
 * PROMPT ENHANCER SERVICE
 *
 * Uses Anthropic Claude (Messages API) to expand anchor + memorable (+ context)
 * into a structured JSON prompt contract. Falls back to a simple prompt if
 * ANTHROPIC_API_KEY is missing or the request fails.
 */

const axios = require('axios');
require('dotenv').config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
/**
 * Model IDs change over time — see https://platform.claude.com/docs/en/about-claude/models/overview
 * - Default: Haiku 4.5 (fast / lower cost; good for short prompt expansion on every click).
 * - For parity with Claude chat “Opus 4.7”: set ANTHROPIC_MODEL=claude-opus-4-7
 * - Balanced: claude-sonnet-4-6
 */
const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
/** API versions: https://docs.anthropic.com/en/api/versioning */
const ANTHROPIC_VERSION = process.env.ANTHROPIC_VERSION || '2023-06-01';

const REQUEST_TIMEOUT_MS = 25000;

const PROMPT_VERSION = process.env.PROMPT_VERSION || 'v1';

const SYSTEM_PROMPT = `You are a prompt engineer for Stability SDXL text-to-image.

Inputs:
- prompt_version: ${PROMPT_VERSION}
- mode: "normal" or "stranger"
- anchor: string
- memorableItem: string
- artStyle (user-selected): "Random" | "Digital Art" | "Cartoon" | "3D Render" | "Watercolor" | "Pop Art" | "Photorealistic"
- roomType: optional short string
- room_context: optional short string

Task:
Return ONLY valid JSON with these keys EXACTLY:
prompt_version, mode, anchor, memorableItem, artStyle, label_text, prompt, negative_prompt, rationale, tags

Rules:
1) prompt must be ONE English sentence optimized for SDXL literal rendering: concrete, visual, and easy to depict.
2) Keep prompt compact and literal: 25-60 words, up to 12 comma-separated clauses, no poetic or abstract language.
3) The anchor object must be explicitly named and visually central to the main interaction.
4) If memorableItem is a proper noun (person/place), acronym, or abstract concept, you MUST include at least one clear phonetic/visual wordplay element.
5) Prefer simple scene graphs: one primary interaction, up to two secondary props, clean/uncluttered background.
6) artStyle handling:
   - If input artStyle is NOT "Random": set JSON artStyle to EXACTLY the same string as input.
   - If input artStyle IS "Random": choose ONE final rendering style and set JSON artStyle to that chosen value.
     - Prefer picking from: "Digital Art", "Cartoon", "3D Render", "Watercolor", "Pop Art", "Photorealistic"
     - Optional variety labels are allowed only if they are clear rendering styles.
   - Whatever JSON artStyle is, prompt MUST reflect it.
7) Use roomType/room_context only for atmosphere/materials/lighting; do not replace the anchor interaction.
8) If mode is "stranger", amplify absurdity with exactly ONE of:
   - one bizarre prop, OR
   - one scale twist.
   Keep the scene clearly depictable.
9) label_text rules:
   - Use "" unless text is necessary for the mnemonic.
   - If non-empty, keep it short (1-3 words) and physically placeable on a visible object/sign.
10) negative_prompt must be compact and practical (quality + clutter + watermark/logo suppression).
11) If label_text is non-empty, DO NOT include "text" in negative_prompt.
12) If label_text is empty, you MAY include "text" in negative_prompt.
13) rationale: 1-2 sentences explaining the mnemonic mapping.
14) tags: 3-8 short kebab-case strings.

Safety:
Keep content non-sexual, non-gory, non-hateful. Avoid instructions targeting real private individuals.

Output: JSON only. No markdown, no commentary.`;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function normalizeMode(mode) {
  return mode === 'stranger' ? 'stranger' : 'normal';
}

function fallbackContract({ anchor, memorableItem, mode = 'normal', artStyle = 'Random' }) {
  const chosenStyle =
    artStyle && artStyle !== 'Random'
      ? artStyle
      : pickRandom(['Digital Art', 'Cartoon', '3D Render', 'Watercolor', 'Pop Art', 'Photorealistic']);

  return {
    prompt_version: PROMPT_VERSION,
    mode: normalizeMode(mode),
    anchor,
    memorableItem,
    artStyle: chosenStyle,
    label_text: '',
    prompt: `${memorableItem} interacting with a ${anchor}, ${chosenStyle.toLowerCase()}.`,
    negative_prompt: 'blurry, low quality, watermark, logo, extra text, clutter',
    rationale: `Place ${memorableItem} in an exaggerated interaction with the anchor "${anchor}".`,
    tags: ['mnemonic', 'anchor-object', 'surreal']
  };
}

function extractTextFromMessage(responseData) {
  const blocks = responseData?.content;
  if (!Array.isArray(blocks)) return '';
  const texts = blocks
    .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text);
  return texts.join('\n').trim();
}

function extractFirstJsonObject(text) {
  if (!text) return null;
  const start = text.indexOf('{');
  if (start === -1) return null;
  // Greedy parse attempt by scanning for matching braces.
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth === 0) {
      const candidate = text.slice(start, i + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    }
  }
  return null;
}

function isNonEmptyString(x) {
  return typeof x === 'string' && x.trim().length > 0;
}

function sanitizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((t) => typeof t === 'string')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function isPlainObject(x) {
  if (x === null || typeof x !== 'object') return false;
  if (Array.isArray(x)) return false;

  // Accept normal objects (including ones with null prototype)
  const proto = Object.getPrototypeOf(x);
  return proto === Object.prototype || proto === null;
}

function hasString(x, key) {
  return (
    x !== null &&
    typeof x === 'object' &&
    typeof x[key] === 'string'
  );
}

function isStringArray(x) {
  return Array.isArray(x) && x.every((t) => typeof t === 'string');
}

function validateAndCoerceContract(obj, input) {
  if (!isPlainObject(obj)) return null;

  // Only copy known/expected fields; avoid spreading arbitrary model output
  const out = {};

  // Force required identity fields from input to avoid drift.
  out.prompt_version = PROMPT_VERSION;
  out.mode = normalizeMode(input.mode);
  out.anchor = input.anchor;
  out.memorableItem = input.memorableItem;

  // Required: prompt
  out.prompt = hasString(obj, 'prompt') && isNonEmptyString(obj.prompt) ? obj.prompt : '';
  if (!out.prompt) return null;

  // Optional: artStyle falls back to input
  out.artStyle = isNonEmptyString(obj.artStyle) ? obj.artStyle : input.artStyle;

  // Optional: string default to ''
  out.label_text = typeof obj.label_text === 'string' ? obj.label_text : '';
  out.negative_prompt = typeof obj.negative_prompt === 'string' ? obj.negative_prompt : '';
  out.rationale = typeof obj.rationale === 'string' ? obj.rationale : '';

  // Optional: tags sanitized to string[]
  out.tags = sanitizeTags(isStringArray(obj.tags) ? obj.tags : []);

  return out;
}

/**
 * Backwards compatible signature:
 *   enhancePrompt(anchor, memorableItem)
 * Preferred signature:
 *   enhancePrompt({ anchor, memorableItem, artStyle, roomType, room_context, mode })
 *
 * Returns the structured contract object.
 */
exports.enhancePrompt = async (anchorOrInput, memorableItemMaybe) => {
  const input =
    typeof anchorOrInput === 'object' && anchorOrInput
      ? {
          anchor: anchorOrInput.anchor,
          memorableItem: anchorOrInput.memorableItem,
          artStyle: anchorOrInput.artStyle || 'Random',
          roomType: anchorOrInput.roomType || '',
          room_context: anchorOrInput.room_context || '',
          mode: normalizeMode(anchorOrInput.mode)
        }
      : {
          anchor: anchorOrInput,
          memorableItem: memorableItemMaybe,
          artStyle: 'Random',
          roomType: '',
          room_context: '',
          mode: 'normal'
        };

  if (!isNonEmptyString(input.anchor) || !isNonEmptyString(input.memorableItem)) {
    return fallbackContract({
      anchor: input.anchor || 'object',
      memorableItem: input.memorableItem || 'subject',
      mode: input.mode,
      artStyle: input.artStyle
    });
  }

  if (!ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not configured, using fallback prompt');
    return fallbackContract(input);
  }

  const userMessage = JSON.stringify(
    {
      prompt_version: PROMPT_VERSION,
      mode: input.mode,
      anchor: input.anchor,
      memorableItem: input.memorableItem,
      artStyle: input.artStyle,
      roomType: input.roomType,
      room_context: input.room_context
    },
    null,
    2
  );

  try {
    console.log('Calling Anthropic for prompt expansion...', {
      model: ANTHROPIC_MODEL,
      mode: input.mode,
      artStyle: input.artStyle,
      roomType: input.roomType ? String(input.roomType).slice(0, 40) : ''
    });
    const response = await axios({
      method: 'post',
      url: ANTHROPIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION
      },
      data: {
        model: ANTHROPIC_MODEL,
        max_tokens: 600,
        temperature: 0.75,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }]
      },
      timeout: REQUEST_TIMEOUT_MS
    });

    const text = extractTextFromMessage(response.data);
    console.log('Anthropic prompt expansion raw text length:', text ? text.length : 0);
    const parsed = extractFirstJsonObject(text);
    const contract = validateAndCoerceContract(parsed, input);
    if (!contract) {
      console.warn('Claude returned invalid JSON contract, using fallback');
      return fallbackContract(input);
    }

    console.log('Anthropic prompt expansion parsed contract:\n' + JSON.stringify(contract, null, 2));
    return contract;
  } catch (error) {
    const status = error.response?.status;
    const body = error.response?.data;
    console.error('Error enhancing prompt with Claude:', error.message, {
      status,
      body: typeof body === 'object' ? body : undefined
    });
    return fallbackContract(input);
  }
};
