import React from 'react';

function WelcomeScreen({ onNavigate }) {
  return (
    <div className="text-center">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💰 Lee Cash Flow
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Contract Management & Cash Flow Forecasting System
          </p>
          <p className="text-gray-500 mb-12">
            Manage your medical equipment planning projects and generate ongoing Excel reports
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Enter New Contract Button */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter New Contract</h2>
            <p className="text-gray-600 mb-6">
              Add new contracts with dynamic fields based on project type and invoice type
            </p>
            <button
              onClick={() => onNavigate('new-contract')}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200"
            >
              Add Contract
            </button>
          </div>

          {/* Generate Cash Flow Button */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate Ongoing Report</h2>
            <p className="text-gray-600 mb-6">
              Download Excel report with all contracts, forecasts, and actuals - edit directly in Excel
            </p>
            <button
              onClick={() => onNavigate('generate-cash-flow')}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
            >
              Download Report
            </button>
          </div>

          {/* Admin Area Button */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Area</h2>
            <p className="text-gray-600 mb-6">
              Manage project stages and project types for contracts
            </p>
            <button
              onClick={() => onNavigate('admin')}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200"
            >
              Admin Area
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
