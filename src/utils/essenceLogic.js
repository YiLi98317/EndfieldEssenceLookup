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
