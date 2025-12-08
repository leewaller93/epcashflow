import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState(['All']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewType, setViewType] = useState('invoices');
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableProjectTypes, setAvailableProjectTypes] = useState([]);

  const projectTypeColors = {
    'MEP': 'rgb(59, 130, 246)',    // Blue
    'HAS': 'rgb(34, 197, 94)',     // Green
    'SM': 'rgb(168, 85, 247)',     // Purple
    'FS': 'rgb(251, 146, 60)',     // Orange
    'All': 'rgb(107, 114, 128)'    // Gray
  };

  const viewTypeOptions = [
    { value: 'invoices', label: 'Projected Invoicing', icon: '📄' },
    { value: 'receipts', label: 'Projected Receipts', icon: '💰' },
    { value: 'combined', label: 'Combined View', icon: '📊' }
  ];

  useEffect(() => {
    // Clear any corrupted date values
    if (startDate && (startDate.includes('0002') || startDate.length < 8)) {
      console.log('Clearing corrupted start date:', startDate);
      setStartDate('');
    }
    if (endDate && (endDate.includes('0002') || endDate.length < 8)) {
      console.log('Clearing corrupted end date:', endDate);
      setEndDate('');
    }
    
    loadDashboardData();
    fetchProjectTypes();
  }, [selectedProjectTypes, startDate, endDate, viewType]);

  const fetchProjectTypes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/project-types');
      setAvailableProjectTypes(response.data);
    } catch (error) {
      console.error('Error fetching project types:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard with filters:', { selectedProjectTypes, startDate, endDate, viewType });
      
      // Build URL with filters
      let url = `http://localhost:3001/api/dashboard?view_type=${viewType}`;
      
      // Handle project type filter
      if (selectedProjectTypes.includes('All') || selectedProjectTypes.length === 0) {
        url += '&project_type=All';
      } else if (selectedProjectTypes.length === 1) {
        url += `&project_type=${selectedProjectTypes[0]}`;
      } else {
        // For multiple project types, we'll need to handle this in the frontend
        url += '&project_type=All';
      }
      
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      
      console.log('API URL:', url);
      const response = await axios.get(url);
      console.log('Dashboard response:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleProjectTypeChange = (projectType) => {
    if (projectType === 'All') {
      setSelectedProjectTypes(['All']);
    } else {
      setSelectedProjectTypes(prev => {
        const newTypes = prev.filter(type => type !== 'All');
        if (newTypes.includes(projectType)) {
          return newTypes.filter(type => type !== projectType);
        } else {
          return [...newTypes, projectType];
        }
      });
    }
  };

  const getChartTitle = () => {
    const viewLabels = {
      'invoices': 'Projected Invoicing',
      'receipts': 'Projected Receipts',
      'combined': 'Cash Flow Forecast (Invoices, Receipts & Net P&L)'
    };
    return viewLabels[viewType] || 'Cash Flow Dashboard';
  };

  const getChartData = () => {
    if (!dashboardData || !dashboardData.monthly_data) return null;

    const labels = dashboardData.monthly_data.map(item => item.month);
    const datasets = [];

    if (viewType === 'invoices') {
      if (showDetail && selectedProjectTypes.length > 1) {
        // Show separate lines for each project type
        selectedProjectTypes.forEach(projectType => {
          if (projectType !== 'All') {
            datasets.push({
              label: `${projectType} Invoices`,
              data: dashboardData.monthly_data.map(item => 
                item.by_project_type[projectType]?.invoices || 0
              ),
              borderColor: projectTypeColors[projectType],
              backgroundColor: projectTypeColors[projectType].replace('rgb', 'rgba').replace(')', ', 0.1)'),
              tension: 0.1
            });
          }
        });
      } else {
        // Show single line for all invoices
        datasets.push({
          label: 'Projected Invoices',
          data: dashboardData.monthly_data.map(item => item.invoices),
          borderColor: projectTypeColors['All'],
          backgroundColor: projectTypeColors['All'].replace('rgb', 'rgba').replace(')', ', 0.1)'),
          tension: 0.1
        });
      }
    } else if (viewType === 'receipts') {
      if (showDetail && selectedProjectTypes.length > 1) {
        selectedProjectTypes.forEach(projectType => {
          if (projectType !== 'All') {
            datasets.push({
              label: `${projectType} Receipts`,
              data: dashboardData.monthly_data.map(item => 
                item.by_project_type[projectType]?.receipts || 0
              ),
              borderColor: projectTypeColors[projectType],
              backgroundColor: projectTypeColors[projectType].replace('rgb', 'rgba').replace(')', ', 0.1)'),
              tension: 0.1
            });
          }
        });
      } else {
        datasets.push({
          label: 'Projected Receipts',
          data: dashboardData.monthly_data.map(item => item.receipts),
          borderColor: projectTypeColors['All'],
          backgroundColor: projectTypeColors['All'].replace('rgb', 'rgba').replace(')', ', 0.1)'),
          tension: 0.1
        });
      }
    } else if (viewType === 'combined') {
      // Always show invoices and receipts
      datasets.push({
        label: 'Projected Invoices',
        data: dashboardData.monthly_data.map(item => item.invoices),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1
      });
      datasets.push({
        label: 'Projected Receipts',
        data: dashboardData.monthly_data.map(item => item.receipts),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1
      });
      datasets.push({
        label: 'Net P&L',
        data: dashboardData.monthly_data.map(item => item.net_pnl),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1
      });
    }

    return { labels, datasets };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: getChartTitle(),
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const getTotalInvoices = () => {
    if (!dashboardData || !dashboardData.monthly_data) return 0;
    return dashboardData.monthly_data.reduce((sum, item) => sum + item.invoices, 0);
  };

  const getTotalReceipts = () => {
    if (!dashboardData || !dashboardData.monthly_data) return 0;
    return dashboardData.monthly_data.reduce((sum, item) => sum + item.receipts, 0);
  };

  const getNetPnl = () => {
    return getTotalReceipts() - getTotalInvoices();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <div className="text-gray-500 text-lg">Loading dashboard data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Cash Flow Dashboard</h1>
            <p className="text-gray-600 mt-1">Professional cash flow forecasting and analysis</p>
          </div>
          <div className="flex items-center space-x-4">
            {selectedProjectTypes.includes('All') && (
              <button
                onClick={() => setShowDetail(!showDetail)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showDetail 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showDetail ? 'Hide Detail' : 'Show Detail'}
              </button>
            )}
          </div>
        </div>

        {/* View Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">View Type:</label>
          <div className="flex space-x-2">
            {viewTypeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setViewType(option.value)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewType === option.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Filters</h3>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Project Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Project Types:</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedProjectTypes.includes('All')}
                    onChange={() => handleProjectTypeChange('All')}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">All Project Types</span>
                </label>
                {['MEP', 'HAS', 'SM', 'FS'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedProjectTypes.includes(type)}
                      onChange={() => handleProjectTypeChange(type)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date:</label>
              <input
                type="date"
                value={formatDateForInput(startDate)}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('Start date changed to:', value);
                  setStartDate(value);
                }}
                placeholder="YYYY-MM-DD"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date:</label>
              <input
                type="date"
                value={formatDateForInput(endDate)}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('End date changed to:', value);
                  setEndDate(value);
                }}
                placeholder="YYYY-MM-DD"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSelectedProjectTypes(['All']);
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-2xl font-bold">{dashboardData?.total_projects || 0}</div>
                <div className="text-blue-100">Total Projects</div>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-2xl font-bold">{formatCurrency(dashboardData?.total_value || 0)}</div>
                <div className="text-green-100">Total Contract Value</div>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-2xl font-bold">{formatCurrency(getTotalInvoices())}</div>
                <div className="text-purple-100">Total Invoices</div>
              </div>
              <div className="text-4xl">📄</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-2xl font-bold">{formatCurrency(getTotalReceipts())}</div>
                <div className="text-orange-100">Total Receipts</div>
              </div>
              <div className="text-4xl">💳</div>
            </div>
          </div>
        </div>

        {/* Net P&L Card (for combined view) */}
        {viewType === 'combined' && (
          <div className="mb-8">
            <div className={`rounded-lg p-6 ${
              getNetPnl() >= 0 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
            }`}>
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="text-2xl font-bold">{formatCurrency(getNetPnl())}</div>
                  <div className="text-opacity-90">Net P&L (Receipts - Invoices)</div>
                </div>
                <div className="text-4xl">{getNetPnl() >= 0 ? '📈' : '📉'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{getChartTitle()}</h2>
          {getChartData() && (
            <div className="h-96">
              <Line data={getChartData()} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Dashboard Overview:</strong> This professional cash flow dashboard shows projected invoicing and receipts based on your contract stages and payment terms. 
                Use the filters to analyze specific time periods and project types. The combined view shows net P&L to help you understand your cash position.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
