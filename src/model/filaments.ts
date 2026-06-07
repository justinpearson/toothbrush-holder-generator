// Preset filament colors for the 3D preview. These only affect how the holder
// looks on screen — they are not part of the model and do not change the
// exported .scad or .stl.

export interface Filament {
  name: string;
  hex: string;
}

export const FILAMENTS: Filament[] = [
  { name: 'Gold', hex: '#e6b422' },
  { name: 'White', hex: '#f3f3f0' },
  { name: 'Light Gray', hex: '#b8bcc0' },
  { name: 'Black', hex: '#1d1d1f' },
  { name: 'Red', hex: '#c8102e' },
  { name: 'Orange', hex: '#ff6a13' },
  { name: 'Green', hex: '#00ae42' },
  { name: 'Blue', hex: '#0072ce' },
  { name: 'Purple', hex: '#6b3fa0' },
  { name: 'Pink', hex: '#ff5fa2' },
];

export const DEFAULT_FILAMENT = FILAMENTS[0].hex;
