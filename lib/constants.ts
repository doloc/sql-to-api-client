export const DATABASE_SOURCES = [
  { value: 'fccom', label: 'fccom' },
  { value: 'tnex', label: 'tnex' },
  { value: 'msb', label: 'msb' },
  { value: 'lendingPlatform', label: 'lendingPlatform' },
  { value: 'tnex-loan', label: 'tnex-loan' },
  { value: 'masterDataManagement', label: 'masterDataManagement' },
  { value: 'admin', label: 'admin' },
  { value: 'cif-module', label: 'cif-module' },
  { value: 'core-service', label: 'core-service' },
  { value: 'corebanking', label: 'corebanking' },
  { value: 'credit-info', label: 'credit-info' },
  { value: 'customer-profile', label: 'customer-profile' },
  { value: 'datawarehouse', label: 'datawarehouse' },
  { value: 'ekyc', label: 'ekyc' },
  { value: 'gateway', label: 'gateway' },
  { value: 'reporting', label: 'reporting' },
  { value: 'staging', label: 'staging' },
  { value: 'onboarding', label: 'onboarding' },
] as const;

export const DATABASE_SOURCE_VALUES = DATABASE_SOURCES.map(source => source.value);
export type DatabaseSource = typeof DATABASE_SOURCE_VALUES[number];
