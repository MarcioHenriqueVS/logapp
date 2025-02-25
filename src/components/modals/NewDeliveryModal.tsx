"use client";

import { useState } from "react";
import { X, Plus, Minus, Package } from "lucide-react";
import { CartItem, DeliveryPerson, Unit, Vehicle } from "@/types/dashboard";
import { ProductSelectionModal } from "./ProductSelectionModal";

interface NewDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableProducts: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  deliveryPeople: DeliveryPerson[];
  vehicles: Vehicle[];
  units: Unit[];
}

export function NewDeliveryModal({
  isOpen,
  onClose,
  availableProducts,
  deliveryPeople,
  vehicles,
  units
}: NewDeliveryModalProps) {
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProductSelectionOpen, setIsProductSelectionOpen] = useState(false);

  if (!isOpen) return null;

  const addToCart = (product: { id: string; name: string; quantity: number }) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity < product.quantity) {
        setCart(cart.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        availableQuantity: product.quantity
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    const existing = cart.find(item => item.productId === productId);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.productId !== productId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de submissão
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Nova Carga</h2>
            <button onClick={onClose} className="text-slate-600 hover:text-slate-800">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Seleção de Unidade */}
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">
                  Unidade
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white"
                  required
                >
                  <option value="" className="text-slate-500">Selecione uma unidade</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id} className="text-slate-700">
                      {unit.city} - {unit.district}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção de Entregador */}
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">
                  Entregador
                </label>
                <select
                  value={selectedDeliveryPerson}
                  onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white"
                  required
                >
                  <option value="" className="text-slate-500">Selecione um entregador</option>
                  {deliveryPeople.map(person => (
                    <option key={person.id} value={person.id} className="text-slate-700">
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção de Veículo */}
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">
                  Veículo
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white"
                  required
                >
                  <option value="" className="text-slate-500">Selecione um veículo</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id} className="text-slate-700">
                      {vehicle.model} - {vehicle.plate}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seção de Produtos */}
              <div className="space-y-6">
                {/* Botão Adicionar Produtos */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-slate-800">
                      Produtos da Carga
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsProductSelectionOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium"
                    >
                      <Plus size={20} />
                      Adicionar Produtos
                    </button>
                  </div>

                  {/* Lista de Produtos Selecionados */}
                  {cart.length > 0 ? (
                    <div className="border border-slate-200 rounded-lg divide-y">
                      {cart.map(item => (
                        <div key={item.productId} className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-slate-800">{item.name}</p>
                            <p className="text-sm text-slate-600">
                              Quantidade: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                      <Package className="mx-auto h-12 w-12 text-slate-400" />
                      <p className="mt-2 text-sm text-slate-600">
                        Nenhum produto adicionado
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                >
                  Criar Carga
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <ProductSelectionModal
        isOpen={isProductSelectionOpen}
        onClose={() => setIsProductSelectionOpen(false)}
        onConfirm={(selectedProducts) => {
          setCart(selectedProducts);
          setIsProductSelectionOpen(false);
        }}
        availableProducts={availableProducts}
        currentCart={cart}
      />
    </>
  );
} 