import React from 'react';
import ReactDOM from 'react-dom';

const ConfirmationModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Delete', 
  cancelText = 'Cancel',
  type = 'danger' 
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content confirmation-modal" data-testid="confirmation-modal">
        <div className="modal-header">
          <div className={`modal-icon ${type}`}>
            {type === 'danger' ? '⚠️' : '🔔'}
          </div>
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button 
            className="btn btn-outline" 
            onClick={onCancel}
            data-testid="modal-cancel-button"
          >
            {cancelText}
          </button>
          <button 
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`} 
            onClick={onConfirm}
            data-testid="modal-confirm-button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
