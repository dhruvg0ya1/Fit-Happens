import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGridIcon, DumbbellIcon, BrainCircuitIcon, HeadphonesIcon, CircleUserRoundIcon, MenuIcon } from './Icons';

const FitHappensLogo: React.FC = () => (
  <div className="flex items-center gap-2">
     <DumbbellIcon className="w-8 h-8 text-accent-1" />
    <span className="text-xl font-bold text-light-1">Fit Happens</span>
  </div>
);

const NavItem: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }> = ({ to, icon, children, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg text-lg transition-all duration-200 ${
                isActive ? 'bg-accent-1 text-white font-semibold' : 'text-medium-1 hover:bg-secondary-bg hover:text-light-1'
            }`}
        >
            {icon}
            {children}
        </NavLink>
    );
};

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => (
  <header className="bg-primary-bg/70 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-secondary-bg">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <FitHappensLogo />
        <button onClick={onMenuClick} className="p-2 z-50 md:hidden">
            <MenuIcon className="w-6 h-6 text-light-1"/>
        </button>
        <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/dashboard" className={({isActive}) => `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'text-accent-1' : 'text-medium-1 hover:text-light-1'}`}>Dashboard</NavLink>
            <NavLink to="/fitness" className={({isActive}) => `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'text-accent-1' : 'text-medium-1 hover:text-light-1'}`}>Fitness</NavLink>
            <NavLink to="/braingym" className={({isActive}) => `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'text-accent-1' : 'text-medium-1 hover:text-light-1'}`}>Brain Gym</NavLink>
            <NavLink to="/meditation" className={({isActive}) => `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'text-accent-1' : 'text-medium-1 hover:text-light-1'}`}>Meditation</NavLink>
            <NavLink to="/profile" className={({isActive}) => `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'text-accent-1' : 'text-medium-1 hover:text-light-1'}`}>Profile</NavLink>
        </nav>
      </div>
    </div>
  </header>
);

const NavDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
    <>
        <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
        <div className={`fixed top-0 right-0 h-full w-72 bg-primary-bg shadow-2xl z-50 transform transition-transform md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-5 pt-8 space-y-3">
                <NavItem to="/dashboard" icon={<LayoutGridIcon className="w-6 h-6" />} onClick={onClose}>Dashboard</NavItem>
                <NavItem to="/fitness" icon={<DumbbellIcon className="w-6 h-6" />} onClick={onClose}>Fitness</NavItem>
                <NavItem to="/braingym" icon={<BrainCircuitIcon className="w-6 h-6" />} onClick={onClose}>Brain Gym</NavItem>
                <NavItem to="/meditation" icon={<HeadphonesIcon className="w-6 h-6" />} onClick={onClose}>Meditation</NavItem>
                <NavItem to="/profile" icon={<CircleUserRoundIcon className="w-6 h-6" />} onClick={onClose}>Profile</NavItem>
            </div>
        </div>
    </>
);

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-primary-bg text-light-1">
      <Header onMenuClick={() => setDrawerOpen(true)} />
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 fade-in">
        {children}
      </main>
    </div>
  );
};

export default Layout;