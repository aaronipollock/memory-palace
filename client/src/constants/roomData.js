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
      'column': { top: '50%', left: '10%', width: '80px', height: '250px' },
      'dais': { top: '75%', left: '25%', width: '180px', height: '80px' },
      'statue': { top: '60%', left: '33%', width: '100px', height: '200px' },
      'stained glass window': { top: '40%', left: '40%', width: '150px', height: '150px' },
      'banner': { top: '50%', left: '75%', width: '120px', height: '180px' },
      'candlestick': { top: '70%', left: '85%', width: '80px', height: '150px' },
      'footstool': { top: '90%', left: '75%', width: '100px', height: '80px' },
      'red carpet': { top: '85%', left: '55%', width: '200px', height: '100px' },
      'throne': { top: '60%', left: '55%', width: '150px', height: '150px' },
      'chandelier': { top: '20%', left: '60%', width: '150px', height: '100px' },
    },
    "bedchamber": {
      'wardrobe': { top: '45%', left: '10%', width: '80px', height: '80px' },
      'armchair': { top: '60%', left: '15%', width: '120px', height: '100px' },
      'dresser': { top: '60%', left: '25%', width: '150px', height: '120px' },
      'mirror': { top: '45%', left: '25%', width: '150px', height: '120px' },
      'bed': { top: '60%', left: '50%', width: '200px', height: '150px' },
      'headboard': { top: '45%', left: '70%', width: '180px', height: '100px' },
      'ceiling beams': { top: '15%', left: '70%', width: '300px', height: '80px' },
      'lamp': { top: '45%', left: '88%', width: '80px', height: '120px' },
      'nightstand': { top: '70%', left: '85%', width: '100px', height: '100px' },
      'rug': { top: '90%', left: '50%', width: '200px', height: '100px' }
    },
    "dungeon": {
      'iron gate': { top: '40%', left: '30%', width: '200px', height: '120px' },
      'table': { top: '70%', left: '40%', width: '100px', height: '120px' },
      'pillory': { top: '60%', left: '75%', width: '120px', height: '100px' },
      'bookshelf': { top: '60%', left: '10%', width: '120px', height: '200px' },
      'barrel': { top: '70%', left: '90%', width: '100px', height: '150px' },
      'wall chains': { top: '35%', left: '72%', width: '150px', height: '120px' },
      'sconce': { top: '30%', left: '90%', width: '80px', height: '100px' },
      'arched ceiling': { top: '20%', left: '55%', width: '300px', height: '150px' },
      'candelabra': { top: '55%', left: '40%', width: '100px', height: '80px' },
      'parchment': { top: '65%', left: '60%', width: '80px', height: '60px' }
    },
  };

export { ROOM_ANCHOR_POSITIONS, ROOM_IMAGES }
