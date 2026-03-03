// src/components/common/Toast.jsx
import { useEffect } from 'react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  useEffect(() => {
    // auto close after duration
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // cleanup timer if component unmounts
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: '✓',
    error: '✗',
    info: 'i'
  };

  return (
    <div className={`fixed top-4 right-4 ${bgColor[type]} border rounded-lg shadow-lg p-4 max-w-md z-50 animate-slideIn`}>
      <div className="flex items-center">
        <span className="mr-3 text-xl font-bold">{icons[type]}</span>
        <p className="flex-1">{message}</p>
        <button 
          onClick={onClose} 
          className="ml-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;