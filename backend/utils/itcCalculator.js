export function calculateITC(entry) {
  /**
   * Simple rules for now:
   * - If IGST exists → eligible
   * - If CGST + SGST exist → eligible
   * - Otherwise → ineligible
   */

  let eligibleITC = 0;
  let ineligibleITC = 0;

  if (entry.igst > 0) {
    eligibleITC = entry.igst;
  } else if (entry.cgst > 0 || entry.sgst > 0) {
    eligibleITC = (entry.cgst || 0) + (entry.sgst || 0);
  } else {
    ineligibleITC = entry.totalGST;
  }

  return {
    eligibleITC,
    ineligibleITC
  };
}
