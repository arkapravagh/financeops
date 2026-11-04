#!/usr/bin/env node
/**
 * FinanceOps structure checker: the deterministic half of the `react-review` skill.
 *
 * Checks every file under src/ (or only the paths given) against .claude/rules/structure.md:
 *   naming      <kebab>.<type>.ts(x) with a known type suffix, in the folder that type belongs to
 *   location    hooks only in src/hooks, enums only in src/enums
 *   docs        file header block + JSDoc on every exported symbol
 *   layering    imports only point down app → features → shared → hooks → services → data
 *   enums       raw string literals that equal an enum value (`=== "paid"`)            [warning]
 *   language    hard-coded English in JSX text and text props outside src/language     [warning]
 *
 * Usage: node .claude/skills/react-review/scripts/check-structure.mjs [--json] [path ...]
 * Exit code 1 when there are errors (warnings alone exit 0). No dependencies; Node ≥ 18.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const ROOT = resolve(process.cwd());
const SRC = join(ROOT, "src");
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const targets = args.filter((a) => !a.startsWith("--"));

const rel = (p) => relative(SRC, p).split(sep).join("/");
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const all = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f));
const files = targets.length
  ? all.filter((f) => targets.some((t) => resolve(f).startsWith(resolve(t))))
  : all;

const findings = [];
const add = (severity, check, file, line, message) => findings.push({ severity, check, file, line, message });

// ---------- rule tables ----------
const SUFFIX_DIRS = {
  page: /^features\/[a-z0-9-]+\/$/,
  component: /^(app|app\/layout|features\/[a-z0-9-]+\/components|shared\/(ui|charts|data-table|finance))\/$/,
  provider: /^features\/[a-z0-9-]+\/$/,
  hook: /^hooks\/$/,
  service: /^services\/$/,
  data: /^data\/$/,
  enum: /^enums\/$/,
  lang: /^language\/en\/$/,
  types: /^types\/$/,
  model: /^features\/[a-z0-9-]+\/$/,
  config: /^(shared\/config|features\/[a-z0-9-]+)\/$/,
  util: /^shared\/(utils|charts|data-table)\/$/,
  routes: /^app\/$/,
};
const EXCEPTIONS = new Set(["app/main.tsx"]);
const LAYER = (p) =>
  p.startsWith("app/") ? "app" :
  p.startsWith("features/") ? "features" :
  p.startsWith("shared/") ? "shared" :
  p.startsWith("hooks/") ? "hooks" :
  p.startsWith("services/") ? "services" :
  p.startsWith("data/") ? "data" :
  p.startsWith("enums/") ? "enums" :
  p.startsWith("language/") ? "language" :
  p.startsWith("types/") ? "types" : "other";
/** Layers each layer may import. enums/types/language are importable from anywhere (with their own limits). */
const ALLOWED = {
  app: ["app", "features", "shared", "hooks", "services", "enums", "types", "language"],
  features: ["features", "shared", "hooks", "services", "enums", "types", "language"],
  shared: ["shared", "hooks", "services", "enums", "types", "language"],
  hooks: ["hooks", "services", "enums", "types", "language"],
  services: ["services", "data", "enums", "types", "language", "shared/utils"],
  data: ["enums", "types"],
  enums: [],
  language: ["enums", "types", "language"],
  types: ["enums", "types"],
};

// Enum values, for the raw-string check.
const enumValues = new Set();
for (const f of all.filter((f) => rel(f).startsWith("enums/"))) {
  for (const m of readFileSync(f, "utf8").matchAll(/^\s+\w+ = "([^"]+)",/gm)) enumValues.add(m[1]);
}
/**
 * Field names that hold enum values. A raw string compared with (or assigned to) one of these is almost certainly a
 * missed enum member. Generic words (`direction`, `id`, `type`) are left out because they collide with non-enum code.
 */
const ENUM_FIELDS = /^(status|derived|category|kind|role|feature|feedback|view|scale|density|theme|horizon|age|tabledensity|budgetscale|aiusageview|forecasthorizon)$/i;

// ---------- per-file checks ----------
for (const file of files) {
  const p = rel(file);
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  const dir = p.slice(0, p.lastIndexOf("/") + 1);
  const base = p.slice(p.lastIndexOf("/") + 1);
  const layer = LAYER(p);

  // naming + location
  if (!EXCEPTIONS.has(p)) {
    const m = base.match(/^([a-z0-9]+(?:-[a-z0-9]+)*)\.([a-z]+)\.(ts|tsx)$/);
    if (!m) add("error", "naming", p, 1, "file name must be <kebab-name>.<type>.ts(x)");
    else if (!SUFFIX_DIRS[m[2]]) add("error", "naming", p, 1, `unknown type suffix ".${m[2]}"`);
    else if (!SUFFIX_DIRS[m[2]].test(dir)) add("error", "location", p, 1, `.${m[2]} files don't belong in ${dir}`);
    else if (m[2] === "hook" && !m[1].startsWith("use-")) add("error", "naming", p, 1, "hook files start with use-");
    if (m && /\.tsx$/.test(base) !== /<[A-Za-z]/.test(text) && m[2] !== "page" && m[2] !== "component" && m[2] !== "provider" && m[2] !== "routes")
      if (/\.tsx$/.test(base)) add("warning", "naming", p, 1, ".tsx without JSX; use .ts");
  }
  lines.forEach((l, i) => {
    if (/^export (function|const) use[A-Z]/.test(l) && layer !== "hooks") add("error", "location", p, i + 1, "custom hooks belong in src/hooks/");
    if (/^export (const )?enum /.test(l) && layer !== "enums") add("error", "location", p, i + 1, "enums belong in src/enums/");
  });

  // docs: header + exported symbols
  const hasHeader = /^\/\*\*/.test(lines[0] ?? "") && (() => {
    const end = lines.findIndex((l) => l.trim().endsWith("*/"));
    return end >= 0 && !/^export /.test(lines[end + 1] ?? "");
  })();
  if (!hasHeader) add("error", "docs", p, 1, "missing file header comment");
  lines.forEach((l, i) => {
    const m = l.match(/^export (?:default )?(?:async )?(?:function\*? |const |type |interface |class |enum )(\w+)/);
    if (!m) return;
    let j = i - 1;
    while (j >= 0 && lines[j].trim() === "") j--;
    if (!(j >= 0 && lines[j].trim().endsWith("*/"))) add("error", "docs", p, i + 1, `exported ${m[1]} has no JSDoc comment`);
  });

  // layering
  for (const [i, l] of lines.entries()) {
    const m = l.match(/^(?:import|export)\s.*?from\s+"(\.{1,2}\/[^"]+)"/);
    if (!m) continue;
    const target = rel(resolve(join(SRC, p, ".."), m[1]));
    const tLayer = LAYER(target);
    const allowed = ALLOWED[layer] ?? [];
    const ok = allowed.includes(tLayer) || allowed.some((a) => a.includes("/") && target.startsWith(a + "/"));
    if (!ok) add("error", "layering", p, i + 1, `${layer}/ must not import ${tLayer}/ (${target})`);
    if ((layer === "types" || layer === "language") && tLayer === "enums" && !/^import type /.test(l) && layer === "types")
      add("warning", "imports", p, i + 1, "types/ files use `import type`");
  }

  // raw enum strings (outside enums, data, language): comparisons against, or assignments to, enum-typed fields.
  if (!["enums", "data", "language"].includes(layer)) {
    lines.forEach((l, i) => {
      if (/^\s*(\*|\/\/|import )/.test(l)) return;
      const hits = [
        ...[...l.matchAll(/([\w.?]+)\s*(?:===|!==)\s*"([a-z0-9-]+)"/g)].map((m) => [m[1], m[2]]),
        ...[...l.matchAll(/"([a-z0-9-]+)"\s*(?:===|!==)\s*([\w.?]+)/g)].map((m) => [m[2], m[1]]),
        ...[...l.matchAll(/\b(\w+)\s*:\s*"([a-z0-9-]+)"/g)].map((m) => [m[1], m[2]]),
        ...[...l.matchAll(/useState<(\w+)>\("([a-z0-9-]+)"\)/g)].map((m) => [m[1].toLowerCase(), m[2]]),
      ];
      for (const [lhs, value] of hits) {
        const field = lhs.split(/[.?]+/).pop();
        if (enumValues.has(value) && ENUM_FIELDS.test(field))
          add("warning", "enums", p, i + 1, `raw string "${value}" for ${field}; use the enum member`);
      }
    });
  }

  // hard-coded English (TSX outside language/, and not the AI demo engine prose)
  if (base.endsWith(".tsx") && layer !== "language") {
    lines.forEach((raw, i) => {
      if (/^\s*(\*|\/\/|import )/.test(raw)) return;
      const l = raw.replace(/className=("[^"]*"|\{`[^`]*`\})/g, "");
      const props = l.match(/\b(title|subtitle|label|placeholder|aria-label|ariaLabel|alt|caption|description|note|aside|searchPlaceholder|emptyMessage)="([^"]*[A-Za-z]{2,}[^"]*)"/);
      if (props) add("warning", "language", p, i + 1, `hard-coded ${props[1]}="${props[2].slice(0, 40)}"; move it to language/en`);
      const jsx = l.match(/>\s*([A-Z][a-z]+(?:[ ,.'’-]+[A-Za-z]+){1,})\s*</);
      if (jsx) add("warning", "language", p, i + 1, `hard-coded text "${jsx[1].slice(0, 40)}"; move it to language/en`);
      const own = l.match(/^\s+([A-Z][a-z]+(?: [a-z]+){1,}[.!?]?)\s*$/);
      if (own) add("warning", "language", p, i + 1, `hard-coded text "${own[1].slice(0, 40)}"; move it to language/en`);
    });
  }
}

// ---------- report ----------
const errors = findings.filter((f) => f.severity === "error");
const warnings = findings.filter((f) => f.severity === "warning");
if (asJson) {
  console.log(JSON.stringify({ files: files.length, errors: errors.length, warnings: warnings.length, findings }, null, 2));
} else {
  const by = (list) => [...new Set(list.map((f) => f.check))].map((c) => `${c} ${list.filter((f) => f.check === c).length}`).join(", ");
  for (const f of [...errors, ...warnings]) console.log(`${f.severity.toUpperCase().padEnd(7)} ${f.check.padEnd(9)} src/${f.file}:${f.line}  ${f.message}`);
  console.log(`\nChecked ${files.length} files: ${errors.length} errors${errors.length ? ` (${by(errors)})` : ""}, ${warnings.length} warnings${warnings.length ? ` (${by(warnings)})` : ""}.`);
}
if (!existsSync(SRC)) console.error("Run from the project root (src/ not found).");
process.exit(errors.length ? 1 : 0);
