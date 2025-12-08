import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';

function ContractsList({ onViewContract, onAddNewContract }) {
  const [contracts, setContracts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    project_type: 'All',
    invoice_type: 'All'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  const projectTypes = ['All', 'MEP', 'HAS', 'SM', 'FS'];
  const invoiceTypes = ['All', 'Monthly', 'Progress', 'Milestone'];

  useEffect(() => {
    loadContracts();
  }, [currentPage, filters]);

  const loadContracts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 10,
        ...(filters.project_type !== 'All' && { project_type: filters.project_type }),
        ...(filters.invoice_type !== 'All' && { invoice_type: filters.invoice_type })
      });

      const response = await axios.get(`${API_URL}/api/contracts?${params}`);
      setContracts(response.data.contracts);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  };

  const handleContractClick = (contract) => {
    if (onViewContract) {
      onViewContract(contract);
    }
  };

  const handleDeleteContract = async (contract) => {
    if (window.confirm(`Are you sure you want to delete contract "${contract.project_name || contract.project_id}"?`)) {
      try {
        await axios.delete(`${API_URL}/api/contracts/${contract.project_id}`);
        setMessage('✅ Contract deleted successfully!');
        loadContracts(); // Reload the list
      } catch (error) {
        console.error('Error deleting contract:', error);
        setMessage('❌ Error deleting contract. Please try again.');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProjectTypeColor = (type) => {
    const colors = {
      'MEP': 'bg-blue-100 text-blue-800',
      'HAS': 'bg-green-100 text-green-800',
      'SM': 'bg-purple-100 text-purple-800',
      'FS': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getInvoiceTypeColor = (type) => {
    const colors = {
      'Monthly': 'bg-indigo-100 text-indigo-800',
      'Progress': 'bg-yellow-100 text-yellow-800',
      'Milestone': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📋 Contracts</h1>
          {onAddNewContract && (
            <button
              onClick={onAddNewContract}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition-colors"
            >
              + Add New Contract
            </button>
          )}
        </div>
        
        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Type
            </label>
            <select
              value={filters.project_type}
              onChange={(e) => handleFilterChange('project_type', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {projectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Type
            </label>
            <select
              value={filters.invoice_type}
              onChange={(e) => handleFilterChange('invoice_type', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {invoiceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Loading contracts...</div>
          </div>
        )}

        {/* Contracts Table */}
        {!isLoading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contracts.map((contract) => (
                  <tr key={contract.project_id} className="hover:bg-gray-50 cursor-pointer">
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleContractClick(contract)}
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contract.project_name || contract.project_id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contract.project_id}
                        </div>
                      </div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleContractClick(contract)}
                    >
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProjectTypeColor(contract.project_type)}`}>
                        {contract.project_type}
                      </span>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => handleContractClick(contract)}
                    >
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInvoiceTypeColor(contract.contract_invoice_type)}`}>
                        {contract.contract_invoice_type}
                      </span>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      onClick={() => handleContractClick(contract)}
                    >
                      {formatCurrency(contract.total_value)}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      onClick={() => handleContractClick(contract)}
                    >
                      {formatDate(contract.start_date)}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      onClick={() => handleContractClick(contract)}
                    >
                      {formatDate(contract.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleContractClick(contract)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                        >
                          View/Edit
                        </button>
                        <button
                          onClick={() => handleDeleteContract(contract)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {!isLoading && contracts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No contracts found</div>
            <div className="text-gray-400 text-sm mt-2">
              Try adjusting your filters or add a new contract
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContractsList;
