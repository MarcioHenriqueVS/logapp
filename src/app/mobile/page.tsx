"use client";

import { useState } from "react";
import { Package, Truck, ArrowRight, Plus, CheckCircle2, X, Edit, Minus, Search } from "lucide-react";
import { ProductMovement } from "@/types/dashboard";

interface Delivery {
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
}

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState<'active' | 'new'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFinalizingDelivery, setIsFinalizingDelivery] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [movements, setMovements] = useState<ProductMovement[]>([]);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [editedProducts, setEditedProducts] = useState<Array<{ id: string; name: string; quantity: number }>>([]);
  const [isAddingProducts, setIsAddingProducts] = useState(false);
  const [isCreatingDelivery, setIsCreatingDelivery] = useState(false);

  // Dados de exemplo
  const mockDeliveries: Delivery[] = [
    {
      id: "12345",
      deliveryPerson: {
        name: "João Silva",
        initials: "JS"
      },
      unit: {
        city: "Resende",
        district: "Campos Elíseos"
      },
      vehicle: {
        model: "Fiorino",
        plate: "ABC-1234"
      },
      departureTime: "08:30",
      status: "Em Rota",
      products: [
        {
          id: "1",
          name: "Botijão 13kg (Cheio)",
          quantity: 32
        }
      ]
    },
    {
      id: "12346",
      deliveryPerson: {
        name: "Maria Santos",
        initials: "MS"
      },
      unit: {
        city: "Porto Real",
        district: "Centro"
      },
      vehicle: {
        model: "HR",
        plate: "XYZ-5678"
      },
      departureTime: "09:15",
      status: "Em Rota",
      products: [
        {
          id: "1",
          name: "Botijão 13kg (Cheio)",
          quantity: 25
        },
        {
          id: "2",
          name: "Botijão 45kg (Cheio)",
          quantity: 8
        }
      ]
    }
  ];

  // Mock de unidades para exemplo
  const mockUnits = [
    { id: "1", city: "Resende", district: "Campos Elíseos" },
    { id: "2", city: "Porto Real", district: "Centro" },
  ];

  // Mock de produtos disponíveis
  const mockAvailableProducts = [
    { id: "1", name: "Botijão 13kg (Cheio)", quantity: 150 },
    { id: "2", name: "Botijão 45kg (Cheio)", quantity: 45 },
    { id: "3", name: "Botijão 8kg (Cheio)", quantity: 20 },
  ];

  const handleStartFinalize = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setMovements(
      delivery.products.map(product => ({
        id: product.id,
        name: product.name,
        initialQuantity: product.quantity,
        sold: 0,
        returned: 0
      }))
    );
    setIsFinalizingDelivery(true);
  };

  const handleReturnedChange = (productId: string, returned: number) => {
    setMovements(movements.map(movement => {
      if (movement.id === productId) {
        const newMovement = { 
          ...movement, 
          returned,
          sold: movement.initialQuantity - returned
        };
        
        if (returned > movement.initialQuantity) {
          return movement;
        }
        return newMovement;
      }
      return movement;
    }));
  };

  const handleFinalize = () => {
    // Implementar lógica de finalização
    console.log('Finalizando entrega:', movements);
    setIsFinalizingDelivery(false);
    setSelectedDelivery(null);
    setMovements([]);
  };

  const handleStartEdit = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setEditedProducts(delivery.products);
    setIsEditingDelivery(true);
  };

  const handleRemoveProduct = (productId: string) => {
    setEditedProducts(products => products.filter(p => p.id !== productId));
  };

  const handleEditQuantity = (productId: string, newQuantity: number) => {
    const product = mockAvailableProducts.find(p => p.id === productId);
    if (!product) return;

    // Limita a quantidade ao disponível no estoque
    const quantity = Math.min(newQuantity, product.quantity);

    setEditedProducts(products =>
      products.map(p =>
        p.id === productId
          ? { ...p, quantity }
          : p
      )
    );
  };

  const handleQuantityAdjust = (productId: string, increment: boolean) => {
    const product = mockAvailableProducts.find(p => p.id === productId);
    if (!product) return;

    setEditedProducts(products =>
      products.map(p => {
        if (p.id === productId) {
          if (increment) {
            // Não permite ultrapassar o estoque disponível
            const newQuantity = Math.min(p.quantity + 1, product.quantity);
            return { ...p, quantity: newQuantity };
          } else {
            // Não permite quantidade menor que 1
            const newQuantity = Math.max(p.quantity - 1, 1);
            return { ...p, quantity: newQuantity };
          }
        }
        return p;
      })
    );
  };

  // Modal de Finalização
  const FinalizeModal = () => {
    if (!selectedDelivery) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        
        {/* Container do Modal com a mesma largura do app */}
        <div className="w-full max-w-[420px] relative">
          <div className="bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">
                Finalizar Carga #{selectedDelivery.id}
              </h2>
              <button 
                onClick={() => setIsFinalizingDelivery(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-4 space-y-4">
              {movements.map(movement => (
                <div key={movement.id} className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-medium text-slate-800">{movement.name}</p>
                    <p className="text-sm text-slate-600">
                      Quantidade inicial: {movement.initialQuantity}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Retornados
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={movement.initialQuantity}
                      value={movement.returned}
                      onChange={(e) => handleReturnedChange(
                        movement.id,
                        parseInt(e.target.value) || 0
                      )}
                      className="w-full border border-slate-200 rounded-lg p-2 text-slate-700"
                    />
                  </div>

                  <div className="flex gap-4 text-sm text-slate-600">
                    <p>Vendidos: {movement.initialQuantity - movement.returned}</p>
                    <p>Retornados: {movement.returned}</p>
                  </div>
                </div>
              ))}

              {/* Botão de Confirmar */}
              <button
                onClick={handleFinalize}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 mt-6"
              >
                <CheckCircle2 size={20} />
                Confirmar Finalização
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal de Edição
  const EditModal = () => {
    if (!selectedDelivery) return null;

    const [transferQuantities, setTransferQuantities] = useState<Record<string, number>>({});
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleQuantityInputChange = (productId: string, value: string) => {
      const quantity = parseInt(value) || 0;
      const product = editedProducts.find(p => p.id === productId);
      
      // Garante que a quantidade não ultrapasse o disponível na carga
      if (product && quantity > product.quantity) {
        setTransferQuantities({
          ...transferQuantities,
          [productId]: product.quantity
        });
        return;
      }

      setTransferQuantities({
        ...transferQuantities,
        [productId]: quantity
      });
    };

    const handleSaveChanges = () => {
      // Implementar lógica de salvamento
      console.log('Transferências para estoque local:', transferQuantities);
      console.log('Produtos atualizados:', editedProducts);
      setIsEditingDelivery(false);
    };

    // Modal de Confirmação
    const ConfirmationModal = () => (
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowConfirmation(false)} />
        
        <div className="w-full max-w-[320px] bg-white rounded-lg relative p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Confirmar Alterações</h3>
          
          <div className="space-y-3">
            {/* Mostra transferências apenas de produtos originais */}
            {Object.entries(transferQuantities).map(([productId, quantity]) => {
              if (quantity <= 0) return null;
              const product = editedProducts.find(p => p.id === productId);
              if (!product || !selectedDelivery.products.some(p => p.id === productId)) return null;
              
              return (
                <div key={productId} className="text-sm text-slate-600">
                  <p>• Transferir {quantity} unidades de {product.name} para estoque local</p>
                </div>
              );
            })}
            
            {/* Mostra produtos novos adicionados */}
            {editedProducts.filter(p => !selectedDelivery.products.some(op => op.id === p.id)).map(product => (
              <div key={product.id} className="text-sm text-slate-600">
                <p>• Adicionar {product.quantity} unidades de {product.name} à carga</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveChanges}
              className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    );

    // Dialog de Seleção de Produtos
    const AddProductsDialog = () => {
      const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
      const [filterType, setFilterType] = useState<'all' | '13kg' | '45kg' | '8kg'>('all');

      // Filtra produtos que já estão na carga
      const availableProducts = mockAvailableProducts.filter(
        product => !editedProducts.some(ep => ep.id === product.id)
      );

      // Aplica filtros e busca
      const filteredProducts = availableProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || product.name.toLowerCase().includes(filterType);
        return matchesSearch && matchesFilter;
      });

      const handleAddProducts = () => {
        const newProducts = Object.entries(selectedProducts)
          .filter(([_, quantity]) => quantity > 0)
          .map(([productId, quantity]) => {
            const product = mockAvailableProducts.find(p => p.id === productId);
            return {
              id: productId,
              name: product!.name,
              quantity: quantity
            };
          });

        setEditedProducts([...editedProducts, ...newProducts]);
        setIsAddingProducts(false);
      };

      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsAddingProducts(false)} />
          
          {/* Container com largura máxima consistente */}
          <div className="w-full max-w-[420px] mx-4 relative">
            <div className="bg-white rounded-xl shadow-xl max-h-[80vh] flex flex-col">
              {/* Header com Busca */}
              <div className="p-4 border-b sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Adicionar Produtos
                  </h3>
                  <button 
                    onClick={() => setIsAddingProducts(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>

                {/* Campo de Busca */}
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar produtos..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                {/* Filtros */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      filterType === 'all' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterType('13kg')}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      filterType === '13kg' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Botijão 13kg
                  </button>
                  <button
                    onClick={() => setFilterType('45kg')}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      filterType === '45kg' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Botijão 45kg
                  </button>
                  <button
                    onClick={() => setFilterType('8kg')}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      filterType === '8kg' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Botijão 8kg
                  </button>
                </div>
              </div>

              {/* Lista de Produtos */}
              <div className="overflow-y-auto flex-1 p-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-slate-400" />
                    <p className="mt-2 text-sm text-slate-600">
                      Nenhum produto encontrado
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-800">{product.name}</p>
                          <p className="text-sm text-slate-600">
                            Disponível: {product.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                            <button
                              onClick={() => {
                                const current = selectedProducts[product.id] || 0;
                                if (current <= 0) return;
                                setSelectedProducts({
                                  ...selectedProducts,
                                  [product.id]: current - 1
                                });
                              }}
                              className="p-2 text-slate-600 hover:bg-slate-50"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-12 text-center font-medium text-slate-700">
                              {selectedProducts[product.id] || 0}
                            </span>
                            <button
                              onClick={() => {
                                const current = selectedProducts[product.id] || 0;
                                if (current >= product.quantity) return;
                                setSelectedProducts({
                                  ...selectedProducts,
                                  [product.id]: current + 1
                                });
                              }}
                              className="p-2 text-slate-600 hover:bg-slate-50"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer com Botão de Confirmar */}
              <div className="p-4 border-t bg-white">
                <button
                  onClick={handleAddProducts}
                  disabled={Object.values(selectedProducts).every(qty => !qty)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  Adicionar Selecionados
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        
        <div className="w-full max-w-[420px] relative">
          <div className="bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">
                Editar Carga #{selectedDelivery.id}
              </h2>
              <button 
                onClick={() => setIsEditingDelivery(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Lista de Produtos */}
              <div className="space-y-4">
                {editedProducts.map(product => {
                  const isOriginalProduct = selectedDelivery.products.some(p => p.id === product.id);
                  const maxQuantity = mockAvailableProducts.find(p => p.id === product.id)?.quantity || 0;

                  return (
                    <div key={product.id} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-800">{product.name}</p>
                            {!isOriginalProduct && (
                              <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
                                Novo
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">
                            Quantidade na carga: {product.quantity}
                          </p>
                          {!isOriginalProduct && (
                            <p className="text-xs text-slate-500 mt-1">
                              Máximo disponível: {maxQuantity} unidades
                            </p>
                          )}
                        </div>
                        
                        {/* Controles para produtos adicionados */}
                        {!isOriginalProduct && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-slate-200 rounded-lg">
                              <button
                                onClick={() => handleQuantityAdjust(product.id, false)}
                                disabled={product.quantity <= 1}
                                className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-12 text-center font-medium text-slate-700">
                                {product.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityAdjust(product.id, true)}
                                disabled={product.quantity >= maxQuantity}
                                className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveProduct(product.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remover produto"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Campo de transferência para produtos originais */}
                      {isOriginalProduct && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Transferir para Estoque Local
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={product.quantity}
                            value={transferQuantities[product.id] || ''}
                            onChange={(e) => handleQuantityInputChange(product.id, e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-2 text-slate-700"
                            placeholder={`Máximo: ${product.quantity}`}
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Quantidade disponível: {product.quantity} unidades
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Botão Adicionar Produtos */}
              <button
                onClick={() => setIsAddingProducts(true)}
                className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-50"
              >
                <Plus size={20} />
                Adicionar Produtos
              </button>

              {/* Botão Salvar */}
              <button
                onClick={() => setShowConfirmation(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium mt-6"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>

        {/* Adiciona o modal de seleção de produtos */}
        {isAddingProducts && <AddProductsDialog />}

        {/* Modais */}
        {showConfirmation && <ConfirmationModal />}
      </div>
    );
  };

  // Dialog de Criação de Carga
  const CreateDeliveryDialog = () => {
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
    const [filterType, setFilterType] = useState<'all' | '13kg' | '45kg' | '8kg'>('all');

    // Mock de veículos disponíveis
    const mockVehicles = [
      { id: "1", model: "Fiorino", plate: "ABC-1234" },
      { id: "2", model: "HR", plate: "DEF-5678" },
    ];

    // Aplica filtros e busca nos produtos
    const filteredProducts = mockAvailableProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || product.name.toLowerCase().includes(filterType);
      return matchesSearch && matchesFilter;
    });

    const handleCreateDelivery = () => {
      const products = Object.entries(selectedProducts)
        .filter(([_, quantity]) => quantity > 0)
        .map(([productId, quantity]) => {
          const product = mockAvailableProducts.find(p => p.id === productId);
          return {
            id: productId,
            name: product!.name,
            quantity: quantity
          };
        });

      // Aqui implementaria a lógica de criação da carga
      console.log('Nova carga:', {
        vehicle: selectedVehicle ? mockVehicles.find(v => v.id === selectedVehicle) : null,
        products
      });

      setIsCreatingDelivery(false);
      setActiveTab('active'); // Volta para a lista de cargas ativas
    };

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCreatingDelivery(false)} />
        
        <div className="w-full max-w-[420px] mx-4 relative">
          <div className="bg-white rounded-xl shadow-xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Criar Nova Carga
                </h3>
                <button 
                  onClick={() => setIsCreatingDelivery(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              {/* Seleção de Veículo */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Selecione o Veículo
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-700"
                >
                  <option value="">Selecione um veículo</option>
                  {mockVehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} - {vehicle.plate}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo de Busca */}
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Filtros */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    filterType === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterType('13kg')}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    filterType === '13kg' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Botijão 13kg
                </button>
                <button
                  onClick={() => setFilterType('45kg')}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    filterType === '45kg' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Botijão 45kg
                </button>
                <button
                  onClick={() => setFilterType('8kg')}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    filterType === '8kg' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Botijão 8kg
                </button>
              </div>
            </div>

            {/* Lista de Produtos */}
            <div className="overflow-y-auto flex-1 p-4">
              <div className="space-y-3">
                {filteredProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">{product.name}</p>
                      <p className="text-sm text-slate-600">
                        Disponível: {product.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                        <button
                          onClick={() => {
                            const current = selectedProducts[product.id] || 0;
                            if (current <= 0) return;
                            setSelectedProducts({
                              ...selectedProducts,
                              [product.id]: current - 1
                            });
                          }}
                          className="p-2 text-slate-600 hover:bg-slate-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-medium text-slate-700">
                          {selectedProducts[product.id] || 0}
                        </span>
                        <button
                          onClick={() => {
                            const current = selectedProducts[product.id] || 0;
                            if (current >= product.quantity) return;
                            setSelectedProducts({
                              ...selectedProducts,
                              [product.id]: current + 1
                            });
                          }}
                          className="p-2 text-slate-600 hover:bg-slate-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-white">
              <button
                onClick={handleCreateDelivery}
                disabled={Object.values(selectedProducts).every(qty => !qty)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
              >
                Criar Carga
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center">
      {/* Container do App Mobile */}
      <div className="w-full max-w-[420px] h-[calc(100vh-32px)] bg-slate-100 overflow-y-auto relative rounded-2xl shadow-2xl">
        {/* Header */}
        <header className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-800">FuzaLog Mobile</h1>
        </header>

        {/* Tabs - também sticky para melhor UX */}
        <div className="flex border-b bg-white sticky top-[52px] z-10">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'active'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600'
            }`}
          >
            Cargas Ativas
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'new'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600'
            }`}
          >
            Nova Carga
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'active' ? (
            <div className="space-y-4">
              {/* Campo de Busca */}
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por placa ou ID da carga..."
                  className="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-sm text-slate-700 placeholder:text-slate-400"
                />
              </div>

              {/* Lista de Cargas Filtrada */}
              {mockDeliveries
                .filter(delivery => 
                  delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  delivery.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(delivery => (
                <div
                  key={delivery.id}
                  className="bg-white rounded-xl p-4 shadow-sm space-y-4"
                >
                  {/* Cabeçalho do Card */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-medium">
                          {delivery.deliveryPerson.initials}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {delivery.deliveryPerson.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {delivery.unit.city} - {delivery.unit.district}
                        </p>
                      </div>
                    </div>
                    <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {delivery.status}
                    </span>
                  </div>

                  {/* Informações do Veículo */}
                  <div className="flex items-center gap-2 text-slate-600">
                    <Truck size={18} />
                    <span className="text-sm">
                      {delivery.vehicle.model} - {delivery.vehicle.plate}
                    </span>
                  </div>

                  {/* Produtos */}
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={18} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">
                        Produtos da Carga
                      </span>
                    </div>
                    {delivery.products.map(product => (
                      <div
                        key={product.id}
                        className="flex justify-between items-center py-2"
                      >
                        <span className="text-sm text-slate-600">{product.name}</span>
                        <span className="text-sm font-medium text-slate-800">
                          {product.quantity} unidades
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Botões de Ação atualizados */}
                  <div className="flex flex-col gap-2 mt-4">
                    <button 
                      onClick={() => handleStartEdit(delivery)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <Edit size={20} />
                      Editar Carga
                    </button>
                    <button 
                      onClick={() => handleStartFinalize(delivery)}
                      className="w-full bg-red-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                    >
                      <CheckCircle2 size={20} />
                      Finalizar Carga
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={() => setIsCreatingDelivery(true)}
                className="w-full bg-white p-4 rounded-xl shadow-sm text-left flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Truck className="text-blue-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Criar Nova Carga</p>
                  <p className="text-sm text-slate-500">
                    Selecione produtos e configure a entrega
                  </p>
                </div>
                <ArrowRight className="ml-auto text-slate-400" />
              </button>

              <button className="w-full bg-white p-4 rounded-xl shadow-sm text-left flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Package className="text-emerald-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Produtos Disponíveis</p>
                  <p className="text-sm text-slate-500">
                    Veja o estoque atual
                  </p>
                </div>
                <ArrowRight className="ml-auto text-slate-400" />
              </button>
            </div>
          )}
        </div>

        {/* FAB - ajustado para ficar flutuante */}
        {activeTab === 'active' && (
          <button 
            onClick={() => setActiveTab('new')}
            className="fixed bottom-6 right-1/2 translate-x-[190px] w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-20"
          >
            <Plus className="text-white w-6 h-6" />
          </button>
        )}
      </div>

      {/* Modal de Finalização */}
      {isFinalizingDelivery && <FinalizeModal />}

      {/* Adicionar o modal de edição */}
      {isEditingDelivery && <EditModal />}

      {/* Adicionar o dialog de criação */}
      {isCreatingDelivery && <CreateDeliveryDialog />}

      {/* Barra de Status Simulada */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-8 bg-black rounded-t-2xl flex items-center justify-center">
        <div className="w-32 h-[18px] bg-slate-800 rounded-full" />
      </div>
    </div>
  );
}
