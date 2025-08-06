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

// Prompt generator (MVP version)
const generatePrompt = async (association, setCurrentPrompt) => {
  const verb = pickRandom(ACTION_VERBS);
  const adjective = pickRandom(DESCRIPTIVE_ADJECTIVES);
  const artStyle = pickRandom(ART_STYLES);

  // Extract the concrete image for AI generation, but keep full text for display
  const concreteImage = extractConcreteImage(association.memorableItem);
  const description = `a ${adjective} ${concreteImage}, clearly visible and prominent`;

  const core = `${description} ${verb} a ${association.anchor}`;
  const fullPrompt = `${core}, ${artStyle}, centered composition, clear focus on the ${concreteImage}.`;
  const displayPrompt = `${core}.`;

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
  generatePrompt
};
