import type { Voucher } from './types';

const today = new Date();
// JS months are 0-indexed, so 8 is September
const getDate = (year: number, month: number, day: number) => new Date(year, month, day).toISOString().split('T')[0];

export const initialVouchers: Voucher[] = [
    {
        id: '9',
        type: 'Purchase',
        date: getDate(2024, 8, 2), // Corresponds to 02-09-2024
        isInterState: false,
        invoiceNo: '035',
        party: 'Balamurugan Fabricators',
        items: [
            { name: 'Inspection table', qty: 2, rate: 9900, taxableAmount: 19800, cgstAmount: 1782, sgstAmount: 1782, igstAmount: 0, totalAmount: 23364 },
            { name: 'Toolstable', qty: 5, rate: 4800, taxableAmount: 24000, cgstAmount: 2160, sgstAmount: 2160, igstAmount: 0, totalAmount: 28320 },
        ],
        totalTaxableAmount: 43800,
        totalCgst: 3942,
        totalSgst: 3942,
        totalIgst: 0,
        total: 51684,
        narration: 'Purchase of inspection and tool tables'
    },
    {
        id: '1',
        type: 'Receipt',
        date: getDate(today.getFullYear(), 5, 1),
        account: 'Cash',
        party: 'Owner Capital',
        amount: 500000,
        narration: 'Capital introduced'
    },
    {
        id: '2',
        type: 'Purchase',
        date: getDate(today.getFullYear(), 5, 5),
        isInterState: true, // Assuming Global Tech is out of state
        invoiceNo: 'GTS-001',
        party: 'Global Tech Supplies',
        items: [
            { name: 'Laptop', qty: 5, rate: 55000, taxableAmount: 275000, cgstAmount: 0, sgstAmount: 0, igstAmount: 49500, totalAmount: 324500 },
            { name: '1TB SSD Drive', qty: 10, rate: 4500, taxableAmount: 45000, cgstAmount: 0, sgstAmount: 0, igstAmount: 8100, totalAmount: 53100 },
        ],
        totalTaxableAmount: 320000,
        totalCgst: 0,
        totalSgst: 0,
        totalIgst: 57600,
        total: 377600,
        narration: 'Goods purchased for resale'
    },
    {
        id: '3',
        type: 'Sales',
        date: getDate(today.getFullYear(), 5, 10),
        isInterState: false,
        invoiceNo: 'INV-001',
        party: 'Local Customer',
        items: [
            { name: 'Laptop', qty: 2, rate: 65000, taxableAmount: 130000, cgstAmount: 11700, sgstAmount: 11700, igstAmount: 0, totalAmount: 153400 },
            { name: 'Mouse', qty: 2, rate: 800, taxableAmount: 1600, cgstAmount: 144, sgstAmount: 144, igstAmount: 0, totalAmount: 1888 }
        ],
        totalTaxableAmount: 131600,
        totalCgst: 11844,
        totalSgst: 11844,
        totalIgst: 0,
        total: 155288,
        narration: 'Goods sold on credit'
    },
    {
        id: '4',
        type: 'Payment',
        date: getDate(today.getFullYear(), 5, 15),
        account: 'Cash',
        party: 'Rent Expense',
        amount: 25000,
        narration: 'Rent paid for the month'
    },
    {
        id: '5',
        type: 'Contra',
        date: getDate(today.getFullYear(), 5, 16),
        fromAccount: 'Cash',
        toAccount: 'HDFC Bank',
        amount: 400000,
        narration: 'Cash deposited into bank'
    },
     {
        id: '6',
        type: 'Payment',
        date: getDate(today.getFullYear(), 5, 20),
        account: 'HDFC Bank',
        party: 'Global Tech Supplies',
        amount: 200000,
        narration: 'Partial payment made via cheque'
    },
    {
        id: '7',
        type: 'Receipt',
        date: getDate(today.getFullYear(), 6, 1),
        account: 'HDFC Bank',
        party: 'Local Customer',
        amount: 100000,
        narration: 'Received partial payment'
    },
    {
        id: '8',
        type: 'Sales',
        date: getDate(today.getFullYear(), 6, 5),
        isInterState: false,
        invoiceNo: 'INV-002',
        party: 'Prime Retail Customer',
        items: [
            { name: '27-inch Monitor', qty: 3, rate: 18000, taxableAmount: 54000, cgstAmount: 7560, sgstAmount: 7560, igstAmount: 0, totalAmount: 69120 },
            { name: 'Keyboard', qty: 3, rate: 1200, taxableAmount: 3600, cgstAmount: 324, sgstAmount: 324, igstAmount: 0, totalAmount: 4248 }
        ],
        totalTaxableAmount: 57600,
        totalCgst: 7884,
        totalSgst: 7884,
        totalIgst: 0,
        total: 73368,
        narration: 'Goods sold to unregistered customer'
    },
];