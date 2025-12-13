import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      <div className={`toast ${type === 'error' ? 'toast-error' : 'toast-success'}`}>
        {message}
      </div>
    </div>
  );
};

export default Toast;
