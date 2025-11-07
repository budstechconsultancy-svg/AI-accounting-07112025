import type { Ledger, LedgerGroupMaster, Unit, StockItem, StockGroup } from './types';

export const initialLedgerGroups: LedgerGroupMaster[] = [
    { name: 'Branch / Divisions', under: 'Primary' },
    { name: 'Capital Account', under: 'Primary' },
    { name: 'Current Assets', under: 'Primary' },
    { name: 'Current Liabilities', under: 'Primary' },
    { name: 'Direct Expenses', under: 'Primary' },
    { name: 'Direct Incomes', under: 'Primary' },
    { name: 'Fixed Assets', under: 'Primary' },
    { name: 'Indirect Expenses', under: 'Primary' },
    { name: 'Indirect Incomes', under: 'Primary' },
    { name: 'Investments', under: 'Primary' },
    { name: 'Loans (Liability)', under: 'Primary' },
    { name: 'Misc. Expenses (ASSET)', under: 'Primary' },
    { name: 'Purchase Accounts', under: 'Primary' },
    { name: 'Sales Accounts', under: 'Primary' },
    { name: 'Suspense A/c', under: 'Primary' },
    { name: 'Bank Accounts', under: 'Current Assets' },
    { name: 'Cash-in-Hand', under: 'Current Assets' },
    { name: 'Duties & Taxes', under: 'Current Liabilities' },
    { name: 'Provisions', under: 'Current Liabilities' },
    { name: 'Reserves & Surplus', under: 'Capital Account' },
    { name: 'Secured Loans', under: 'Loans (Liability)' },
    { name: 'Sundry Creditors', under: 'Current Liabilities' },
    { name: 'Sundry Debtors', under: 'Current Assets' },
    { name: 'Unsecured Loans', under: 'Loans (Liability)' },
    { name: 'Stock-in-Hand', under: 'Current Assets' },
    { name: 'Bank OD A/c', under: 'Loans (Liability)' },
];


export const initialLedgers: Ledger[] = [
    { name: 'Cash', group: 'Cash-in-Hand' },
    { name: 'HDFC Bank', group: 'Bank Accounts' },
    { name: 'Sales', group: 'Sales Accounts' },
    { name: 'Purchases', group: 'Purchase Accounts' },
    { name: 'Consulting Income', group: 'Indirect Incomes' },
    { name: 'CGST', group: 'Duties & Taxes' },
    { name: 'SGST', group: 'Duties & Taxes' },
    { name: 'IGST', group: 'Duties & Taxes' },
    { name: 'Balamurugan Fabricators', group: 'Sundry Creditors', gstin: '33AKWPP4092M1ZB', registrationType: 'Registered', state: 'Tamil Nadu' },
    { name: 'Local Supplier', group: 'Sundry Creditors', gstin: '27AAAAA1234A1Z4', registrationType: 'Registered', state: 'Maharashtra' },
    { name: 'Global Tech Supplies', group: 'Sundry Creditors', gstin: '29BBBBB5678B1Z5', registrationType: 'Registered', state: 'Karnataka' },
    { name: 'Local Customer', group: 'Sundry Debtors', gstin: '27CCCCC9012C1Z6', registrationType: 'Registered', state: 'Maharashtra' },
    { name: 'Prime Retail Customer', group: 'Sundry Debtors', registrationType: 'Unregistered', state: 'Maharashtra' },
    { name: 'Rent Expense', group: 'Indirect Expenses' },
    { name: 'Office Supplies', group: 'Indirect Expenses' },
    { name: 'Owner Capital', group: 'Capital Account' },
];

export const initialUnits: Unit[] = [
    { name: 'Nos' }, { name: 'Pcs' }, { name: 'Kgs' }, { name: 'Ltrs' }, { name: 'Box' }
];

export const initialStockGroups: StockGroup[] = [
    { name: 'Electronics' }, { name: 'Hardware' }, { name: 'Software' }, { name: 'Accessories' }
];

export const initialStockItems: StockItem[] = [
    { name: 'Laptop', group: 'Electronics', unit: 'Nos', hsn: '847130', gstRate: 18 }, 
    { name: 'Mouse', group: 'Accessories', unit: 'Nos', hsn: '847160', gstRate: 18 },
    { name: 'Keyboard', group: 'Accessories', unit: 'Nos', hsn: '847160', gstRate: 18 },
    { name: '1TB SSD Drive', group: 'Hardware', unit: 'Nos', hsn: '847170', gstRate: 18 },
    { name: '16GB DDR5 RAM', group: 'Hardware', unit: 'Pcs', hsn: '847330', gstRate: 28 },
    { name: 'Accounting Software License', group: 'Software', unit: 'Nos', hsn: '852380', gstRate: 18 },
    { name: '27-inch Monitor', group: 'Electronics', unit: 'Nos', hsn: '852852', gstRate: 28 },
    { name: 'Inspection table', group: 'Hardware', unit: 'Nos', hsn: '8479', gstRate: 18 },
    { name: 'Toolstable', group: 'Hardware', unit: 'Nos', hsn: '8461', gstRate: 18 }
];