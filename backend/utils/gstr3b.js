export function generateGSTR3B(invoices, gstin, period) {
  let taxable = 0, cgst = 0, sgst = 0;

  invoices.forEach(inv => {
    taxable += inv.taxableValue;
    cgst += inv.cgst;
    sgst += inv.sgst;
  });

  return {
    gstin,
    period,
    outward: {
      taxable,
      cgst,
      sgst
    }
  };
}
