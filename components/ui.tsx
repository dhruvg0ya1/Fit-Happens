import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'sm';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'default', ...props }) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-opacity-50 shadow-lg hover:shadow-xl hover:scale-105';
  
  const sizeClasses = {
    default: 'px-6 py-3',
    sm: 'px-3 py-1 text-sm',
  };

  const variantClasses = {
    primary: 'bg-accent-1 text-white hover:bg-opacity-90 focus:ring-accent-1',
    secondary: 'bg-secondary-bg text-light-1 hover:brightness-125 focus:ring-medium-1',
    ghost: 'bg-transparent text-accent-2 hover:bg-accent-2/10 shadow-none hover:shadow-none focus:ring-accent-2',
  };

  return (
    <button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-medium-1 mb-2">{label}</label>
      <input
        id={id}
        className="w-full bg-primary-bg border-2 border-secondary-bg text-light-1 rounded-lg p-3 transition-colors focus:ring-2 focus:ring-accent-2 focus:border-accent-2 outline-none"
        {...props}
      />
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-medium-1 mb-2">{label}</label>
      <select
        id={id}
        className="w-full bg-primary-bg border-2 border-secondary-bg text-light-1 rounded-lg p-3 transition-colors focus:ring-2 focus:ring-accent-2 focus:border-accent-2 outline-none"
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`bg-secondary-bg/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl shadow-black/20 border border-white/5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Spinner: React.FC = () => {
    return (
        <div className="flex justify-center items-center h-full w-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-1"></div>
        </div>
    );
};

interface CheckboxGroupProps<T> {
  label: string;
  options: readonly T[];
  selectedOptions: T[];
  onChange: (selected: T[]) => void;
  selectAll?: boolean;
}

export const CheckboxGroup = <T extends string>({ label, options, selectedOptions, onChange, selectAll = false }: CheckboxGroupProps<T>) => {
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onChange([...options]);
    } else {
      onChange([]);
    }
  };

  const handleOptionChange = (option: T) => {
    const newSelected = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option];
    onChange(newSelected);
  };
  
  return (
    <div>
      <label className="block text-lg font-bold text-light-1 mb-3">{label}</label>
      <div className="space-y-3">
        {selectAll && (
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="select-all"
                    checked={selectedOptions.length === options.length}
                    onChange={handleSelectAll}
                    className="h-5 w-5 rounded-md border-medium-1/50 bg-primary-bg text-accent-1 focus:ring-accent-1"
                />
                <label htmlFor="select-all" className="ml-3 text-medium-1 font-medium">
                    Select All
                </label>
            </div>
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {options.map((option) => (
            <div key={option} className="flex items-center">
              <input
                id={option}
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={() => handleOptionChange(option)}
                className="h-5 w-5 rounded-md border-medium-1/50 bg-primary-bg text-accent-1 focus:ring-accent-1"
              />
              <label htmlFor={option} className="ml-3 text-medium-1 text-sm">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 fade-in" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
      <div 
        className="bg-secondary-bg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/10" 
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-primary-bg">
          <h2 id="modal-title" className="text-xl font-bold text-light-1">{title}</h2>
          <button onClick={onClose} className="text-medium-1 hover:text-light-1">&times;</button>
        </header>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};