import { useEffect, useRef } from 'react';

const Modal = ({ open, onClose, title, children, id }) => {
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;

    const node = modalRef.current;
    if (!node) return;
    // focus first focusable element inside
    const focusableSelector = 'a[href], area[href], input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = node.querySelectorAll(focusableSelector);
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        // trap focus inside the modal
        const focusables = Array.from(node.querySelectorAll(focusableSelector)).filter(el => el.offsetParent !== null);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      // restore focus
      if (previouslyFocused.current && previouslyFocused.current.focus) {
        previouslyFocused.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target.classList.contains('modal-overlay')) onClose(); }}
      aria-hidden={!open}
    >
      <div
        className="modal-card bg-card p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={id || 'modal-title'}
        ref={modalRef}
        style={{ color: 'var(--text)' }}
        onKeyDown={(e) => {
          // prevent space/enter from bubbling to global handlers while keeping Escape/Tab working
          if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
            e.stopPropagation();
          }
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 id={id || 'modal-title'} className="font-semibold">{title}</h3>
          <button onClick={onClose} className="px-2 py-1 rounded text-muted" aria-label="Close dialog">✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
