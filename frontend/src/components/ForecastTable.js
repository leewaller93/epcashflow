import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';

function ForecastTable() {
  const [forecastData, setForecastData] = useState([]);
  const [selectedProjectType, setSelectedProjectType] = useState('All');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('Current');

  const projectTypes = ['All', 'MEP', 'HAS', 'SM', 'FS'];
  
  // Generate fiscal year options (Current, FY26, FY27, etc.)
  const generateFiscalYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = ['Current'];
    
    // Generate FY options from current year - 1 to current year + 5
    for (let year = currentYear - 1; year <= currentYear + 5; year++) {
      const fyYear = year.toString().slice(-2); // Get last 2 digits (e.g., 2026 -> 26)
      options.push(`FY${fyYear}`);
    }
    
    return options;
  };

  const fiscalYearOptions = generateFiscalYearOptions();

  // Generate monthly dates based on fiscal year selection
  const generateMonthlyDates = (fiscalYear) => {
    const dates = [];
    
    if (fiscalYear === 'Current') {
      // Current: next 12 months from today
      const today = new Date();
      for (let i = 0; i < 12; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        dates.push(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
      }
    } else {
      // Fiscal year: FY26 = 2026, FY27 = 2027, etc.
      const yearStr = fiscalYear.replace('FY', '');
      const year = yearStr.length === 2 ? 2000 + parseInt(yearStr) : parseInt(yearStr);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let month = 0; month < 12; month++) {
        dates.push(`${monthNames[month]} ${year}`);
      }
    }
    
    return dates;
  };

  // Initialize monthly dates with current selection
  const [monthlyDates, setMonthlyDates] = useState(() => generateMonthlyDates('Current'));

  useEffect(() => {
    // Update monthly dates when fiscal year changes
    setMonthlyDates(generateMonthlyDates(selectedFiscalYear));
  }, [selectedFiscalYear]);

  useEffect(() => {
    loadForecastData();
  }, [selectedProjectType, selectedFiscalYear]);

  const loadForecastData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/forecast?project_type=${selectedProjectType}&fiscal_year=${selectedFiscalYear}`);
      // Handle both old format (array) and new format (object with forecast_data)
      if (Array.isArray(response.data)) {
        // Old format - use frontend-generated dates
        setForecastData(response.data);
        setMonthlyDates(generateMonthlyDates(selectedFiscalYear));
      } else {
        // New format - use backend dates
        setForecastData(response.data.forecast_data || []);
        // Use backend monthly dates if provided
        if (response.data.monthly_dates && response.data.monthly_dates.length > 0) {
          setMonthlyDates(response.data.monthly_dates);
        } else {
          // Fallback to frontend-generated dates
          setMonthlyDates(generateMonthlyDates(selectedFiscalYear));
        }
      }
    } catch (error) {
      console.error('Error loading forecast data:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
        {/* Header Section - More Compact */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📊 Cash Flow Forecast</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <select
              value={selectedFiscalYear}
              onChange={(e) => setSelectedFiscalYear(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {fiscalYearOptions.map(fy => (
                <option key={fy} value={fy}>
                  {fy === 'Current' ? 'Current (12 Months)' : fy}
                </option>
              ))}
            </select>
            <select
              value={selectedProjectType}
              onChange={(e) => setSelectedProjectType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {projectTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Compact Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded-r">
          <p className="text-xs sm:text-sm text-blue-700">
            <strong>Note:</strong> Shows invoiced amounts by month (when invoices are sent, not when payments are received).
          </p>
        </div>

        {/* Table with Better Spacing */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    {monthlyDates.map(date => (
                      <th key={date} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[75px]">
                        {date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forecastData.map((project) => (
                    <tr key={project.project_id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                            {project.project_name}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">
                            {project.project_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProjectTypeColor(project.project_type)}`}>
                          {project.project_type}
                        </span>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInvoiceTypeColor(project.contract_invoice_type)}`}>
                          {project.contract_invoice_type}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(project.total_value)}
                      </td>
                      {monthlyDates.map((date, index) => {
                        const receiptAmount = project.monthly_values[index] || 0;
                        return (
                          <td key={date} className="px-2 py-3 text-center text-sm text-gray-900 whitespace-nowrap">
                            {receiptAmount > 0 ? (
                              <span className="font-medium">{formatCurrency(receiptAmount)}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {forecastData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No forecast data found</div>
            <div className="text-gray-400 text-sm mt-2">
              Add contracts to generate cash flow forecasts
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForecastTable;
