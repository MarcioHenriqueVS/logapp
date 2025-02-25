"use client";

import { useState, useMemo } from "react";
import { X, Plus, Minus, Search, Package } from "lucide-react";
import { CartItem } from "@/types/dashboard";

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedProducts: CartItem[]) => void;
  availableProducts: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  currentCart: CartItem[];
}

export function ProductSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  availableProducts,
  currentCart
}: ProductSelectionModalProps) {
  const [cart, setCart] = useState<CartItem[]>(currentCart);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "available" | "low">("all");

  const filteredProducts = useMemo(() => {
    return availableProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      switch (selectedFilter) {
        case "available":
          return matchesSearch && product.quantity > 20;
        case "low":
          return matchesSearch && product.quantity <= 20;
        default:
          return matchesSearch;
      }
    });
  }, [availableProducts, searchTerm, selectedFilter]);

  const getCartQuantity = (productId: string) => {
    const item = cart.find(item => item.productId === productId);
    return item?.quantity || 0;
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Selecionar Produtos</h2>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-800">
            <X size={24} />
          </button>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="mb-6 space-y-4">
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === "all"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedFilter("available")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === "available"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Em Estoque
              </button>
              <button
                onClick={() => setSelectedFilter("low")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === "low"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Estoque Baixo
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-slate-800">Produtos Disponíveis</h3>
            <span className="text-sm text-slate-500">
              {filteredProducts.length} produtos encontrados
            </span>
          </div>
          
          {availableProducts.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
              <Package className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600">
                Não há produtos disponíveis para adicionar
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Todos os produtos já estão incluídos na carga
              </p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="border border-slate-200 rounded-lg divide-y">
              {filteredProducts.map(product => {
                const cartQuantity = getCartQuantity(product.id);
                return (
                  <div key={product.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800">{product.name}</p>
                      <p className="text-sm text-slate-600">
                        Disponível: {product.quantity}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                          product.quantity > 20
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {product.quantity > 20 ? "Em Estoque" : "Estoque Baixo"}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {cartQuantity > 0 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => removeFromCart(product.id)}
                            className="bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-slate-200"
                          >
                            <Minus size={20} />
                          </button>
                          <span className="w-10 text-center font-medium text-slate-700">
                            {cartQuantity}
                          </span>
                        </>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100"
                        disabled={cartQuantity >= product.quantity}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
              <p className="text-slate-500">Nenhum produto encontrado</p>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(cart);
              onClose();
            }}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
          >
            Confirmar Seleção
          </button>
        </div>
      </div>
    </div>
  );
} 