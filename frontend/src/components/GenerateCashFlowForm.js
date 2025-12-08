import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

function GenerateCashFlowForm({ onBack }) {
  const [selectedProjectType, setSelectedProjectType] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const projectTypes = ['All', 'MEP', 'HAS', 'SM', 'FS'];

  const handleDownload = async () => {
    setIsLoading(true);
    setMessage('Generating ongoing Excel report...');

    try {
      const response = await axios.get(`${API_URL}/api/download?project_type=${selectedProjectType}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Lee_Cash_Flow_Report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage('✅ Ongoing Excel report downloaded successfully! You can edit it directly in Excel.');
    } catch (error) {
      console.error('Download error:', error);
      setMessage('❌ Error downloading report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">📊 Generate Ongoing Excel Report</h1>
        </div>

        <div className="mb-8">
          <p className="text-gray-600 mb-4">
            Download a comprehensive Excel report with all your contracts, cash flow forecasts, and actuals data.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Ongoing Report Feature:</strong> This Excel file can be edited directly. 
                  When you add new contracts and download again, the totals will update automatically 
                  (e.g., 20 contracts → 21 contracts, $50K → $55K cash flow).
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Project Type (Optional)
          </label>
          <select
            value={selectedProjectType}
            onChange={(e) => setSelectedProjectType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {projectTypes.map(type => (
              <option key={type} value={type}>
                {type === 'All' ? 'All Project Types' : type}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Report Contents:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">📋 Contracts Tab</h4>
              <p className="text-sm text-gray-600">All contract details with dynamic fields</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">📊 Forecast Tab</h4>
              <p className="text-sm text-gray-600">Cash flow projections with net 30 calculations</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">📈 Actuals Tab</h4>
              <p className="text-sm text-gray-600">Recorded hours, invoices, and payments</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">📉 Summary Tab</h4>
              <p className="text-sm text-gray-600">Ongoing totals and key metrics</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isLoading ? 'Generating Report...' : '📥 Download Ongoing Excel Report'}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default GenerateCashFlowForm;
