/**
 * PROMPT ENHANCER SERVICE
 *
 * Uses Anthropic Claude (Messages API) to expand anchor + memorable (+ context)
 * into a structured JSON prompt contract. Falls back to a simple prompt if
 * ANTHROPIC_API_KEY is missing or the request fails.
 */

const axios = require('axios');
const Sentry = require('@sentry/node');
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

/** JSON contract needs room to finish; low max_tokens ⇒ truncation ⇒ invalid_contract. Override: ANTHROPIC_MAX_OUTPUT_TOKENS */
const ANTHROPIC_MAX_OUTPUT_TOKENS = Math.min(
  Math.max(Number.parseInt(process.env.ANTHROPIC_MAX_OUTPUT_TOKENS ?? '1536', 10), 256),
  8192
);

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
3) The anchor and memorableItem must be actively doing something to each other — verb-forward, not posed. Lead with or include a strong physical interaction verb (e.g. "crushing", "riding", "swallowing", "dragging", "launching"). A static "X next to Y" or "X holding Y" is not acceptable.
4) The anchor must be the grammatical subject or direct object of the interaction verb — not background, not atmosphere. Self-check: if you can remove the anchor from the sentence and the scene still makes sense, rewrite until it cannot.
5) The anchor object must be explicitly named and visually central to the main interaction.
6) If memorableItem is a proper noun (person/place), acronym, or abstract concept, you MUST include at least one phonetic/visual wordplay element. The connection must meet ONE of these criteria — no weak near-rhymes:
   a) Syllable split: each piece sounds like (or IS) a common English word (e.g. "Napoleon" → "nap" + "leon/lion").
   b) True homophone or near-homophone: ≤1 phoneme different, same vowel sound (e.g. "Zeus" → "juice").
   c) Visual substitute: the object physically resembles something that directly cues the name/word.
   Automatic disqualifiers — do not use these:
   - Fuzzy vowel swap: the substitute word shares consonants but changes the vowel sound (e.g. "Ricco" /riːkoʊ/ → "rice" /raɪs/ — vowel /iː/ vs /aɪ/ is a fail).
   - Stressed-syllable miss: the substitute word diverges on the stressed syllable (e.g. "Rodriguez" ro-DREE-gwez → "rodent" ro-DENT — "dri" vs "dent" on the stress beat is a fail).
   - Shared-prefix only: only the first 1-2 letters match and the rest diverges.
   - Extra-hop symbol: the visual evokes a concept that then suggests the sound, rather than the sound directly (e.g. halo → "holiness" → "heaven" → "Kevin" is two hops; use a visual that reads "heaven" on first glance — clouds, pearly gates, souls ascending).
   If you cannot find a connection meeting (a), (b), or (c), pick the strongest syllable split available and state it honestly in the rationale — do NOT invent a weak rhyme.
7) Prefer simple scene graphs: one primary interaction, up to two secondary props, clean/uncluttered background.
8) artStyle handling:
   - If input artStyle is NOT "Random": set JSON artStyle to EXACTLY the same string as input.
   - If input artStyle IS "Random": choose ONE final rendering style and set JSON artStyle to that chosen value.
     - Prefer picking from: "Digital Art", "Cartoon", "3D Render", "Watercolor", "Pop Art", "Photorealistic"
     - Optional variety labels are allowed only if they are clear rendering styles.
   - Whatever JSON artStyle is, prompt MUST reflect it.
9) Use roomType/room_context only for atmosphere/materials/lighting; do not replace the anchor interaction.
10) If mode is "stranger", amplify absurdity with exactly ONE of:
   - one bizarre prop, OR
   - one scale twist.
   Keep the scene clearly depictable.
11) label_text rules:
   - Use "" unless text is necessary for the mnemonic.
   - If non-empty, keep it short (1-3 words) and physically placeable on a visible object/sign.
12) negative_prompt must be compact and practical (quality + clutter + watermark/logo suppression).
13) If label_text is non-empty, DO NOT include "text" in negative_prompt.
14) If label_text is empty, you MAY include "text" in negative_prompt.
15) rationale — for the person memorizing, not for a prompt engineer:
   - Explain ONLY the mnemonic: sound-split, pun, or what in the picture cues what (plain words).
   - Do NOT describe how you built the image prompt: no "verb-forward", "anchor central", "grammatical subject", "interaction", "scene graph", "literal rendering", "SDXL", "composition", "kinetic", "fires on recall", "makes the interaction…", "icon of the acronym", or similar meta.
   - Do NOT justify prompt rules; the athlete does not care about prompt engineering.
   - 1-2 short sentences; normal mode prefer one sentence.
16) tags: 3-8 short kebab-case strings.

Safety:
Keep content non-sexual, non-gory, non-hateful. Avoid instructions targeting real private individuals.

Output: JSON only. No markdown, no commentary.

---

EXAMPLES (study these before every response):

Example 1 — normal mode, proper noun with phonetic encoding
Input:
{
  "prompt_version": "v1",
  "mode": "normal",
  "anchor": "wooden bookshelf",
  "memorableItem": "Napoleon",
  "artStyle": "Watercolor",
  "roomType": "study",
  "room_context": "warm lamplight, oak paneling"
}
Output:
{
  "prompt_version": "v1",
  "mode": "normal",
  "anchor": "wooden bookshelf",
  "memorableItem": "Napoleon",
  "artStyle": "Watercolor",
  "label_text": "",
  "prompt": "A small golden lion caught mid-nap on top of a wooden bookshelf, books splayed open beneath its chin, warm amber lamplight, loose watercolor washes.",
  "negative_prompt": "blurry, low quality, watermark, logo, text, clutter, harsh lines",
  "rationale": "Napoleon → nap + leon: a sleeping lion on the bookshelf so you read nap, then lion.",
  "tags": ["napoleon", "phonetic-split", "lion", "bookshelf", "napping", "watercolor", "study"]
}

Example 2 — stranger mode, abstract concept with phonetic split
Input:
{
  "prompt_version": "v1",
  "mode": "stranger",
  "anchor": "kitchen faucet",
  "memorableItem": "photosynthesis",
  "artStyle": "Digital Art",
  "roomType": "kitchen",
  "room_context": "bright overhead lights, white tile"
}
Output:
{
  "prompt_version": "v1",
  "mode": "stranger",
  "anchor": "kitchen faucet",
  "memorableItem": "photosynthesis",
  "artStyle": "Digital Art",
  "label_text": "",
  "prompt": "A vintage film camera the size of a watermelon sprouting green vines from its lens instead of water, mounted where a chrome kitchen faucet should be, bright overhead light, digital art style.",
  "negative_prompt": "blurry, low quality, watermark, logo, text, clutter, dark shadows",
  "rationale": "Photosynthesis → photo + synthesis: a camera where the faucet was, with vines growing out like water. The giant camera is just a weird extra hook so you remember the faucet spot.",
  "tags": ["photosynthesis", "phonetic-split", "camera", "vines", "faucet", "stranger-mode", "digital-art"]
}`;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function normalizeMode(mode) {
  return mode === 'stranger' ? 'stranger' : 'normal';
}

function fallbackContract({
  anchor,
  memorableItem,
  mode = 'normal',
  artStyle = 'Random',
  llm_fallback = true,
  llm_fallback_reason = 'generic'
}) {
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
    llm_fallback,
    llm_fallback_reason,
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
      artStyle: input.artStyle,
      llm_fallback: false,
      llm_fallback_reason: 'invalid_input'
    });
  }

  if (!ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not configured, using fallback prompt');
    return fallbackContract({ ...input, llm_fallback_reason: 'missing_api_key' });
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
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-beta': 'prompt-caching-2024-07-31'
      },
      data: {
        model: ANTHROPIC_MODEL,
        max_tokens: ANTHROPIC_MAX_OUTPUT_TOKENS,
        temperature: input.mode === 'stranger' ? 0.9 : 0.65,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userMessage }]
      },
      timeout: REQUEST_TIMEOUT_MS
    });

    const usage = response.data?.usage;
    const stopReason = response.data?.stop_reason;
    console.log('Anthropic prompt expansion token usage:', {
      input: usage?.input_tokens,
      output: usage?.output_tokens,
      cache_created: usage?.cache_creation_input_tokens,
      cache_read: usage?.cache_read_input_tokens,
      stop_reason: stopReason,
      max_tokens: ANTHROPIC_MAX_OUTPUT_TOKENS
    });
    const text = extractTextFromMessage(response.data);
    console.log('Anthropic prompt expansion raw text length:', text ? text.length : 0);
    const parsed = extractFirstJsonObject(text);
    const contract = validateAndCoerceContract(parsed, input);
    if (!contract) {
      console.warn('Claude returned invalid JSON contract, using fallback', {
        stop_reason: stopReason,
        output_tokens: usage?.output_tokens,
        max_tokens: ANTHROPIC_MAX_OUTPUT_TOKENS,
        likely_truncated:
          stopReason === 'max_tokens' ||
          (typeof usage?.output_tokens === 'number' &&
            usage.output_tokens >= ANTHROPIC_MAX_OUTPUT_TOKENS - 8),
        raw_tail: typeof text === 'string' ? text.slice(-320) : undefined
      });
      return fallbackContract({ ...input, llm_fallback_reason: 'invalid_contract' });
    }

    console.log('Anthropic prompt expansion parsed contract:\n' + JSON.stringify(contract, null, 2));
    return { ...contract, llm_fallback: false, llm_fallback_reason: null };
  } catch (error) {
    const status = error.response?.status;
    const body = error.response?.data;
    console.error('Error enhancing prompt with Claude:', error.message, {
      status,
      body: typeof body === 'object' ? body : undefined
    });
    Sentry.withScope((scope) => {
      scope.setTag('service', 'promptEnhancer');
      scope.setTag('llm_provider', 'anthropic');
      scope.setTag('llm_model', ANTHROPIC_MODEL);
      scope.setTag('mode', input.mode);

      scope.setContext('anthropic', {
        status: error.response?.status,
        // keep it bounded; avoid dumping huge payloads
        bodyPreview:
          typeof error.response?.data === 'string'
            ? error.response.data.slice(0, 800)
            : error.response?.data
      });

      scope.setContext('prompt_input', {
        anchor: input.anchor,
        memorableItem: input.memorableItem,
        artStyle: input.artStyle,
        roomType: input.roomType,
        room_context: input.room_context
      });

      Sentry.captureException(error);
    });
    return fallbackContract({ ...input, llm_fallback_reason: 'anthropic_error' });
  }
};
