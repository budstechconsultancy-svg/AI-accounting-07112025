import React, { useState, useCallback, useEffect } from 'react';
import type { Page, Ledger, Unit, StockItem, Voucher, ExtractedInvoiceData, CompanyDetails, LedgerGroupMaster, StockGroup, AgentMessage } from './types';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import MastersPage from './components/MastersPage';
import InventoryPage from './components/InventoryPage';
import VouchersPage from './components/VouchersPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import Modal from './components/Modal';
import AIAgent from './components/AIAgent';
import Icon from './components/Icon';
import MassUploadResultPage from './components/MassUploadResultPage';
import { extractInvoiceDataWithRetry, getAgentResponse, getGroundedAgentResponse } from './services/geminiService';
import { initialLedgers, initialLedgerGroups, initialUnits, initialStockItems, initialStockGroups } from './initialData';
import { initialVouchers } from './initialVouchers';
import * as dbService from './services/dbService';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // In-memory database state
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({ name: 'AI-Accounting', address: '', gstin: '', state: ''});
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [ledgerGroups, setLedgerGroups] = useState<LedgerGroupMaster[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [stockGroups, setStockGroups] = useState<StockGroup[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  
  // AI Flow State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefilledVoucherData, setPrefilledVoucherData] = useState<ExtractedInvoiceData | null>(null);

  // AI Agent State
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([
      { role: 'model', text: 'Hello! How can I help you with your accounting data today? Use the toggle below to search the web for up-to-date information.' }
  ]);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  
  // Import summary state
  const [importSummary, setImportSummary] = useState<{success: number, failed: number} | null>(null);

  // Mass upload result state
  const [massUploadResult, setMassUploadResult] = useState<Voucher[] | null>(null);

  // Load data from IndexedDB on initial mount
  useEffect(() => {
    const loadData = async () => {
      await dbService.initDB();
      // FIX: Provide explicit types to the generic `dbService.loadData` function to resolve type errors.
      const [
        loadedCompanyDetails, loadedLedgers, loadedLedgerGroups, loadedUnits,
        loadedStockGroups, loadedStockItems, loadedVouchers
      ] = await Promise.all([
        dbService.loadData<CompanyDetails>('companyDetails'),
        dbService.loadData<Ledger>('ledgers'),
        dbService.loadData<LedgerGroupMaster>('ledgerGroups'),
        dbService.loadData<Unit>('units'),
        dbService.loadData<StockGroup>('stockGroups'),
        dbService.loadData<StockItem>('stockItems'),
        dbService.loadData<Voucher>('vouchers')
      ]);

      if (loadedLedgers.length === 0) { // First time load, seed the database
        setCompanyDetails({ name: 'Accatum Machinors Pvt Ltd', address: '4/14, 4/15 V.K.V Nanjappa Gounder Layout', gstin: '33ABACA5718R1ZD', state: 'Tamil Nadu'});
        setLedgers(initialLedgers);
        setLedgerGroups(initialLedgerGroups);
        setUnits(initialUnits);
        setStockGroups(initialStockGroups);
        setStockItems(initialStockItems);
        setVouchers(initialVouchers);
      } else {
        setCompanyDetails(loadedCompanyDetails[0] || { name: 'AI-Accounting', address: '', gstin: '', state: ''});
        setLedgers(loadedLedgers);
        setLedgerGroups(loadedLedgerGroups);
        setUnits(loadedUnits);
        setStockGroups(loadedStockGroups);
        setStockItems(loadedStockItems);
        setVouchers(loadedVouchers);
      }
      setIsDataLoaded(true);
    };
    loadData();
  }, []);

  // Save data to IndexedDB whenever it changes
  useEffect(() => {
    if (!isDataLoaded) return;
    dbService.saveData('companyDetails', [companyDetails]);
    dbService.saveData('ledgers', ledgers);
    dbService.saveData('ledgerGroups', ledgerGroups);
    dbService.saveData('units', units);
    dbService.saveData('stockGroups', stockGroups);
    dbService.saveData('stockItems', stockItems);
    dbService.saveData('vouchers', vouchers);
  }, [companyDetails, ledgers, ledgerGroups, units, stockGroups, stockItems, vouchers, isDataLoaded]);


  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('Dashboard');
  };

  const handleNavigate = (page: Page) => setCurrentPage(page);

  // --- Data mutation handlers ---
  const handleAddLedger = (ledger: Ledger) => setLedgers(prev => [...prev, ledger].sort((a,b) => a.name.localeCompare(b.name)));
  const handleAddLedgerGroup = (group: LedgerGroupMaster) => setLedgerGroups(prev => [...prev, group].sort((a,b) => a.name.localeCompare(b.name)));
  const handleAddUnit = (unit: Unit) => setUnits(prev => [...prev, unit].sort((a,b) => a.name.localeCompare(b.name)));
  const handleAddStockGroup = (group: StockGroup) => setStockGroups(prev => [...prev, group].sort((a,b) => a.name.localeCompare(b.name)));
  const handleAddStockItem = (item: StockItem) => setStockItems(prev => [...prev, item].sort((a,b) => a.name.localeCompare(b.name)));
  
  const handleAddVouchers = (vouchersToAdd: Voucher[]) => {
    const newVouchers = vouchersToAdd.map(v => ({...v, id: v.id || new Date().toISOString() + Math.random() }));
    setVouchers(prev => [...prev, ...newVouchers].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const handleUpdateVoucher = (updatedVoucher: Voucher) => {
    // Update main vouchers list
    setVouchers(prevVouchers => 
        prevVouchers.map(v => v.id === updatedVoucher.id ? updatedVoucher : v)
    );
    // Also update the mass upload result list being displayed
    setMassUploadResult(prevResult => 
        prevResult ? prevResult.map(v => v.id === updatedVoucher.id ? updatedVoucher : v) as Voucher[] : null
    );
  };

  const handleMassUploadComplete = (vouchersToCreate: Voucher[]) => {
    // We need to assign IDs before showing them on the result page.
    const createdVouchers = vouchersToCreate.map(v => ({...v, id: v.id || new Date().toISOString() + Math.random() }));
    
    // First, add the vouchers to the main state
    setVouchers(prev => [...prev, ...createdVouchers].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    // Then, store the result for the results page
    setMassUploadResult(createdVouchers);

    // Finally, navigate to the results page
    setCurrentPage('MassUploadResult');
  };
  
  const handleInvoiceUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await extractInvoiceDataWithRetry(file);
      setPrefilledVoucherData(data);
      setCurrentPage('Vouchers');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during AI extraction.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessageToAgent = async (message: string, useGrounding: boolean) => {
    const userMessage: AgentMessage = { role: 'user', text: message };
    setAgentMessages(prev => [...prev, userMessage]);
    setIsAgentLoading(true);

    try {
      let modelMessage: AgentMessage;
      if (useGrounding) {
        const response = await getGroundedAgentResponse(message);
        modelMessage = { role: 'model', text: response.text, sources: response.sources };
      } else {
        const contextData = JSON.stringify({
          vouchers,
          ledgers,
          stockItems,
          companyDetails,
        });
        const responseText = await getAgentResponse(contextData, message);
        modelMessage = { role: 'model', text: responseText };
      }
      setAgentMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      const errorMessage: AgentMessage = { role: 'model', text: 'Sorry, I had trouble connecting to the AI. Please try again.' };
      setAgentMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAgentLoading(false);
    }
  };

  const clearPrefilledData = useCallback(() => setPrefilledVoucherData(null), []);
  
  const renderPage = () => {
    if (!isDataLoaded) {
      return <div className="flex items-center justify-center h-full text-gray-500">Loading Data...</div>;
    }
    switch (currentPage) {
      case 'Dashboard': return <DashboardPage companyName={companyDetails.name} vouchers={vouchers} ledgers={ledgers} />;
      case 'Masters': return <MastersPage ledgers={ledgers} ledgerGroups={ledgerGroups} onAddLedger={handleAddLedger} onAddLedgerGroup={handleAddLedgerGroup} />;
      case 'Inventory': return <InventoryPage units={units} stockGroups={stockGroups} stockItems={stockItems} onAddUnit={handleAddUnit} onAddStockGroup={handleAddStockGroup} onAddStockItem={handleAddStockItem} />;
      case 'Vouchers': return <VouchersPage ledgers={ledgers} stockItems={stockItems} onAddVouchers={handleAddVouchers} prefilledData={prefilledVoucherData} clearPrefilledData={clearPrefilledData} onInvoiceUpload={handleInvoiceUpload} companyDetails={companyDetails} onMassUploadComplete={handleMassUploadComplete} />;
      case 'Reports': return <ReportsPage vouchers={vouchers} ledgers={ledgers} stockItems={stockItems} />;
      case 'Settings': return <SettingsPage companyDetails={companyDetails} onSave={setCompanyDetails} />;
      case 'MassUploadResult': return <MassUploadResultPage 
        results={massUploadResult || []} 
        onDone={() => { setCurrentPage('Vouchers'); setMassUploadResult(null); }} 
        onUpdateVoucher={handleUpdateVoucher}
        ledgers={ledgers}
        stockItems={stockItems}
        companyDetails={companyDetails}
      />;
      default: return <div>Page not found</div>;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} companyName={companyDetails.name} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {renderPage()}
      </main>
      <Modal isOpen={isLoading} title="AI Processing" type="loading">
        <p>Extracting invoice data with Gemini AI. This may take a moment...</p>
      </Modal>
      <Modal isOpen={!!error} onClose={() => setError(null)} title="Error" type="error">
        <p>{error}</p>
      </Modal>
      {importSummary && (
        <Modal isOpen={!!importSummary} onClose={() => setImportSummary(null)} title="Import Complete" type="success">
            <p>Successfully imported {importSummary.success} vouchers.</p>
            {importSummary.failed > 0 && <p className="text-yellow-700 mt-1">{importSummary.failed} rows were skipped due to errors or incorrect formatting.</p>}
        </Modal>
      )}

      <div className="fixed bottom-8 right-8 z-40">
        <button 
          onClick={() => setIsAgentOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open AI Assistant"
        >
          <Icon name="sparkles" className="w-8 h-8" />
        </button>
      </div>

      <AIAgent 
        isOpen={isAgentOpen}
        onClose={() => setIsAgentOpen(false)}
        messages={agentMessages}
        onSendMessage={handleSendMessageToAgent}
        isLoading={isAgentLoading}
      />
    </div>
  );
};

export default App;