
import React, { useState } from 'react';
import type { Ledger, LedgerGroupMaster } from '../types';
import Icon from './Icon';

interface MastersPageProps {
  ledgers: Ledger[];
  ledgerGroups: LedgerGroupMaster[];
  onAddLedger: (ledger: Ledger) => void;
  onAddLedgerGroup: (group: LedgerGroupMaster) => void;
}

type MasterTab = 'Ledgers' | 'LedgerGroups';

const indianStates = [ "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttarakhand", "Uttar Pradesh", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Lakshadweep", "Puducherry" ];

const MastersPage: React.FC<MastersPageProps> = ({ ledgers, ledgerGroups, onAddLedger, onAddLedgerGroup }) => {
  const [activeTab, setActiveTab] = useState<MasterTab>('Ledgers');

  // State for Create Ledger
  const [ledgerName, setLedgerName] = useState('');
  const [ledgerGroup, setLedgerGroup] = useState<string>('Sundry Debtors');
  const [gstin, setGstin] = useState('');
  const [registrationType, setRegistrationType] = useState<'Registered' | 'Unregistered' | 'Composition'>('Registered');
  const [ledgerState, setLedgerState] = useState('Maharashtra');

  // State for Create Ledger Group
  const [groupName, setGroupName] = useState('');
  const [groupUnder, setGroupUnder] = useState<string>('Current Assets');

  const handleLedgerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ledgerName.trim() && !ledgers.find(l => l.name.toLowerCase() === ledgerName.trim().toLowerCase())) {
      onAddLedger({ name: ledgerName.trim(), group: ledgerGroup, gstin: gstin.trim(), registrationType, state: ledgerState });
      setLedgerName('');
      setGstin('');
    }
  };

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && !ledgerGroups.find(g => g.name.toLowerCase() === groupName.trim().toLowerCase())) {
      onAddLedgerGroup({ name: groupName.trim(), under: groupUnder });
      setGroupName('');
    }
  };

  const renderLedgers = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Create Ledger</h3>
          <form onSubmit={handleLedgerSubmit} className="space-y-4">
            <div>
              <label htmlFor="ledgerName" className="block text-sm font-medium text-gray-700 mb-1">Ledger Name</label>
              <input
                type="text"
                id="ledgerName"
                value={ledgerName}
                onChange={(e) => setLedgerName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">Group</label>
              <select
                id="group"
                value={ledgerGroup}
                onChange={(e) => setLedgerGroup(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {ledgerGroups.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="registrationType" className="block text-sm font-medium text-gray-700 mb-1">Registration Type</label>
              <select id="registrationType" value={registrationType} onChange={(e) => setRegistrationType(e.target.value as any)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option>Registered</option>
                <option>Unregistered</option>
                <option>Composition</option>
              </select>
            </div>
            <div>
              <label htmlFor="ledgerState" className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select id="ledgerState" value={ledgerState} onChange={(e) => setLedgerState(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="gstin" className="block text-sm font-medium text-gray-700 mb-1">GSTIN (if applicable)</label>
              <input type="text" id="gstin" value={gstin} onChange={(e) => setGstin(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div className="text-right">
              <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Icon name="plus" className="w-4 h-4 mr-2" />
                Create Ledger
              </button>
            </div>
          </form>
        </div>
      </div>
       <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
           <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Existing Ledgers</h3>
           <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                      <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ledger Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GSTIN</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {ledgers.map(ledger => (
                          <tr key={ledger.name}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ledger.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ledger.group}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ledger.state || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ledger.gstin || 'N/A'}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );

  const renderLedgerGroups = () => (
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Create Ledger Group</h3>
          <form onSubmit={handleGroupSubmit} className="space-y-4">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="groupUnder" className="block text-sm font-medium text-gray-700 mb-1">Under</label>
              <select
                id="groupUnder"
                value={groupUnder}
                onChange={(e) => setGroupUnder(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {ledgerGroups.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
              </select>
            </div>
            <div className="text-right">
              <button type="submit" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Icon name="plus" className="w-4 h-4 mr-2" />
                Create Group
              </button>
            </div>
          </form>
        </div>
      </div>
       <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
           <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Existing Ledger Groups</h3>
           <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Under</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {ledgerGroups.map(group => (
                          <tr key={group.name}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.under}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Accounting Masters</h2>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {(['Ledgers', 'LedgerGroups'] as MasterTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              {tab === 'LedgerGroups' ? 'Ledger Groups' : tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'Ledgers' ? renderLedgers() : renderLedgerGroups()}
    </div>
  );
};

export default MastersPage;