/**
 * Gets the localized name from a name object or string
 * @param {Object|string} name - Name object with zh/en keys or string
 * @param {string} language - Current language ('en' or 'zh')
 * @returns {string} Localized name
 */
export function getLocalizedName(name, language) {
  if (typeof name === 'string') {
    return name // Fallback for old format
  }
  if (name && typeof name === 'object') {
    return name[language] || name.en || name.zh || ''
  }
  return ''
}

/**
 * Flattens stats object into a single array for display
 * @param {Object} stats - Stats object with basic, additional, skill arrays
 * @returns {string[]} Flattened array of all stats
 */
export function flattenStats(stats) {
  if (Array.isArray(stats)) {
    return stats // Fallback for old format
  }
  if (stats && typeof stats === 'object') {
    return [
      ...(stats.basic || []),
      ...(stats.additional || []),
      ...(stats.skill || [])
    ]
  }
  return []
}

/**
 * Checks if all weapon stats are present in pool stats
 * @param {Object} weaponStats - Weapon stats object
 * @param {Object} poolStats - Pool stats object
 * @returns {boolean} True if all weapon stats are in pool
 */
export function hasAllStats(weaponStats, poolStats) {
  const weaponStatsFlat = flattenStats(weaponStats)
  const poolStatsFlat = flattenStats(poolStats)
  
  return weaponStatsFlat.every((stat) => poolStatsFlat.includes(stat))
}
