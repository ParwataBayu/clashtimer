// CoC Data ID to Name mapping (loaded from external mapping JSON)
import mapping from './cocMapping.json';

type MappingItem = { name: string; dataId: number };

const ID_TO_NAME: Record<number, string> = (mapping as MappingItem[]).reduce((acc, it) => {
  acc[it.dataId] = it.name;
  return acc;
}, {} as Record<number, string>);

// Some mapping files include placeholder entries like "String" for certain IDs.
// Provide small fallbacks for hero and pet IDs to avoid showing "String" in the UI.
const FALLBACK_HERO_NAMES: Record<number, string> = {
  28000000: 'Barbarian King',
  28000001: 'Archer Queen',
  28000002: 'Grand Warden',
  28000003: 'Battle Machine',
  28000004: 'Royal Champion',
  28000005: 'Battle Copter',
  28000006: 'Minion Prince',
  28000007: 'Apprentice Warden',
  28000008: 'Dragon Duke',
};

const FALLBACK_PET_NAMES: Record<number, string> = {
  73000000: 'L.A.S.S.I',
  73000001: 'Mighty Yak',
  73000002: 'Electro Owl',
  73000003: 'Unicorn',
  73000004: 'Phoenix',
  73000005: 'Phoenix Egg',
  73000006: 'Stork',
  73000007: 'Poison Lizard',
  73000008: 'Diggy',
  73000009: 'Frosty',
  73000010: 'Spirit Fox',
  73000011: 'Angry Jelly',
  73000016: 'Sneezy',
  73000155: 'Crow',
};

for (const [id, name] of Object.entries(FALLBACK_HERO_NAMES)) {
  const numId = Number(id);
  if (!ID_TO_NAME[numId] || ID_TO_NAME[numId].toLowerCase().startsWith('string')) {
    ID_TO_NAME[numId] = name;
  }
}

for (const [id, name] of Object.entries(FALLBACK_PET_NAMES)) {
  const numId = Number(id);
  if (!ID_TO_NAME[numId] || ID_TO_NAME[numId].toLowerCase().startsWith('string')) {
    ID_TO_NAME[numId] = name;
  }
}

export function getBuildingName(dataId: number): string {
  return ID_TO_NAME[dataId] ?? `Bangunan #${dataId}`;
}

export function getHeroName(dataId: number): string {
  const name = ID_TO_NAME[dataId] ?? resolveNameFromMaps(dataId, ID_TO_NAME, FALLBACK_HERO_NAMES);
  if (!name) return `Hero #${dataId}`;
  // strip leading "BB " for hero display (builder-base prefix not desired for heroes list)
  return name.replace(/^BB\s+/i, '');
}

// Fallback maps for units, spells, equipment when mapping file is missing entries
const UNIT_FALLBACK: Record<number, string> = {
  4000000: 'Barbarian',
  4000001: 'Archer',
  4000002: 'Giant',
  4000003: 'Goblin',
  4000004: 'Wall Breaker',
  4000005: 'Balloon',
  4000006: 'Wizard',
  4000007: 'Healer',
  4000008: 'Dragon',
  4000009: 'P.E.K.K.A',
  4000010: 'Minion',
  4000011: 'Hog Rider',
  4000012: 'Valkyrie',
  4000013: 'Golem',
  4000014: 'Witch',
  4000015: 'Lava Hound',
  4000016: 'Bowler',
  4000017: 'Baby Dragon',
  4000018: 'Miner',
  4000019: 'Super Barbarian',
  4000020: 'Super Archer',
  4000021: 'Super Wall Breaker',
  4000022: 'Sneaky Goblin',
  4000023: 'Super Giant',
  4000024: 'Inferno Dragon',
  4000025: 'Super Valkyrie',
  4000026: 'Super Witch',
  4000027: 'Ice Golem',
  4000028: 'Electro Dragon',
  4000029: 'Yeti',
  4000030: 'Dragon Rider',
  4000031: 'Electro Titan',
  4000032: 'Root Rider',
  4000033: 'Thrower',
  4000034: 'Minion',
  4000035: 'Super Hog Rider',
  4000036: 'Super Bowler',
  4000037: 'Super Dragon',
  4000038: 'Sneaky Archer',
  4000039: 'Super Miner',
  4000040: 'Super Witch',
  4000041: 'Electro Titan',
  4000042: 'Root Rider',
  4000051: 'Wall Wrecker',
  4000052: 'Battle Blimp',
  4000053: 'Stone Slammer',
  4000054: 'Siege Barracks',
  4000055: 'Log Launcher',
  4000056: 'Flame Flinger',
  4000057: 'Battle Drill',
  4000058: 'Druid',
  4000059: 'Minion',
  4000060: 'Super Barbarian',
  4000061: 'Super Archer',
  4000062: 'Flame Flinger',
  4000063: 'Battle Drill',
  4000065: 'Apprentice Warden',
  4000070: 'Electro Titan',
  4000075: 'Battle Blimp',
  4000082: 'Thrower',
  4000087: 'Siege Barracks',
  4000091: 'Log Launcher',
  4000095: 'Druid',
  4000097: 'Minion',
  4000123: 'Root Rider',
};

const SPELL_FALLBACK: Record<number, string> = {
  26000000: 'Lightning Spell',
  26000001: 'Healing Spell',
  26000002: 'Rage Spell',
  26000003: 'Freeze Spell',
  26000004: 'Jump Spell',
  26000005: 'Earthquake Spell',
  26000006: 'Haste Spell',
  26000007: 'Clone Spell',
  26000008: 'Invisibility Spell',
  26000009: 'Poison Spell',
  26000010: 'Earthquake Spell',
  26000011: 'Haste Spell',
  26000012: 'Bat Spell',
  26000013: 'Skeleton Spell',
  26000014: 'Overgrowth Spell',
  26000015: 'Recall Spell',
  26000016: 'Bat Spell',
  26000017: 'Skeleton Spell',
  26000028: 'Overgrowth Spell',
  26000035: 'Recall Spell',
  26000053: 'Invisibility Spell',
  26000070: 'Clone Spell',
  26000109: 'Revive Spell',
};

const EQUIPMENT_FALLBACK: Record<number, string> = {
  90000000: 'Barbarian Puppet',
  90000001: 'Rage Vial',
  90000002: 'Archer Puppet',
  90000003: 'Invisibility Vial',
  90000004: 'Giant Gauntlet',
  90000005: 'Frozen Arrow',
  90000006: 'Master Builder Puppet',
  90000007: 'Giant Gauntlet',
  90000008: 'Hog Rider Puppet',
  90000009: 'Eternal Tome',
  90000010: 'Life Gem',
  90000011: 'Rage Gem',
  90000012: 'Healing Tome',
  90000013: 'Royal Gem',
  90000014: 'Seeking Shield',
  90000015: 'Giant Arrow',
  90000016: 'Healer Puppet',
  90000017: 'Fireball',
  90000018: 'Henchmen Puppet',
  90000019: 'Rocket Spear',
  90000020: 'Electro Boots',
  90000021: 'Vampstache',
  90000022: 'Dark Orb',
  90000023: 'Earthquake Boots',
  90000024: 'Hog Rider Puppet',
  90000025: 'Spiky Ball',
  90000026: 'Magic Mirror',
  90000027: 'Haste Vial',
  90000028: 'Giant Gauntlet',
  90000029: 'Frozen Arrow',
  90000030: 'Barbarian Puppet',
  90000031: 'Rage Vial',
  90000032: 'Archer Puppet',
  90000033: 'Invisibility Vial',
  90000034: 'Seeking Shield',
  90000035: 'Giant Arrow',
  90000036: 'Eternal Tome',
  90000037: 'Life Gem',
  90000038: 'Rage Gem',
  90000039: 'Healing Tome',
  90000040: 'Royal Gem',
  90000041: 'Healer Puppet',
  90000042: 'Fireball',
  90000043: 'Electro Boots',
  90000044: 'Vampstache',
  90000047: 'Dark Orb',
  90000048: 'Earthquake Boots',
  90000049: 'Spiky Ball',
  90000050: 'Magic Mirror',
  90000051: 'Haste Vial',
  90000052: 'Rocket Spear',
  90000053: 'Henchmen Puppet',
  90000057: 'Giant Gauntlet',
};
// Fallback for trap IDs (12000000+)
const TRAP_FALLBACK: Record<number, string> = {
  12000000: 'Bomb',
  12000001: 'Spring Trap',
  12000002: 'Giant Bomb',
  12000005: 'Air Bomb',
  12000006: 'Seeking Air Mine',
  12000008: 'Skeleton Trap',
  12000010: 'Small Air Bomb',
  12000011: 'Large Air Bomb',
  12000013: 'Hidden Tesla Trap',
  12000014: 'Multi Trap',
  12000016: 'Tornado Trap',
};

export function getTrapName(dataId: number): string {
  return resolveNameFromMaps(dataId, ID_TO_NAME, TRAP_FALLBACK) ?? `Trap #${dataId}`;
}
function resolveNameFromMaps(dataId: number, ...maps: Array<Record<number, string>>): string | undefined {
  const strId = String(dataId);
  // direct lookup
  for (const m of maps) {
    if (m[dataId]) return m[dataId];
  }

  // try suffix/partial matches (handle extra leading/trailing zeros)
  const allEntries: Array<[string, string]> = [];
  for (const m of maps) {
    for (const k of Object.keys(m)) {
      allEntries.push([k, m[Number(k)]]);
    }
  }

  for (const [k, v] of allEntries) {
    if (k.endsWith(strId) || strId.endsWith(k)) return v;
  }

  return undefined;
}

export function getUnitName(dataId: number): string {
  return (
    resolveNameFromMaps(dataId, ID_TO_NAME, UNIT_FALLBACK) ?? `Pasukan #${dataId}`
  );
}

export function getSpellName(dataId: number): string {
  return (
    resolveNameFromMaps(dataId, ID_TO_NAME, SPELL_FALLBACK) ?? `Mantra #${dataId}`
  );
}

export function getPetName(dataId: number): string {
  return (
    resolveNameFromMaps(dataId, ID_TO_NAME, FALLBACK_PET_NAMES) ?? `Pet #${dataId}`
  );
}

export function getEquipmentName(dataId: number): string {
  return (
    resolveNameFromMaps(dataId, ID_TO_NAME, EQUIPMENT_FALLBACK) ?? `Equipment #${dataId}`
  );
}
