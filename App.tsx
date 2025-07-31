
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import FitnessPage from './pages/FitnessPage';
import BrainGymPage from './pages/BrainGymPage';
import MeditationPage from './pages/MeditationPage';
import ProfilePage from './pages/ProfilePage';
import { useUser, UserProvider } from './services/user';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useUser();

    if (loading) {
        return <div className="h-screen w-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-1"></div></div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // If user exists but doesn't have a name, they haven't completed onboarding
    if (!user.name) {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useUser();
    
    if (loading) {
       return <div className="h-screen w-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-1"></div></div>;
    }
    
    if (!user) {
         return <Navigate to="/login" replace />;
    }
    
    if (user.name) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return <>{children}</>
}


const AppRoutes: React.FC = () => (
    <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingGuard><OnboardingPage /></OnboardingGuard>} />
        
        <Route path="/dashboard" element={<AuthGuard><Layout><DashboardPage /></Layout></AuthGuard>} />
        <Route path="/fitness" element={<AuthGuard><Layout><FitnessPage /></Layout></AuthGuard>} />
        <Route path="/braingym" element={<AuthGuard><Layout><BrainGymPage /></Layout></AuthGuard>} />
        <Route path="/meditation" element={<AuthGuard><Layout><MeditationPage /></Layout></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><Layout><ProfilePage /></Layout></AuthGuard>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
);

const App: React.FC = () => {
    return (
        <UserProvider>
            <HashRouter>
                <AppRoutes />
            </HashRouter>
        </UserProvider>
    );
};

export default App;