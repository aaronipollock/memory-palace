import nlp from 'compromise';

// Constants for prompt generation
const ACTION_VERBS = [
  'on',
  'next to',
  'inside',
  'above',
  'below',
  'behind',
  'in front of',
  'around'
];

const DESCRIPTIVE_ADJECTIVES = [
  'giant', 'tiny', 'glowing', 'colorful',
  'transparent', 'bright', 'sparkling', 'floating'
];

const ART_STYLES = [
  'digital art',
  'realistic',
  'detailed illustration',
  'high quality render'
];

// Anchor-specific context for better AI generation
const ANCHOR_CONTEXT = {
  'banner': 'a medieval heraldic banner hanging from a wall or pole, with coat of arms or symbols',
  'column': 'a tall stone column or pillar, classical architecture style',
  'dais': 'a raised platform or podium, often with steps',
  'statue': 'a detailed stone or bronze statue, classical or medieval style',
  'stained glass window': 'a colorful stained glass window with intricate patterns',
  'candlestick': 'a ornate candlestick or candelabra, medieval or gothic style',
  'footstool': 'a decorative footstool or ottoman',
  'red carpet': 'a rich red carpet or rug, luxurious and ornate',
  'throne': 'an ornate throne chair, royal or medieval style',
  'chandelier': 'a grand chandelier hanging from the ceiling, crystal or metal',
  'wardrobe': 'a large wooden wardrobe or armoire',
  'bed': 'a four-poster bed with curtains and ornate headboard',
  'mirror': 'a large ornate mirror in a decorative frame',
  'fireplace': 'a stone fireplace with mantel and hearth',
  'bookshelf': 'a tall wooden bookshelf filled with books',
  'desk': 'a wooden writing desk with drawers',
  'chair': 'an ornate wooden chair with decorative details',
  'table': 'a wooden table, possibly with tablecloth',
  'sink': 'a stone or ceramic sink basin',
  'stove': 'a large cooking stove or oven, medieval style',
  'pantry': 'wooden pantry shelves with food storage',
  'barrel': 'wooden barrels for storage',
  'cauldron': 'a large metal cauldron for cooking',
  'torture rack': 'a medieval torture device, dark and ominous',
  'iron maiden': 'a spiked iron torture device',
  'chains': 'heavy metal chains hanging from walls',
  'dungeon door': 'a heavy wooden door with metal reinforcements',
  'torch': 'wall-mounted torches providing flickering light',
  'cell bars': 'iron bars forming a prison cell',
  'stone floor': 'cold stone floor with cracks and wear'
};

// Utility for random selection
const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

// Extract concrete image from memorable item (handles parentheses format)
const extractConcreteImage = (memorableItem) => {
  // If the item contains parentheses, extract the part before them
  const parenthesesIndex = memorableItem.indexOf('(');
  if (parenthesesIndex !== -1) {
    return memorableItem.substring(0, parenthesesIndex).trim();
  }
  // Otherwise, return the full item
  return memorableItem;
};

// Prompt generator (Enhanced version with anchor context)
const generatePrompt = async (association, setCurrentPrompt) => {
  const verb = pickRandom(ACTION_VERBS);
  const adjective = pickRandom(DESCRIPTIVE_ADJECTIVES);
  const artStyle = pickRandom(ART_STYLES);

  // Extract the concrete image for AI generation, but keep full text for display
  const concreteImage = extractConcreteImage(association.memorableItem);
  const description = `a ${adjective} ${concreteImage}, clearly visible and prominent`;

  // Get anchor-specific context for better AI generation
  const anchorContext = ANCHOR_CONTEXT[association.anchor.toLowerCase()] || `a ${association.anchor}`;

  // Create enhanced prompt with anchor context
  const core = `${description} ${verb} ${anchorContext}`;
  const fullPrompt = `${core}, ${artStyle}, centered composition, clear focus on the ${concreteImage}, medieval fantasy setting.`;
  const displayPrompt = `${description} ${verb} a ${association.anchor}.`;

  if (setCurrentPrompt) {
    setCurrentPrompt(displayPrompt);
  }

  return {
    fullPrompt,
    displayPrompt
  };
};

// Export essentials
export {
  ACTION_VERBS,
  DESCRIPTIVE_ADJECTIVES,
  ART_STYLES,
  ANCHOR_CONTEXT,
  generatePrompt
};
