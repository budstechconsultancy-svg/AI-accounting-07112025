

import React, { useState, useMemo, useCallback } from 'react';
import type { Ledger, Voucher, StockItem, SalesPurchaseVoucher } from '../types';

interface ReportsPageProps {
  vouchers: Voucher[];
  ledgers: Ledger[];
  stockItems: StockItem[];
}

type ReportType = 'DayBook' | 'LedgerReport' | 'TrialBalance' | 'StockSummary' | 'GSTR1' | 'StockValuation' | 'SalesTaxReport';

const ReportsPage: React.FC<ReportsPageProps> = ({ vouchers, ledgers, stockItems }) => {
  const [reportType, setReportType] = useState<ReportType>('DayBook');
  const [selectedLedger, setSelectedLedger] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('');
  
  const ledgersByName = useMemo(() => {
    return ledgers.reduce((acc, ledger) => {
        acc[ledger.name] = ledger;
        return acc;
    }, {} as {[key: string]: Ledger});
  }, [ledgers]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    vouchers.forEach(v => {
        const d = new Date(v.date);
        // Handle potential invalid dates from user input
        if (!isNaN(d.getTime())) {
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months.add(monthKey);
        }
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a)).map(monthKey => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return {
            value: monthKey,
            label: date.toLocaleString('default', { month: 'long', year: 'numeric' })
        };
    });
  }, [vouchers]);

  const trialBalanceData = useMemo(() => {
    if (reportType !== 'TrialBalance') return null;

    const balances: { [key: string]: { debit: number; credit: number } } = {};
    
    // Helper to safely initialize a ledger if it doesn't exist
    const ensureLedger = (name: string) => {
        if (name && !balances[name]) {
            balances[name] = { debit: 0, credit: 0 };
        }
    };
    
    // Initialize with all known ledgers from the master list
    ledgers.forEach(l => ensureLedger(l.name));
    
    vouchers.forEach(v => {
      // Ensure all ledgers mentioned in the voucher exist in our balances object
      // before we start calculating. This prevents crashes if data is out of sync.
      switch (v.type) {
        case 'Purchase':
          ensureLedger(v.party);
          ensureLedger('Purchases');
          ensureLedger('IGST'); ensureLedger('CGST'); ensureLedger('SGST');
          
          balances[v.party].credit += v.total;
          balances['Purchases'].debit += v.totalTaxableAmount;
          if (v.isInterState) {
            balances['IGST'].debit += v.totalIgst;
          } else {
            balances['CGST'].debit += v.totalCgst;
            balances['SGST'].debit += v.totalSgst;
          }
          break;
        case 'Sales':
          ensureLedger(v.party);
          ensureLedger('Sales');
          ensureLedger('IGST'); ensureLedger('CGST'); ensureLedger('SGST');

          balances[v.party].debit += v.total;
          balances['Sales'].credit += v.totalTaxableAmount;
           if (v.isInterState) {
            balances['IGST'].credit += v.totalIgst;
           } else {
            balances['CGST'].credit += v.totalCgst;
            balances['SGST'].credit += v.totalSgst;
          }
          break;
        case 'Payment':
          ensureLedger(v.party);
          ensureLedger(v.account);
          balances[v.party].debit += v.amount;
          balances[v.account].credit += v.amount;
          break;
        case 'Receipt':
          ensureLedger(v.party);
          ensureLedger(v.account);
          balances[v.party].credit += v.amount;
          balances[v.account].debit += v.amount;
          break;
        case 'Contra':
          ensureLedger(v.fromAccount);
          ensureLedger(v.toAccount);
          balances[v.fromAccount].credit += v.amount;
          balances[v.toAccount].debit += v.amount;
          break;
        case 'Journal':
          v.entries.forEach(e => {
            ensureLedger(e.ledger);
            if(e.ledger) { // Ensure ledger name is not empty
              balances[e.ledger].debit += e.debit;
              balances[e.ledger].credit += e.credit;
            }
          });
          break;
      }
    });

    const result = Object.entries(balances)
      .map(([ledger, { debit, credit }]) => {
        if (debit > credit) return { ledger, debit: debit - credit, credit: 0 };
        if (credit > debit) return { ledger, debit: 0, credit: credit - debit };
        return { ledger, debit: 0, credit: 0 };
      })
      .filter(item => item.debit > 0 || item.credit > 0);
      
    const totals = result.reduce((acc, curr) => ({
        debit: acc.debit + curr.debit,
        credit: acc.credit + curr.credit
    }), { debit: 0, credit: 0 });

    return { result, totals };
  }, [reportType, vouchers, ledgers]);
  
  const stockSummaryData = useMemo(() => {
    if (reportType !== 'StockSummary') return null;
    
    const summary: {[key: string]: {inward: number, outward: number}} = {};
    stockItems.forEach(i => {
        summary[i.name] = {inward: 0, outward: 0};
    });

    vouchers.forEach(v => {
        if (v.type === 'Purchase') {
            v.items.forEach(item => {
                if (summary[item.name]) summary[item.name].inward += item.qty;
            });
        } else if (v.type === 'Sales') {
            v.items.forEach(item => {
                if (summary[item.name]) summary[item.name].outward += item.qty;
            });
        }
    });

    return Object.entries(summary).map(([name, data]) => ({
        name,
        ...data,
        closing: data.inward - data.outward,
    }));
  }, [reportType, vouchers, stockItems]);
  
   const gstr1Data = useMemo(() => {
    if (reportType !== 'GSTR1') return null;
    const salesVouchers = vouchers.filter(v => v.type === 'Sales') as SalesPurchaseVoucher[];
    
    const b2b = salesVouchers.filter(v => {
        const partyLedger = ledgersByName[v.party];
        return partyLedger?.registrationType === 'Registered' && partyLedger?.gstin;
    });

    const b2c = salesVouchers.filter(v => {
        const partyLedger = ledgersByName[v.party];
        return !partyLedger || partyLedger.registrationType !== 'Registered' || !partyLedger.gstin;
    });

    return { b2b, b2c };
  }, [reportType, vouchers, ledgersByName]);

  const stockValuationData = useMemo(() => {
    if (reportType !== 'StockValuation') return null;

    const valuation: {
        [key: string]: {
            purchaseQty: number;
            purchaseValue: number;
            salesQty: number;
        }
    } = {};

    stockItems.forEach(item => {
        valuation[item.name] = {
            purchaseQty: 0,
            purchaseValue: 0,
            salesQty: 0,
        };
    });

    vouchers.forEach(v => {
        if (v.type === 'Purchase') {
            v.items.forEach(item => {
                if (valuation[item.name]) {
                    valuation[item.name].purchaseQty += item.qty;
                    valuation[item.name].purchaseValue += item.taxableAmount;
                }
            });
        } else if (v.type === 'Sales') {
            v.items.forEach(item => {
                if (valuation[item.name]) {
                    valuation[item.name].salesQty += item.qty;
                }
            });
        }
    });

    return Object.entries(valuation).map(([name, data]) => {
        const closingQty = data.purchaseQty - data.salesQty;
        const avgCost = data.purchaseQty > 0 ? data.purchaseValue / data.purchaseQty : 0;
        const value = closingQty * avgCost;

        return {
            name,
            closingQty,
            avgCost,
            value,
        };
    });
  }, [reportType, vouchers, stockItems]);

  const salesTaxData = useMemo(() => {
    if (reportType !== 'SalesTaxReport') return null;
    const salesVouchers = vouchers.filter(v => v.type === 'Sales') as SalesPurchaseVoucher[];
    
    return salesVouchers.reduce((acc, v) => {
        acc.taxable += v.totalTaxableAmount;
        acc.cgst += v.totalCgst;
        acc.sgst += v.totalSgst;
        acc.igst += v.totalIgst;
        acc.total += v.total;
        return acc;
    }, { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });
  }, [reportType, vouchers]);


  const filteredVouchers = useMemo(() => {
    if (reportType === 'LedgerReport' && selectedLedger) {
      return vouchers.filter(v => {
        switch (v.type) {
          case 'Purchase':
          case 'Sales':
          case 'Payment':
          case 'Receipt':
            return v.party === selectedLedger || ('account' in v && v.account === selectedLedger);
          case 'Contra':
            return v.fromAccount === selectedLedger || v.toAccount === selectedLedger;
          case 'Journal':
            return v.entries.some(e => e.ledger === selectedLedger);
          default:
            return false;
        }
      });
    }

    if (reportType === 'DayBook') {
        if (filterDate) {
            return vouchers.filter(v => v.date === filterDate);
        }
        if (filterMonth) {
            return vouchers.filter(v => v.date.startsWith(filterMonth));
        }
    }

    return vouchers;
  }, [vouchers, reportType, selectedLedger, filterDate, filterMonth]);

  const getVoucherAmount = (v: Voucher) => ('total' in v ? v.total : 'amount' in v ? v.amount : 0);
  const getVoucherParty = (v: Voucher) => ('party' in v ? v.party : 'N/A');

  const renderDayBook = () => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50"><tr><th className="table-header">Date</th><th className="table-header">Voucher Type</th><th className="table-header">Party</th><th className="table-header text-right">Amount</th></tr></thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredVouchers.length > 0 ? filteredVouchers.map(v => (
          <tr key={v.id}>
            <td className="table-cell text-gray-500">{new Date(v.date).toLocaleDateString()}</td>
            <td className="table-cell font-medium">{v.type}</td>
            <td className="table-cell text-gray-500">{getVoucherParty(v)}</td>
            <td className="table-cell font-mono text-right">{getVoucherAmount(v).toFixed(2)}</td>
          </tr>
        )) : (
          <tr><td colSpan={4} className="text-center py-10 text-gray-500">
            {reportType === 'LedgerReport' && !selectedLedger ? 'Please select a ledger.' :
             (filterDate || filterMonth) ? 'No transactions found for the selected filter.' :
             'No transactions found.'
            }
          </td></tr>
        )}
      </tbody>
    </table>
  );

  const renderTrialBalance = () => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50"><tr><th className="table-header">Ledger</th><th className="table-header text-right">Debit</th><th className="table-header text-right">Credit</th></tr></thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {trialBalanceData?.result.map(item => (
          <tr key={item.ledger}><td className="table-cell font-medium">{item.ledger}</td><td className="table-cell font-mono text-right">{item.debit > 0 ? item.debit.toFixed(2) : ''}</td><td className="table-cell font-mono text-right">{item.credit > 0 ? item.credit.toFixed(2) : ''}</td></tr>
        ))}
      </tbody>
      <tfoot className="bg-gray-100 font-bold">
        <tr><td className="table-cell text-right">Total</td><td className="table-cell font-mono text-right">{trialBalanceData?.totals.debit.toFixed(2)}</td><td className="table-cell font-mono text-right">{trialBalanceData?.totals.credit.toFixed(2)}</td></tr>
      </tfoot>
    </table>
  );
  
  const renderStockSummary = () => (
     <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50"><tr><th className="table-header">Item Name</th><th className="table-header text-right">Inward</th><th className="table-header text-right">Outward</th><th className="table-header text-right">Closing Balance</th></tr></thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {stockSummaryData?.map(item => (
          <tr key={item.name}><td className="table-cell font-medium">{item.name}</td><td className="table-cell font-mono text-right">{item.inward}</td><td className="table-cell font-mono text-right">{item.outward}</td><td className="table-cell font-mono text-right">{item.closing}</td></tr>
        ))}
      </tbody>
    </table>
  );
  
  const renderGSTR1 = () => (
    <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">GSTR-1 Summary</h3>
        
        <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">B2B Invoices (Registered Dealers)</h4>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr>
                    <th className="table-header">GSTIN</th><th className="table-header">Party Name</th><th className="table-header text-right">Taxable Value</th><th className="table-header text-right">Total Tax</th><th className="table-header text-right">Invoice Value</th>
                </tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {gstr1Data?.b2b.map(v => (
                        <tr key={v.id}>
                            <td className="table-cell">{ledgersByName[v.party]?.gstin}</td>
                            <td className="table-cell font-medium">{v.party}</td>
                            <td className="table-cell text-right font-mono">{v.totalTaxableAmount.toFixed(2)}</td>
                            <td className="table-cell text-right font-mono">{(v.totalCgst + v.totalSgst + v.totalIgst).toFixed(2)}</td>
                            <td className="table-cell text-right font-mono">{v.total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

         <div>
            <h4 className="font-semibold text-gray-700 mb-2">B2C Invoices (Unregistered Dealers)</h4>
            <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50"><tr>
                    <th className="table-header">Party Name</th><th className="table-header text-right">Taxable Value</th><th className="table-header text-right">Total Tax</th><th className="table-header text-right">Invoice Value</th>
                </tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                     {gstr1Data?.b2c.map(v => (
                        <tr key={v.id}>
                            <td className="table-cell font-medium">{v.party}</td>
                            <td className="table-cell text-right font-mono">{v.totalTaxableAmount.toFixed(2)}</td>
                            <td className="table-cell text-right font-mono">{(v.totalCgst + v.totalSgst + v.totalIgst).toFixed(2)}</td>
                            <td className="table-cell text-right font-mono">{v.total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderStockValuation = () => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="table-header">Item Name</th>
          <th className="table-header text-right">Closing Qty</th>
          <th className="table-header text-right">Avg. Cost</th>
          <th className="table-header text-right">Value</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {stockValuationData?.map(item => (
          <tr key={item.name}>
            <td className="table-cell font-medium">{item.name}</td>
            <td className="table-cell font-mono text-right">{item.closingQty}</td>
            <td className="table-cell font-mono text-right">{item.avgCost.toFixed(2)}</td>
            <td className="table-cell font-mono text-right font-semibold">{item.value.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSalesTaxReport = () => (
    <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Tax Summary</h3>
        {salesTaxData && (
            <div className="max-w-md border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total Taxable Sales</span>
                        <span className="font-mono font-semibold text-gray-800">{salesTaxData.taxable.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm border-t pt-3 mt-3">
                        <span className="text-gray-600">Total CGST Collected</span>
                        <span className="font-mono text-gray-800">{salesTaxData.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total SGST Collected</span>
                        <span className="font-mono text-gray-800">{salesTaxData.sgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total IGST Collected</span>
                        <span className="font-mono text-gray-800">{salesTaxData.igst.toFixed(2)}</span>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 border-t rounded-b-lg">
                    <div className="flex justify-between items-center font-bold">
                        <span className="text-gray-800">Total Tax Collected</span>
                        <span className="font-mono text-gray-800">{(salesTaxData.cgst + salesTaxData.sgst + salesTaxData.igst).toFixed(2)}</span>
                    </div>
                </div>
                <div className="bg-gray-100 p-4 border-t rounded-b-lg">
                     <div className="flex justify-between items-center font-bold text-lg">
                        <span className="text-gray-900">Total Invoice Value</span>
                        <span className="font-mono text-gray-900">{salesTaxData.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        )}
    </div>
);


  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reports</h2>
      <style>{`.table-header { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase; } .table-cell { padding: 1rem 1.5rem; white-space: nowrap; font-size: 0.875rem; color: #1f2937; }`}</style>

      <div className="mb-6 flex flex-wrap p-1 bg-slate-200 rounded-lg max-w-4xl">
        {(['DayBook', 'LedgerReport', 'TrialBalance', 'StockSummary', 'GSTR1', 'SalesTaxReport', 'StockValuation'] as ReportType[]).map(type => (
          <button key={type} onClick={() => setReportType(type)} className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-colors m-1 ${reportType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-slate-300'}`}>{
            {
              'DayBook': 'Day Book',
              'LedgerReport': 'Ledger',
              'TrialBalance': 'Trial Balance',
              'StockSummary': 'Stock Summary',
              'GSTR1': 'GSTR-1',
              'SalesTaxReport': 'Sales Tax',
              'StockValuation': 'Stock Valuation'
            }[type]
          }</button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        {reportType === 'DayBook' && (
            <div className="mb-4 flex items-end space-x-4 p-4 bg-slate-50 rounded-md border border-slate-200">
                <div>
                    <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
                    <input 
                        type="date" 
                        id="filterDate"
                        value={filterDate}
                        onChange={(e) => { setFilterDate(e.target.value); setFilterMonth(''); }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="filterMonth" className="block text-sm font-medium text-gray-700 mb-1">Filter by Month</label>
                    <select 
                        id="filterMonth"
                        value={filterMonth} 
                        onChange={(e) => { setFilterMonth(e.target.value); setFilterDate(''); }}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">All Months</option>
                        {availableMonths.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
                    </select>
                </div>
                {(filterDate || filterMonth) && (
                    <button 
                        onClick={() => { setFilterDate(''); setFilterMonth(''); }}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                    >
                        Clear
                    </button>
                )}
            </div>
        )}
        {reportType === 'LedgerReport' && (
          <div className="mb-4 max-w-sm"><label className="block text-sm font-medium text-gray-700 mb-1">Select Ledger</label>
            <select value={selectedLedger} onChange={(e) => setSelectedLedger(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="">-- Select a Ledger --</option>
              {ledgers.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
            </select>
          </div>
        )}
        <div className="overflow-x-auto">
          { (reportType === 'DayBook' || reportType === 'LedgerReport') && renderDayBook() }
          { reportType === 'TrialBalance' && renderTrialBalance() }
          { reportType === 'StockSummary' && renderStockSummary() }
          { reportType === 'GSTR1' && renderGSTR1() }
          { reportType === 'StockValuation' && renderStockValuation() }
          { reportType === 'SalesTaxReport' && renderSalesTaxReport() }
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
