export type Page = 'Dashboard' | 'Masters' | 'Inventory' | 'Vouchers' | 'Reports' | 'Settings' | 'MassUploadResult';

export interface CompanyDetails {
  name: string;
  address: string;
  gstin: string;
  state: string;
}

export interface LedgerGroupMaster {
  name: string;
  under: string; // references another group name, or is a primary group
}

export type LedgerGroup = 'Sundry Debtors' | 'Sundry Creditors' | 'Bank Accounts' | 'Cash-in-Hand' | 'Duties & Taxes' | 'Direct Expenses' | 'Indirect Incomes' | 'Sales Accounts' | 'Purchase Accounts' | 'Capital Account' | 'Current Assets' | 'Current Liabilities' | 'Fixed Assets' | 'Investments' | 'Loans (Liability)' | 'Misc. Expenses (ASSET)' | 'Branch / Divisions' | 'Reserves & Surplus' | 'Secured Loans' | 'Unsecured Loans' | 'Suspense A/c' | 'Bank OD A/c';

export interface Ledger {
  name: string;
  group: string;
  gstin?: string;
  registrationType?: 'Registered' | 'Unregistered' | 'Composition';
  state?: string;
}

export interface Unit {
  name: string;
}

export interface StockGroup {
  name: string;
}

export interface StockItem {
  name: string;
  group: string;
  unit: string;
  hsn?: string;
  gstRate?: number;
}

export interface VoucherItem {
  name: string;
  qty: number;
  rate: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export type VoucherType = 'Purchase' | 'Sales' | 'Payment' | 'Receipt' | 'Contra' | 'Journal';

export interface BaseVoucher {
  id: string;
  type: VoucherType;
  date: string;
  narration?: string;
}

export interface SalesPurchaseVoucher extends BaseVoucher {
  type: 'Purchase' | 'Sales';
  isInterState: boolean;
  invoiceNo: string;
  party: string;
  items: VoucherItem[];
  totalTaxableAmount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  total: number;
}

export interface PaymentReceiptVoucher extends BaseVoucher {
  type: 'Payment' | 'Receipt';
  account: string; // Bank or Cash ledger
  party: string;
  amount: number;
}

export interface ContraVoucher extends BaseVoucher {
    type: 'Contra';
    fromAccount: string; // From Cash/Bank
    toAccount: string;   // To Cash/Bank
    amount: number;
}

export interface JournalEntry {
    ledger: string;
    debit: number;
    credit: number;
}
export interface JournalVoucher extends BaseVoucher {
    type: 'Journal';
    entries: JournalEntry[];
    totalDebit: number;
    totalCredit: number;
}


export type Voucher = SalesPurchaseVoucher | PaymentReceiptVoucher | ContraVoucher | JournalVoucher;

// For AI data extraction
export interface ExtractedLineItem {
  itemDescription: string;
  hsnCode: string;
  quantity: number;
  rate: number;
}

export interface ExtractedInvoiceData {
  sellerName: string;
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
  lineItems: ExtractedLineItem[];
}

// For AI Agent
export interface AgentMessage {
    role: 'user' | 'model';
    text: string;
    sources?: { uri: string; title: string; }[];
}

// For Mass Upload feature
export type MassUploadStatus = 'pending' | 'processing' | 'success' | 'error';

export interface MassUploadFile {
  id: string;
  file: File;
  status: MassUploadStatus;
  extractedData?: ExtractedInvoiceData;
  error?: string;
}