import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ContractForm({ onBack, contract, isEditing = false }) {
  const [formData, setFormData] = useState({
    project_id: '',
    project_name: '',
    project_type: 'MEP',
    contract_invoice_type: 'Progress',
    total_value: '',
    start_date: '',
    end_date: '',
    net_payment_terms: 30,
    equipment_budget: '',
    architectural_fees: '',
    surgical_equipment_costs: '',
    maintenance_fees: '',
    milestone_details: '',
    stages: [],
    account_name: '',
    account_number: ''
  });

  const [stages, setStages] = useState([]);
  const [availableStages, setAvailableStages] = useState([]);
  const [availableProjectTypes, setAvailableProjectTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showStageModal, setShowStageModal] = useState(false);
  const [newStage, setNewStage] = useState({
    stage_name: '',
    start_date: '',
    end_date: '',
    months: 1,
    amount: ''
  });
  const [monthlyBreakdown, setMonthlyBreakdown] = useState({
    mode: 'tcv-to-monthly', // 'tcv-to-monthly' or 'monthly-to-tcv'
    tcv: '',
    monthlyAmount: '',
    numberOfMonths: '',
    startDate: '',
    endDate: ''
  });
  const invoiceTypes = ['Progress', 'Milestone', 'Monthly'];

  // Calculate financial summary
  const calculateSummary = () => {
    const totalValue = parseFloat(formData.total_value) || 0;
    const allocatedAmount = stages.reduce((sum, stage) => sum + (parseFloat(stage.amount) || 0), 0);
    const remainingAmount = totalValue - allocatedAmount;
    
    return {
      totalValue,
      allocatedAmount,
      remainingAmount,
      allocationPercentage: totalValue > 0 ? (allocatedAmount / totalValue) * 100 : 0
    };
  };

  // Calculate months between dates
  const calculateMonths = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  };

  // Calculate end date from start date and months
  const calculateEndDate = (startDate, months) => {
    if (!startDate || !months) return '';
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(start);
    end.setMonth(end.getMonth() + months - 1);
    end.setDate(new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()); // Last day of month
    return end.toISOString().split('T')[0];
  };

  // Calculate start date from end date and months
  const calculateStartDate = (endDate, months) => {
    if (!endDate || !months) return '';
    const end = new Date(endDate + 'T00:00:00');
    const start = new Date(end);
    start.setMonth(start.getMonth() - months + 1);
    start.setDate(1); // First day of month
    return start.toISOString().split('T')[0];
  };

  // Handle monthly breakdown calculations
  const handleMonthlyBreakdownChange = (field, value) => {
    setMonthlyBreakdown(prev => {
      const updated = { ...prev, [field]: value };
      
      // Calculate monthly amount from TCV and months
      if (updated.mode === 'tcv-to-monthly' && field !== 'monthlyAmount') {
        const tcv = parseFloat(updated.tcv) || 0;
        const months = parseFloat(updated.numberOfMonths) || 0;
        if (tcv > 0 && months > 0) {
          updated.monthlyAmount = (tcv / months).toFixed(2);
        } else {
          updated.monthlyAmount = '';
        }
      }
      
      // Calculate TCV from monthly amount and months
      if (updated.mode === 'monthly-to-tcv' && field !== 'tcv') {
        const monthly = parseFloat(updated.monthlyAmount) || 0;
        const months = parseFloat(updated.numberOfMonths) || 0;
        if (monthly > 0 && months > 0) {
          updated.tcv = (monthly * months).toFixed(2);
        } else {
          updated.tcv = '';
        }
      }
      
      // Calculate end date from start date and number of months
      if ((field === 'startDate' || field === 'numberOfMonths') && updated.startDate && updated.numberOfMonths) {
        const months = parseInt(updated.numberOfMonths) || 0;
        if (months > 0) {
          updated.endDate = calculateEndDate(updated.startDate, months);
        } else {
          updated.endDate = '';
        }
      }
      
      return updated;
    });
  };

  // Sync monthly breakdown TCV with total_value when Monthly invoice type is selected
  useEffect(() => {
    if (formData.contract_invoice_type === 'Monthly' && monthlyBreakdown.tcv) {
      const tcvValue = parseFloat(monthlyBreakdown.tcv);
      const currentTotalValue = parseFloat(formData.total_value) || 0;
      
      // Only update if values are different to avoid infinite loops
      if (tcvValue > 0 && Math.abs(tcvValue - currentTotalValue) > 0.01) {
        setFormData(prev => ({ ...prev, total_value: monthlyBreakdown.tcv }));
      }
    }
  }, [monthlyBreakdown.tcv]);

  // Sync monthly breakdown dates with main form dates when Monthly invoice type is selected
  useEffect(() => {
    if (formData.contract_invoice_type === 'Monthly') {
      if (monthlyBreakdown.startDate && monthlyBreakdown.startDate !== formData.start_date) {
        setFormData(prev => ({ ...prev, start_date: monthlyBreakdown.startDate }));
      }
      if (monthlyBreakdown.endDate && monthlyBreakdown.endDate !== formData.end_date) {
        setFormData(prev => ({ ...prev, end_date: monthlyBreakdown.endDate }));
      }
    }
  }, [monthlyBreakdown.startDate, monthlyBreakdown.endDate]);

  // Force reset form data to ensure clean state
  useEffect(() => {
    // Always reset to clean state, regardless of editing mode
    setFormData({
      project_id: '',
      project_name: '',
      project_type: 'MEP',
      contract_invoice_type: 'Progress',
      total_value: '',
      start_date: '',
      end_date: '',
      net_payment_terms: 30,
      equipment_budget: '',
      architectural_fees: '',
      surgical_equipment_costs: '',
      maintenance_fees: '',
      milestone_details: '',
      stages: [],
      account_name: '',
      account_number: ''
    });
    setStages([]);
    setMessage('');
  }, []); // Empty dependency array - runs once on mount

  // Load contract data if editing
  useEffect(() => {
    if (isEditing && contract && contract.project_id) {
      const contractStages = contract.stages ? JSON.parse(contract.stages) : [];
      
      setFormData({
        project_id: contract.project_id || '',
        project_name: contract.project_name || '',
        project_type: contract.project_type || 'MEP',
        contract_invoice_type: contract.contract_invoice_type || 'Progress',
        total_value: contract.total_value || '',
        start_date: contract.start_date || '',
        end_date: contract.end_date || '',
        net_payment_terms: contract.net_payment_terms || 30,
        equipment_budget: contract.equipment_budget || '',
        architectural_fees: contract.architectural_fees || '',
        surgical_equipment_costs: contract.surgical_equipment_costs || '',
        maintenance_fees: contract.maintenance_fees || '',
        milestone_details: contract.milestone_details || '',
        stages: contractStages,
        account_name: contract.account_name || '',
        account_number: contract.account_number || ''
      });
      
      // Ensure stages have proper default values
      const formattedStages = contractStages.map(stage => ({
        ...stage,
        months: parseInt(stage.months) || 1,
        amount: parseFloat(stage.amount) || 0
      }));
      
      setStages(formattedStages);
      console.log('Loaded contract stages:', formattedStages);
    }
  }, [contract, isEditing]);

  // Load available stages and project types
  useEffect(() => {
    fetchAvailableStages();
    fetchAvailableProjectTypes();
  }, []);

  const fetchAvailableStages = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/stages');
      setAvailableStages(response.data);
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  const fetchAvailableProjectTypes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/project-types');
      setAvailableProjectTypes(response.data);
    } catch (error) {
      console.error('Error fetching project types:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset monthly breakdown when switching away from Monthly invoice type
    if (name === 'contract_invoice_type' && value !== 'Monthly') {
      setMonthlyBreakdown({
        mode: 'tcv-to-monthly',
        tcv: '',
        monthlyAmount: '',
        numberOfMonths: '',
        startDate: '',
        endDate: ''
      });
    }
    
    // Sync total_value with monthly breakdown when Monthly invoice type is selected
    if (name === 'total_value' && formData.contract_invoice_type === 'Monthly' && monthlyBreakdown.mode === 'tcv-to-monthly') {
      handleMonthlyBreakdownChange('tcv', value);
    }
  };

  const openStageModal = () => {
    // Set start date to end date of last stage if exists
    const lastStage = stages[stages.length - 1];
    const startDate = lastStage && lastStage.end_date ? lastStage.end_date : '';
    
    setNewStage({
      stage_name: '',
      start_date: startDate,
      end_date: '',
      months: 1,
      amount: ''
    });
    setShowStageModal(true);
  };

  const closeStageModal = () => {
    setShowStageModal(false);
    setNewStage({
      stage_name: '',
      start_date: '',
      end_date: '',
      months: 1,
      amount: ''
    });
  };

  const addStageFromModal = () => {
    if (!newStage.stage_name || !newStage.start_date || !newStage.end_date || !newStage.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const stageToAdd = {
      id: Date.now(),
      ...newStage
    };
    
    setStages([...stages, stageToAdd]);
    closeStageModal();
  };

  const addStage = () => {
    const newStage = {
      id: Date.now(),
      stage_name: '',
      start_date: '',
      end_date: '',
      amount: '',
      months: 1
    };
    setStages(prev => [...prev, newStage]);
  };

  const updateStage = (index, field, value) => {
    setStages(prev => prev.map((stage, i) => {
      if (i !== index) return stage;
      
      const updatedStage = { ...stage, [field]: value };
      
      // Auto-calculate months when dates change
      if (field === 'start_date' && updatedStage.end_date) {
        const months = calculateMonths(value, updatedStage.end_date);
        updatedStage.months = months > 0 ? months : 1;
      } else if (field === 'end_date' && updatedStage.start_date) {
        const months = calculateMonths(updatedStage.start_date, value);
        updatedStage.months = months > 0 ? months : 1;
      }
      
      // Auto-calculate dates when months change
      if (field === 'months') {
        const months = parseInt(value) || 1;
        if (updatedStage.start_date) {
          updatedStage.end_date = calculateEndDate(updatedStage.start_date, months);
        } else if (updatedStage.end_date) {
          updatedStage.start_date = calculateStartDate(updatedStage.end_date, months);
        }
      }
      
      return updatedStage;
    }));
  };

  const removeStage = (index) => {
    setStages(prev => prev.filter((_, i) => i !== index));
  };

  const calculateInvoiceDates = (stage) => {
    if (!stage.start_date || !stage.amount) return [];
    
    const startDate = new Date(stage.start_date + 'T00:00:00');
    const amount = parseFloat(stage.amount);
    const months = parseInt(stage.months) || 1;
    
    if (formData.contract_invoice_type === 'Milestone') {
      // Single invoice on end date
      const endDate = new Date(stage.end_date + 'T00:00:00');
      return [{
        date: endDate,
        amount: amount
      }];
    } else if (formData.contract_invoice_type === 'Monthly') {
      // Monthly billing - use monthly breakdown if available, otherwise calculate from amount/months
      const invoices = [];
      const monthlyAmount = parseFloat(monthlyBreakdown.monthlyAmount) || (amount / months);
      const numberOfMonths = parseFloat(monthlyBreakdown.numberOfMonths) || months;
      
      for (let i = 0; i < numberOfMonths; i++) {
        const invoiceDate = new Date(startDate);
        invoiceDate.setMonth(invoiceDate.getMonth() + i);
        invoices.push({
          date: invoiceDate,
          amount: monthlyAmount
        });
      }
      
      return invoices;
    } else {
      // Progress billing - distribute across months
      const invoices = [];
      const monthlyAmount = amount / months;
      
      for (let i = 0; i < months; i++) {
        const invoiceDate = new Date(startDate);
        invoiceDate.setMonth(invoiceDate.getMonth() + i);
        invoices.push({
          date: invoiceDate,
          amount: monthlyAmount
        });
      }
      
      return invoices;
    }
  };

  const calculatePaymentDates = (invoiceDate) => {
    const netDays = parseInt(formData.net_payment_terms) || 30;
    const paymentDate = new Date(invoiceDate);
    paymentDate.setDate(paymentDate.getDate() + netDays);
    return paymentDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Ensure stages are properly formatted
      const formattedStages = stages.map(stage => ({
        ...stage,
        amount: parseFloat(stage.amount) || 0,
        months: parseInt(stage.months) || 1
      }));

      const contractData = {
        ...formData,
        total_value: parseFloat(formData.total_value) || 0,
        stages: JSON.stringify(formattedStages)
      };

      console.log('Saving contract with stages:', formattedStages);
      console.log('isEditing:', isEditing, 'contract:', contract);

      // Only update if we have a valid contract with project_id
      if (isEditing && contract && contract.project_id) {
        await axios.put(`http://localhost:3001/api/contracts/${contract.project_id}`, contractData);
        setMessage('✅ Contract updated successfully!');
      } else {
        // Always create new contract if not editing or no valid contract
        await axios.post('http://localhost:3001/api/contracts', contractData);
        setMessage('✅ Contract added successfully!');
      }

      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error) {
      console.error('Error saving contract:', error);
      setMessage('❌ Error saving contract. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const summary = calculateSummary();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Financial Summary & Stages Reference */}
          <div className="w-80 flex-shrink-0">
            <div className="space-y-6 sticky top-8">
              {/* Financial Summary */}
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Financial Summary</h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Total Contract Value</div>
                    <div className="text-2xl font-bold text-blue-900">
                      ${summary.totalValue.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Allocated Amount</div>
                    <div className="text-xl font-bold text-green-900">
                      ${summary.allocatedAmount.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Remaining Amount</div>
                    <div className="text-xl font-bold text-orange-900">
                      ${summary.remainingAmount.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">Allocation Progress</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(summary.allocationPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {summary.allocationPercentage.toFixed(1)}% allocated
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>

                    {/* Main Form */}
          <div className="flex-1">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Contract' : 'Add New Contract'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">Contract Management</p>
              </div>
          <button
            onClick={onBack}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            ← Back
          </button>
            </div>
        </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Contract Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID *
              </label>
              <input
                type="text"
                name="project_id"
                value={formData.project_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name
              </label>
              <input
                type="text"
                name="account_name"
                value={formData.account_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional - for future CRM integration"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Type *
              </label>
              <select
                name="project_type"
                value={formData.project_type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {availableProjectTypes.map(type => (
                  <option key={type.id} value={type.type_name}>{type.type_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Type *
              </label>
              <select
                name="contract_invoice_type"
                value={formData.contract_invoice_type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {invoiceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Monthly Breakdown Section - Only show when Monthly is selected */}
          {formData.contract_invoice_type === 'Monthly' && (
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4">📅 Monthly Breakdown Calculator</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calculation Mode
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="monthlyMode"
                      value="tcv-to-monthly"
                      checked={monthlyBreakdown.mode === 'tcv-to-monthly'}
                      onChange={(e) => {
                        setMonthlyBreakdown(prev => ({ ...prev, mode: e.target.value, monthlyAmount: '' }));
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">TCV → Monthly Amount</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="monthlyMode"
                      value="monthly-to-tcv"
                      checked={monthlyBreakdown.mode === 'monthly-to-tcv'}
                      onChange={(e) => {
                        setMonthlyBreakdown(prev => ({ ...prev, mode: e.target.value, tcv: '' }));
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Monthly Amount → TCV</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {monthlyBreakdown.mode === 'tcv-to-monthly' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Contract Value (TCV) ($) *
                      </label>
                      <input
                        type="number"
                        value={monthlyBreakdown.tcv}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleMonthlyBreakdownChange('tcv', value);
                          // Sync with total_value
                          setFormData(prev => ({ ...prev, total_value: value }));
                        }}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Months *
                      </label>
                      <input
                        type="number"
                        value={monthlyBreakdown.numberOfMonths}
                        onChange={(e) => handleMonthlyBreakdownChange('numberOfMonths', e.target.value)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Amount ($) (Calculated)
                      </label>
                      <input
                        type="number"
                        value={monthlyBreakdown.monthlyAmount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Amount ($) *
                      </label>
                      <input
                        type="number"
                        value={monthlyBreakdown.monthlyAmount}
                        onChange={(e) => handleMonthlyBreakdownChange('monthlyAmount', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Months *
                      </label>
                      <input
                        type="number"
                        value={monthlyBreakdown.numberOfMonths}
                        onChange={(e) => handleMonthlyBreakdownChange('numberOfMonths', e.target.value)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Contract Value (TCV) ($) (Calculated)
                      </label>
                      <input
                        type="number"
                        value={monthlyBreakdown.tcv}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700"
                      />
                    </div>
                  </>
                )}
              </div>

              {monthlyBreakdown.monthlyAmount && monthlyBreakdown.numberOfMonths && (
                <div className="mt-4 p-3 bg-white rounded border border-indigo-200">
                  <p className="text-sm text-gray-600">
                    <strong>Summary:</strong> {monthlyBreakdown.numberOfMonths} monthly payments of{' '}
                    {formatCurrency(parseFloat(monthlyBreakdown.monthlyAmount) || 0)} ={' '}
                    {formatCurrency(parseFloat(monthlyBreakdown.tcv) || 0)} total
                  </p>
                </div>
              )}

              {/* Date Fields */}
              <div className="mt-6 pt-4 border-t border-indigo-300">
                <h4 className="text-md font-semibold text-indigo-900 mb-3">📅 Project Dates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={monthlyBreakdown.startDate}
                      onChange={(e) => handleMonthlyBreakdownChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Calculated)
                    </label>
                    <input
                      type="date"
                      value={monthlyBreakdown.endDate}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700"
                    />
                    {monthlyBreakdown.startDate && monthlyBreakdown.numberOfMonths && (
                      <p className="text-xs text-gray-500 mt-1">
                        Calculated from start date + {monthlyBreakdown.numberOfMonths} months
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Value ($) *
              </label>
              <input
                type="number"
                name="total_value"
                value={formData.total_value}
                onChange={handleInputChange}
                required
                  min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Net Payment Terms (days) *
                </label>
                <input
                  type="number"
                  name="net_payment_terms"
                  value={formData.net_payment_terms}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

                          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Start Date *
              </label>
              <input
                  type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                style={{ minWidth: '140px' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project End Date *
              </label>
              <input
                  type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                style={{ minWidth: '140px' }}
              />
            </div>
          </div>

            {/* Stages Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Project Stages</h3>
                       <button
                         type="button"
                  onClick={openStageModal}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  + Add Stage
                       </button>
                     </div>

              {stages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No stages added yet. Click "Add Stage" to begin.</p>
              ) : (
                <div className="space-y-4">
                  {stages.map((stage, index) => (
                    <div key={stage.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-900">Stage {index + 1}</h4>
                         <button
                           type="button"
                          onClick={() => removeStage(index)}
                          className="text-red-600 hover:text-red-800"
                         >
                           Remove
                         </button>
                       </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Stage</label>
                          <select
                            value={stage.stage_name}
                            onChange={(e) => updateStage(index, 'stage_name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">Select Stage</option>
                            {availableStages.map(s => (
                              <option key={s.id} value={s.stage_name}>{s.stage_name}</option>
                            ))}
                          </select>
                   </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={stage.start_date}
                            onChange={(e) => updateStage(index, 'start_date', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            style={{ minWidth: '120px' }}
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">End Date</label>
                          <input
                            type="date"
                            value={stage.end_date}
                            onChange={(e) => updateStage(index, 'end_date', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            style={{ minWidth: '120px' }}
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1"># of Months</label>
                          <input
                            type="number"
                            value={stage.months || 1}
                            onChange={(e) => updateStage(index, 'months', parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                          <div>
                          <label className="block text-xs text-gray-600 mb-1">Amount ($)</label>
                            <input
                              type="number"
                            value={stage.amount}
                            onChange={(e) => updateStage(index, 'amount', e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>


                      </div>

                      {/* Invoice Preview */}
                      {stage.start_date && stage.amount && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Invoice Preview:</h5>
                          <div className="space-y-1">
                            {calculateInvoiceDates(stage).map((invoice, i) => (
                              <div key={i} className="text-xs text-gray-600">
                                Invoice: {formatDate(invoice.date)} = {formatCurrency(invoice.amount)} | 
                                Payment: {formatDate(calculatePaymentDates(invoice.date))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
                  </div>
                ))}
              </div>
              )}
            </div>

            {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

            {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 rounded-md font-semibold ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
                {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Contract' : 'Add Contract')}
            </button>
          </div>
        </form>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Modal */}
      {showStageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Stage</h3>
              <button
                onClick={closeStageModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Last Stage Reference */}
            {stages.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-900">Last Stage:</div>
                <div className="text-sm text-blue-700">
                  {stages[stages.length - 1].stage_name} - Ends: {stages[stages.length - 1].end_date ? new Date(stages[stages.length - 1].end_date).toLocaleDateString() : 'Not set'}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stage Name *</label>
                <select
                  value={newStage.stage_name}
                  onChange={(e) => setNewStage({...newStage, stage_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select Stage</option>
                  {availableStages.map(s => (
                    <option key={s.id} value={s.stage_name}>{s.stage_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  value={newStage.start_date}
                  onChange={(e) => setNewStage({...newStage, start_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                <input
                  type="date"
                  value={newStage.end_date}
                  onChange={(e) => setNewStage({...newStage, end_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($) *</label>
                <input
                  type="number"
                  value={newStage.amount}
                  onChange={(e) => setNewStage({...newStage, amount: e.target.value})}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={closeStageModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addStageFromModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add Stage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractForm;
