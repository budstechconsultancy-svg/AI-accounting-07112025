
import React from 'react';
import Icon from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  type: 'loading' | 'error' | 'success';
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, type, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <div className="flex items-start space-x-4">
          {type === 'loading' && (
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full">
               <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          {type === 'error' && (
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full">
              <Icon name="warning" className="h-6 w-6 text-red-600" />
            </div>
          )}
          {type === 'success' && (
            <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-full">
              <Icon name="check-circle" className="h-6 w-6 text-green-600" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="mt-2 text-sm text-gray-600">
              {children}
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <Icon name="close" className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Modal;