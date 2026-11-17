import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const baseDir = fileURLToPath(new URL('../assets/icons/', import.meta.url));
const mobileDir = fileURLToPath(new URL('../../../apps/mobile/assets/icons/', import.meta.url));

const outlineIcons = {
  'check': '<polyline points="20 6 9 17 4 12" />',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />',
  'circle': '<circle cx="12" cy="12" r="10" />',
  'clock': '<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />',
  'calendar': '<rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />',
  'calendar-clock': '<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h5" /><path d="M17.5 17.5 16 16.3V14" /><circle cx="16" cy="16" r="6" />',
  'target': '<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />',
  'sparkles': '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />',
  'play': '<polygon points="6 3 20 12 6 21 6 3" />',
  'pause': '<rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />',
  'pencil': '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />',
  'trash-2': '<path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />',
  'plus': '<path d="M5 12h14" /><path d="M12 5v14" />',
  'plus-circle': '<circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />',
  'x': '<path d="M18 6 6 18" /><path d="m6 6 12 12" />',
  'x-circle': '<circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />',
  'chevron-down': '<path d="m6 9 6 6 6-6" />',
  'chevron-up': '<path d="m18 15-6-6-6 6" />',
  'chevron-right': '<path d="m9 18 6-6-6-6" />',
  'chevron-left': '<path d="m15 18-6-6 6-6" />',
  'arrow-right': '<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />',
  'arrow-left': '<path d="M19 12H5" /><path d="m12 19-7-7 7-7" />',
  'search': '<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />',
  'filter': '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />',
  'tag': '<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" />',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />',
  'alert-circle': '<circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />',
  'info': '<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />',
  'bar-chart-2': '<line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" />',
  'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />',
  'sun': '<circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />',
  'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />',
  'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />',
  'grip-vertical': '<circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" />',
  'layout-dashboard': '<rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />',
};

const filledIcons = {
  'check-circle': '<circle cx="12" cy="12" r="10" fill="currentColor" /><path d="m9 12 2 2 4-4" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />',
  'target': '<circle cx="12" cy="12" r="10" fill="currentColor" /><circle cx="12" cy="12" r="6" fill="#FFFFFF" /><circle cx="12" cy="12" r="2" fill="currentColor" />',
  'sparkles': '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" fill="currentColor" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />',
  'play': '<polygon points="6 3 20 12 6 21 6 3" fill="currentColor" />',
  'tag': '<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" fill="currentColor" /><circle cx="7" cy="7" r="1" fill="#FFFFFF" />',
  'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="currentColor" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" stroke="currentColor" stroke-width="2" />',
};

async function main() {
  await mkdir(`${baseDir}/outline`, { recursive: true });
  await mkdir(`${baseDir}/filled`, { recursive: true });
  await mkdir(mobileDir, { recursive: true });

  for (const [name, inner] of Object.entries(outlineIcons)) {
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      `  ${inner}`,
      '</svg>',
      '',
    ].join('\n');

    await writeFile(`${baseDir}/outline/${name}.svg`, svg, 'utf8');
    await writeFile(`${mobileDir}/${name}.svg`, svg, 'utf8');
  }

  for (const [name, inner] of Object.entries(filledIcons)) {
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      `  ${inner}`,
      '</svg>',
      '',
    ].join('\n');

    await writeFile(`${baseDir}/filled/${name}.svg`, svg, 'utf8');
  }

  console.log(`Generated ${Object.keys(outlineIcons).length} outline SVGs and ${Object.keys(filledIcons).length} filled SVGs.`);
}

main().catch(console.error);
