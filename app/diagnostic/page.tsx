'use client';

import { useState, useEffect } from 'react';

interface TestResult {
  name: string;
  url: string;
  status?: number;
  ok?: boolean;
  error?: string;
  response?: any;
  cors?: string;
}

export default function DiagnosticPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [envInfo, setEnvInfo] = useState<any>({});

  useEffect(() => {
    setEnvInfo({
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      nodeEnv: process.env.NODE_ENV,
      location: typeof window !== 'undefined' ? window.location.href : 'SSR',
    });
  }, []);

  const runDiagnostics = async () => {
    setTesting(true);
    setResults([]);
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const tests: TestResult[] = [];

    // Test 1: Root endpoint
    try {
      console.log('Testing root endpoint:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      tests.push({
        name: 'Root Endpoint',
        url: apiUrl,
        status: response.status,
        ok: response.ok,
        response: await response.json().catch(() => response.text()).catch(() => 'No response body'),
        cors: response.headers.get('access-control-allow-origin') || 'Not set',
      });
    } catch (error) {
      tests.push({
        name: 'Root Endpoint',
        url: apiUrl,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 2: Health endpoint
    try {
      console.log('Testing health endpoint:', `${apiUrl}/health`);
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      tests.push({
        name: 'Health Check',
        url: `${apiUrl}/health`,
        status: response.status,
        ok: response.ok,
        response: await response.json().catch(() => response.text()).catch(() => 'No response body'),
        cors: response.headers.get('access-control-allow-origin') || 'Not set',
      });
    } catch (error) {
      tests.push({
        name: 'Health Check',
        url: `${apiUrl}/health`,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 3: Chat endpoint (non-streaming)
    try {
      console.log('Testing chat endpoint:', `${apiUrl}/api/chat`);
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: 'test',
          history: [],
        }),
      });
      tests.push({
        name: 'Chat API (POST)',
        url: `${apiUrl}/api/chat`,
        status: response.status,
        ok: response.ok,
        response: await response.json().catch(() => response.text()).catch(() => 'No response body'),
        cors: response.headers.get('access-control-allow-origin') || 'Not set',
      });
    } catch (error) {
      tests.push({
        name: 'Chat API (POST)',
        url: `${apiUrl}/api/chat`,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Test 4: Streaming endpoint
    try {
      console.log('Testing stream endpoint:', `${apiUrl}/api/chat/stream`);
      const response = await fetch(`${apiUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          message: 'test',
          history: [],
        }),
      });
      tests.push({
        name: 'Stream API (POST)',
        url: `${apiUrl}/api/chat/stream`,
        status: response.status,
        ok: response.ok,
        response: 'Streaming endpoint - check if status is 200',
        cors: response.headers.get('access-control-allow-origin') || 'Not set',
      });
    } catch (error) {
      tests.push({
        name: 'Stream API (POST)',
        url: `${apiUrl}/api/chat/stream`,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    setResults(tests);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            🔧 API Diagnostics
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Test connectivity between frontend and backend
          </p>
        </div>

        {/* Environment Info */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            📊 Environment Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                API URL
              </p>
              <code className="text-sm text-zinc-900 dark:text-zinc-50 break-all">
                {envInfo.apiUrl}
              </code>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg">
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                Environment
              </p>
              <code className="text-sm text-zinc-900 dark:text-zinc-50">
                {envInfo.nodeEnv || 'Unknown'}
              </code>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg col-span-2">
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                Current Location
              </p>
              <code className="text-sm text-zinc-900 dark:text-zinc-50 break-all">
                {envInfo.location}
              </code>
            </div>
          </div>
        </div>

        {/* Run Tests Button */}
        <div className="mb-8">
          <button
            onClick={runDiagnostics}
            disabled={testing}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
          >
            {testing ? '🔄 Running Tests...' : '▶️ Run Diagnostics'}
          </button>
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              📋 Test Results
            </h2>
            {results.map((result, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 border-2 ${
                  result.error
                    ? 'border-red-500'
                    : result.ok
                    ? 'border-green-500'
                    : 'border-yellow-500'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      {result.error ? '❌' : result.ok ? '✅' : '⚠️'} {result.name}
                    </h3>
                    <code className="text-sm text-zinc-600 dark:text-zinc-400 break-all">
                      {result.url}
                    </code>
                  </div>
                  {result.status && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        result.ok
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {result.status}
                    </span>
                  )}
                </div>

                {result.error ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
                      Error Details:
                    </p>
                    <code className="text-sm text-red-800 dark:text-red-300 break-all">
                      {result.error}
                    </code>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {result.cors && (
                      <div>
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          CORS Header:
                        </p>
                        <code className="text-sm bg-zinc-100 dark:bg-zinc-900 p-2 rounded block">
                          {result.cors}
                        </code>
                      </div>
                    )}
                    {result.response && (
                      <div>
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Response:
                        </p>
                        <pre className="text-xs bg-zinc-100 dark:bg-zinc-900 p-3 rounded overflow-auto max-h-64">
                          {typeof result.response === 'string'
                            ? result.response
                            : JSON.stringify(result.response, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        {results.length === 0 && !testing && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
              💡 How to use this tool
            </h3>
            <ul className="list-disc list-inside space-y-2 text-blue-800 dark:text-blue-200">
              <li>Click "Run Diagnostics" to test all API endpoints</li>
              <li>Check if the API URL is correct in the environment info</li>
              <li>Look for CORS errors (common issue with Vercel deployments)</li>
              <li>Verify all tests show green checkmarks ✅</li>
              <li>If errors occur, check the error details for troubleshooting</li>
            </ul>
          </div>
        )}

        {/* Back to App */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Medical Assistant
          </a>
        </div>
      </div>
    </div>
  );
}
