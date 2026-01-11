import React from 'react';

interface AddMenuModalProps {
  // Hacemos isOpen opcional. Si no se pasa, asumimos que el padre controla el renderizado
  isOpen?: boolean;
  onClose: () => void;
}

export default function AddMenuModal({ isOpen = true, onClose }: AddMenuModalProps) {
  // Si isOpen es explícitamente false, no renderizamos.
  // Si es undefined (no se pasa) o true, renderizamos.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-slate-200">
        <h2 className="text-xl font-bold mb-4 text-slate-900">Añadir Nuevo</h2>
        <p className="text-slate-500 mb-6 text-sm">
          Los formularios de creación están en mantenimiento (Fase 1: Estabilización).
        </p>
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-md hover:bg-slate-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}