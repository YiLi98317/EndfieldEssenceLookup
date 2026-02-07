/**
 * Returns pools where ALL of the weapon's stats are in the pool.
 * These are the farm places where the weapon's best essence can drop.
 */
export function getMatchingPools(weapon, pools) {
  if (!weapon) return [];
  return pools.filter((pool) =>
    weapon.stats.every((stat) => pool.stats.includes(stat))
  );
}
