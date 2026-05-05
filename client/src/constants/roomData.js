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
      'column': { top: '38%', left: '10%', width: '100px', height: '280px' },
      'stained glass window': { top: '28%', left: '36%', width: '200px', height: '200px' },
      'chandelier': { top: '14%', left: '60%', width: '180px', height: '120px' },
      'tapestry': { top: '48%', left: '79%', width: '140px', height: '200px' },
      'candlestick': { top: '68%', left: '88%', width: '100px', height: '170px' },
      'footstool': { top: '88%', left: '72%', width: '120px', height: '90px' },
      'red carpet': { top: '89%', left: '58%', width: '240px', height: '110px' },
      'throne': { top: '72%', left: '43%', width: '170px', height: '170px' },
      'dais': { top: '83%', left: '30%', width: '260px', height: '95px' },
      'statue': { top: '58%', left: '28%', width: '130px', height: '240px' },
    },
    "bedchamber": {
      'wardrobe': { top: '66%', left: '8%', width: '150px', height: '300px' },
      'armchair': { top: '58%', left: '16%', width: '130px', height: '130px' },
      'dresser': { top: '56%', left: '24%', width: '170px', height: '140px' },
      'mirror': { top: '43%', left: '30%', width: '130px', height: '110px' },
      'ceiling beams': { top: '12%', left: '59%', width: '400px', height: '110px' },
      'headboard': { top: '44%', left: '70%', width: '220px', height: '130px' },
      'lamp': { top: '50%', left: '88%', width: '95px', height: '150px' },
      'nightstand': { top: '66%', left: '84%', width: '120px', height: '120px' },
      'bed': { top: '60%', left: '65%', width: '260px', height: '200px' },
      'rug': { top: '76%', left: '34%', width: '280px', height: '150px' }
    },
    "dungeon": {
      'barrel': { top: '76%', left: '4%', width: '120px', height: '170px' },
      'bookshelf': { top: '56%', left: '16%', width: '150px', height: '240px' },
      'iron gate': { top: '40%', left: '28%', width: '240px', height: '150px' },
      'arched ceiling': { top: '20%', left: '56%', width: '340px', height: '170px' },
      'wall chains': { top: '30%', left: '68%', width: '170px', height: '150px' },
      'sconce': { top: '42%', left: '88%', width: '95px', height: '120px' },
      'pillory': { top: '68%', left: '76%', width: '150px', height: '220px' },
      'parchment': { top: '62%', left: '59%', width: '95px', height: '75px' },
      'candelabra': { top: '64%', left: '46%', width: '115px', height: '95px' },
      'table': { top: '63%', left: '34%', width: '150px', height: '150px' },
    },
  };

const TAU = 2 * Math.PI;

/**
 * Bearing in radians: 0 = top of frame, increases clockwise (right → bottom → left).
 * Pivot is image center so order is a consistent walk around the room.
 */
function clockwiseBearingFromTop(leftPct, topPct, centerX = 50, centerY = 50) {
  const dx = leftPct - centerX;
  const dy = topPct - centerY;
  return Math.atan2(dx, -dy);
}

/** Map bearing into [0, TAU) relative to startBearing (0 = at start, increasing = clockwise). */
function bearingClockwiseFromStart(bearing, startBearing) {
  return ((bearing - startBearing) % TAU + TAU) % TAU;
}

function parsePercent(value) {
  if (typeof value !== 'string') return NaN;
  const n = parseFloat(String(value).replace('%', '').trim());
  return Number.isFinite(n) ? n : NaN;
}

/** Sort anchor names clockwise from image center, starting at the left-most anchor (min left, then min top). */
function getAnchorNamesClockwiseFromPositions(positions) {
  if (!positions || typeof positions !== 'object') return [];
  const entries = Object.entries(positions).map(([name, pos]) => {
    const left = parsePercent(pos.left);
    const top = parsePercent(pos.top);
    const bearing = clockwiseBearingFromTop(left, top);
    const dist = (left - 50) ** 2 + (top - 50) ** 2;
    return { name, left, top, bearing, dist };
  });
  if (entries.length === 0) return [];

  let start = entries[0];
  for (let i = 1; i < entries.length; i++) {
    const e = entries[i];
    if (e.left < start.left || (e.left === start.left && e.top < start.top)) {
      start = e;
    }
  }
  const startBearing = start.bearing;

  entries.sort((a, b) => {
    const ra = bearingClockwiseFromStart(a.bearing, startBearing);
    const rb = bearingClockwiseFromStart(b.bearing, startBearing);
    if (ra !== rb) return ra - rb;
    return a.dist - b.dist;
  });
  return entries.map((e) => e.name);
}

function getCustomAnchorNamesClockwise(anchorPoints) {
  if (!Array.isArray(anchorPoints) || anchorPoints.length === 0) return [];
  const entries = anchorPoints.map((p) => ({
    point: p,
    bearing: clockwiseBearingFromTop(p.x, p.y),
    dist: (p.x - 50) ** 2 + (p.y - 50) ** 2
  }));

  let start = entries[0];
  for (let i = 1; i < entries.length; i++) {
    const e = entries[i];
    if (e.point.x < start.point.x || (e.point.x === start.point.x && e.point.y < start.point.y)) {
      start = e;
    }
  }
  const startBearing = start.bearing;

  entries.sort((a, b) => {
    const ra = bearingClockwiseFromStart(a.bearing, startBearing);
    const rb = bearingClockwiseFromStart(b.bearing, startBearing);
    if (ra !== rb) return ra - rb;
    return a.dist - b.dist;
  });
  return entries.map((e) => e.point.name);
}

export { ROOM_ANCHOR_POSITIONS, ROOM_IMAGES, getAnchorNamesClockwiseFromPositions, getCustomAnchorNamesClockwise }
