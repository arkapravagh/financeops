import type { AiBudget, AiFeatureInfo, AiSeatCharge, AiUsage } from "../types/finance";

/**
 * AI usage and cost, May–Oct 2026, as billed by each provider (fictional vendors).
 * All AI spend is booked under "Software & cloud" in budgets/transactions.
 * October totals: API $1,490.07 + GPU $2,640.00 (= txn_024) + seats $690.00 = $4,820.07.
 */
export const aiFeatures = [
  { feature: "In-app assistant", description: "Answers customer questions inside the product", customerFacing: true },
  { feature: "Document parsing", description: "Extracts fields from uploaded files", customerFacing: true },
  { feature: "Search", description: "Embeddings for semantic search", customerFacing: true },
  { feature: "Support triage", description: "Tags and routes support tickets", customerFacing: true },
  { feature: "Internal tools", description: "Scripts and agents the team runs", customerFacing: false },
] satisfies AiFeatureInfo[];

export const aiUsage = [
  { id: "aiu_001", month: "2026-05", vendor: "Lumen Labs", model: "Lumen Pro", kind: "api", feature: "In-app assistant", requests: 22_220, inputTokens: 101_080_000, outputTokens: 14_440_000, costCents: 519_84 },
  { id: "aiu_002", month: "2026-06", vendor: "Lumen Labs", model: "Lumen Pro", kind: "api", feature: "In-app assistant", requests: 24_780, inputTokens: 112_770_000, outputTokens: 16_110_000, costCents: 579_96 },
  { id: "aiu_003", month: "2026-07", vendor: "Lumen Labs", model: "Lumen Pro", kind: "api", feature: "In-app assistant", requests: 27_350, inputTokens: 124_460_000, outputTokens: 17_780_000, costCents: 640_08 },
  { id: "aiu_004", month: "2026-08", vendor: "Lumen Labs", model: "Lumen Pro", kind: "api", feature: "In-app assistant", requests: 29_490, inputTokens: 134_190_000, outputTokens: 19_170_000, costCents: 690_12 },
  { id: "aiu_005", month: "2026-09", vendor: "Lumen Labs", model: "Lumen Pro", kind: "api", feature: "In-app assistant", requests: 32_480, inputTokens: 147_770_000, outputTokens: 21_110_000, costCents: 759_96 },
  { id: "aiu_006", month: "2026-10", vendor: "Lumen Labs", model: "Lumen Pro", kind: "api", feature: "In-app assistant", requests: 35_050, inputTokens: 159_460_000, outputTokens: 22_780_000, costCents: 820_08 },
  { id: "aiu_007", month: "2026-05", vendor: "Lumen Labs", model: "Lumen Mini", kind: "api", feature: "Support triage", requests: 159_100, inputTokens: 327_300_000, outputTokens: 54_550_000, costCents: 150_01 },
  { id: "aiu_008", month: "2026-06", vendor: "Lumen Labs", model: "Lumen Mini", kind: "api", feature: "Support triage", requests: 175_000, inputTokens: 360_000_000, outputTokens: 60_000_000, costCents: 165_00 },
  { id: "aiu_009", month: "2026-07", vendor: "Lumen Labs", model: "Lumen Mini", kind: "api", feature: "Support triage", requests: 190_900, inputTokens: 392_700_000, outputTokens: 65_450_000, costCents: 179_99 },
  { id: "aiu_010", month: "2026-08", vendor: "Lumen Labs", model: "Lumen Mini", kind: "api", feature: "Support triage", requests: 206_820, inputTokens: 425_460_000, outputTokens: 70_910_000, costCents: 195_00 },
  { id: "aiu_011", month: "2026-09", vendor: "Lumen Labs", model: "Lumen Mini", kind: "api", feature: "Support triage", requests: 228_030, inputTokens: 469_080_000, outputTokens: 78_180_000, costCents: 215_00 },
  { id: "aiu_012", month: "2026-10", vendor: "Lumen Labs", model: "Lumen Mini", kind: "api", feature: "Support triage", requests: 254_540, inputTokens: 523_620_000, outputTokens: 87_270_000, costCents: 239_99 },
  { id: "aiu_013", month: "2026-05", vendor: "Cobalt AI", model: "Cobalt Embed", kind: "api", feature: "Search", requests: 2_000_000, inputTokens: 1_800_000_000, outputTokens: 0, costCents: 180_00 },
  { id: "aiu_014", month: "2026-06", vendor: "Cobalt AI", model: "Cobalt Embed", kind: "api", feature: "Search", requests: 2_222_220, inputTokens: 2_000_000_000, outputTokens: 0, costCents: 200_00 },
  { id: "aiu_015", month: "2026-07", vendor: "Cobalt AI", model: "Cobalt Embed", kind: "api", feature: "Search", requests: 2_444_440, inputTokens: 2_200_000_000, outputTokens: 0, costCents: 220_00 },
  { id: "aiu_016", month: "2026-08", vendor: "Cobalt AI", model: "Cobalt Embed", kind: "api", feature: "Search", requests: 2_777_780, inputTokens: 2_500_000_000, outputTokens: 0, costCents: 250_00 },
  { id: "aiu_017", month: "2026-09", vendor: "Cobalt AI", model: "Cobalt Embed", kind: "api", feature: "Search", requests: 3_111_110, inputTokens: 2_800_000_000, outputTokens: 0, costCents: 280_00 },
  { id: "aiu_018", month: "2026-10", vendor: "Cobalt AI", model: "Cobalt Embed", kind: "api", feature: "Search", requests: 3_444_440, inputTokens: 3_100_000_000, outputTokens: 0, costCents: 310_00 },
  { id: "aiu_019", month: "2026-05", vendor: "Lumen Labs", model: "Lumen Pro", kind: "api", feature: "Internal tools", requests: 2_000, inputTokens: 10_000_000, outputTokens: 2_000_000, costCents: 60_00 },
  { id: "aiu_020", month: "2026-06", vendor: "Lumen Labs", model: "Lumen Pro", kind: "api", feature: "Internal tools", requests: 2_330, inputTokens: 11_650_000, outputTokens: 2_330_000, costCents: 69_90 },
  { id: "aiu_021", month: "2026-07", vendor: "Lumen Labs", model: "Lumen Pro", kind: "api", feature: "Internal tools", requests: 2_830, inputTokens: 14_150_000, outputTokens: 2_830_000, costCents: 84_90 },
  { id: "aiu_022", month: "2026-08", vendor: "Lumen Labs", model: "Lumen Pro", kind: "api", feature: "Internal tools", requests: 3_170, inputTokens: 15_850_000, outputTokens: 3_170_000, costCents: 95_10 },
  { id: "aiu_023", month: "2026-09", vendor: "Lumen Labs", model: "Lumen Pro", kind: "api", feature: "Internal tools", requests: 3_500, inputTokens: 17_500_000, outputTokens: 3_500_000, costCents: 105_00 },
  { id: "aiu_024", month: "2026-10", vendor: "Lumen Labs", model: "Lumen Pro", kind: "api", feature: "Internal tools", requests: 4_000, inputTokens: 20_000_000, outputTokens: 4_000_000, costCents: 120_00 },
  { id: "aiu_025", month: "2026-05", vendor: "Nimbus Cloud", model: "Hosted open model (GPU)", kind: "compute", feature: "Document parsing", requests: 15_280, inputTokens: 97_780_000, outputTokens: 24_440_000, costCents: 1_100_00 },
  { id: "aiu_026", month: "2026-06", vendor: "Nimbus Cloud", model: "Hosted open model (GPU)", kind: "compute", feature: "Document parsing", requests: 18_750, inputTokens: 120_000_000, outputTokens: 30_000_000, costCents: 1_350_00 },
  { id: "aiu_027", month: "2026-07", vendor: "Nimbus Cloud", model: "Hosted open model (GPU)", kind: "compute", feature: "Document parsing", requests: 22_220, inputTokens: 142_220_000, outputTokens: 35_560_000, costCents: 1_600_00 },
  { id: "aiu_028", month: "2026-08", vendor: "Nimbus Cloud", model: "Hosted open model (GPU)", kind: "compute", feature: "Document parsing", requests: 26_390, inputTokens: 168_890_000, outputTokens: 42_220_000, costCents: 1_900_00 },
  { id: "aiu_029", month: "2026-09", vendor: "Nimbus Cloud", model: "Hosted open model (GPU)", kind: "compute", feature: "Document parsing", requests: 31_250, inputTokens: 200_000_000, outputTokens: 50_000_000, costCents: 2_250_00 },
  { id: "aiu_030", month: "2026-10", vendor: "Nimbus Cloud", model: "Hosted open model (GPU)", kind: "compute", feature: "Document parsing", requests: 36_670, inputTokens: 234_670_000, outputTokens: 58_670_000, costCents: 2_640_00 },
] satisfies AiUsage[];

export const aiSeatCharges = [
  { id: "ais_001", month: "2026-05", vendor: "Quill", product: "Quill Copilot (coding)", seats: 7, activeSeats: 7, costCents: 273_00 },
  { id: "ais_002", month: "2026-06", vendor: "Quill", product: "Quill Copilot (coding)", seats: 8, activeSeats: 8, costCents: 312_00 },
  { id: "ais_003", month: "2026-07", vendor: "Quill", product: "Quill Copilot (coding)", seats: 8, activeSeats: 8, costCents: 312_00 },
  { id: "ais_004", month: "2026-08", vendor: "Quill", product: "Quill Copilot (coding)", seats: 9, activeSeats: 8, costCents: 351_00 },
  { id: "ais_005", month: "2026-09", vendor: "Quill", product: "Quill Copilot (coding)", seats: 10, activeSeats: 8, costCents: 390_00 },
  { id: "ais_006", month: "2026-10", vendor: "Quill", product: "Quill Copilot (coding)", seats: 10, activeSeats: 8, costCents: 390_00 },
  { id: "ais_007", month: "2026-07", vendor: "Parley", product: "Parley Teams (chat assistant)", seats: 8, activeSeats: 8, costCents: 200_00 },
  { id: "ais_008", month: "2026-08", vendor: "Parley", product: "Parley Teams (chat assistant)", seats: 10, activeSeats: 9, costCents: 250_00 },
  { id: "ais_009", month: "2026-09", vendor: "Parley", product: "Parley Teams (chat assistant)", seats: 12, activeSeats: 8, costCents: 300_00 },
  { id: "ais_010", month: "2026-10", vendor: "Parley", product: "Parley Teams (chat assistant)", seats: 12, activeSeats: 7, costCents: 300_00 },
] satisfies AiSeatCharge[];

/** AI budget started in August, alongside the category budgets. */
export const aiBudgets = [
  { month: "2026-08", budgetCents: 4_000_00 },
  { month: "2026-09", budgetCents: 4_250_00 },
  { month: "2026-10", budgetCents: 4_500_00 },
] satisfies AiBudget[];
