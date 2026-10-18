export const theme = {
  colors: {
    paper: '#F3F5F9', // Page background, flat, no gradient wash
    card: '#FFFFFF',
    ink: '#121A2B',   // Text, primary buttons, user bubbles
    mute: '#6B7488',  // Secondary text
    line: '#E3E7EF',  // Hairlines and 1px borders
    verdicts: {
      take: '#1F9D6B',
      counter: '#D98A00',
      pass: '#D64545',
      needInfo: '#8A93A6',
    },
  },
  typography: {
    fontFamily: "'Onest', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    weights: {
      regular: 400,
      semibold: 600,
    },
    scale: {
      small: '13px',
      body: '15px',
      subhead: '18px',
      title: '24px',
      hero: '40px',
    },
  },
  radii: {
    bubble: '20px',
    bubbleCorner: '6px',
    card: '20px',
    chip: '9999px',
    sheetTop: '28px',
  },
} as const;

export type Theme = typeof theme;
