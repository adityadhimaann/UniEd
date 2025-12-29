import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import { isFirebaseConfigured } from "@/config/firebase";

export function FirebaseConfigCheck() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  const checks = [
    { name: "API Key", value: config.apiKey, required: true },
    { name: "Auth Domain", value: config.authDomain, required: true },
    { name: "Project ID", value: config.projectId, required: true },
    { name: "Storage Bucket", value: config.storageBucket, required: true },
    { name: "Messaging Sender ID", value: config.messagingSenderId, required: true },
    { name: "App ID", value: config.appId, required: true },
    { name: "Measurement ID", value: config.measurementId, required: false },
  ];

  const allRequired = checks.filter(c => c.required).every(c => c.value);
  const configured = isFirebaseConfigured();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 p-6">
      <Card className="bg-slate-800/50 border-slate-700/50 p-6 max-w-3xl w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Firebase Configuration Check</h1>
          <p className="text-slate-400 text-sm">
            Verify your Firebase setup before testing
          </p>
        </div>

        {/* Overall Status */}
        <div className={`p-4 rounded-lg border ${
          configured 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-3">
            {configured ? (
              <CheckCircle className="h-6 w-6 text-green-400" />
            ) : (
              <XCircle className="h-6 w-6 text-red-400" />
            )}
            <div>
              <p className={`font-medium ${configured ? 'text-green-400' : 'text-red-400'}`}>
                {configured ? 'Configuration Complete' : 'Configuration Incomplete'}
              </p>
              <p className="text-sm text-slate-400">
                {configured 
                  ? 'All required Firebase variables are set' 
                  : 'Some required Firebase variables are missing'}
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Details */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white mb-3">Environment Variables</h3>
          {checks.map((check) => (
            <div
              key={check.name}
              className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {check.value ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : check.required ? (
                  <XCircle className="h-4 w-4 text-red-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                )}
                <span className="text-sm text-slate-300">{check.name}</span>
                {!check.required && (
                  <span className="text-xs text-slate-500">(optional)</span>
                )}
              </div>
              <span className="text-xs text-slate-500 font-mono max-w-md truncate">
                {check.value ? `${check.value.substring(0, 20)}...` : 'Not set'}
              </span>
            </div>
          ))}
        </div>

        {/* Current Configuration */}
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-medium text-white mb-2">Current Project</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Project ID:</span>
              <span className="text-cyan-400 font-mono">{config.projectId || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Auth Domain:</span>
              <span className="text-cyan-400 font-mono text-xs">{config.authDomain || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Error Message if Configuration Not Found */}
        {configured && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-400">
                  Configuration Found but Getting "CONFIGURATION_NOT_FOUND" Error?
                </p>
                <p className="text-xs text-slate-300">
                  This usually means the Web app is not properly registered in Firebase Console.
                </p>
                <div className="space-y-1 text-xs text-slate-400">
                  <p>To fix this:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Go to Firebase Console → Project Settings</li>
                    <li>Scroll to "Your apps" section</li>
                    <li>If no Web app exists, click "Add app" → Web icon</li>
                    <li>Register app with nickname "UniEd Frontend"</li>
                    <li>Copy the NEW configuration</li>
                    <li>Update your .env.local file</li>
                    <li>Restart dev server</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Firebase Console
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard/ai-assessment/test'}
            variant="outline"
            className="border-slate-600 text-slate-300"
            disabled={!configured}
          >
            Run Tests
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-slate-500 space-y-1">
          <p>📚 See <code className="text-cyan-400">FIREBASE_SETUP.md</code> for detailed setup instructions</p>
          <p>🧪 See <code className="text-cyan-400">FIREBASE_TEST_GUIDE.md</code> for testing guide</p>
        </div>
      </Card>
    </div>
  );
}
