import { useMemo } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Chip,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { getMatchingPools, getFarmableTogetherWeapons } from "../utils/essenceLogic";
import { useLanguage } from "../i18n/LanguageContext";
import { getLocalizedName, flattenStats } from "../utils/dataHelpers";

function PoolStatsBlock({ stats, hasCategorized, isMatchingStat, t, flattenStats }) {
  if (hasCategorized) {
    return (
      <>
        {stats.basic?.length > 0 && (
          <Box sx={{ mb: 0.5 }}>
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, display: "block", mb: 0.25 }}
            >
              {t("statBasic")}:{" "}
            </Typography>
            <Box
              component="span"
              sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}
            >
              {stats.basic.map((stat) => (
                <Chip
                  key={stat}
                  label={stat}
                  size="small"
                  variant={isMatchingStat(stat) ? "filled" : "outlined"}
                  color={isMatchingStat(stat) ? "primary" : "default"}
                />
              ))}
            </Box>
          </Box>
        )}
        {stats.additional?.length > 0 && (
          <Box sx={{ mb: 0.5 }}>
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, display: "block", mb: 0.25 }}
            >
              {t("statAdditional")}:{" "}
            </Typography>
            <Box
              component="span"
              sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}
            >
              {stats.additional.map((stat) => (
                <Chip
                  key={stat}
                  label={stat}
                  size="small"
                  variant={isMatchingStat(stat) ? "filled" : "outlined"}
                  color={isMatchingStat(stat) ? "primary" : "default"}
                />
              ))}
            </Box>
          </Box>
        )}
        {stats.skill?.length > 0 && (
          <Box>
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, display: "block", mb: 0.25 }}
            >
              {t("statSkill")}:{" "}
            </Typography>
            <Box
              component="span"
              sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}
            >
              {stats.skill.map((stat) => (
                <Chip
                  key={stat}
                  label={stat}
                  size="small"
                  variant={isMatchingStat(stat) ? "filled" : "outlined"}
                  color={isMatchingStat(stat) ? "primary" : "default"}
                />
              ))}
            </Box>
          </Box>
        )}
      </>
    );
  }
  return (
    <Box component="span" sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
      {flattenStats(stats).map((stat) => (
        <Chip
          key={stat}
          label={stat}
          size="small"
          variant={isMatchingStat(stat) ? "filled" : "outlined"}
          color={isMatchingStat(stat) ? "primary" : "default"}
        />
      ))}
    </Box>
  );
}

export default function FarmPlaceResults({ weapon, pools, weapons = [] }) {
  const { t, language } = useLanguage();

  if (!weapon) {
    return (
      <Typography color="text.secondary">{t("selectWeaponHint")}</Typography>
    );
  }

  const matchingPools = getMatchingPools(weapon, pools);
  const weaponName = getLocalizedName(weapon.name, language);
  const statsList = flattenStats(weapon.stats);
  const statsStr = statsList.join(", ");

  const weaponStatsSet = useMemo(
    () => new Set(flattenStats(weapon.stats)),
    [weapon]
  );
  const isMatchingStat = (stat) => weaponStatsSet.has(stat);

  if (matchingPools.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="error">
          {t("noFarmPlace", { name: weaponName, stats: statsStr })}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {t("farmThesePlaces", { name: weaponName, stats: statsStr })}
      </Typography>
      <Paper>
        {matchingPools.map((pool) => {
          const poolName = getLocalizedName(pool.name, language);
          const stats = pool.stats;
          const hasCategorized =
            stats &&
            typeof stats === "object" &&
            (stats.basic?.length || stats.additional?.length || stats.skill?.length);
          const farmableWeapons = getFarmableTogetherWeapons(pool, weapons, weapon);

          return (
            <Accordion key={pool.id} disableGutters sx={{ "&:before": { display: "none" } }}>
              <AccordionSummary
                expandIcon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
                  </svg>
                }
              >
                <Box sx={{ width: "100%", pr: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {poolName}
                  </Typography>
                  <Box component="div" sx={{ mt: 0.5 }}>
                    <PoolStatsBlock
                      stats={stats}
                      hasCategorized={hasCategorized}
                      isMatchingStat={isMatchingStat}
                      t={t}
                      flattenStats={flattenStats}
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  {t("farmableTogether")}
                </Typography>
                {farmableWeapons.length > 0 ? (
                  <List dense disablePadding>
                    {farmableWeapons.map((w) => {
                      const wName = getLocalizedName(w.name, language);
                      const wStatsList = flattenStats(w.stats);
                      const typeLabel = w.type
                        ? ` · ${getLocalizedName(w.type, language)}`
                        : "";
                      const rarityLabel = w.rarity != null ? ` · ${w.rarity}★` : "";
                      const selectStat =
                        (weapon.stats.additional?.[0] != null &&
                         w.stats.additional?.[0] === weapon.stats.additional?.[0]
                          ? w.stats.additional[0]
                          : null) ??
                        (weapon.stats.skill?.[0] != null &&
                         w.stats.skill?.[0] === weapon.stats.skill?.[0]
                          ? w.stats.skill[0]
                          : null);
                      return (
                        <ListItem key={w.id} disablePadding sx={{ py: 0.25 }}>
                          <ListItemText
                            primary={`${wName}${typeLabel}${rarityLabel}`}
                            secondary={
                              wStatsList.length > 0 ? (
                                <Box
                                  component="span"
                                  sx={{
                                    display: "flex",
                                    gap: 0.5,
                                    flexWrap: "wrap",
                                    mt: 0.25,
                                  }}
                                >
                                  {wStatsList.map((s) => (
                                    <Chip
                                      key={s}
                                      label={s}
                                      size="small"
                                      variant={s === selectStat ? "filled" : "outlined"}
                                      sx={
                                        s === selectStat
                                          ? {
                                              backgroundColor: "warning.light",
                                              color: "warning.contrastText",
                                              borderColor: "warning.main",
                                            }
                                          : undefined
                                      }
                                    />
                                  ))}
                                </Box>
                              ) : null
                            }
                            secondaryTypographyProps={{ component: "div" }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t("noFarmableTogether")}
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Paper>
    </Box>
  );
}
