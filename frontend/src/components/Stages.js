import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Stages({ onBack }) {
  const [stages, setStages] = useState([]);
  const [newStageName, setNewStageName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/stages');
      setStages(response.data);
    } catch (error) {
      console.error('Error fetching stages:', error);
      setMessage('❌ Error loading stages');
    }
  };

  const handleAddStage = async (e) => {
    e.preventDefault();
    if (!newStageName.trim()) {
      setMessage('❌ Please enter a stage name');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('http://localhost:3001/api/stages', {
        stage_name: newStageName.trim()
      });
      
      setNewStageName('');
      setMessage('✅ Stage added successfully!');
      fetchStages();
    } catch (error) {
      console.error('Error adding stage:', error);
      if (error.response?.data?.error?.includes('already exists')) {
        setMessage('❌ Stage name already exists');
      } else {
        setMessage('❌ Error adding stage');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStage = async (stageId) => {
    if (!window.confirm('Are you sure you want to delete this stage?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/stages/${stageId}`);
      setMessage('✅ Stage deleted successfully!');
      fetchStages();
    } catch (error) {
      console.error('Error deleting stage:', error);
      setMessage('❌ Error deleting stage');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Project Stages</h1>
                <p className="text-sm text-gray-600 mt-1">Manage project stages for contracts</p>
              </div>
              <button
                onClick={onBack}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Add New Stage Form */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Stage</h2>
            <form onSubmit={handleAddStage} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="Enter stage name (e.g., Construction Documents)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !newStageName.trim()}
                className={`px-6 py-2 rounded-md font-semibold ${
                  isLoading || !newStageName.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isLoading ? 'Adding...' : 'Add Stage'}
              </button>
            </form>
          </div>

          {/* Message */}
          {message && (
            <div className={`px-6 py-3 ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* Stages List */}
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Stages</h2>
            {stages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No stages found. Add your first stage above.</p>
            ) : (
              <div className="space-y-3">
                {stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{stage.stage_name}</h3>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(stage.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteStage(stage.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
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

export default Stages;

