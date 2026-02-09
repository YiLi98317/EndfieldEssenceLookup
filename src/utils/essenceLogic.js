import { hasAllStats } from './dataHelpers'

/**
 * Returns pools where ALL of the weapon's stats are in the pool.
 * These are the farm places where the weapon's best essence can drop.
 */
export function getMatchingPools(weapon, pools) {
  if (!weapon || !weapon.stats) return [];
  return pools.filter((pool) =>
    hasAllStats(weapon.stats, pool.stats)
  );
}

/**
 * Finds all weapons that can be farmed together at a given pool.
 * In one run you select 3 basic + 1 additional OR 1 skill, so only weapons
 * that share the same additional OR the same skill as the current weapon can
 * drop in the same run.
 *
 * @param {Object} pool - Pool object with stats
 * @param {Object[]} allWeapons - Array of all weapons
 * @param {Object} currentWeapon - Currently selected weapon (excluded from results)
 * @returns {Object[]} Array of weapons that can be farmed together
 */
export function getFarmableTogetherWeapons(pool, allWeapons, currentWeapon) {
  if (!pool?.stats || !Array.isArray(allWeapons) || !currentWeapon?.stats)
    return [];
  const currentId = currentWeapon.id != null ? currentWeapon.id : undefined;
  const currentAdditional = currentWeapon.stats.additional?.[0];
  const currentSkill = currentWeapon.stats.skill?.[0];

  return allWeapons.filter((weapon) => {
    if (weapon.id === currentId || String(weapon.id) === String(currentId))
      return false;
    if (!weapon.stats) return false;
    if (!hasAllStats(weapon.stats, pool.stats)) return false;
    const sameAdditional =
      currentAdditional != null &&
      weapon.stats.additional?.[0] === currentAdditional;
    const sameSkill =
      currentSkill != null && weapon.stats.skill?.[0] === currentSkill;
    return sameAdditional || sameSkill;
  });
}
