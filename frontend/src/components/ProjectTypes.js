import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';

function ProjectTypes({ onBack }) {
  const [projectTypes, setProjectTypes] = useState([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProjectTypes();
  }, []);

  const fetchProjectTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/project-types`);
      setProjectTypes(response.data);
    } catch (error) {
      console.error('Error fetching project types:', error);
      setMessage('❌ Error loading project types');
    }
  };

  const handleAddProjectType = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) {
      setMessage('❌ Please enter a project type name');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/project-types`, {
        type_name: newTypeName.trim()
      });
      
      setNewTypeName('');
      setMessage('✅ Project type added successfully!');
      fetchProjectTypes();
    } catch (error) {
      console.error('Error adding project type:', error);
      if (error.response?.data?.error?.includes('already exists')) {
        setMessage('❌ Project type name already exists');
      } else {
        setMessage('❌ Error adding project type');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProjectType = async (typeId) => {
    if (!window.confirm('Are you sure you want to delete this project type?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/project-types/${typeId}`);
      setMessage('✅ Project type deleted successfully!');
      fetchProjectTypes();
    } catch (error) {
      console.error('Error deleting project type:', error);
      setMessage('❌ Error deleting project type');
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
                <h1 className="text-2xl font-bold text-gray-900">Project Types</h1>
                <p className="text-sm text-gray-600 mt-1">Manage project types for contracts</p>
              </div>
              <button
                onClick={onBack}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Add New Project Type Form */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Project Type</h2>
            <form onSubmit={handleAddProjectType} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="Enter project type name (e.g., MEP, HAS, SM, FS)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !newTypeName.trim()}
                className={`px-6 py-2 rounded-md font-semibold ${
                  isLoading || !newTypeName.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isLoading ? 'Adding...' : 'Add Project Type'}
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

          {/* Project Types List */}
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Project Types</h2>
            {projectTypes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No project types found. Add your first project type above.</p>
            ) : (
              <div className="space-y-3">
                {projectTypes.map((projectType) => (
                  <div
                    key={projectType.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{projectType.type_name}</h3>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(projectType.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteProjectType(projectType.id)}
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

export default ProjectTypes;


