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

/**
 * Get unique rarities from weapons list, sorted ascending
 * @param {Object[]} weapons - List of weapons
 * @returns {number[]} Unique rarity values
 */
export function getUniqueRarities(weapons) {
  const set = new Set()
  weapons.forEach((w) => {
    if (w.rarity != null && w.rarity !== '') set.add(Number(w.rarity))
  })
  return [...set].sort((a, b) => a - b)
}

/**
 * Get unique types from weapons list (type is { zh, en } object)
 * @param {Object[]} weapons - List of weapons
 * @returns {Object[]} Unique type objects (order preserved by first appearance)
 */
export function getUniqueTypes(weapons) {
  const seen = new Set()
  const result = []
  weapons.forEach((w) => {
    if (w.type && typeof w.type === 'object') {
      const key = JSON.stringify(w.type)
      if (!seen.has(key)) {
        seen.add(key)
        result.push(w.type)
      }
    }
  })
  return result
}

/**
 * Check if weapon matches type filter (type filter is stringified type object or 'all')
 */
export function weaponMatchesType(weapon, typeFilter) {
  if (typeFilter === 'all' || !typeFilter) return true
  if (!weapon.type) return false
  return JSON.stringify(weapon.type) === typeFilter
}

/**
 * Check if weapon matches rarity filter
 */
export function weaponMatchesRarity(weapon, rarityFilter) {
  if (rarityFilter === 'all' || rarityFilter === '' || rarityFilter == null) return true
  return Number(weapon.rarity) === Number(rarityFilter)
}
