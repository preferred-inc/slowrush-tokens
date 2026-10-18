/**
 * トークンの検証。
 *
 * 1. CSS / JSON / Tailwind preset の3つで色の値がズレていないこと
 *    （このパッケージを作った理由そのものなので、必ず見張る）
 * 2. 文字色と背景色の組み合わせが WCAG AA（4.5:1）を満たすこと
 * 3. 間隔・角丸・書体も3形式でズレていないこと、ダークテーマと exports が壊れていないこと
 *
 * 実行: node test/tokens.test.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const css = readFileSync(join(here, "../src/tokens.css"), "utf8");
const json = JSON.parse(readFileSync(join(here, "../src/tokens.json"), "utf8"));
const preset = require("../src/tailwind-preset.cjs");

let failed = 0;
const ok = (name) => console.log(`  ok   ${name}`);
const ng = (name, detail) => {
  console.error(`  FAIL ${name}\n       ${detail}`);
  failed++;
};

/** :root ブロックだけから CSS 変数を読む（dark の上書きを拾わないため） */
function cssVar(name) {
  const root = css.slice(css.indexOf(":root"), css.indexOf("[data-sr-theme"));
  const m = root.match(new RegExp(`--sr-${name}:\\s*([^;]+);`));
  return m ? m[1].trim().toLowerCase() : null;
}

function relLuminance(hex) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [l1, l2] = [relLuminance(a), relLuminance(b)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// --- 1. 3形式で値が一致するか --------------------------------
console.log("\n[1] CSS / JSON / Tailwind preset の値が一致するか");

const pairs = [
  ["teal", "teal", ["teal", "DEFAULT"]],
  ["teal-dark", "tealDark", ["teal", "dark"]],
  ["espresso", "espresso", ["espresso"]],
  ["cream", "cream", ["cream"]],
  ["sand", "sand", ["sand"]],
  ["material", "material", ["material"]],
  ["charcoal", "charcoal", ["charcoal"]],
  ["subtle", "subtle", ["subtle"]],
  ["danger", "danger", ["danger"]],
];

for (const [cssName, jsonName, twPath] of pairs) {
  const fromCss = cssVar(cssName);
  const fromJson = json.color[jsonName]?.$value?.toLowerCase();
  let fromTw = preset.theme.extend.colors;
  for (const k of twPath) fromTw = fromTw?.[k];
  fromTw = typeof fromTw === "string" ? fromTw.toLowerCase() : null;

  if (fromCss === fromJson && fromJson === fromTw) {
    ok(`${cssName} = ${fromCss}`);
  } else {
    ng(cssName, `css=${fromCss} json=${fromJson} tailwind=${fromTw}`);
  }
}

// --- 2. コントラスト ------------------------------------------
console.log("\n[2] WCAG AA (4.5:1) を満たすか");

const AA = 4.5;
const checks = [
  ["charcoal on cream", "charcoal", "cream"],
  ["charcoal on sand", "charcoal", "sand"],
  ["subtle on cream", "subtle", "cream"],
  ["subtle on sand", "subtle", "sand"],
  ["teal on cream", "teal", "cream"],
  ["teal on sand", "teal", "sand"],
  ["espresso on cream", "espresso", "cream"],
  ["danger on cream", "danger", "cream"],
  ["cream on teal", "cream", "teal"],
  ["cream on teal-dark", "cream", "teal-dark"],
];

for (const [label, fg, bg] of checks) {
  const ratio = contrast(cssVar(fg), cssVar(bg));
  if (ratio >= AA) ok(`${label} = ${ratio.toFixed(2)}`);
  else ng(label, `${ratio.toFixed(2)} < ${AA}`);
}

// --- 3. ダークテーマ ------------------------------------------
console.log("\n[3] ダークテーマ（KDS・厨房）も AA を満たすか");

const darkBlock = css.slice(css.indexOf('[data-sr-theme="dark"]'));
const darkVar = (name) => {
  const m = darkBlock.match(new RegExp(`--sr-${name}:\\s*([^;]+);`));
  return m ? m[1].trim().toLowerCase() : null;
};

for (const [label, fg, bg] of [
  ["text on surface", "charcoal", "cream"],
  ["subtle on surface", "subtle", "cream"],
  ["teal on surface", "teal", "cream"],
  ["text on card", "charcoal", "sand"],
  ["subtle on card", "subtle", "sand"],
]) {
  const ratio = contrast(darkVar(fg), darkVar(bg));
  if (ratio >= AA) ok(`dark: ${label} = ${ratio.toFixed(2)}`);
  else ng(`dark: ${label}`, `${ratio.toFixed(2)} < ${AA}`);
}

// --- 4. 色以外のトークンも3形式で一致するか ------------------
console.log("\n[4] 間隔・角丸・書体も CSS / JSON / Tailwind preset で一致するか");

// 間隔: CSS と JSON は全段一致。Tailwind は section 系の2つだけ持つ
for (const key of Object.keys(json.spacing)) {
  const fromCss = cssVar(key);
  const fromJson = json.spacing[key].$value;
  if (fromCss === fromJson) ok(`spacing ${key} = ${fromCss}`);
  else ng(`spacing ${key}`, `css=${fromCss} json=${fromJson}`);
}

const remToPx = (v) => (v.endsWith("rem") ? `${parseFloat(v) * 16}px` : v);
for (const [tw, key] of [
  ["section", "s14"],
  ["section-lg", "s20"],
]) {
  const fromTw = remToPx(preset.theme.extend.spacing[tw] ?? "");
  const fromJson = json.spacing[key].$value;
  if (fromTw === fromJson) ok(`tailwind spacing.${tw} = ${key} (${fromJson})`);
  else ng(`tailwind spacing.${tw}`, `tailwind=${fromTw} json(${key})=${fromJson}`);
}

// 角丸: 0 か pill の二択（＋ごく小さいもの用の sm）
const radiusKeys = Object.keys(json.radius);
const twRadiusKeys = Object.keys(preset.theme.extend.borderRadius);
if (radiusKeys.sort().join() === twRadiusKeys.sort().join()) {
  ok(`radius のキー = ${radiusKeys.join(", ")}`);
} else {
  ng("radius のキー", `json=${radiusKeys} tailwind=${twRadiusKeys}`);
}
for (const key of radiusKeys) {
  const fromCss = cssVar(`radius-${key}`);
  const fromJson = json.radius[key].$value;
  const fromTw = preset.theme.extend.borderRadius[key];
  if (fromCss === fromJson && fromJson === fromTw) ok(`radius ${key} = ${fromCss}`);
  else ng(`radius ${key}`, `css=${fromCss} json=${fromJson} tailwind=${fromTw}`);
}

// 書体: 先頭（ブランドの書体）が3形式で同じか。
// Tailwind は next/font の CSS 変数を挟むので var(--x, 'Name') から名前を取り出す
const firstFamily = (v) => {
  const head = Array.isArray(v) ? v[0] : v.split(",")[0];
  const m = head.match(/var\([^,]+,\s*(.+)\)/);
  return (m ? m[1] : head).trim().replace(/^['"]|['"]$/g, "");
};
for (const [cssName, jsonName, twName] of [
  ["font-display", "display", "serif"],
  ["font-ui", "ui", "ui"],
  ["font-jp", "jp", "sans"],
  ["font-tagline", "tagline", "tagline"],
]) {
  const fromCss = firstFamily(cssVar(cssName) ?? "");
  const fromJson = firstFamily(json.fontFamily[jsonName].$value);
  const fromTw = firstFamily(preset.theme.extend.fontFamily[twName]);
  if (fromCss.toLowerCase() === fromJson.toLowerCase() && fromJson.toLowerCase() === fromTw.toLowerCase()) {
    ok(`${cssName} = ${fromJson}`);
  } else {
    ng(cssName, `css=${fromCss} json=${fromJson} tailwind=${fromTw}`);
  }
}

// --- 5. ダークテーマの上書きが壊れていないか -----------------
console.log("\n[5] ダークテーマの上書きが :root にある変数だけを、正しい色で上書きしているか");

for (const m of darkBlock.matchAll(/--sr-([a-z0-9-]+):\s*([^;]+);/g)) {
  const [, name, value] = m;
  const v = value.trim();
  if (cssVar(name) === null) ng(`dark: ${name}`, ":root に無い変数を上書きしている（綴り違い？）");
  else if (!/^#[0-9a-f]{6}$/i.test(v)) ng(`dark: ${name}`, `6桁の16進カラーではない: ${v}`);
  else ok(`dark: ${name} = ${v}`);
}

// --- 6. package.json の exports が実在するファイルを指すか -------
console.log("\n[6] package.json の exports が実在するファイルを指すか");

const pkg = JSON.parse(readFileSync(join(here, "../package.json"), "utf8"));
const targets = [];
for (const [key, v] of Object.entries(pkg.exports)) {
  if (typeof v === "string") targets.push([key, v]);
  else for (const [cond, p] of Object.entries(v)) targets.push([`${key} (${cond})`, p]);
}
for (const [key, p] of targets) {
  try {
    readFileSync(join(here, "..", p));
    ok(`${key} -> ${p}`);
  } catch {
    ng(key, `${p} が存在しない`);
  }
}

console.log(
  failed === 0 ? "\n全て通過\n" : `\n${failed} 件が失敗\n`,
);
process.exit(failed === 0 ? 0 : 1);
