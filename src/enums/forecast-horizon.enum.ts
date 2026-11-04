/**
 * Forecast chart horizons.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** How many projected months the Forecast page shows. Values are month counts as strings (segmented-control values). */
export enum ForecastHorizon {
  /** 12 months. */
  Year = "12",
  /** 24 months (default). */
  TwoYears = "24",
  /** 36 months, the full model horizon. */
  ThreeYears = "36",
}
