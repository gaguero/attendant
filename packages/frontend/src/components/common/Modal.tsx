import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);
  
  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-emphasis ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-background-overlay" onClick={onClose} aria-hidden="true"></div>
      
      <div
        className={`bg-background-surface rounded-card shadow-card w-full max-w-lg m-md p-lg transform transition-all duration-emphasis ease-standard ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-xl opacity-0'
        }`}
      >
        <div className="flex justify-between items-start mb-md">
          <h2 className="text-h2 font-semibold text-primary-midnight" id="modal-title">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="text-neutral-gray hover:text-dark-gray text-h2 leading-none font-bold"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );

  if (!isMounted) {
    return null;
  }

  return ReactDOM.createPortal(modalContent, document.getElementById('modal-root')!);
};

export default Modal; 