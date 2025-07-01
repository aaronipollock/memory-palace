// Room images
const ROOM_IMAGES = {
    "throne room": "/images/throne_room.webp",
    "bedchamber": "/images/bedchamber.webp",
    "kitchen": "/images/kitchen.webp",
    "dining room": "/images/dining_room.webp",
    "dungeon": "/images/dungeon.webp",
    "bathroom": "/images/bathroom.webp",
    "study": "/images/study.webp",
    "game room": "/images/game_room.webp"
  };

  // Predefined clickable areas for each anchor point by room type
  const ROOM_ANCHOR_POSITIONS = {
    "throne room": {
      'throne': { top: '60%', left: '50%', width: '150px', height: '150px' },
      'red carpet': { top: '85%', left: '55%', width: '200px', height: '100px' },
      'stained glass window': { top: '40%', left: '60%', width: '150px', height: '150px' },
      'chandelier': { top: '20%', left: '45%', width: '150px', height: '100px' },
      'footstool': { top: '90%', left: '68%', width: '100px', height: '80px' },
      'statue': { top: '60%', left: '25%', width: '100px', height: '200px' },
      'candlestick': { top: '60%', left: '85%', width: '80px', height: '150px' }
    },
    "bedchamber": {
      'bed': { top: '60%', left: '50%', width: '200px', height: '150px' },
      'wardrobe': { top: '45%', left: '10%', width: '80px', height: '80px' },
      'nightstand': { top: '70%', left: '85%', width: '100px', height: '100px' },
      'lamp': { top: '45%', left: '88%', width: '80px', height: '120px' },
      'mirror': { top: '45%', left: '25%', width: '150px', height: '120px' },
      'dresser': { top: '60%', left: '25%', width: '150px', height: '120px' },
      'rug': { top: '90%', left: '50%', width: '200px', height: '100px' }
    },
    "dungeon": {
      'gate': { top: '50%', left: '35%', width: '200px', height: '120px' },
      'table': { top: '70%', left: '40%', width: '100px', height: '120px' },
      'pillory': { top: '60%', left: '75%', width: '120px', height: '100px' },
      'bookshelf': { top: '60%', left: '10%', width: '120px', height: '200px' },
      'barrel': { top: '80%', left: '90%', width: '100px', height: '150px' },
      'hanging chains': { top: '35%', left: '72%', width: '150px', height: '120px' },
      'sconce': { top: '25%', left: '90%', width: '80px', height: '100px' }
    },
  };

export { ROOM_ANCHOR_POSITIONS, ROOM_IMAGES }
