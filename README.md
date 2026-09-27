# @preferred-inc/slowrush-tokens

Slow Rush Coffee のデザイントークン（色・書体・間隔・角丸）。

**ここがブランド値の正本です。** 各リポジトリに色をハードコードしないでください。
2026-09 の時点で `cafe/brand/tokens.css`・`slowrush.jp`・`storeos/apps/order` の
3箇所に同じ値が別々にコピーされていて、すでに欧文書体と注釈色がズレていました。
それを1箇所に集めたのがこのパッケージです。

- デザインガイドライン（人が読む方）: https://slowrush.jp/brand
- 色の根拠: ロゴ SVG から抽出した実カラー

## 入れる

```bash
pnpm add @preferred-inc/slowrush-tokens
```

`.npmrc` に GitHub Packages の設定が要ります。

```
@preferred-inc:registry=https://npm.pkg.github.com
```

## 使う

### Tailwind を使うプロジェクト

```ts
// tailwind.config.ts
import slowrush from "@preferred-inc/slowrush-tokens/tailwind";

export default {
  presets: [slowrush],
  content: ["./src/**/*.{ts,tsx}"],
};
```

```tsx
<p className="text-charcoal">本文</p>
<p className="text-subtle text-sm">注釈</p>
<h2 className="font-serif text-teal text-5xl">Our Coffee</h2>
<span className="font-ui text-[0.7rem] tracking-[0.24em]">OPEN</span>
<p className="font-tagline">ゆっくり、急げ。</p>
```

### 素の CSS のプロジェクト

```css
@import "@preferred-inc/slowrush-tokens/tokens.css";

.price {
  font-family: var(--sr-font-ui);
  color: var(--sr-charcoal);
}
```

### Figma・他ツール

`tokens.json` が DTCG 形式です。

## 中身

### 色

| トークン | 値 | 使うところ |
|---|---|---|
| `teal` | `#00666B` | Primary。見出し・罫線・帯・シンボル |
| `teal-dark` | `#004A4E` | 背景ベタ |
| `espresso` | `#48322A` | ロゴとキッカーのみ。**面で塗らない** |
| `cream` | `#F4F1EA` | 基本背景。**白は使わない** |
| `sand` | `#E9E4D9` | カード・帯・罫線 |
| `material` | `#D9CFC0` | グッズの生地・クラフト紙 |
| `charcoal` | `#26241F` | 本文 |
| `subtle` | `#6B6558` | 注釈 |
| `danger` | `#A94438` | エラー・必須 |

**1枚の中で使う「色」はティール1色**です。茶を面で塗らないでください。

`subtle` はもともと `#8A8375` でしたが、cream 上で 3.33:1 と WCAG AA に
届かないため 2026-09 に `#6B6558` へ変更しました。これより薄くしないでください。

### 書体

役割で分けます。1つの書体に全部を兼ねさせないでください。

| 役割 | 書体 | Tailwind |
|---|---|---|
| 見出し（大きく組む） | EB Garamond | `font-serif` |
| UI のラベル・価格・数字 | Source Sans 3 | `font-ui` |
| 日本語本文 | Zen Kaku Gothic New | `font-sans` |
| 「ゆっくり、急げ。」 | Zen Old Mincho | `font-tagline` |

タグラインの書体を他の用途に広げないでください。

**店名を `SLOW RUSH COFFEE` と全部大文字で打たないでください。**
ロゴは `Slow Rush Coffee` と小文字混じりです。

### 角丸

**0 か pill の二択**です。中途半端な丸みを混ぜると、すぐテンプレートに見えます。

### 暗所向け（KDS・厨房）

遠くから見る画面は cream 背景だと眩しく文字が沈みます。
同じブランド色のまま明度関係だけ反転させたテーマがあります。

```html
<body data-sr-theme="dark">
```

CSS 変数名は変わらないので、`var(--sr-charcoal)` のまま書けます。
暗所側はすべて 6:1 以上を確保しています。

## 使っているところ

| リポジトリ | 何 |
|---|---|
| `dev/slowrush.jp` | 公式サイト |
| `dev/storeos/apps/order` | モバイルオーダー（order.slowrush.jp） |
| `dev/storeos/apps/admin` | 店舗管理 |
| `dev/storeos/apps/kds` | 厨房ディスプレイ（`data-sr-theme="dark"`） |

`dev/dakoku` と `dev/nippo` は Slack ボットで Web UI を持たないため対象外です。

## 値を変えるとき

1. `src/tokens.css`・`src/tokens.json`・`src/tailwind-preset.cjs` の**3つとも**直す
2. `pnpm test` を通す（3形式の一致とコントラストを見ています）
3. version を上げて publish
4. 利用側リポジトリで更新する

テストは3形式のズレを見張るためにあります。1つだけ直して済ませないでください。
