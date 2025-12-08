import React, { useState } from 'react';
import StagesContent from './StagesContent';
import ProjectTypesContent from './ProjectTypesContent';

function Admin({ onBack }) {
  const [activeTab, setActiveTab] = useState('stages'); // 'stages' or 'project-types'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Area</h1>
                <p className="text-sm text-gray-600 mt-1">Manage stages and project types</p>
              </div>
              <button
                onClick={onBack}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                ← Back to Home
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('stages')}
                className={`${
                  activeTab === 'stages'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                📋 Manage Stages
              </button>
              <button
                onClick={() => setActiveTab('project-types')}
                className={`${
                  activeTab === 'project-types'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                🏗️ Manage Project Types
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'stages' && (
              <StagesContent />
            )}
            {activeTab === 'project-types' && (
              <ProjectTypesContent />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;

