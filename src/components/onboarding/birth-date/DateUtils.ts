
/**
 * Calculate age based on birth date
 */
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Generate day values for wheel selector (1-31)
 */
export const generateDaysValues = (): Array<{ label: string; value: number }> => {
  return Array.from({ length: 31 }, (_, i) => ({
    label: `${i + 1}`,
    value: i + 1
  }));
};

/**
 * Generate month values for wheel selector
 */
export const generateMonthsValues = (): Array<{ label: string; value: number }> => {
  return [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ].map((name, index) => ({
    label: name,
    value: index
  }));
};

/**
 * Generate year values for wheel selector based on min/max age range
 */
export const generateYearsValues = (
  minDate: Date,
  maxDate: Date
): Array<{ label: string; value: number }> => {
  return Array.from(
    { length: maxDate.getFullYear() - minDate.getFullYear() + 1 }, 
    (_, i) => ({
      label: `${maxDate.getFullYear() - i}`,
      value: maxDate.getFullYear() - i
    })
  );
};
