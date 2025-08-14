import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Key, 
  Activity, 
  AlertTriangle,
  CheckCircle, 
  Copy,
  Play,
  Send,
  Code,
  Eye,
  EyeOff,
  ExternalLink
} from 'lucide-react';

interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  status: 'active' | 'deprecated' | 'beta';
  responseTime?: number;
  lastUsed?: string;
  requiresAuth: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'expired';
}

export const ApiManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'keys' | 'playground'>('endpoints');
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKeyValues, setShowKeyValues] = useState<{ [key: string]: boolean }>({});

  // Mock API endpoints data
  useEffect(() => {
    const mockEndpoints: ApiEndpoint[] = [
      {
        id: '1',
        name: 'Get Personas',
        method: 'GET',
        path: '/api/personas',
        description: 'Retrieve all available personas',
        status: 'active',
        responseTime: 120,
        lastUsed: '2 minutes ago',
        requiresAuth: true
      },
      {
        id: '2',
        name: 'Create Persona',
        method: 'POST',
        path: '/api/personas',
        description: 'Create a new persona configuration',
        status: 'active',
        responseTime: 340,
        lastUsed: '1 hour ago',
        requiresAuth: true
      },
      {
        id: '3',
        name: 'Update Persona',
        method: 'PUT',
        path: '/api/personas/{id}',
        description: 'Update existing persona settings',
        status: 'active',
        responseTime: 200,
        lastUsed: '30 minutes ago',
        requiresAuth: true
      },
      {
        id: '4',
        name: 'Delete Persona',
        method: 'DELETE',
        path: '/api/personas/{id}',
        description: 'Remove a persona from the system',
        status: 'active',
        responseTime: 89,
        lastUsed: '3 hours ago',
        requiresAuth: true
      },
      {
        id: '5',
        name: 'Chat Completion',
        method: 'POST',
        path: '/api/chat/completions',
        description: 'Generate AI responses using selected persona',
        status: 'active',
        responseTime: 2500,
        lastUsed: '5 minutes ago',
        requiresAuth: true
      },
      {
        id: '6',
        name: 'Get AI Settings',
        method: 'GET',
        path: '/api/settings/ai',
        description: 'Retrieve current AI configuration settings',
        status: 'active',
        responseTime: 95,
        lastUsed: '1 day ago',
        requiresAuth: true
      },
      {
        id: '7',
        name: 'Update AI Settings',
        method: 'PUT',
        path: '/api/settings/ai',
        description: 'Update AI model and response parameters',
        status: 'active',
        responseTime: 150,
        lastUsed: '2 days ago',
        requiresAuth: true
      },
      {
        id: '8',
        name: 'Health Check',
        method: 'GET',
        path: '/api/health',
        description: 'Check API service health and status',
        status: 'active',
        responseTime: 45,
        lastUsed: '1 minute ago',
        requiresAuth: false
      },
      {
        id: '9',
        name: 'Get Analytics',
        method: 'GET',
        path: '/api/analytics/usage',
        description: 'Retrieve usage statistics and analytics data',
        status: 'beta',
        responseTime: 780,
        lastUsed: '1 week ago',
        requiresAuth: true
      }
    ];

    const mockApiKeys: ApiKey[] = [
      {
        id: '1',
        name: 'Production Key',
        key: 'kb_live_1234567890abcdef',
        created: '2024-01-15',
        lastUsed: '2 minutes ago',
        permissions: ['read', 'write', 'admin'],
        status: 'active'
      },
      {
        id: '2',
        name: 'Development Key',
        key: 'kb_test_abcdef1234567890',
        created: '2024-01-20',
        lastUsed: '1 day ago',
        permissions: ['read', 'write'],
        status: 'active'
      },
      {
        id: '3',
        name: 'Mobile App Key',
        key: 'kb_mobile_fedcba0987654321',
        created: '2024-02-01',
        lastUsed: '3 days ago',
        permissions: ['read'],
        status: 'active'
      },
      {
        id: '4',
        name: 'Legacy Key',
        key: 'kb_legacy_0000111122223333',
        created: '2023-12-01',
        lastUsed: '2 months ago',
        permissions: ['read'],
        status: 'inactive'
      }
    ];

    setTimeout(() => {
      setEndpoints(mockEndpoints);
      setApiKeys(mockApiKeys);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      case 'beta': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValues(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskApiKey = (key: string) => {
    return key.slice(0, 8) + '*'.repeat(12) + key.slice(-4);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Management</h2>
          <p className="text-gray-600">Monitor endpoints, manage API keys, and test API calls</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-sm text-gray-500">
            <Activity className="w-4 h-4 mr-1" />
            <span>9 endpoints</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Key className="w-4 h-4 mr-1" />
            <span>{apiKeys.filter(k => k.status === 'active').length} active keys</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'endpoints'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            API Endpoints
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'keys'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Key className="w-4 h-4 inline mr-2" />
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'playground'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Play className="w-4 h-4 inline mr-2" />
            API Playground
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border">
        {/* Endpoints Tab */}
        {activeTab === 'endpoints' && (
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">Loading endpoints...</div>
            ) : (
              <div className="space-y-4">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(endpoint.status)}`}>
                            {endpoint.status}
                          </span>
                          {endpoint.requiresAuth && (
                            <Key className="w-4 h-4 text-orange-500" title="Requires authentication" />
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{endpoint.name}</h3>
                        <p className="text-gray-600 text-sm">{endpoint.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {endpoint.responseTime && (
                            <span>Avg response: {endpoint.responseTime}ms</span>
                          )}
                          {endpoint.lastUsed && (
                            <span>Last used: {endpoint.lastUsed}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(endpoint.path)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          title="Copy endpoint URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Test in playground"
                          onClick={() => setActiveTab('playground')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'keys' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">API Keys</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <Key className="w-4 h-4 mr-2" />
                Generate New Key
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading API keys...</div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{apiKey.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(apiKey.status)}`}>
                            {apiKey.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                              {showKeyValues[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                            </code>
                            <button
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title={showKeyValues[apiKey.id] ? "Hide key" : "Show key"}
                            >
                              {showKeyValues[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(apiKey.key)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Copy key"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Created: {apiKey.created}</span>
                            <span>Last used: {apiKey.lastUsed}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Permissions:</span>
                            {apiKey.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                          Edit
                        </button>
                        <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded">
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* API Playground Tab */}
        {activeTab === 'playground' && (
          <ApiPlayground endpoints={endpoints} />
        )}
      </div>
    </div>
  );
};

// API Playground Component
const ApiPlayground: React.FC<{ endpoints: ApiEndpoint[] }> = ({ endpoints }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [requestBody, setRequestBody] = useState('{}');
  const [headers, setHeaders] = useState('{"Content-Type": "application/json"}');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const handleSendRequest = async () => {
    const endpoint = endpoints.find(e => e.id === selectedEndpoint);
    if (!endpoint) return;

    setLoading(true);
    setResponse('');
    
    const startTime = Date.now();
    
    // Simulate API call
    setTimeout(() => {
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      // Mock response based on endpoint
      let mockResponse = {};
      switch (endpoint.path) {
        case '/api/personas':
          mockResponse = {
            status: 'success',
            data: {
              personas: [
                {
                  id: 'home-improvement-expert',
                  name: 'Home Improvement Expert',
                  role: 'Construction and Renovation Specialist'
                }
              ]
            }
          };
          break;
        case '/api/health':
          mockResponse = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: '24h 30m',
            version: '1.0.0'
          };
          break;
        default:
          mockResponse = {
            status: 'success',
            message: 'API call completed successfully',
            timestamp: new Date().toISOString()
          };
      }
      
      setResponse(JSON.stringify(mockResponse, null, 2));
      setLoading(false);
    }, Math.random() * 1500 + 500);
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-6">API Playground</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Endpoint
            </label>
            <select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Choose an endpoint...</option>
              {endpoints.map((endpoint) => (
                <option key={endpoint.id} value={endpoint.id}>
                  {endpoint.method} {endpoint.path} - {endpoint.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Headers
            </label>
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
              rows={3}
              placeholder='{"Content-Type": "application/json"}'
            />
          </div>

          {selectedEndpoint && endpoints.find(e => e.id === selectedEndpoint)?.method !== 'GET' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Body
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                rows={6}
                placeholder='{}'
              />
            </div>
          )}

          <button
            onClick={handleSendRequest}
            disabled={!selectedEndpoint || loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <Activity className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>

        {/* Response Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Response
            </label>
            {responseTime && (
              <span className="text-sm text-gray-500">
                Response time: {responseTime}ms
              </span>
            )}
          </div>
          
          <div className="border rounded-lg">
            <div className="px-3 py-2 bg-gray-50 border-b flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">JSON Response</span>
              </div>
              {response && (
                <button
                  onClick={() => navigator.clipboard.writeText(response)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Copy response"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
            <textarea
              value={response}
              readOnly
              className="w-full px-3 py-2 font-mono text-sm bg-white border-none resize-none focus:outline-none"
              rows={12}
              placeholder="Response will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};