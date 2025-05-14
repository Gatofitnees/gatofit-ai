
/**
 * Calculate the new index based on the vertical movement
 */
export const calculateNewIndex = (
  diffY: number, 
  itemHeight: number, 
  selectedIndex: number, 
  valuesLength: number
): number => {
  const indexChange = Math.round(diffY / itemHeight);
  return Math.max(0, Math.min(valuesLength - 1, selectedIndex - indexChange));
};
