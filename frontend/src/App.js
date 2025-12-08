import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ContractForm from './components/ContractForm';
import ContractsList from './components/ContractsList';
import GenerateCashFlowForm from './components/GenerateCashFlowForm';
import ForecastTable from './components/ForecastTable';
import ActualsForm from './components/ActualsForm';
import Dashboard from './components/Dashboard';
import Stages from './components/Stages';
import ProjectTypes from './components/ProjectTypes';

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const handleViewContract = (contract) => {
    setSelectedContract(contract);
    setCurrentView('edit-contract');
  };

  const handleBackToContracts = () => {
    setSelectedContract(null);
    setCurrentView('contracts');
  };

  const handleAddNewContract = () => {
    setSelectedContract(null);
    setCurrentView('new-contract');
  };

  const renderView = () => {
    switch (currentView) {
      case 'welcome':
        return <WelcomeScreen onNavigate={setCurrentView} />;
      case 'contracts':
        return <ContractsList onViewContract={handleViewContract} onAddNewContract={handleAddNewContract} />;
      case 'new-contract':
        return <ContractForm onBack={() => setCurrentView('contracts')} />;
      case 'edit-contract':
        return <ContractForm 
          contract={selectedContract} 
          onBack={handleBackToContracts}
          isEditing={true}
        />;
      case 'generate-cash-flow':
        return <GenerateCashFlowForm onBack={() => setCurrentView('welcome')} />;
      case 'forecast':
        return <ForecastTable />;
      case 'actuals':
        return <ActualsForm />;
      case 'dashboard':
        return <Dashboard />;
      case 'stages':
        return <Stages onBack={() => setCurrentView('welcome')} />;
      case 'project-types':
        return <ProjectTypes onBack={() => setCurrentView('welcome')} />;
      default:
        return <WelcomeScreen onNavigate={setCurrentView} />;
    }
  };

  const navigationItems = [
    { id: 'welcome', label: 'Home', icon: '🏠' },
    { id: 'contracts', label: 'Contracts', icon: '📋' },
    { id: 'forecast', label: 'Forecast', icon: '📊' },
    { id: 'actuals', label: 'Actuals', icon: '📈' },
    { id: 'dashboard', label: 'Dashboard', icon: '📉' },
    { id: 'stages', label: 'Stages', icon: '📋' },
    { id: 'project-types', label: 'Project Types', icon: '🏗️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">💰 PHG</h1>
            </div>
            <div className="text-sm text-gray-500">
              Cash Flow Planning
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:w-64 bg-white shadow-sm border-r border-gray-200`}>
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setSelectedContract(null); // Clear selected contract when navigating
                    setSidebarOpen(false);
                  }}
                  className={`${
                    currentView === item.id
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group w-full flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors duration-200`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
