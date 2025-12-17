export function generateGSTR1(invoices, gstin, period) {
  const b2b = [];
  const b2c = [];
  const hsnSummary = {};

  invoices.forEach(inv => {
    if (!hsnSummary[inv.hsn]) {
      hsnSummary[inv.hsn] = {
        hsn: inv.hsn,
        taxable: 0,
        cgst: 0,
        sgst: 0
      };
    }

    hsnSummary[inv.hsn].taxable += inv.taxableValue;
    hsnSummary[inv.hsn].cgst += inv.cgst;
    hsnSummary[inv.hsn].sgst += inv.sgst;

    if (inv.gstin !== "Not found")
      b2b.push(inv);
    else
      b2c.push(inv);
  });

  return {
    gstin,
    period,
    b2b,
    b2c,
    hsn: Object.values(hsnSummary)
  };
}
