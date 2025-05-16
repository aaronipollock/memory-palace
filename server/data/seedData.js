const seedData = {
  // Language Learning Example (Spanish Vocabulary)
  spanishVocabulary: {
    roomType: "throne room",
    associations: [
      {
        anchor: "throne",
        memorable: "el rey (the king)",
        description: "A majestic king sitting on the throne, wearing a crown with Spanish flag colors"
      },
      {
        anchor: "stained glass window",
        memorable: "la ventana (the window)",
        description: "A beautiful stained glass window with Spanish architectural patterns"
      },
      {
        anchor: "chandelier",
        memorable: "la luz (the light)",
        description: "A glowing chandelier casting warm light throughout the room"
      },
      {
        anchor: "red carpet",
        memorable: "el camino (the path)",
        description: "A royal red carpet leading to the throne"
      }
    ]
  },

  // Historical Events Example (American Revolution)
  americanRevolution: {
    roomType: "bedchamber",
    associations: [
      {
        anchor: "bed",
        memorable: "Declaration of Independence",
        description: "A quill pen writing on a scroll on the bed"
      },
      {
        anchor: "lamp",
        memorable: "Boston Tea Party",
        description: "Tea leaves floating in a lamp's light"
      },
      {
        anchor: "mirror",
        memorable: "George Washington",
        description: "A reflection of Washington crossing the Delaware"
      },
      {
        anchor: "window",
        memorable: "Paul Revere's Ride",
        description: "A horse silhouette against the window"
      }
    ]
  },

  // Medical Study Example (Human Anatomy)
  humanAnatomy: {
    roomType: "dungeon",
    associations: [
      {
        anchor: "hanging chains",
        memorable: "Spinal Column",
        description: "Chains arranged like vertebrae"
      },
      {
        anchor: "torch",
        memorable: "Heart",
        description: "A glowing heart-shaped torch"
      },
      {
        anchor: "cell door",
        memorable: "Rib Cage",
        description: "Bars forming a rib-like pattern"
      },
      {
        anchor: "stone wall",
        memorable: "Skin",
        description: "Wall with texture like human skin"
      }
    ]
  },

  // Programming Concepts Example
  programmingConcepts: {
    roomType: "throne room",
    associations: [
      {
        anchor: "throne",
        memorable: "Recursion",
        description: "A throne with smaller thrones nested within it"
      },
      {
        anchor: "stained glass window",
        memorable: "Object-Oriented Programming",
        description: "Stained glass showing inheritance hierarchy"
      },
      {
        anchor: "chandelier",
        memorable: "Event Loop",
        description: "A chandelier with lights moving in a circular pattern"
      },
      {
        anchor: "red carpet",
        memorable: "Data Flow",
        description: "A carpet with binary code patterns flowing"
      }
    ]
  },

  // Music Theory Example
  musicTheory: {
    roomType: "bedchamber",
    associations: [
      {
        anchor: "bed",
        memorable: "Major Scale",
        description: "A bed with seven steps leading up to it"
      },
      {
        anchor: "lamp",
        memorable: "Chord Progressions",
        description: "A lamp with three bulbs in different colors"
      },
      {
        anchor: "mirror",
        memorable: "Harmony",
        description: "Multiple reflections creating perfect harmony"
      },
      {
        anchor: "window",
        memorable: "Rhythm",
        description: "Window with metronome-like patterns"
      }
    ]
  }
};

module.exports = seedData;
