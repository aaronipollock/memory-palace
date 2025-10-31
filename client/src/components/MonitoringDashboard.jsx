import React, { useState, useEffect } from 'react';
import { analytics } from '../utils/analytics';
import { performanceMonitor } from '../utils/performance';

const MonitoringDashboard = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const getAnalyticsData = () => {
    return analytics.getAnalyticsData();
  };

  const getPerformanceData = () => {
    return performanceMonitor.getSummary();
  };

  const exportData = () => {
    const data = {
      analytics: getAnalyticsData(),
      performance: getPerformanceData(),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    analytics.clearAnalytics();
    performanceMonitor.cleanup();
    setRefreshKey(prev => prev + 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Monitoring Dashboard</h2>
          <div className="flex gap-2">
            <button
              onClick={exportData}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Export Data
            </button>
            <button
              onClick={clearData}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Clear Data
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 ${activeTab === 'analytics' ? 'border-b-2 border-blue-500' : ''}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 ${activeTab === 'performance' ? 'border-b-2 border-blue-500' : ''}`}
          >
            Performance
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {activeTab === 'analytics' && (
            <AnalyticsTab data={getAnalyticsData()} />
          )}
          {activeTab === 'performance' && (
            <PerformanceTab data={getPerformanceData()} />
          )}
        </div>
      </div>
    </div>
  );
};

const AnalyticsTab = ({ data }) => {
  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="font-bold">Total Events</h3>
          <p className="text-2xl">{data.totalEvents}</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-bold">User ID</h3>
          <p className="text-sm">{data.userId || 'Not set'}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded">
          <h3 className="font-bold">Session ID</h3>
          <p className="text-sm">{data.sessionId}</p>
        </div>
      </div>

      <h3 className="font-bold mb-2">Recent Events</h3>
      <div className="space-y-2">
        {data.events.slice(-10).reverse().map((event, index) => (
          <div key={index} className="border p-3 rounded text-sm">
            <div className="flex justify-between items-start">
              <div>
                <strong>{event.event}</strong>
                <p className="text-gray-600">{event.timestamp}</p>
              </div>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {event.properties?.page || event.properties?.action || 'N/A'}
              </span>
            </div>
            {Object.keys(event.properties).length > 0 && (
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(event.properties, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PerformanceTab = ({ data }) => {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-bold">Avg Image Load Time</h3>
          <p className="text-2xl">{data.avgImageLoadTime}ms</p>
        </div>
        <div className="bg-orange-100 p-4 rounded">
          <h3 className="font-bold">Avg API Response Time</h3>
          <p className="text-2xl">{data.avgApiResponseTime}ms</p>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <h3 className="font-bold">Total Images</h3>
          <p className="text-2xl">{data.totalImages}</p>
        </div>
        <div className="bg-pink-100 p-4 rounded">
          <h3 className="font-bold">Total API Calls</h3>
          <p className="text-2xl">{data.totalApiCalls}</p>
        </div>
      </div>

      <div className="bg-red-50 p-4 rounded mb-4">
        <h3 className="font-bold text-red-800">Total Errors</h3>
        <p className="text-2xl text-red-600">{data.totalErrors}</p>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
