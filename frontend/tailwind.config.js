const color = name => `rgb(var(--${name}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: {
      ink: color('ink'), paper: color('paper'), panel: color('panel'), muted: color('muted'), line: color('line'), tint: color('tint'), danger: color('danger'), success: color('success'),
      dark: { bg: color('paper'), surface: color('panel'), border: color('line'), text: color('ink'), muted: color('muted') },
      accent: { blue: color('ink'), brown: color('muted') },
    },
  } },
  plugins: [],
};
