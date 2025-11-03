/**
 * Utility functions for handling ID conversions between simple IDs and UUIDs
 */

// Default UUIDs for testing purposes
export const DEFAULT_UUIDS = {
  BAR_1: '550e8400-e29b-41d4-a716-446655440000',
  TABLE_1: '550e8400-e29b-41d4-a716-446655440020',
  TABLE_2: '550e8400-e29b-41d4-a716-446655440021',
  TABLE_3: '550e8400-e29b-41d4-a716-446655440022',
} as const;

/**
 * Converts a simple bar ID to a valid UUID
 * @param barId - The bar ID from URL params
 * @returns A valid UUID string
 */
export function convertBarIdToUUID(barId: string | undefined): string {
  if (!barId) return DEFAULT_UUIDS.BAR_1;
  
  // If it's already a UUID format, return as is
  if (isValidUUID(barId)) return barId;
  
  // Convert simple IDs to UUIDs
  switch (barId) {
    case '1':
      return DEFAULT_UUIDS.BAR_1;
    default:
      return DEFAULT_UUIDS.BAR_1; // Default fallback
  }
}

/**
 * Converts a simple table ID to a valid UUID
 * @param tableId - The table ID from URL params
 * @returns A valid UUID string or null if no table
 */
export function convertTableIdToUUID(tableId: string | null): string | null {
  if (!tableId) return null;
  
  // If it's already a UUID format, return as is
  if (isValidUUID(tableId)) return tableId;
  
  // Convert simple IDs to UUIDs
  switch (tableId) {
    case '1':
      return DEFAULT_UUIDS.TABLE_1;
    case '2':
      return DEFAULT_UUIDS.TABLE_2;
    case '3':
      return DEFAULT_UUIDS.TABLE_3;
    default:
      return DEFAULT_UUIDS.TABLE_1; // Default fallback
  }
}

/**
 * Checks if a string is a valid UUID format
 * @param str - The string to check
 * @returns True if the string is a valid UUID format
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Gets a display-friendly ID from a UUID
 * @param uuid - The UUID to convert
 * @returns A simple ID for display purposes
 */
export function getDisplayIdFromUUID(uuid: string): string {
  switch (uuid) {
    case DEFAULT_UUIDS.BAR_1:
      return '1';
    case DEFAULT_UUIDS.TABLE_1:
      return '1';
    case DEFAULT_UUIDS.TABLE_2:
      return '2';
    case DEFAULT_UUIDS.TABLE_3:
      return '3';
    default:
      return uuid.slice(0, 8); // Show first 8 characters of UUID
  }
}