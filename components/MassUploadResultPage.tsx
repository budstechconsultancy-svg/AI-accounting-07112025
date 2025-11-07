import React from 'react';
import type { Voucher, SalesPurchaseVoucher, Ledger, StockItem, CompanyDetails } from '../types';
import Icon from './Icon';

interface MassUploadResultPageProps {
  results: Voucher[];
  onDone: () => void;
  onUpdateVoucher: (voucher: Voucher) => void;
  ledgers: Ledger[];
  stockItems: StockItem[];
  companyDetails: CompanyDetails;
}

const MassUploadResultPage: React.FC<MassUploadResultPageProps> = ({ results, onDone, onUpdateVoucher, ledgers, stockItems, companyDetails }) => {
  const successfulVouchers = results.filter(v => v.type === 'Purchase' || v.type === 'Sales') as SalesPurchaseVoucher[];
  const partyLedgers = ledgers.filter(l => l.group === 'Sundry Creditors' || l.group === 'Sundry Debtors');

  const handleFieldChange = (voucherId: string, field: keyof SalesPurchaseVoucher, value: string) => {
    const originalVoucher = successfulVouchers.find(v => v.id === voucherId);
    if (!originalVoucher) return;

    let updatedVoucher = { ...originalVoucher, [field]: value };

    // If the party changes, we might need to recalculate taxes
    if (field === 'party') {
        const partyLedger = ledgers.find(l => l.name.toLowerCase() === (value as string).toLowerCase());
        const newIsInterState = (partyLedger?.state && companyDetails.state)
            ? partyLedger.state.toLowerCase() !== companyDetails.state.toLowerCase()
            : false;
        
        if (newIsInterState !== originalVoucher.isInterState) {
            updatedVoucher.isInterState = newIsInterState;

            const updatedItems = originalVoucher.items.map(item => {
                const stockItem = stockItems.find(si => si.name.toLowerCase() === item.name.toLowerCase());
                const gstRate = stockItem?.gstRate || 0;
                const taxableAmount = item.qty * item.rate;
                const totalTax = taxableAmount * (gstRate / 100);

                const newItem = { ...item, taxableAmount };
                if (newIsInterState) {
                    newItem.cgstAmount = 0;
                    newItem.sgstAmount = 0;
                    newItem.igstAmount = totalTax;
                } else {
                    newItem.cgstAmount = totalTax / 2;
                    newItem.sgstAmount = totalTax / 2;
                    newItem.igstAmount = 0;
                }
                newItem.totalAmount = taxableAmount + totalTax;
                return newItem;
            });
            
            updatedVoucher.items = updatedItems;
            
            // Recalculate voucher totals
            const totals = updatedItems.reduce((acc, item) => {
                acc.totalTaxableAmount += item.taxableAmount;
                acc.totalCgst += item.cgstAmount;
                acc.totalSgst += item.sgstAmount;
                acc.totalIgst += item.igstAmount;
                acc.grandTotal += item.totalAmount;
                return acc;
            }, { totalTaxableAmount: 0, totalCgst: 0, totalSgst: 0, totalIgst: 0, grandTotal: 0 });

            updatedVoucher.totalTaxableAmount = totals.totalTaxableAmount;
            updatedVoucher.totalCgst = totals.totalCgst;
            updatedVoucher.totalSgst = totals.totalSgst;
            updatedVoucher.totalIgst = totals.totalIgst;
            updatedVoucher.total = totals.grandTotal;
        }
    }
    
    onUpdateVoucher(updatedVoucher);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Review & Confirm Uploads</h2>
        <button
          onClick={onDone}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Icon name="check-circle" className="w-5 h-5 mr-2" />
          Done
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 mb-6 bg-green-50 border border-green-200 rounded-md">
          <p className="font-semibold text-green-800">
            Successfully created {successfulVouchers.length} purchase vouchers. You can make final edits below before proceeding.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <style>{`
            .table-input { width: 100%; border: 1px solid transparent; padding: 0.5rem 0.25rem; background-color: transparent; outline: none; border-radius: 0.375rem; transition: all 0.2s; color: #1e293b; }
            .table-input:focus { background-color: white; border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
            .table-input-readonly { background-color: #f8fafc; color: #4b5563; }
          `}</style>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tax</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {successfulVouchers.map(voucher => (
                <tr key={voucher.id}>
                  <td className="px-2 py-1 whitespace-nowrap w-40">
                    <input 
                      type="date" 
                      value={voucher.date}
                      onChange={(e) => handleFieldChange(voucher.id, 'date', e.target.value)}
                      className="table-input"
                    />
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                     <input 
                      type="text" 
                      value={voucher.invoiceNo}
                      onChange={(e) => handleFieldChange(voucher.id, 'invoiceNo', e.target.value)}
                      className="table-input"
                    />
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    <input 
                        type="text" 
                        list="party-datalist"
                        value={voucher.party}
                        onChange={(e) => handleFieldChange(voucher.id, 'party', e.target.value)}
                        className="table-input"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-mono">{voucher.totalTaxableAmount.toFixed(2)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-mono">{(voucher.totalCgst + voucher.totalSgst + voucher.totalIgst).toFixed(2)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono font-semibold">{voucher.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <datalist id="party-datalist">
            {partyLedgers.map(l => <option key={l.name} value={l.name} />)}
          </datalist>
        </div>
      </div>
    </div>
  );
};

export default MassUploadResultPage;