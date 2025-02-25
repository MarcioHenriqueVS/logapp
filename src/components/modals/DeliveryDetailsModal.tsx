"use client";

import { useState } from "react";
import { X, Truck, MapPin, User, Package, ArrowRight, Edit, CheckCircle2 } from "lucide-react";

interface DeliveryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinalize: () => void;
  onEdit: () => void;
  delivery: {
    id: string;
    deliveryPerson: {
      name: string;
      initials: string;
    };
    unit: {
      city: string;
      district: string;
    };
    vehicle: {
      model: string;
      plate: string;
    };
    departureTime: string;
    status: string;
    products: Array<{
      id: string;
      name: string;
      quantity: number;
    }>;
  };
}

export function DeliveryDetailsModal({
  isOpen,
  onClose,
  onFinalize,
  onEdit,
  delivery
}: DeliveryDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Detalhes da Carga #{delivery.id}</h2>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-800">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Informações Principais */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="text-slate-400 w-5 h-5" />
                <div>
                  <p className="text-sm text-slate-500">Entregador</p>
                  <p className="text-slate-700 font-medium">{delivery.deliveryPerson.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="text-slate-400 w-5 h-5" />
                <div>
                  <p className="text-sm text-slate-500">Unidade</p>
                  <p className="text-slate-700 font-medium">
                    {delivery.unit.city} - {delivery.unit.district}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="text-slate-400 w-5 h-5" />
                <div>
                  <p className="text-sm text-slate-500">Veículo</p>
                  <p className="text-slate-700 font-medium">
                    {delivery.vehicle.model} - {delivery.vehicle.plate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="text-slate-400 w-5 h-5" />
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                    {delivery.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Produtos */}
          <div>
            <h3 className="text-sm font-medium text-slate-800 mb-3">Produtos da Carga</h3>
            <div className="border border-slate-200 rounded-lg divide-y">
              {delivery.products.map(product => (
                <div key={product.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800">{product.name}</p>
                    <p className="text-sm text-slate-600">Quantidade: {product.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onEdit}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700"
            >
              <Edit size={20} />
              Editar Carga
            </button>
            <button
              onClick={onFinalize}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-700"
            >
              <CheckCircle2 size={20} />
              Finalizar Carga
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 