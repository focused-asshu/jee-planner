import React from 'react';

const createIcon = (name, children) => React.forwardRef(function Icon({ color = 'currentColor', size = 24, strokeWidth = 2, absoluteStrokeWidth, children: extraChildren, ...props }, ref) {
  return React.createElement(
    'svg',
    {
      ref,
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth: absoluteStrokeWidth ? (Number(strokeWidth) * 24) / Number(size) : strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': 'true',
      ...props,
    },
    [...children, extraChildren],
  );
});

const e = (tag, props) => React.createElement(tag, props);
export const Search = createIcon('Search', [e('circle', { key: 1, cx: 11, cy: 11, r: 8 }), e('path', { key: 2, d: 'm21 21-4.3-4.3' })]);
export const X = createIcon('X', [e('path', { key: 1, d: 'M18 6 6 18' }), e('path', { key: 2, d: 'm6 6 12 12' })]);
export const BookOpen = createIcon('BookOpen', [e('path', { key: 1, d: 'M12 7v14' }), e('path', { key: 2, d: 'M3 5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z' }), e('path', { key: 3, d: 'M12 5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2z' })]);
export const LayoutDashboard = createIcon('LayoutDashboard', [e('rect', { key: 1, width: 7, height: 9, x: 3, y: 3, rx: 1 }), e('rect', { key: 2, width: 7, height: 5, x: 14, y: 3, rx: 1 }), e('rect', { key: 3, width: 7, height: 9, x: 14, y: 12, rx: 1 }), e('rect', { key: 4, width: 7, height: 5, x: 3, y: 16, rx: 1 })]);
export const Atom = createIcon('Atom', [e('circle', { key: 1, cx: 12, cy: 12, r: 1 }), e('path', { key: 2, d: 'M20.2 20.2c2.04-2.03-.02-7.4-4.6-11.98C11.02 3.64 5.65 1.58 3.62 3.62S3.64 11.02 8.22 15.6c4.58 4.58 9.95 6.64 11.98 4.6Z' }), e('path', { key: 3, d: 'M15.6 8.22c4.58-4.58 6.64-9.95 4.6-11.98' }), e('path', { key: 4, d: 'M20.2 3.8c2.04 2.03-.02 7.4-4.6 11.98-4.58 4.58-9.95 6.64-11.98 4.6S3.64 12.98 8.22 8.4' })]);
export const FlaskConical = createIcon('FlaskConical', [e('path', { key: 1, d: 'M10 2v7.31' }), e('path', { key: 2, d: 'M14 9.3V2' }), e('path', { key: 3, d: 'M8.5 2h7' }), e('path', { key: 4, d: 'M14 9.3 20.7 21a1 1 0 0 1-.87 1.5H4.17A1 1 0 0 1 3.3 21L10 9.31' }), e('path', { key: 5, d: 'M7.5 16h9' })]);
export const Sigma = createIcon('Sigma', [e('path', { key: 1, d: 'M18 7V4H6l6 8-6 8h12v-3' })]);
export const Play = createIcon('Play', [e('polygon', { key: 1, points: '6 3 20 12 6 21 6 3' })]);
export const Pause = createIcon('Pause', [e('rect', { key: 1, x: 14, y: 4, width: 4, height: 16, rx: 1 }), e('rect', { key: 2, x: 6, y: 4, width: 4, height: 16, rx: 1 })]);
export const RotateCcw = createIcon('RotateCcw', [e('path', { key: 1, d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }), e('path', { key: 2, d: 'M3 3v5h5' })]);
export const Flame = createIcon('Flame', [e('path', { key: 1, d: 'M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2-.5 3-2 1-1.5.5-3.5-.5-5 .5 2-1.5 2.5-1.5 2.5-1-3-3-5-3-5 .5 2-1 3.5-2 5A5 5 0 1 0 17 14c0-5-5-9-5-9 .5 3-2.5 5.5-3.5 9.5Z' })]);
export const Trophy = createIcon('Trophy', [e('path', { key: 1, d: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6' }), e('path', { key: 2, d: 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18' }), e('path', { key: 3, d: 'M4 22h16' }), e('path', { key: 4, d: 'M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22' }), e('path', { key: 5, d: 'M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22' }), e('path', { key: 6, d: 'M18 2H6v7a6 6 0 0 0 12 0V2Z' })]);
export const CheckCircle2 = createIcon('CheckCircle2', [e('circle', { key: 1, cx: 12, cy: 12, r: 10 }), e('path', { key: 2, d: 'm9 12 2 2 4-4' })]);
export const Clock = createIcon('Clock', [e('circle', { key: 1, cx: 12, cy: 12, r: 10 }), e('path', { key: 2, d: 'M12 6v6l4 2' })]);
export const Hourglass = createIcon('Hourglass', [e('path', { key: 1, d: 'M5 22h14' }), e('path', { key: 2, d: 'M5 2h14' }), e('path', { key: 3, d: 'M17 22v-4.17a4 4 0 0 0-1.17-2.83L12 12l3.83-3A4 4 0 0 0 17 6.17V2' }), e('path', { key: 4, d: 'M7 2v4.17A4 4 0 0 0 8.17 9L12 12l-3.83 3A4 4 0 0 0 7 17.83V22' })]);
export const Square = createIcon('Square', [e('rect', { key: 1, width: 18, height: 18, x: 3, y: 3, rx: 2 })]);
