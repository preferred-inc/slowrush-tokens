/**
 * Slow Rush Coffee — Tailwind preset
 *
 * tailwind.config の presets に入れると、ブランドの色・書体・
 * 間隔・角丸が使えるようになる。
 *
 *   // tailwind.config.ts
 *   import slowrush from "@preferred-inc/slowrush-tokens/tailwind";
 *   export default { presets: [slowrush], content: [...] };
 *
 * 色は CSS 変数を参照しないで実値で持つ。Tailwind の
 * opacity 修飾子（text-charcoal/75 など）を効かせるため。
 * テーマ切り替えが要る画面は tokens.css の
 * [data-sr-theme="dark"] を併用する。
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        cream: "#F4F1EA",
        sand: "#E9E4D9",
        material: "#D9CFC0",
        teal: {
          DEFAULT: "#00666B",
          dark: "#004A4E",
        },
        espresso: "#48322A",
        charcoal: "#26241F",
        // 注釈。cream 上 5.13:1 / sand 上 4.57:1。これより薄くしない
        subtle: "#6B6558",
        danger: "#A94438",
      },
      fontFamily: {
        // 見出し。大きく組んだときに効く
        serif: [
          "var(--font-serif-en, 'EB Garamond')",
          "var(--font-serif-jp, 'Zen Old Mincho')",
          "Hiragino Mincho ProN",
          "Yu Mincho",
          "serif",
        ],
        // UI のラベル・価格・数字
        ui: [
          "var(--font-ui-en, 'Source Sans 3')",
          "var(--font-zen, 'Zen Kaku Gothic New')",
          "-apple-system",
          "sans-serif",
        ],
        // 日本語本文
        sans: [
          "var(--font-zen, 'Zen Kaku Gothic New')",
          "-apple-system",
          "BlinkMacSystemFont",
          "Hiragino Sans",
          "Noto Sans JP",
          "sans-serif",
        ],
        // 「ゆっくり、急げ。」専用
        tagline: [
          "var(--font-serif-jp, 'Zen Old Mincho')",
          "Hiragino Mincho ProN",
          "Yu Mincho",
          "serif",
        ],
      },
      spacing: {
        // セクションの上下。余白を広く取るのがブランド
        section: "7rem",
        "section-lg": "10rem",
      },
      borderRadius: {
        // 角丸は 0 か pill の二択。中途半端な丸みを混ぜない
        none: "0",
        sm: "2px",
        pill: "9999px",
      },
    },
  },
};
