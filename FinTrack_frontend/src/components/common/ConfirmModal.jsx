import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loading = false,
  variant = 'danger',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} title={title}>
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>
        <p className="text-sm text-slate-600 pt-1 leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          variant={variant}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
