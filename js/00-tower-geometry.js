/* 00-tower-geometry.js — pure procedural tower geometry (T9)
   Campaign length is the only source of floor count. The renderer supplies
   viewport measurements later; these functions need only numbers. */
const TV_ASSET = Object.freeze({roofHeight:251, topHeight:87, windowHeight:94, baseHeight:302});

function towerGeometry(floors){
  const count = Math.max(1, Math.floor(Number(floors) || 1));
  const repeatLevels = Math.max(0, count - 3);
  const worldHeight = TV_ASSET.roofHeight + TV_ASSET.topHeight
    + repeatLevels * TV_ASSET.windowHeight + TV_ASSET.windowHeight + TV_ASSET.baseHeight;
  return Object.freeze({...TV_ASSET, floors:count, repeatLevels, worldHeight});
}
function tvLevelTop(level, geometry){
  const g = geometry || towerGeometry(1);
  const {roofHeight:R, topHeight:T, windowHeight:W, repeatLevels:REP, floors:N} = g;
  if(level === N) return 0;
  if(level === N - 1) return R;
  if(level >= 2) return R + T + ((N - 2 - level) * W);
  return R + T + (REP * W);
}
function tvLevelHeight(level, geometry){
  const g = geometry || towerGeometry(1);
  if(level === g.floors) return g.roofHeight;
  if(level === g.floors - 1) return g.topHeight;
  return g.windowHeight;
}
function tvGlowTop(level, geometry){
  const g = geometry || towerGeometry(1);
  if(level === g.floors) return 163;
  if(level === 1) return 36;
  if(level === g.floors - 1) return 32;
  return 31;
}

if(typeof module !== "undefined" && module.exports){
  module.exports = {TV_ASSET, towerGeometry, tvLevelTop, tvLevelHeight, tvGlowTop};
}
if(typeof SQ !== "undefined"){
  SQ.TV_ASSET = TV_ASSET;
  SQ.towerGeometry = towerGeometry;
  SQ.tvLevelTop = tvLevelTop;
  SQ.tvLevelHeight = tvLevelHeight;
  SQ.tvGlowTop = tvGlowTop;
}
