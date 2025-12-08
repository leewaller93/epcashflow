import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ActualsForm() {
  const [formData, setFormData] = useState({
    project_id: '',
    date: '',
    hours_worked: '',
    invoice_issued: '',
    payment_received: '',
    notes: ''
  });

  const [actuals, setActuals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadContracts();
    loadActuals();
  }, []);

  const loadContracts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:3001/api/contracts');
      setContracts(response.data.contracts || []);
    } catch (error) {
      console.error('Error loading contracts:', error);
    }
  };

  const loadActuals = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:3001/api/actuals');
      setActuals(response.data.actuals || []);
    } catch (error) {
      console.error('Error loading actuals:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      await axios.post('http://127.0.0.1:3001/api/actuals', formData);
      setMessage('✅ Actuals recorded successfully!');
      setFormData({
        project_id: '',
        date: '',
        hours_worked: '',
        invoice_issued: '',
        payment_received: '',
        notes: ''
      });
      loadActuals(); // Refresh the list
    } catch (error) {
      console.error('Error recording actuals:', error);
      setMessage('❌ Error recording actuals. Please try again.');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">📈 Record Actuals</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a project</option>
                {contracts.map(contract => (
                  <option key={contract.project_id} value={contract.project_id}>
                    {contract.project_name} ({contract.project_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours Worked
                </label>
                <input
                  type="number"
                  name="hours_worked"
                  value={formData.hours_worked}
                  onChange={handleInputChange}
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Issued ($)
                </label>
                <input
                  type="number"
                  name="invoice_issued"
                  value={formData.invoice_issued}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Received ($)
              </label>
              <input
                type="number"
                name="payment_received"
                value={formData.payment_received}
                onChange={handleInputChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Additional notes about this entry..."
              />
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isLoading ? 'Recording...' : 'Record Actuals'}
            </button>
          </form>
        </div>

        {/* Actuals List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Actuals History</h2>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Actuals Tracking:</strong> Record actual hours worked, invoices issued, and payments received. 
                  This data helps compare forecasted vs. actual cash flow and project performance.
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {actuals.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No actuals recorded yet</div>
                <div className="text-gray-400 text-sm mt-2">Start recording actuals to track performance</div>
              </div>
            ) : (
              <div className="space-y-4">
                {actuals.map((actual) => (
                  <div key={actual.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          {actual.project_name || actual.project_id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(actual.date)}
                        </div>
                      </div>
                      <div className="text-right">
                        {actual.invoice_issued > 0 && (
                          <div className="text-sm text-gray-600">
                            Invoice: {formatCurrency(actual.invoice_issued)}
                          </div>
                        )}
                        {actual.payment_received > 0 && (
                          <div className="text-sm text-green-600 font-medium">
                            Payment: {formatCurrency(actual.payment_received)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {actual.hours_worked > 0 && (
                        <div>
                          <span className="text-gray-500">Hours:</span>
                          <span className="ml-1 font-medium">{actual.hours_worked}</span>
                        </div>
                      )}
                    </div>

                    {actual.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="text-gray-500">Notes:</span> {actual.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActualsForm;
