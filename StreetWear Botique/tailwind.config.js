/** KAIROS — Tailwind configuration
 *  Colours are driven by CSS variables (see src/input.css) so light/dark
 *  themes switch automatically without sprinkling `dark:` everywhere.
 *  Rebuild CSS:  npm install  &&  npm run build   (or npm run watch)
 */
const withVar = (v) => `rgb(var(${v}) / <alpha-value>)`;

module.exports = {
  content: ['./*.html', './assets/js/**/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: withVar('--c-bg'),
        surface: withVar('--c-surface'),
        surface2: withVar('--c-surface-2'),
        fg: withVar('--c-fg'),
        muted: withVar('--c-muted'),
        accent: withVar('--c-accent'),
        accentink: withVar('--c-accent-ink'),
        accenttext: withVar('--c-accent-text'),
        hot: withVar('--c-hot'),
        danger: withVar('--c-danger'),
        ink: '#0A0A0B',
        bone: '#F3F0EA',
        brand: '#FF5B2E',   /* infrared */
        cobalt: '#3355FF',
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'sans-serif'],
        sans: ['"Space Grotesk Variable"', '"Space Grotesk"', 'system-ui', '-apple-system', 'Segoe UI', 'Tahoma', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      maxWidth: { site: '1360px' },
      letterSpacing: { mega: '0.28em' },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'marquee-rev': { from: { transform: 'translateX(-50%)' }, to: { transform: 'translateX(0)' } },
        floaty: { '0%,100%': { transform: 'translateY(0) rotate(var(--r,0deg))' }, '50%': { transform: 'translateY(-14px) rotate(var(--r,0deg))' } },
        pulse2: { '0%': { boxShadow: '0 0 0 0 rgb(255 91 46 / .7)' }, '100%': { boxShadow: '0 0 0 14px rgb(255 91 46 / 0)' } },
        gridmove: { from: { backgroundPosition: '0 0' }, to: { backgroundPosition: '0 80px' } },
        spinslow: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        'marquee-rev': 'marquee-rev 38s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        pulse2: 'pulse2 1.6s ease-out infinite',
        gridmove: 'gridmove 2.4s linear infinite',
        spinslow: 'spinslow 18s linear infinite',
      },
    },
  },
  plugins: [],
};
