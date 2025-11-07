import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { VoucherType, Ledger, StockItem, Voucher, SalesPurchaseVoucher, PaymentReceiptVoucher, ContraVoucher, JournalVoucher, JournalEntry, VoucherItem, ExtractedInvoiceData, CompanyDetails } from '../types';
import Icon from './Icon';
import { generateVoucherNarration } from '../services/geminiService';
import MassUploadModal from './MassUploadModal';

// Let TypeScript know that the XLSX library is available globally
declare const XLSX: any;

interface VouchersPageProps {
  ledgers: Ledger[];
  stockItems: StockItem[];
  onAddVouchers: (vouchers: Voucher[]) => void;
  prefilledData: ExtractedInvoiceData | null;
  clearPrefilledData: () => void;
  onInvoiceUpload: (file: File) => void;
  companyDetails: CompanyDetails;
  onMassUploadComplete: (vouchers: Voucher[]) => void;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

const VouchersPage: React.FC<VouchersPageProps> = ({ ledgers, stockItems, onAddVouchers, prefilledData, clearPrefilledData, onInvoiceUpload, companyDetails, onMassUploadComplete }) => {
  const [voucherType, setVoucherType] = useState<VoucherType>('Purchase');
  
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const importMenuRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [isMassUploadOpen, setIsMassUploadOpen] = useState(false);

  // Common state
  const [date, setDate] = useState(getTodayDate());
  const [party, setParty] = useState('');
  const [narration, setNarration] = useState('');
  const [isNarrationLoading, setIsNarrationLoading] = useState(false);
  
  // Sales/Purchase
  const [invoiceNo, setInvoiceNo] = useState('');
  const [isInterState, setIsInterState] = useState(false);
  const [items, setItems] = useState<VoucherItem[]>([{ name: '', qty: 1, rate: 0, taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalAmount: 0 }]);

  // Payment/Receipt
  const [account, setAccount] = useState('');
  const [simpleAmount, setSimpleAmount] = useState(0);

  // Contra
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');

  // Journal
  const [entries, setEntries] = useState<JournalEntry[]>([ { ledger: '', debit: 0, credit: 0 }, { ledger: '', debit: 0, credit: 0 }]);
  
  // Import feedback
  const [importSummary, setImportSummary] = useState<{success: number, failed: number} | null>(null);

  const triggerFileUpload = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
    setIsImportMenuOpen(false);
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onInvoiceUpload(file);
    }
  };
  
  const isVoucher = (obj: any): obj is Voucher => {
    return obj && typeof obj.type === 'string' && typeof obj.date === 'string';
  };

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result;
            const data = JSON.parse(content as string);
            if (Array.isArray(data)) {
                const validVouchers: Voucher[] = [];
                let failed = 0;
                data.forEach(item => {
                    if (isVoucher(item)) {
                        validVouchers.push(item);
                    } else {
                        failed++;
                    }
                });
                if (validVouchers.length > 0) {
                    onAddVouchers(validVouchers);
                }
                setImportSummary({ success: validVouchers.length, failed });
            } else {
                 setImportSummary({ success: 0, failed: 1 });
            }
        } catch (error) {
            console.error("Error parsing JSON file:", error);
            setImportSummary({ success: 0, failed: file.size > 0 ? 1 : 0 });
        }
    };
    reader.readAsText(file);
  };
  
  const handleExcelFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            let allVouchers: Voucher[] = [];
            let failed = 0;
            
            const processSheet = (sheetName: string, type: 'SalesPurchases' | 'PaymentsReceipts' | 'Contra' | 'Journal') => {
                 const sheet = workbook.Sheets[sheetName];
                 if (sheet) {
                    const rows = XLSX.utils.sheet_to_json(sheet);
                    rows.forEach((row: any) => {
                       try {
                           let voucher: Partial<Voucher> = { date: new Date((row.date - (25567 + 1)) * 86400 * 1000).toISOString().split('T')[0], type: row.type, narration: row.narration };
                           
                           if (type === 'SalesPurchases') {
                               voucher = { ...voucher, party: row.party, invoiceNo: row.invoiceNo, isInterState: row.isInterState === 'TRUE', items: JSON.parse(row.items) } as Partial<SalesPurchaseVoucher>;
                               // Recalculate totals for data integrity
                               const { items, isInterState } = voucher as SalesPurchaseVoucher;
                               const totals = items.reduce((acc, item) => {
                                  const stockItem = stockItems.find(si => si.name === item.name);
                                  const gstRate = stockItem?.gstRate || 0;
                                  const taxable = item.qty * item.rate;
                                  const tax = taxable * (gstRate/100);
                                  item.taxableAmount = taxable;
                                  if(isInterState) {
                                      item.igstAmount = tax; item.cgstAmount = 0; item.sgstAmount = 0;
                                  } else {
                                      item.igstAmount = 0; item.cgstAmount = tax/2; item.sgstAmount = tax/2;
                                  }
                                  item.totalAmount = taxable + tax;
                                  acc.taxable += item.taxableAmount; acc.cgst += item.cgstAmount; acc.sgst += item.sgstAmount; acc.igst += item.igstAmount; acc.total += item.totalAmount;
                                  return acc;
                                }, {taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0});
                                (voucher as SalesPurchaseVoucher).totalTaxableAmount = totals.taxable;
                                (voucher as SalesPurchaseVoucher).totalCgst = totals.cgst;
                                (voucher as SalesPurchaseVoucher).totalSgst = totals.sgst;
                                (voucher as SalesPurchaseVoucher).totalIgst = totals.igst;
                                (voucher as SalesPurchaseVoucher).total = totals.total;
                           } else if (type === 'PaymentsReceipts') {
                               voucher = { ...voucher, party: row.party, account: row.account, amount: row.amount } as PaymentReceiptVoucher;
                           } else if (type === 'Contra') {
                               voucher = { ...voucher, fromAccount: row.fromAccount, toAccount: row.toAccount, amount: row.amount } as ContraVoucher;
                           } else if (type === 'Journal') {
                               const entries = JSON.parse(row.entries);
                               const {debit, credit} = entries.reduce((acc: any, e: any) => ({debit: acc.debit + e.debit, credit: acc.credit + e.credit}), {debit: 0, credit: 0});
                               voucher = { ...voucher, entries, totalDebit: debit, totalCredit: credit } as JournalVoucher;
                           }
                           
                           if(isVoucher(voucher)) allVouchers.push(voucher as Voucher); else failed++;
                       } catch { failed++; }
                    });
                 }
            };
            
            processSheet('SalesPurchases', 'SalesPurchases');
            processSheet('PaymentsReceipts', 'PaymentsReceipts');
            processSheet('Contra', 'Contra');
            processSheet('Journal', 'Journal');
            
            if (allVouchers.length > 0) {
                onAddVouchers(allVouchers);
            }
            setImportSummary({ success: allVouchers.length, failed });

        } catch (error) {
            console.error("Error parsing Excel file:", error);
            setImportSummary({ success: 0, failed: 1 });
        }
    };
    reader.readAsArrayBuffer(file);
  };
  
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    
    // Define headers
    const spHeaders = [["date", "type", "invoiceNo", "party", "isInterState", "narration", "items"]];
    const prHeaders = [["date", "type", "account", "party", "amount", "narration"]];
    const cHeaders = [["date", "type", "fromAccount", "toAccount", "amount", "narration"]];
    const jHeaders = [["date", "type", "narration", "entries"]];
    
    // Example data
    spHeaders.push(["2023-01-01", "Sales", "INV-101", "Local Customer", "FALSE", "Sold goods", '[{"name": "Laptop", "qty": 1, "rate": 50000}]']);
    prHeaders.push(["2023-01-02", "Payment", "HDFC Bank", "Local Supplier", "25000", "Paid for supplies"]);
    cHeaders.push(["2023-01-03", "Contra", "Cash", "HDFC Bank", "10000", "Cash deposited"]);
    jHeaders.push(["2023-01-04", "Journal", "Adjustment entry", '[{"ledger": "Rent Expense", "debit": 15000, "credit": 0}, {"ledger": "Cash", "debit": 0, "credit": 15000}]']);
    
    // Create worksheets
    const spSheet = XLSX.utils.aoa_to_sheet(spHeaders);
    const prSheet = XLSX.utils.aoa_to_sheet(prHeaders);
    const cSheet = XLSX.utils.aoa_to_sheet(cHeaders);
    const jSheet = XLSX.utils.aoa_to_sheet(jHeaders);
    
    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, spSheet, "SalesPurchases");
    XLSX.utils.book_append_sheet(wb, prSheet, "PaymentsReceipts");
    XLSX.utils.book_append_sheet(wb, cSheet, "Contra");
    XLSX.utils.book_append_sheet(wb, jSheet, "Journal");
    
    XLSX.writeFile(wb, "AI-Accounting_Voucher_Template.xlsx");
    setIsImportMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (importMenuRef.current && !importMenuRef.current.contains(event.target as Node)) {
            setIsImportMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [importMenuRef]);

  const resetForm = useCallback(() => {
    setDate(getTodayDate());
    setInvoiceNo('');
    setParty('');
    setItems([{ name: '', qty: 1, rate: 0, taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalAmount: 0 }]);
    setAccount('');
    setSimpleAmount(0);
    setNarration('');
    setFromAccount('');
    setToAccount('');
    setEntries([ { ledger: '', debit: 0, credit: 0 }, { ledger: '', debit: 0, credit: 0 }]);
  }, []);

  // Auto-set Inter-State flag based on party ledger's state
  useEffect(() => {
    if (voucherType === 'Purchase' || voucherType === 'Sales') {
        const partyLedger = ledgers.find(l => l.name === party);
        if (partyLedger && partyLedger.state && companyDetails.state) {
            const isInter = partyLedger.state.toLowerCase() !== companyDetails.state.toLowerCase();
            setIsInterState(isInter);
        } else {
            setIsInterState(false);
        }
    }
  }, [party, ledgers, companyDetails.state, voucherType]);

  // Recalculate all item taxes when transaction type (isInterState) changes
  useEffect(() => {
    setItems(currentItems => currentItems.map(item => {
        const stockItem = stockItems.find(si => si.name.toLowerCase() === item.name.toLowerCase());
        if (!stockItem || !item.name) {
            return item;
        }
        
        const gstRate = stockItem.gstRate || 0;
        const taxableAmount = item.qty * item.rate;
        const totalTax = taxableAmount * (gstRate / 100);

        const newItem = { ...item, taxableAmount };

        if (isInterState) {
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
    }));
  }, [isInterState, stockItems]);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    // Handles YYYY-MM-DD and DD-MM-YYYY
    const parts = dateString.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) { // YYYY-MM-DD
        return dateString;
      }
      if (parts[2].length === 4) { // DD-MM-YYYY
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    // Fallback for other formats, might not be perfect
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (prefilledData) {
        const partyLedger = ledgers.find(l => l.name.toLowerCase() === prefilledData.sellerName.toLowerCase());
        const newIsInterState = (partyLedger && partyLedger.state && companyDetails.state)
            ? partyLedger.state.toLowerCase() !== companyDetails.state.toLowerCase()
            : false;
        
        setVoucherType('Purchase');
        setDate(formatDateForInput(prefilledData.invoiceDate) || getTodayDate());
        setInvoiceNo(prefilledData.invoiceNumber || '');
        setParty(prefilledData.sellerName || '');
        setIsInterState(newIsInterState);

        if (prefilledData.lineItems && prefilledData.lineItems.length > 0) {
            const newItems = prefilledData.lineItems.map(item => {
                const stockItem = stockItems.find(si => si.name.toLowerCase() === item.itemDescription.toLowerCase());
                const gstRate = stockItem?.gstRate || 18;
                const taxableAmount = item.quantity * item.rate;
                const tax = taxableAmount * (gstRate / 100);
                
                return {
                    name: item.itemDescription,
                    qty: item.quantity,
                    rate: item.rate,
                    taxableAmount,
                    cgstAmount: newIsInterState ? 0 : tax / 2,
                    sgstAmount: newIsInterState ? 0 : tax / 2,
                    igstAmount: newIsInterState ? tax : 0,
                    totalAmount: taxableAmount + tax,
                };
            });
            setItems(newItems);
        } else {
            setItems([{ name: '', qty: 1, rate: 0, taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalAmount: 0 }]);
        }

        clearPrefilledData();
    }
  }, [prefilledData, clearPrefilledData, stockItems, ledgers, companyDetails.state]);

  const { partyLedgers, accountLedgers, allLedgers } = useMemo(() => {
    const partyLedgers = ledgers.filter(l => l.group === 'Sundry Creditors' || l.group === 'Sundry Debtors');
    const accountLedgers = ledgers.filter(l => l.group === 'Bank Accounts' || l.group === 'Cash-in-Hand');
    const allLedgers = [...ledgers];
    return { partyLedgers, accountLedgers, allLedgers };
  }, [ledgers]);

  const { totalTaxableAmount, totalCgst, totalSgst, totalIgst, grandTotal } = useMemo(() => {
    return items.reduce((acc, item) => {
        acc.totalTaxableAmount += item.taxableAmount;
        acc.totalCgst += item.cgstAmount;
        acc.totalSgst += item.sgstAmount;
        acc.totalIgst += item.igstAmount;
        acc.grandTotal += item.totalAmount;
        return acc;
    }, { totalTaxableAmount: 0, totalCgst: 0, totalSgst: 0, totalIgst: 0, grandTotal: 0 });
  }, [items]);
  
  const { totalDebit, totalCredit, isJournalBalanced } = useMemo(() => {
    const totalDebit = entries.reduce((acc, entry) => acc + entry.debit, 0);
    const totalCredit = entries.reduce((acc, entry) => acc + entry.credit, 0);
    const isJournalBalanced = totalDebit === totalCredit && totalDebit > 0;
    return { totalDebit, totalCredit, isJournalBalanced };
  }, [entries]);

  const handleItemChange = (index: number, field: keyof VoucherItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'name') {
        item.name = value as string;
    } else {
        // FIX: Ensure value is treated as a number to avoid type errors.
        (item as any)[field] = typeof value === 'string' ? parseFloat(value) || 0 : value;
    }

    const stockItem = stockItems.find(si => si.name.toLowerCase() === item.name.toLowerCase());
    const gstRate = stockItem?.gstRate || 0;
    
    item.taxableAmount = item.qty * item.rate;
    const totalTax = item.taxableAmount * (gstRate / 100);

    if (isInterState) {
        item.cgstAmount = 0;
        item.sgstAmount = 0;
        item.igstAmount = totalTax;
    } else {
        item.cgstAmount = totalTax / 2;
        item.sgstAmount = totalTax / 2;
        item.igstAmount = 0;
    }
    item.totalAmount = item.taxableAmount + totalTax;

    newItems[index] = item;
    setItems(newItems);
  };
  
  const handleEntryChange = (index: number, field: keyof JournalEntry, value: string | number) => {
    const newEntries = [...entries];
    newEntries[index] = {...newEntries[index], [field]: value};
    setEntries(newEntries);
  }
  
  const handleAddItemRow = () => setItems([...items, { name: '', qty: 1, rate: 0, taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalAmount: 0 }]);
  const handleRemoveItemRow = (index: number) => items.length > 1 && setItems(items.filter((_, i) => i !== index));
  const handleAddEntryRow = () => setEntries([...entries, { ledger: '', debit: 0, credit: 0 }]);
  const handleRemoveEntryRow = (index: number) => entries.length > 2 && setEntries(entries.filter((_, i) => i !== index));

  const handleSaveVoucher = () => {
    let voucher: Voucher | null = null;
    
    switch(voucherType) {
        case 'Purchase':
        case 'Sales':
            voucher = { id: '', type: voucherType, date, isInterState, invoiceNo, party, items, totalTaxableAmount, totalCgst, totalSgst, totalIgst, total: grandTotal, narration };
            break;
        case 'Payment':
        case 'Receipt':
            voucher = { id: '', type: voucherType, date, account, party, amount: simpleAmount, narration };
            break;
        case 'Contra':
            voucher = { id: '', type: voucherType, date, fromAccount, toAccount, amount: simpleAmount, narration };
            break;
        case 'Journal':
            if(isJournalBalanced) {
                voucher = { id: '', type: voucherType, date, entries, totalDebit, totalCredit, narration };
            } else {
                alert("Journal entries are not balanced!");
            }
            break;
    }

    if(voucher) {
      onAddVouchers([voucher]);
      resetForm();
    }
  };

  const handleGenerateNarration = async () => {
    setIsNarrationLoading(true);
    let voucherData: Partial<Voucher> | null = null;

    switch(voucherType) {
        case 'Purchase':
        case 'Sales':
            voucherData = { type: voucherType, party, invoiceNo, total: grandTotal, items };
            break;
        case 'Payment':
        case 'Receipt':
            voucherData = { type: voucherType, party, account, amount: simpleAmount };
            break;
        case 'Contra':
             voucherData = { type: voucherType, fromAccount, toAccount, amount: simpleAmount };
            break;
        case 'Journal':
            voucherData = { type: voucherType, entries, totalDebit };
            break;
    }

    if (voucherData) {
        const result = await generateVoucherNarration(voucherData);
        setNarration(result);
    }
    setIsNarrationLoading(false);
  };


  const renderSalesPurchaseForm = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div><label className="form-label">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Invoice No.</label><input type="text" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Party</label><input type="text" list="party-datalist" value={party} onChange={e => setParty(e.target.value)} className="form-input" /><datalist id="party-datalist">{partyLedgers.map(l => <option key={l.name} value={l.name} />)}</datalist></div>
      </div>
      <div className="mb-4 p-2 bg-slate-100 rounded-md text-center">
        <p className="text-sm font-semibold text-gray-700">
            Transaction Type: <span className="text-blue-600">{isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST & SGST)'}</span>
        </p>
      </div>
      <div className="overflow-x-auto">
          <table className="min-w-full"><thead className="bg-slate-100"><tr>
            <th className="table-header">Item</th><th className="table-header w-24">Qty</th><th className="table-header w-28">Rate</th>
            <th className="table-header w-32">Taxable Amt</th>
            {!isInterState && <><th className="table-header w-28">CGST</th><th className="table-header w-28">SGST</th></>}
            {isInterState && <th className="table-header w-28">IGST</th>}
            <th className="table-header w-32">Total</th><th className="w-12"></th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (<tr key={index}>
                  <td><input type="text" list="stock-items-datalist" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} className="table-input" /></td>
                  <td><input type="number" value={item.qty} onChange={e => handleItemChange(index, 'qty', e.target.value)} className="table-input text-right" /></td>
                  <td><input type="number" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} className="table-input text-right" /></td>
                  <td><input type="number" value={item.taxableAmount.toFixed(2)} readOnly className="table-input text-right" /></td>
                  {!isInterState && <>
                    <td><input type="number" value={item.cgstAmount.toFixed(2)} readOnly className="table-input text-right" /></td>
                    <td><input type="number" value={item.sgstAmount.toFixed(2)} readOnly className="table-input text-right" /></td>
                  </>}
                  {isInterState && <td><input type="number" value={item.igstAmount.toFixed(2)} readOnly className="table-input text-right" /></td>}
                  <td><input type="number" value={item.totalAmount.toFixed(2)} readOnly className="table-input text-right font-semibold" /></td>
                  <td><button onClick={() => handleRemoveItemRow(index)} className="text-red-500 hover:text-red-700 p-1"><Icon name="trash" className="w-4 h-4" /></button></td>
              </tr>))}
            </tbody>
          </table>
          <datalist id="stock-items-datalist">{stockItems.map(i => <option key={i.name} value={i.name} />)}</datalist>
      </div>
      <button onClick={handleAddItemRow} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"><Icon name="plus" className="w-4 h-4 mr-1" /> Add Row</button>
      <div className="mt-6 flex justify-between items-start">
        <div className="relative"><label className="form-label">Narration</label><textarea value={narration} onChange={e => setNarration(e.target.value)} className="form-input w-80 pr-10" rows={3}></textarea><button onClick={handleGenerateNarration} disabled={isNarrationLoading} className="absolute top-7 right-2 text-blue-500 hover:text-blue-700 disabled:text-gray-300" title="Generate Narration with AI">{isNarrationLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin"/> : <Icon name="wand-sparkles" className="w-5 h-5" />}</button></div>
        <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Total Taxable Amount</span><span className="font-semibold text-gray-800">{totalTaxableAmount.toFixed(2)}</span></div>
            {!isInterState && <>
                <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Total CGST</span><span className="font-semibold text-gray-800">{totalCgst.toFixed(2)}</span></div>
                <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Total SGST</span><span className="font-semibold text-gray-800">{totalSgst.toFixed(2)}</span></div>
            </>}
            {isInterState && <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Total IGST</span><span className="font-semibold text-gray-800">{totalIgst.toFixed(2)}</span></div>}
            <div className="flex justify-between items-center border-t pt-2 mt-2"><span className="text-lg font-bold text-gray-800">Grand Total</span><span className="text-lg font-bold text-gray-800">{grandTotal.toFixed(2)}</span></div>
        </div>
      </div>
    </>
  );

  const renderSimpleForm = (type: 'Payment' | 'Receipt' | 'Contra') => (
     <div className="max-w-md mx-auto space-y-4">
        <div><label className="form-label">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input" /></div>
        { type !== 'Contra' && <div><label className="form-label">Account (Cash/Bank)</label><input type="text" list="account-datalist" value={account} onChange={e => setAccount(e.target.value)} className="form-input" /><datalist id="account-datalist">{accountLedgers.map(l => <option key={l.name} value={l.name} />)}</datalist></div> }
        { type === 'Contra' && <>
          <div><label className="form-label">From Account</label><input type="text" list="account-datalist" value={fromAccount} onChange={e => setFromAccount(e.target.value)} className="form-input" /></div>
          <div><label className="form-label">To Account</label><input type="text" list="account-datalist" value={toAccount} onChange={e => setToAccount(e.target.value)} className="form-input" /></div>
          <datalist id="account-datalist">{accountLedgers.map(l => <option key={l.name} value={l.name} />)}</datalist>
        </> }
        { type !== 'Contra' && <div><label className="form-label">Party</label><input type="text" list="party-datalist" value={party} onChange={e => setParty(e.target.value)} className="form-input" /><datalist id="party-datalist">{partyLedgers.map(l => <option key={l.name} value={l.name} />)}</datalist></div> }
        <div><label className="form-label">Amount</label><input type="number" value={simpleAmount} onChange={e => setSimpleAmount(parseFloat(e.target.value))} className="form-input" /></div>
        <div className="relative"><label className="form-label">Narration</label><textarea value={narration} onChange={e => setNarration(e.target.value)} className="form-input w-full pr-10" rows={3}></textarea><button onClick={handleGenerateNarration} disabled={isNarrationLoading} className="absolute top-7 right-2 text-blue-500 hover:text-blue-700 disabled:text-gray-300" title="Generate Narration with AI">{isNarrationLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin"/> : <Icon name="wand-sparkles" className="w-5 h-5" />}</button></div>
     </div>
  );
  
  const renderJournalForm = () => (
    <>
      <div className="mb-4 w-48"><label className="form-label">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input" /></div>
      <table className="min-w-full"><thead className="bg-gray-50"><tr><th className="table-header">By/To</th><th className="table-header">Ledger</th><th className="table-header w-40">Debit</th><th className="table-header w-40">Credit</th><th className="w-12"></th></tr></thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((entry, index) => (<tr key={index}>
              <td className="px-4 py-2 text-sm text-gray-500">{index === 0 ? 'By (Dr)' : 'To (Cr)'}</td>
              <td><input type="text" list="all-ledgers-datalist" value={entry.ledger} onChange={e => handleEntryChange(index, 'ledger', e.target.value)} className="table-input" /></td>
              <td><input type="number" value={entry.debit} onChange={e => handleEntryChange(index, 'debit', parseFloat(e.target.value) || 0)} className="table-input" /></td>
              <td><input type="number" value={entry.credit} onChange={e => handleEntryChange(index, 'credit', parseFloat(e.target.value) || 0)} className="table-input" /></td>
              <td><button onClick={() => handleRemoveEntryRow(index)} className="text-red-500 hover:text-red-700 p-1"><Icon name="trash" className="w-4 h-4" /></button></td>
          </tr>))}
        </tbody>
        <tfoot className="bg-gray-50 font-semibold"><tr><td colSpan={2} className="px-4 py-2 text-right">Total</td><td className="px-4 py-2">{totalDebit.toFixed(2)}</td><td className="px-4 py-2">{totalCredit.toFixed(2)}</td><td></td></tr></tfoot>
      </table>
      <datalist id="all-ledgers-datalist">{allLedgers.map(l => <option key={l.name} value={l.name} />)}</datalist>
      <button onClick={handleAddEntryRow} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"><Icon name="plus" className="w-4 h-4 mr-1" /> Add Row</button>
      <div className="mt-6 relative"><label className="form-label">Narration</label><textarea value={narration} onChange={e => setNarration(e.target.value)} className="form-input w-full pr-10" rows={3}></textarea><button onClick={handleGenerateNarration} disabled={isNarrationLoading} className="absolute top-7 right-2 text-blue-500 hover:text-blue-700 disabled:text-gray-300" title="Generate Narration with AI">{isNarrationLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin"/> : <Icon name="wand-sparkles" className="w-5 h-5" />}</button></div>
      {!isJournalBalanced && totalDebit > 0 && <p className="text-red-500 text-sm mt-2">Totals do not match!</p>}
    </>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Voucher Entry</h2>
      
      <div className="mb-6 flex flex-wrap justify-center p-1 bg-slate-200 rounded-lg max-w-3xl mx-auto">
        {(['Purchase', 'Sales', 'Payment', 'Receipt', 'Contra', 'Journal'] as VoucherType[]).map(type => (
          <button key={type} onClick={() => { setVoucherType(type); resetForm(); }} className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-colors m-1 ${voucherType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-slate-300'}`}>{type}</button>
        ))}
         <button 
          onClick={() => setIsMassUploadOpen(true)} 
          className="flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-colors m-1 text-purple-700 hover:bg-purple-100 bg-white flex items-center justify-center space-x-2 border border-purple-200"
        >
            <Icon name="upload" className="w-4 h-4" />
            <span>Mass Upload</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
         <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{voucherType} Voucher</h3>
            <div className="relative" ref={importMenuRef}>
                <button
                    onClick={() => setIsImportMenuOpen(prev => !prev)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Icon name="upload" className="w-5 h-5 mr-2" />
                    Import Vouchers
                </button>
                {isImportMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <a href="#" onClick={(e)=>{e.preventDefault(); triggerFileUpload(imageInputRef);}} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">From Image (AI)</a>
                            <a href="#" onClick={(e)=>{e.preventDefault(); triggerFileUpload(jsonInputRef);}} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">From JSON</a>
                            <a href="#" onClick={(e)=>{e.preventDefault(); triggerFileUpload(excelInputRef);}} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">From Excel</a>
                             <div className="border-t border-gray-100 my-1"></div>
                            <a href="#" onClick={(e)=>{e.preventDefault(); handleDownloadTemplate();}} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                <Icon name="download" className="w-4 h-4 mr-2" />
                                Download Template
                            </a>
                        </div>
                    </div>
                )}
            </div>
            <input type="file" ref={imageInputRef} onChange={handleImageFileChange} accept="image/png, image/jpeg" className="hidden" />
            <input type="file" ref={jsonInputRef} onChange={handleJsonFileChange} accept=".json" className="hidden" />
            <input type="file" ref={excelInputRef} onChange={handleExcelFileChange} accept=".xlsx, .xls" className="hidden" />
        </div>
        <style>{`
          .form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
          .form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }
          .form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
          .table-input { 
            width: 100%; 
            border: 1px solid transparent; 
            padding: 0.5rem 0.75rem;
            background-color: transparent;
            outline: none; 
            border-radius: 0.375rem;
            transition: all 0.2s;
            color: #1e293b;
          }
           .table-input:focus { 
            background-color: white;
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
          }
          .table-input[readOnly] {
            background-color: #f9fafb;
            color: #4b5563;
            cursor: not-allowed;
          }
          .table-header { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; background-color: #f9fafb; }
        `}</style>
        { (voucherType === 'Purchase' || voucherType === 'Sales') && renderSalesPurchaseForm() }
        { (voucherType === 'Payment' || voucherType === 'Receipt' || voucherType === 'Contra') && renderSimpleForm(voucherType) }
        { voucherType === 'Journal' && renderJournalForm() }

        <div className="mt-8 pt-4 border-t flex justify-end">
            <button onClick={handleSaveVoucher} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Save Voucher
            </button>
        </div>
      </div>

      {isMassUploadOpen && (
          <MassUploadModal
            onClose={() => setIsMassUploadOpen(false)}
            onComplete={onMassUploadComplete}
            ledgers={ledgers}
            stockItems={stockItems}
            companyDetails={companyDetails}
          />
      )}
    </div>
  );
};

export default VouchersPage;