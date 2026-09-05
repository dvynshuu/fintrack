import React from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const DeleteConfirmModal = ({ onClose, onDelete, title, message, itemName }) => {
    return createPortal(
        <div className="modal-overlay">
            <div className="modal-container" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2>{title || 'Confirm Delete'}</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Close modal">
                        &times;
                    </button>
                </div>

                <div className="modal-body">
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
                    </p>
                    {itemName && (
                        <div style={{
                            padding: '1rem',
                            background: 'var(--bg-app)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            marginBottom: '1rem'
                        }}>
                            <strong style={{ color: 'var(--accent)' }}>{itemName}</strong>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        style={{ backgroundColor: 'var(--error)' }}
                        onClick={onDelete}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div >,
        document.body
    );
};

export default DeleteConfirmModal;
