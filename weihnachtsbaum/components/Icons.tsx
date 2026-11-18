const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export const IconCalendar = () => (
  <svg {...base}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4M8.5 14.5l2.2 2.2 4.5-4.6" /></svg>
);
export const IconHome = () => (
  <svg {...base}><path d="M4 11l8-7 8 7v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M12 10l-2.5 3.5h1.5L9 17h6l-2-3.5h1.5z" /></svg>
);
export const IconForest = () => (
  <svg {...base}><path d="M9 3l4 6h-2l3.5 5H12l3 5H3l3-5H3.5L7 9H5z" /><path d="M9 19v2M17.5 9l3 5h-1.5l2 4h-3.5M18 18v3" /></svg>
);
export const IconTruck = () => (
  <svg {...base}><path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3.5v3h-7z" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>
);
