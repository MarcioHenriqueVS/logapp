"use client";

import { useState } from "react";
import { X, Plus, Package, Trash2, CheckCircle2 } from "lucide-react";
import { ProductSelectionModal } from "./ProductSelectionModal";
import { ProductMovement } from "@/types/dashboard";

interface FinalizeDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (movements: ProductMovement[]) => void;
  delivery: {
    id: string;
    products: Array<{
      id: string;
      name: string;
      quantity: number;
    }>;
  };
  units: Array<{
    id: string;
    city: string;
    district: string;
  }>;
  availableProducts: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
}

export function FinalizeDeliveryModal({
  isOpen,
  onClose,
  onConfirm,
  delivery,
  units,
  availableProducts
}: FinalizeDeliveryModalProps) {
  const [movements, setMovements] = useState<ProductMovement[]>(
    delivery.products.map(product => ({
      id: product.id,
      name: product.name,
      initialQuantity: product.quantity,
      sold: 0,
      returned: 0
    }))
  );
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleReturnedChange = (productId: string, returned: number) => {
    setMovements(movements.map(movement => {
      if (movement.id === productId) {
        const newMovement = { 
          ...movement, 
          returned,
          // Calcula automaticamente os vendidos como a diferença
          sold: movement.initialQuantity - returned
        };
        
        // Validação apenas para produtos originais
        if (!movement.isNew && returned > movement.initialQuantity) {
          return movement;
        }
        return newMovement;
      }
      return movement;
    }));
  };

  const handleAddProducts = (selectedProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    availableQuantity: number;
  }>) => {
    const newProducts = selectedProducts.map(product => ({
      id: product.productId,
      name: product.name,
      initialQuantity: product.quantity,
      sold: 0,
      returned: product.quantity, // Produtos novos começam como totalmente retornados
      isNew: true
    }));

    setMovements([...movements, ...newProducts]);
  };

  const handleRemoveProduct = (productId: string) => {
    setMovements(movements.filter(movement => movement.id !== productId));
  };

  const handleUnitChange = (productId: string, unitId: string) => {
    setMovements(movements.map(movement => 
      movement.id === productId 
        ? { ...movement, receivedFrom: unitId }
        : movement
    ));
  };

  // Filtra os produtos que já existem na carga original
  const availableProductsForAdd = availableProducts.filter(
    product => !delivery.products.some(deliveryProduct => deliveryProduct.id === product.id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Finalizar Carga #{delivery.id}</h2>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-800">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Lista de Produtos */}
          <div>
            <h3 className="text-sm font-medium text-slate-800 mb-3">Produtos da Carga</h3>
            <div className="space-y-4">
              {delivery.products.map(product => (
                <div key={product.id} className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-medium text-slate-800">{product.name}</p>
                    <p className="text-sm text-slate-600">
                      Quantidade inicial: {product.quantity}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Retornados
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={product.quantity}
                      value={movements.find(m => m.id === product.id)?.returned || 0}
                      onChange={(e) => handleReturnedChange(
                        product.id,
                        parseInt(e.target.value) || 0
                      )}
                      className="w-full border border-slate-200 rounded-lg p-2 text-slate-700"
                    />
                  </div>

                  <div className="flex gap-4 text-sm text-slate-600">
                    <p>Vendidos: {product.quantity - (movements.find(m => m.id === product.id)?.returned || 0)}</p>
                    <p>Retornados: {movements.find(m => m.id === product.id)?.returned || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botão de Confirmar */}
          <button
            onClick={() => onConfirm(movements)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={20} />
            Confirmar Finalização
          </button>
        </div>
      </div>
    </div>
  );
} 