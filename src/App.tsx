import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/dashboard/Dashboard';

function App() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400">Initializing Nexus Synapse...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthForm />;
}

export default App;
