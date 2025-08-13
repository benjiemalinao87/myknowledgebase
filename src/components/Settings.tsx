import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Key, 
  MessageSquare, 
  Brain,
  Save,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  role: string;
  experience: string;
  primaryGoal: string;
  communicationStyle: string;
  isEditing?: boolean;
}

interface AISettings {
  provider: 'openai' | 'cloudflare';
  model: string;
  maxTokens: number;
  temperature: number;
  smsMode: boolean;
  responseLength: number;
}

interface ConfigurationSettings {
  apiEndpoint: string;
  openAIKey?: string;
  cloudflareAccountId?: string;
  enableAnalytics: boolean;
  enableDebugMode: boolean;
}

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personas' | 'ai' | 'config'>('personas');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [aiSettings, setAISettings] = useState<AISettings>({
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 60,
    temperature: 0.8,
    smsMode: true,
    responseLength: 160
  });
  const [config, setConfig] = useState<ConfigurationSettings>({
    apiEndpoint: import.meta.env.DEV 
      ? 'http://localhost:8787/api'
      : 'https://knowledge-base-api.benjiemalinao879557.workers.dev/api',
    enableAnalytics: true,
    enableDebugMode: false
  });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);
  const [newPersona, setNewPersona] = useState<Partial<Persona>>({});
  const [showNewPersonaForm, setShowNewPersonaForm] = useState(false);

  // Load personas from API
  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiEndpoint}/personas`);
      const data = await response.json();
      setPersonas(data.personas.map((p: any) => ({ ...p, isEditing: false })));
    } catch (error) {
      console.error('Failed to fetch personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersona = async (persona: Persona) => {
    setSaveStatus('saving');
    try {
      // API call to update persona
      const response = await fetch(`${config.apiEndpoint}/personas/${persona.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
      });
      
      const result = await response.json();
      
      setPersonas(prev => prev.map(p => 
        p.id === persona.id ? { ...persona, isEditing: false } : p
      ));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save persona:', error);
      setSaveStatus('error');
    }
  };

  const handleAddPersona = async () => {
    if (!newPersona.name || !newPersona.role) return;
    
    setSaveStatus('saving');
    try {
      const personaToAdd = {
        ...newPersona,
        id: `custom-${Date.now()}`,
        experience: newPersona.experience || '',
        primaryGoal: newPersona.primaryGoal || '',
        communicationStyle: newPersona.communicationStyle || ''
      };

      // API call to add persona
      await fetch(`${config.apiEndpoint}/personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personaToAdd)
      });

      setPersonas(prev => [...prev, personaToAdd as Persona]);
      setNewPersona({});
      setShowNewPersonaForm(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to add persona:', error);
      setSaveStatus('error');
    }
  };

  const handleDeletePersona = async (id: string) => {
    if (!confirm('Are you sure you want to delete this persona?')) return;
    
    setSaveStatus('saving');
    try {
      await fetch(`${config.apiEndpoint}/personas/${id}`, {
        method: 'DELETE'
      });
      
      setPersonas(prev => prev.filter(p => p.id !== id));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to delete persona:', error);
      setSaveStatus('error');
    }
  };

  const handleSaveAISettings = async () => {
    setSaveStatus('saving');
    try {
      await fetch(`${config.apiEndpoint}/settings/ai`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiSettings)
      });
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save AI settings:', error);
      setSaveStatus('error');
    }
  };

  const handleSaveConfig = async () => {
    setSaveStatus('saving');
    try {
      await fetch(`${config.apiEndpoint}/settings/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      // If API endpoint changed, update it globally
      localStorage.setItem('apiEndpoint', config.apiEndpoint);
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      setSaveStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Configuration Settings</h1>
            </div>
            {saveStatus === 'saved' && (
              <div className="flex items-center text-green-600">
                <Check className="w-5 h-5 mr-2" />
                <span>Saved successfully</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>Save failed</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('personas')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'personas'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Personas
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'ai'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Brain className="w-4 h-4 inline mr-2" />
              AI Settings
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'config'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Key className="w-4 h-4 inline mr-2" />
              API Configuration
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Personas Tab */}
          {activeTab === 'personas' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Manage Personas</h2>
                <button
                  onClick={() => setShowNewPersonaForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Persona
                </button>
              </div>

              {/* New Persona Form */}
              {showNewPersonaForm && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">Create New Persona</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newPersona.name || ''}
                      onChange={(e) => setNewPersona(prev => ({ ...prev, name: e.target.value }))}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={newPersona.role || ''}
                      onChange={(e) => setNewPersona(prev => ({ ...prev, role: e.target.value }))}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Experience"
                      value={newPersona.experience || ''}
                      onChange={(e) => setNewPersona(prev => ({ ...prev, experience: e.target.value }))}
                      className="px-3 py-2 border rounded-lg col-span-2"
                    />
                    <textarea
                      placeholder="Primary Goal"
                      value={newPersona.primaryGoal || ''}
                      onChange={(e) => setNewPersona(prev => ({ ...prev, primaryGoal: e.target.value }))}
                      className="px-3 py-2 border rounded-lg col-span-2"
                      rows={2}
                    />
                    <textarea
                      placeholder="Communication Style"
                      value={newPersona.communicationStyle || ''}
                      onChange={(e) => setNewPersona(prev => ({ ...prev, communicationStyle: e.target.value }))}
                      className="px-3 py-2 border rounded-lg col-span-2"
                      rows={2}
                    />
                    <textarea
                      placeholder="Responsibilities (one per line)"
                      value={Array.isArray(newPersona.responsibilities) ? newPersona.responsibilities.join('\n') : newPersona.responsibilities || ''}
                      onChange={(e) => setNewPersona(prev => ({ ...prev, responsibilities: e.target.value.split('\n').filter(r => r.trim()) }))}
                      className="px-3 py-2 border rounded-lg col-span-2"
                      rows={3}
                    />
                    <textarea
                      placeholder="Constraints (one per line)"
                      value={Array.isArray(newPersona.constraints) ? newPersona.constraints.join('\n') : newPersona.constraints || ''}
                      onChange={(e) => setNewPersona(prev => ({ ...prev, constraints: e.target.value.split('\n').filter(c => c.trim()) }))}
                      className="px-3 py-2 border rounded-lg col-span-2"
                      rows={3}
                    />
                    <textarea
                      placeholder="Expertise Areas (one per line)"
                      value={Array.isArray(newPersona.expertiseAreas) ? newPersona.expertiseAreas.join('\n') : newPersona.expertiseAreas || ''}
                      onChange={(e) => setNewPersona(prev => ({ ...prev, expertiseAreas: e.target.value.split('\n').filter(e => e.trim()) }))}
                      className="px-3 py-2 border rounded-lg col-span-2"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end mt-4 space-x-2">
                    <button
                      onClick={() => {
                        setShowNewPersonaForm(false);
                        setNewPersona({});
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddPersona}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Persona
                    </button>
                  </div>
                </div>
              )}

              {/* Personas List */}
              {loading ? (
                <div className="text-center py-8">Loading personas...</div>
              ) : (
                <div className="space-y-3">
                  {personas.map((persona) => (
                    <div key={persona.id} className="border rounded-lg">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {persona.isEditing ? (
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={persona.name}
                                  onChange={(e) => setPersonas(prev => prev.map(p => 
                                    p.id === persona.id ? { ...p, name: e.target.value } : p
                                  ))}
                                  className="px-3 py-1 border rounded w-full"
                                />
                                <input
                                  type="text"
                                  value={persona.role}
                                  onChange={(e) => setPersonas(prev => prev.map(p => 
                                    p.id === persona.id ? { ...p, role: e.target.value } : p
                                  ))}
                                  className="px-3 py-1 border rounded w-full"
                                />
                                <input
                                  type="text"
                                  placeholder="Experience"
                                  value={persona.experience || ''}
                                  onChange={(e) => setPersonas(prev => prev.map(p => 
                                    p.id === persona.id ? { ...p, experience: e.target.value } : p
                                  ))}
                                  className="px-3 py-1 border rounded w-full"
                                />
                                <textarea
                                  placeholder="Primary Goal"
                                  value={persona.primaryGoal || ''}
                                  onChange={(e) => setPersonas(prev => prev.map(p => 
                                    p.id === persona.id ? { ...p, primaryGoal: e.target.value } : p
                                  ))}
                                  className="px-3 py-1 border rounded w-full"
                                  rows={2}
                                />
                                <textarea
                                  placeholder="Communication Style"
                                  value={persona.communicationStyle || ''}
                                  onChange={(e) => setPersonas(prev => prev.map(p => 
                                    p.id === persona.id ? { ...p, communicationStyle: e.target.value } : p
                                  ))}
                                  className="px-3 py-1 border rounded w-full"
                                  rows={2}
                                />
                                <textarea
                                  placeholder="Responsibilities (one per line)"
                                  value={Array.isArray(persona.responsibilities) ? persona.responsibilities.join('\n') : persona.responsibilities || ''}
                                  onChange={(e) => setPersonas(prev => prev.map(p => 
                                    p.id === persona.id ? { ...p, responsibilities: e.target.value.split('\n').filter(r => r.trim()) } : p
                                  ))}
                                  className="px-3 py-1 border rounded w-full"
                                  rows={3}
                                />
                                <textarea
                                  placeholder="Constraints (one per line)"
                                  value={Array.isArray(persona.constraints) ? persona.constraints.join('\n') : persona.constraints || ''}
                                  onChange={(e) => setPersonas(prev => prev.map(p => 
                                    p.id === persona.id ? { ...p, constraints: e.target.value.split('\n').filter(c => c.trim()) } : p
                                  ))}
                                  className="px-3 py-1 border rounded w-full"
                                  rows={3}
                                />
                                <textarea
                                  placeholder="Expertise Areas (one per line)"
                                  value={Array.isArray(persona.expertiseAreas) ? persona.expertiseAreas.join('\n') : persona.expertiseAreas || ''}
                                  onChange={(e) => setPersonas(prev => prev.map(p => 
                                    p.id === persona.id ? { ...p, expertiseAreas: e.target.value.split('\n').filter(e => e.trim()) } : p
                                  ))}
                                  className="px-3 py-1 border rounded w-full"
                                  rows={3}
                                />
                              </div>
                            ) : (
                              <div
                                onClick={() => setExpandedPersona(expandedPersona === persona.id ? null : persona.id)}
                                className="cursor-pointer"
                              >
                                <div className="flex items-center">
                                  <h3 className="font-semibold text-lg">{persona.name}</h3>
                                  {expandedPersona === persona.id ? 
                                    <ChevronUp className="w-4 h-4 ml-2" /> : 
                                    <ChevronDown className="w-4 h-4 ml-2" />
                                  }
                                </div>
                                <p className="text-gray-600">{persona.role}</p>
                                {expandedPersona === persona.id && (
                                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                                    <p><strong>Experience:</strong> {persona.experience}</p>
                                    <p><strong>Goal:</strong> {persona.primaryGoal}</p>
                                    <p><strong>Style:</strong> {persona.communicationStyle}</p>
                                    {persona.responsibilities && persona.responsibilities.length > 0 && (
                                      <div>
                                        <strong>Responsibilities:</strong>
                                        <ul className="ml-4 mt-1 list-disc">
                                          {persona.responsibilities.map((resp, idx) => (
                                            <li key={idx}>{resp}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {persona.constraints && persona.constraints.length > 0 && (
                                      <div>
                                        <strong>Constraints:</strong>
                                        <ul className="ml-4 mt-1 list-disc">
                                          {persona.constraints.map((constraint, idx) => (
                                            <li key={idx}>{constraint}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {persona.expertiseAreas && persona.expertiseAreas.length > 0 && (
                                      <div>
                                        <strong>Expertise Areas:</strong>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                          {persona.expertiseAreas.map((area, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                              {area}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            {persona.isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSavePersona(persona)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded"
                                  title="Save changes"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setPersonas(prev => prev.map(p => 
                                    p.id === persona.id ? { ...p, isEditing: false } : p
                                  ))}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setPersonas(prev => prev.map(p => 
                                    p.id === persona.id ? { ...p, isEditing: true } : p
                                  ))}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Edit persona"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePersona(persona.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                                  title="Delete persona"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI Settings Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">AI Response Configuration</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Provider
                  </label>
                  <select
                    value={aiSettings.provider}
                    onChange={(e) => setAISettings(prev => ({ 
                      ...prev, 
                      provider: e.target.value as 'openai' | 'cloudflare' 
                    }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="openai">OpenAI (GPT-4o)</option>
                    <option value="cloudflare">Cloudflare Workers AI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={aiSettings.model}
                    onChange={(e) => setAISettings(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={aiSettings.maxTokens}
                    onChange={(e) => setAISettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature (0-1)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={aiSettings.temperature}
                    onChange={(e) => setAISettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Mode
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={aiSettings.smsMode}
                      onChange={(e) => setAISettings(prev => ({ ...prev, smsMode: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">
                      Limit responses to SMS length (160 chars)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Length (chars)
                  </label>
                  <input
                    type="number"
                    value={aiSettings.responseLength}
                    onChange={(e) => setAISettings(prev => ({ ...prev, responseLength: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={!aiSettings.smsMode}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveAISettings}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  disabled={saveStatus === 'saving'}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save AI Settings
                </button>
              </div>
            </div>
          )}

          {/* Configuration Tab */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">API & System Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Endpoint
                  </label>
                  <input
                    type="text"
                    value={config.apiEndpoint}
                    onChange={(e) => setConfig(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {config.apiEndpoint}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={config.openAIKey || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, openAIKey: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your API key is encrypted and stored securely
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cloudflare Account ID
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={config.cloudflareAccountId || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, cloudflareAccountId: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.enableAnalytics}
                      onChange={(e) => setConfig(prev => ({ ...prev, enableAnalytics: e.target.checked }))}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">
                      Enable Analytics
                      <span className="text-xs text-gray-500 ml-2">
                        Track usage and performance metrics
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.enableDebugMode}
                      onChange={(e) => setConfig(prev => ({ ...prev, enableDebugMode: e.target.checked }))}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">
                      Enable Debug Mode
                      <span className="text-xs text-gray-500 ml-2">
                        Show detailed logs and responses
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveConfig}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  disabled={saveStatus === 'saving'}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};