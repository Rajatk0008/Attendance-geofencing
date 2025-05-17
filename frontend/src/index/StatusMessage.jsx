import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const StatusMessage = ({ 
  message, 
  type = 'info', 
  duration = 0,
  onDismiss = null
}) => {
  const [visible, setVisible] = useState(!!message);
  
  useEffect(() => {
    setVisible(!!message);
    
    if (message && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, duration, onDismiss]);
  
  if (!message || !visible) return null;
  
  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
    info: null  // Info icon removed
  };

  const bgColorMap = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    warning: 'bg-amber-50',
    info: 'bg-blue-50'
  };
  
  const borderColorMap = {
    success: 'border-green-200',
    error: 'border-red-200',
    warning: 'border-amber-200',
    info: 'border-blue-200'
  };
  
  const icon = iconMap[type] || null;
  const bgColor = bgColorMap[type] || bgColorMap.info;
  const borderColor = borderColorMap[type] || borderColorMap.info;

  return (
    <div className={`flex items-center p-3 rounded-lg border ${borderColor} ${bgColor} mb-4 animate-fadeIn`}>
      {icon && (
        <div className="flex-shrink-0 mr-3">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium flex-grow">{message}</p>
      {onDismiss && (
        <button 
          onClick={() => {
            setVisible(false);
            onDismiss();
          }}
          className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-500"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default StatusMessage;
