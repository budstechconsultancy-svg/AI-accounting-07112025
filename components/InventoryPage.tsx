import React, { useState, useCallback } from 'react';
import type { Unit, StockItem, StockGroup } from '../types';
import Icon from './Icon';
import { validateHsnCode } from '../services/validationService';
import type { HsnValidationResult } from '../services/validationService';


interface InventoryPageProps {
  units: Unit[];
  stockGroups: StockGroup[];
  stockItems: StockItem[];
  onAddUnit: (unit: Unit) => void;
  onAddStockGroup: (group: StockGroup) => void;
  onAddStockItem: (item: StockItem) => void;
}

type InventoryTab = 'Items' | 'Groups' | 'Units';

const InventoryPage: React.FC<InventoryPageProps> = ({ 
  units, stockGroups, stockItems, 
  onAddUnit, onAddStockGroup, onAddStockItem 
}) => {
  const [activeTab, setActiveTab] = useState<InventoryTab>('Items');
  
  // Form states
  const [unitName, setUnitName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemUnit, setItemUnit] = useState('');
  const [itemGroup, setItemGroup] = useState('');
  const [hsn, setHsn] = useState('');
  const [gstRate, setGstRate] = useState<number>(18);

  // HSN Validation State
  const [hsnValidation, setHsnValidation] = useState<HsnValidationResult | null>(null);
  const [isHsnLoading, setIsHsnLoading] = useState(false);

  const handleUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unitName.trim() && !units.find(u => u.name.toLowerCase() === unitName.trim().toLowerCase())) {
      onAddUnit({ name: unitName.trim() });
      setUnitName('');
    }
  };
  
  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && !stockGroups.find(g => g.name.toLowerCase() === groupName.trim().toLowerCase())) {
      onAddStockGroup({ name: groupName.trim() });
      setGroupName('');
    }
  };

  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim() && itemUnit.trim() && itemGroup.trim() && hsnValidation?.status === 'valid' && !stockItems.find(i => i.name.toLowerCase() === itemName.trim().toLowerCase())) {
      onAddStockItem({ name: itemName.trim(), unit: itemUnit, group: itemGroup, hsn: hsn, gstRate: gstRate });
      setItemName('');
      setItemUnit('');
      setItemGroup('');
      setHsn('');
      setGstRate(18);
      setHsnValidation(null);
    }
  };

  const handleHsnBlur = useCallback(async () => {
    if (!hsn) {
      setHsnValidation(null);
      return;
    }
    setIsHsnLoading(true);
    setHsnValidation(null);
    const result = await validateHsnCode(hsn, gstRate);
    setHsnValidation(result);
    setIsHsnLoading(false);
  }, [hsn, gstRate]);
  
  const renderItems = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Create Stock Item</h3>
          <form onSubmit={handleItemSubmit} className="space-y-4">
             <div>
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input type="text" id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} className="form-input" required />
            </div>
             <div>
              <label htmlFor="itemGroup" className="block text-sm font-medium text-gray-700 mb-1">Group</label>
              <input type="text" id="itemGroup" list="stock-groups-datalist" value={itemGroup} onChange={(e) => setItemGroup(e.target.value)} className="form-input" required />
              <datalist id="stock-groups-datalist">
                {stockGroups.map(g => <option key={g.name} value={g.name} />)}
              </datalist>
            </div>
             <div>
              <label htmlFor="itemUnit" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input type="text" id="itemUnit" list="units-datalist" value={itemUnit} onChange={(e) => setItemUnit(e.target.value)} className="form-input" required />
              <datalist id="units-datalist">
                {units.map(u => <option key={u.name} value={u.name} />)}
              </datalist>
            </div>
            <div>
              <label htmlFor="hsn" className="block text-sm font-medium text-gray-700 mb-1">HSN/SAC Code</label>
              <div className="relative">
                <input 
                  type="text" 
                  id="hsn" 
                  value={hsn} 
                  onChange={(e) => {
                    setHsn(e.target.value);
                    setHsnValidation(null); // Reset validation on change
                  }} 
                  onBlur={handleHsnBlur}
                  className="form-input pr-10" 
                  placeholder="e.g. 8471"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {isHsnLoading && <Icon name="spinner" className="w-5 h-5 text-gray-400 animate-spin" />}
                  {hsnValidation && !isHsnLoading && (
                    hsnValidation.status === 'valid' ? <Icon name="check-circle" className="w-5 h-5 text-green-500" /> :
                    hsnValidation.status === 'invalid' ? <Icon name="x-circle" className="w-5 h-5 text-red-500" /> :
                    <Icon name="warning" className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
              </div>
              {hsnValidation && !isHsnLoading && <p className={`text-xs mt-1 ${hsnValidation.status === 'invalid' ? 'text-red-600' : hsnValidation.status === 'mismatch' ? 'text-yellow-600' : 'text-green-600'}`}>{hsnValidation.message}</p>}
            </div>
             <div>
              <label htmlFor="gstRate" className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
              <input 
                type="number" 
                id="gstRate" 
                value={gstRate} 
                onChange={(e) => {
                  setGstRate(parseFloat(e.target.value));
                  setHsnValidation(null); // Reset validation on change
                }} 
                onBlur={handleHsnBlur}
                className="form-input" 
              />
            </div>
             <div className="text-right">
              <button type="submit" className="form-button disabled:bg-gray-400" disabled={hsnValidation?.status !== 'valid'}>
                 <Icon name="plus" className="w-4 h-4 mr-2" /> Create Item
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="md:col-span-2">
         <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Stock Items</h3>
             <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="table-header">Item Name</th>
                            <th className="table-header">Group</th>
                            <th className="table-header">HSN</th>
                            <th className="table-header">GST Rate</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stockItems.map(item => (
                            <tr key={item.name}>
                                <td className="table-cell font-medium">{item.name}</td>
                                <td className="table-cell text-gray-500">{item.group}</td>
                                <td className="table-cell text-gray-500 font-mono">{item.hsn}</td>
                                <td className="table-cell text-gray-500">{item.gstRate}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
      </div>
    </div>
  );
  
  const renderSimpleMaster = (
    title: string, type: 'Group' | 'Unit', name: string, setName: (val: string) => void, 
    handleSubmit: (e: React.FormEvent) => void, list: {name: string}[]
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="md:col-span-1">
         <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Create {title}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor={`${type}Name`} className="block text-sm font-medium text-gray-700 mb-1">{title} Name</label>
              <input type="text" id={`${type}Name`} value={name} onChange={(e) => setName(e.target.value)} className="form-input" required />
            </div>
            <div className="text-right">
              <button type="submit" className="form-button">
                <Icon name="plus" className="w-4 h-4 mr-2" /> Create {title}
              </button>
            </div>
          </form>
        </div>
      </div>
       <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Existing {title}s</h3>
          <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {list.map(i => <li key={i.name} className="py-3 px-4 text-sm font-medium">{i.name}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Inventory Masters</h2>
      <style>{`
        .form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }
        .form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
        .form-button { display: inline-flex; items-center: center; justify-content: center; padding: 0.5rem 1rem; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); color: white; background-color: #2563eb; }
        .form-button:hover { background-color: #1d4ed8; }
        .table-header { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
        .table-cell { padding: 1rem 1.5rem; white-space: nowrap; font-size: 0.875rem; color: #111827; }
      `}</style>
      
       <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {(['Items', 'Groups', 'Units'] as InventoryTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              {tab === 'Groups' ? 'Stock Groups' : tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'Items' && renderItems()}
      {activeTab === 'Groups' && renderSimpleMaster('Stock Group', 'Group', groupName, setGroupName, handleGroupSubmit, stockGroups)}
      {activeTab === 'Units' && renderSimpleMaster('Unit', 'Unit', unitName, setUnitName, handleUnitSubmit, units)}

    </div>
  );
};

export default InventoryPage;