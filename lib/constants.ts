export const DATABASE_SOURCES = [
  { value: 'fccom', label: 'fccom' },
  { value: 'tnex', label: 'tnex' },
  { value: 'msb', label: 'msb' },
  { value: 'lendingPlatform', label: 'lendingPlatform' },
  { value: 'tnex-loan', label: 'tnex-loan' },
  { value: 'masterDataManagement', label: 'masterDataManagement' },
] as const;

export const DATABASE_SOURCE_VALUES = DATABASE_SOURCES.map(source => source.value);
export type DatabaseSource = typeof DATABASE_SOURCE_VALUES[number];
