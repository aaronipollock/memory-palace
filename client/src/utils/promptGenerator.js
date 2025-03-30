import nlp from 'compromise'
import { checkWordConcreteness } from './dictionaryService';

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

const splitIntoSyllables = (word) => {
    // This is a simplified syllable splitting algorithm
    // More sophisticated versions exist but require larger libraries

    word = word.toLowerCase();

    // Define vowels
    const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];

    // Find syllable boundaries
    const syllables = [];
    let currentSyllable = '';
    let hasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      currentSyllable += char;

      // Check if current character is a vowel
      if (vowels.includes(char)) {
        hasVowel = true;
      }

      // Check if we should end the current syllable
      // Basic rule: after a vowel followed by a consonant
      if (hasVowel &&
          i < word.length - 1 &&
          !vowels.includes(char) &&
          vowels.includes(word[i+1])) {
        syllables.push(currentSyllable);
        currentSyllable = '';
        hasVowel = false;
      }
    }

    // Add the last syllable
    if (currentSyllable) {
      syllables.push(currentSyllable);
    }

    // Handle edge cases
    if (syllables.length === 0) {
      return [word]; // Return the whole word if no syllables found
    }

    return syllables;
};

// A more algorithmic approach to determine if a term is concrete
const needsFigurativeRepresentation = async (term) => {
  const lowerTerm = term.toLowerCase().trim();

  // For multi-word terms, check each word
  if (lowerTerm.includes(' ')) {
    const words = lowerTerm.split(' ');
    // If any word is abstract, use figurative representation
    for (const word of words) {
      if (word.length > 3) { // Skip short words like "the", "and", etc.
        try {
          const isConcrete = await checkWordConcreteness(word);
          // If API returns null (error), assume it's concrete to be safe
          if (isConcrete === false) {
            return true;
          }
        } catch (error) {
          console.error(`Error checking concreteness for word "${word}":`, error);
          // Continue with other words if one fails
        }
      }
    }
    return false;
  }

  // For single words, check directly
  try {
    const isConcrete = await checkWordConcreteness(lowerTerm);

    // If we got a result from the API, use it
    if (isConcrete !== null) {
      return !isConcrete; // If concrete, don't need figurative representation
    }
  } catch (error) {
    console.error(`Error checking concreteness for term "${lowerTerm}":`, error);
  }

  // Fall back to our NLP approach if API failed
  const doc = nlp(lowerTerm);

  // 1. Use linguistic features to identify concrete nouns
  // Concrete nouns tend to be:
  // - Simple nouns (not proper, not abstract)
  // - Often have clear visual representations
  // - Usually shorter and more common

  // Check if it's a simple noun phrase
  const isSimpleNoun = doc.match('#Noun').found &&
                      !doc.match('#Verb').found &&
                      !doc.match('#Adjective').found &&
                      !doc.match('#Adverb').found;

  // Check if it's a plural form of a simple noun
  const isPlural = doc.match('#Plural').found;

  // Check if it's a proper noun (names, places)
  const isProperNoun = doc.match('#ProperNoun').found;

  // Check if it contains numbers or dates
  const hasNumbers = doc.numbers().found || doc.match('#Value').found || doc.match('#Date').found;

  // Check word complexity (shorter words tend to be more concrete)
  const isShortWord = lowerTerm.length <= 8 && !lowerTerm.includes(' ');

  // Check syllable complexity (fewer syllables tend to be more concrete)
  const syllables = splitIntoSyllables(lowerTerm);
  const hasFewSyllables = syllables.length <= 2;

  // 2. Combine these factors to make a decision

  // If it's a simple, short noun with few syllables, it's likely concrete
  if (isSimpleNoun && isShortWord && hasFewSyllables && !isProperNoun && !hasNumbers) {
    return false; // Use literal representation
  }

  // If it's a plural form of a simple noun, it's likely concrete
  if (isPlural && isShortWord && hasFewSyllables && !isProperNoun && !hasNumbers) {
    return false; // Use literal representation
  }

  // Otherwise, use figurative representation
  return true;
};

const generateFigurativeAssociation = (memorable) => {
    const term = memorable.toLowerCase().trim();
    const doc = nlp(term);

    // Proper nouns
    if (doc.people().found) {
        const person = doc.people().text();
        return `a person respresenting ${person}, with distinctive characteristics`;
    }

    if (doc.places().found) {
        const place = doc.places().text();
        return `a miniature scene of ${place} with recongnizable landmarks`;
    }

    // Mulit-word phrases
    if (term.includes(' ')) {
        const nouns = doc.nouns().out('array');
        const adjectives = doc.adjectives().out('array');

        if (nouns.length > 0 && adjectives.length > 0) {
            return `a ${adjectives.join(' and ')} ${nouns.join(' and ')}`;
        } else {
            const parts = term.split(' ');
            return `a scene showing ${parts.join(' and ')}`;
        }
    }

    // Numbers and dates
    if (doc.numbers().found) {
        const num = doc.numbers().toNumber().out();
        return `the number ${num} visualized creatively`;
    }

    // Fix for dates - use match instead of dates()
    if (doc.match('#Date').found) {
        return `a calendar or clock showing ${term}`;
    }

    // For longer single words, use syllable-based approach
    if (term.length > 6) {
        const syllables = splitIntoSyllables(term);

        // If we have multiple syllables, create a scene with them
        if (syllables.length > 1) {
            return `a scene combining ${syllables.join(' and ')}`;
        }
    }

    // Fallback for anything else
    return `a visual representation of "${term}"`;
};

const generatePrompt = async (association, setCurrentPrompt) => {
    // Randomly select elements to create variety
    const verb = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
    const adjective = DESCRIPTIVE_ADJECTIVES[Math.floor(Math.random() * DESCRIPTIVE_ADJECTIVES.length)];
    const artStyle = ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)];

    // Determine if we should use figurative or literal approach
    const shouldUseFigurative = await needsFigurativeRepresentation(association.memorable);

    let description;
    if (shouldUseFigurative) {
        // Use figurative approach
        description = generateFigurativeAssociation(association.memorable);
    } else {
        // Use literal approach
        description = `a ${adjective} ${association.memorable}`;
    }

    // Create the prompt
    const prompt = `${description} ${verb} a ${association.anchor}, ${artStyle}.`;

    // Save a simplified version for display (without art style)
    const displayPrompt = `${description} ${verb} a ${association.anchor}.`;

    // If setCurrentPrompt function is provided, use it to update state
    if (setCurrentPrompt) {
        setCurrentPrompt(displayPrompt);
    }

    return {
        fullPrompt: prompt,
        displayPrompt: displayPrompt
    };
};

// Export everything needed by other components
export {
    ACTION_VERBS,
    DESCRIPTIVE_ADJECTIVES,
    ART_STYLES,
    needsFigurativeRepresentation,
    splitIntoSyllables,
    generateFigurativeAssociation,
    generatePrompt
};
