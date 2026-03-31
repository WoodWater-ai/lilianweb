export type SortDirection = 'default' | 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export const useSort = <T,>(data: T[], sortConfig: SortConfig) => {
  return [...data].sort((a, b) => {
    if (sortConfig.direction === 'default') return 0;
    
    const aVal = a[sortConfig.key as keyof T];
    const bVal = b[sortConfig.key as keyof T];
    
    // Handle numeric sorting
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    // Handle string-to-number sorting (e.g., freeShippingThreshold)
    if (typeof aVal === 'string' && typeof bVal === 'string' && !isNaN(parseFloat(aVal)) && !isNaN(parseFloat(bVal))) {
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
    }
    
    return 0;
  });
};
