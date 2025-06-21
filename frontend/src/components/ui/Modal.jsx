import React from 'react';

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
        {children}
      </div>
    </div>
  );
};

export default Modal; 