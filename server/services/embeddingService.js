const natural = require('natural');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Cache for embeddings to improve performance
const embeddingCache = new Map();

// Use WordNet for basic semantic relationships
const wordnet = new natural.WordNet();

// List of concrete, visual words organized by category
const concreteVisualWords = {
  animals: ['elephant', 'tiger', 'eagle', 'octopus', 'giraffe', 'peacock', 'dolphin', 'butterfly'],
  landmarks: ['pyramid', 'lighthouse', 'skyscraper', 'castle', 'bridge', 'statue', 'tower', 'temple'],
  nature: ['volcano', 'waterfall', 'glacier', 'tornado', 'mountain', 'forest', 'canyon', 'island'],
  objects: ['diamond', 'sword', 'crown', 'telescope', 'compass', 'hourglass', 'mirror', 'book'],
  fantasy: ['dragon', 'wizard', 'giant', 'unicorn', 'phoenix', 'mermaid', 'robot', 'spaceship'],
  phenomena: ['rainbow', 'lightning', 'aurora', 'eclipse', 'firework', 'explosion', 'whirlpool', 'meteor']
};

// Common metaphorical patterns
const metaphors = [
  { pattern: 'growth', visual: 'a seedling breaking through soil' },
  { pattern: 'journey', visual: 'a winding path through mountains' },
  { pattern: 'connection', visual: 'intertwined vines' },
  { pattern: 'conflict', visual: 'colliding waves' },
  { pattern: 'transformation', visual: 'a butterfly emerging from a cocoon' },
  { pattern: 'balance', visual: 'a scale with equal weights' },
  { pattern: 'knowledge', visual: 'an open book with glowing pages' },
  { pattern: 'time', visual: 'an hourglass with flowing sand' },
  { pattern: 'power', visual: 'a lightning bolt striking a tree' },
  { pattern: 'freedom', visual: 'a bird soaring in open sky' }
];

// Fallback word associations (manually curated)
const wordAssociations = {
  'democracy': 'a balanced scale with multiple weights',
  'freedom': 'a bird soaring in open sky',
  'justice': 'a blindfolded figure holding scales',
  'peace': 'a white dove with an olive branch',
  'love': 'a glowing red heart',
  'time': 'an hourglass with flowing sand',
  'knowledge': 'an open book with glowing pages',
  'power': 'a lightning bolt striking a tree',
  'wealth': 'a treasure chest overflowing with gold coins',
  'health': 'a vibrant tree with fruit',
  'happiness': 'a radiant sun with a smiling face',
  'sadness': 'a single teardrop falling into still water',
  'anger': 'a volcano erupting with red lava',
  'fear': 'a dark shadow with glowing eyes',
  'courage': 'a majestic lion standing tall',
  'wisdom': 'an ancient owl perched on a book',
  'creativity': 'a paintbrush creating colorful swirls',
  'strength': 'a mighty oak tree withstanding a storm',
  'beauty': 'a blooming flower with dew drops',
  'truth': 'a crystal-clear mirror reflecting light'
};

// Historical figures with meaningful associations
const historicalFigures = {
  // Presidents with distinctive visual associations
  'washington': 'a commanding general crossing a frozen river',
  'jefferson': 'an architect holding the Declaration of Independence',
  'adams': 'a distinguished diplomat with a quill pen',
  'madison': 'a scholarly statesman with the Constitution',
  'monroe': 'a president in Revolutionary War uniform proclaiming a doctrine',
  'jackson': 'a battle-hardened general on horseback',
  'van buren': 'a silver-haired politician with distinctive sideburns',
  'harrison': 'a general in a log cabin wearing a coonskin cap',
  'tyler': 'a president standing alone symbolizing independence',
  'polk': 'an expansionist president with a map of western territories',
  'taylor': 'a military hero in uniform nicknamed "Old Rough and Ready"',
  'fillmore': 'a president signing the Compromise of 1850',
  'pierce': 'a handsome but troubled president with a glass of alcohol',
  'buchanan': 'a president watching the Union fracture before the Civil War',
  'lincoln': 'a tall figure in a stovepipe hat freeing slaves',
  'johnson': 'a tailor-turned-president holding an impeachment document',
  'grant': 'a Civil War general in a blue uniform smoking a cigar',
  'hayes': 'a president with a contested election and a full beard',
  'garfield': 'a president struck down by an assassin\'s bullet',
  'arthur': 'an elegant president with distinctive sideburns and formal attire',
  'cleveland': 'a robust president serving two non-consecutive terms',
  'harrison': 'a small president standing in the shadow of his grandfather',
  'mckinley': 'a president promoting the gold standard',
  'roosevelt': 'a robust president with glasses and a big stick',
  'taft': 'a large president stuck in a bathtub',
  'wilson': 'an academic president with the League of Nations',
  'harding': 'a handsome president surrounded by scandal',
  'coolidge': 'a quiet, stern president known for few words',
  'hoover': 'an engineer president during the Great Depression',
  'roosevelt': 'a president in a wheelchair with a cigarette holder',
  'truman': 'a plain-speaking president holding "The Buck Stops Here" sign',
  'eisenhower': 'a military general with D-Day plans',
  'kennedy': 'a young, charismatic president in an open-top car',
  'johnson': 'a tall Texan president signing civil rights legislation',
  'nixon': 'a president making the victory sign during resignation',
  'ford': 'a president stumbling down airplane stairs',
  'carter': 'a peanut farmer president with a wide smile',
  'reagan': 'a president actor on horseback at a ranch',
  'bush': 'a president with a thousand points of light',
  'clinton': 'a saxophone-playing president wagging his finger',
  'bush': 'a president standing on rubble with a bullhorn',
  'obama': 'a president with large ears making a hope poster',
  'trump': 'a president with distinctive orange hair and long tie',
  'biden': 'an elderly president wearing aviator sunglasses'
};

// Find similar words using WordNet
const findSimilarWords = async (word, candidateWords, topN = 5) => {
  try {
    // First check if we have a direct match in our associations
    if (wordAssociations[word.toLowerCase()]) {
      return [{
        word: word,
        similarity: 1.0,
        association: wordAssociations[word.toLowerCase()]
      }];
    }

    // Try to use WordNet to find synonyms and related words
    return new Promise((resolve) => {
      wordnet.lookup(word, (results) => {
        if (!results || results.length === 0) {
          // If no WordNet results, use our fallback approach
          resolve(findSimilarWordsWithFallback(word, candidateWords, topN));
          return;
        }

        // Extract synonyms from WordNet results
        const synonyms = new Set();
        results.forEach(result => {
          if (result.synonyms) {
            result.synonyms.forEach(syn => synonyms.add(syn.replace(/_/g, ' ')));
          }
        });

        // Score candidate words based on synonym overlap
        const similarities = candidateWords.map(candidate => {
          let similarity = 0;

          // Check if the candidate is a synonym
          if (synonyms.has(candidate)) {
            similarity = 0.9;
          }

          // Check if the candidate contains or is contained by the word
          if (candidate.includes(word) || word.includes(candidate)) {
            similarity = Math.max(similarity, 0.7);
          }

          // Check for partial matches with synonyms
          synonyms.forEach(syn => {
            if (candidate.includes(syn) || syn.includes(candidate)) {
              similarity = Math.max(similarity, 0.6);
            }
          });

          return { word: candidate, similarity };
        });

        // Sort by similarity and take top N
        const result = similarities
          .sort((a, b) => b.similarity - a.similarity)
          .filter(item => item.similarity > 0)
          .slice(0, topN);

        if (result.length > 0) {
          resolve(result);
        } else {
          // If no matches found with WordNet, use fallback
          resolve(findSimilarWordsWithFallback(word, candidateWords, topN));
        }
      });
    });
  } catch (error) {
    console.error('Error finding similar words:', error);
    return findSimilarWordsWithFallback(word, candidateWords, topN);
  }
};

// Fallback method when WordNet doesn't find matches
const findSimilarWordsWithFallback = (word, candidateWords, topN) => {
  // Simple string similarity using Levenshtein distance
  const similarities = candidateWords.map(candidate => {
    const distance = natural.LevenshteinDistance(word, candidate);
    const maxLength = Math.max(word.length, candidate.length);
    // Convert distance to similarity score (0-1)
    const similarity = 1 - (distance / maxLength);
    return { word: candidate, similarity };
  });

  // Sort by similarity and take top N
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
};

// Generate figurative association using our methods
const generateFigurativeAssociation = async (term) => {
  try {
    // Check if this is a historical figure (like a president)
    const lowerTerm = term.toLowerCase();

    // Look for last names of presidents
    for (const [name, association] of Object.entries(historicalFigures)) {
      if (lowerTerm.includes(name)) {
        return association;
      }
    }

    // Check if we have a direct association in our dictionary
    if (wordAssociations[term.toLowerCase()]) {
      return `${wordAssociations[term.toLowerCase()]} symbolizing ${term}`;
    }

    // Flatten the categories of concrete words
    const allConcreteWords = Object.values(concreteVisualWords).flat();

    // Find similar concrete words
    const similarWords = await findSimilarWords(term, allConcreteWords, 5);

    if (similarWords.length > 0 && similarWords[0].similarity > 0.2) {
      // Use the most similar concrete word with a descriptive adjective
      const bestMatch = similarWords[0].word;

      // Find which category the best match belongs to
      const category = Object.keys(concreteVisualWords).find(cat =>
        concreteVisualWords[cat].includes(bestMatch)
      );

      // Add an appropriate adjective based on the category
      const adjectives = {
        animals: ['majestic', 'fierce', 'colorful', 'graceful'],
        landmarks: ['ancient', 'towering', 'magnificent', 'mysterious'],
        nature: ['powerful', 'breathtaking', 'massive', 'serene'],
        objects: ['gleaming', 'intricate', 'magical', 'ornate'],
        fantasy: ['mythical', 'enchanted', 'legendary', 'mystical'],
        phenomena: ['dazzling', 'spectacular', 'brilliant', 'mesmerizing']
      };

      const adjective = adjectives[category][Math.floor(Math.random() * adjectives[category].length)];

      return `a ${adjective} ${bestMatch} representing ${term}`;
    }

    // If no good match with concrete words, try metaphors
    const metaphorSimilarities = await findSimilarWords(
      term,
      metaphors.map(m => m.pattern),
      1
    );

    if (metaphorSimilarities.length > 0 && metaphorSimilarities[0].similarity > 0.2) {
      const bestPattern = metaphorSimilarities[0].word;
      const bestMetaphor = metaphors.find(m => m.pattern === bestPattern);
      return `${bestMetaphor.visual} symbolizing ${term}`;
    }

    // Last resort fallback - use a generic visual representation
    return `a symbolic representation of "${term}"`;
  } catch (error) {
    console.error('Error generating figurative association:', error);
    return `a visual representation of "${term}"`;
  }
};

module.exports = {
  findSimilarWords,
  generateFigurativeAssociation
};
