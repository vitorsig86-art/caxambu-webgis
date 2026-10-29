const paths = {
  map: "m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Zm6-3v15m6-12v15",
  add: "M12 5v14M5 12h14",
  people: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3a4 4 0 0 1 0 8M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  explore: "m12 3 9 9-9 9-9-9Zm3 6-2 4-4 2 2-4Z",
  leaf: "M5 19c-6-14 8-16 15-16 0 9-2 19-13 14M4 21 16 9",
  close: "m6 6 12 12M6 18 18 6",
  layers: "m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5",
  download: "M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4",
  check: "m5 12.5 4.5 4.5L19 7",
  chevron: "m9 6 6 6-6 6",
  back: "m15 6-6 6 6 6",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
};
export function CommunityIcon({ name }: { name: keyof typeof paths }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
