import { useEffect, type ReactNode } from 'react';
import '../styles/Dialog.css';

export interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  loading?: boolean;
}

export function Dialog({
  open,
  title,
  description,
  children,
  onClose,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false,
  loading = false,
}: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="dialog-overlay" onClick={onClose} aria-hidden="true" />
      <div className="dialog" role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description">
        <div className="dialog-content">
          <h2 id="dialog-title" className="dialog-title">
            {title}
          </h2>
          {description && (
            <p id="dialog-description" className="dialog-description">
              {description}
            </p>
          )}
          {children && <div className="dialog-body">{children}</div>}
        </div>

        <div className="dialog-actions">
          <button
            className="dialog-btn dialog-btn-cancel"
            onClick={() => {
              onCancel?.();
              onClose();
            }}
            disabled={loading}
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              className={`dialog-btn dialog-btn-confirm ${isDangerous ? 'dialog-btn-danger' : ''}`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              disabled={loading}
            >
              {loading ? '⏳ Processando...' : confirmText}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
