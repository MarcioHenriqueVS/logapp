"use client";

import { useState } from "react";
import { 
  Package, 
  Truck, 
  BarChart3, 
  Menu,
  Home,
  Package2,
  ClipboardList,
  ArrowRight,
  Plus,
  CheckCircle2,
  X,
  Edit,
  Minus,
  Search
} from "lucide-react";
import { NewDeliveryModal } from "@/components/modals/NewDeliveryModal";
import { DeliveryDetailsModal } from "@/components/modals/DeliveryDetailsModal";
import { FinalizeDeliveryModal } from "@/components/modals/FinalizeDeliveryModal";
import { ProductMovement } from "@/types/dashboard";

// Adicione essa interface
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

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNewDeliveryModalOpen, setIsNewDeliveryModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [editedProducts, setEditedProducts] = useState<Array<{ id: string; name: string; quantity: number }>>([]);
  const [isAddingProducts, setIsAddingProducts] = useState(false);

  // Dados de exemplo - em produção viriam da API
  const mockData = {
    availableProducts: [
      { id: "1", name: "Botijão 13kg (Cheio)", quantity: 150 },
      { id: "2", name: "Botijão 45kg (Cheio)", quantity: 45 },
      { id: "3", name: "Botijão 8kg (Cheio)", quantity: 20 },
    ],
    deliveryPeople: [
      { id: "1", name: "João Silva", initials: "JS" },
      { id: "2", name: "Maria Santos", initials: "MS" },
    ],
    vehicles: [
      { id: "1", model: "Fiorino", plate: "ABC-1234" },
      { id: "2", model: "VW/Saveiro", plate: "DEF-5678" },
    ],
    units: [
      { id: "1", city: "Resende", district: "Campos Elíseos" },
      { id: "2", city: "Porto Real", district: "Centro" },
    ],
    deliveries: [
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
          model: "VW/Saveiro",
          plate: "DEF-5678"
        },
        departureTime: "09:15",
        status: "Iniciando Rota",
        products: [
          {
            id: "1",
            name: "Botijão 13kg (Cheio)",
            quantity: 45
          }
        ]
      }
    ]
  };

  const handleFinalizeDelivery = (movements: ProductMovement[]) => {
    // Implementar lógica de finalização
    console.log('Finalizando entrega:', movements);
    setIsFinalizeModalOpen(false);
  };

  const handleStartEdit = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setEditedProducts(delivery.products);
    setIsEditingDelivery(true);
  };

  const handleRemoveProduct = (productId: string) => {
    setEditedProducts(products => products.filter(p => p.id !== productId));
  };

  const handleQuantityAdjust = (productId: string, increment: boolean) => {
    const product = mockData.availableProducts.find(p => p.id === productId);
    if (!product) return;

    setEditedProducts(products =>
      products.map(p => {
        if (p.id === productId) {
          if (increment) {
            const newQuantity = Math.min(p.quantity + 1, product.quantity);
            return { ...p, quantity: newQuantity };
          } else {
            const newQuantity = Math.max(p.quantity - 1, 1);
            return { ...p, quantity: newQuantity };
          }
        }
        return p;
      })
    );
  };

  // Modal de Edição
  const EditModal = () => {
    if (!selectedDelivery) return null;

    const [transferQuantities, setTransferQuantities] = useState<Record<string, number>>({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | '13kg' | '45kg' | '8kg'>('all');

    const availableProducts = mockData.availableProducts.filter(
      product => !editedProducts.some(ep => ep.id === product.id)
    );

    const filteredProducts = availableProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || product.name.toLowerCase().includes(filterType);
      return matchesSearch && matchesFilter;
    });

    const handleQuantityInputChange = (productId: string, value: string) => {
      const quantity = parseInt(value) || 0;
      const product = editedProducts.find(p => p.id === productId);
      
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

    const handleAddProducts = () => {
      const newProducts = Object.entries(selectedProducts)
        .filter(([_, quantity]) => quantity > 0)
        .map(([productId, quantity]) => {
          const product = mockData.availableProducts.find(p => p.id === productId);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsEditingDelivery(false)} />
        
        <div className="w-full max-w-2xl relative bg-white rounded-lg shadow-xl">
          <div className="max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800">
                  Editar Carga #{selectedDelivery.id}
                </h2>
                <button onClick={() => setIsEditingDelivery(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X size={20} className="text-slate-600" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="overflow-y-auto p-6">
              <div className="space-y-6">
                {editedProducts.map(product => {
                  const isOriginalProduct = selectedDelivery.products.some(p => p.id === product.id);
                  const maxQuantity = mockData.availableProducts.find(p => p.id === product.id)?.quantity || 0;

                  return (
                    <div key={product.id} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
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
                            <div className="flex items-center border border-slate-200 rounded-lg bg-white">
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
                        <div className="mt-4">
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

                <button
                  onClick={() => setIsAddingProducts(true)}
                  className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-50"
                >
                  <Plus size={20} />
                  Adicionar Produtos
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-white">
              <button
                onClick={() => setShowConfirmation(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Confirmação */}
        {showConfirmation && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center">
            {/* ... conteúdo do modal de confirmação ... */}
          </div>
        )}

        {/* Dialog de Adicionar Produtos */}
        {isAddingProducts && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsAddingProducts(false)} />
            
            <div className="w-full max-w-2xl relative bg-white rounded-lg shadow-xl">
              <div className="max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-slate-800">
                      Adicionar Produtos
                    </h3>
                    <button onClick={() => setIsAddingProducts(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                      <X size={20} className="text-slate-600" />
                    </button>
                  </div>

                  {/* Busca e Filtros */}
                  <div className="space-y-4">
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

                    <div className="flex gap-2">
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
                </div>

                {/* Lista de Produtos */}
                <div className="overflow-y-auto p-6">
                  <div className="space-y-4">
                    {filteredProducts.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-800">{product.name}</p>
                          <p className="text-sm text-slate-600">
                            Disponível: {product.quantity} unidades
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
                              className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
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
                              className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
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
                <div className="p-6 border-t bg-white">
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
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={`bg-white h-full transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      } border-r border-slate-200 shadow-sm`}>
        <div className="p-4 flex justify-between items-center border-b border-slate-200">
          {isSidebarOpen && <h2 className="font-bold text-xl text-slate-800">FuzaLog</h2>}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
          >
            <Menu size={24} />
          </button>
        </div>

        <nav className="mt-4">
          <MenuItem icon={<Home className="text-slate-600" />} text="Início" isOpen={isSidebarOpen} />
          <MenuItem icon={<Truck className="text-slate-600" />} text="Entregas" isOpen={isSidebarOpen} />
          <MenuItem icon={<Package2 className="text-slate-600" />} text="Estoque" isOpen={isSidebarOpen} />
          <MenuItem icon={<ClipboardList className="text-slate-600" />} text="Pedidos" isOpen={isSidebarOpen} />
        </nav>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard</h1>
        
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <Truck className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-600 font-medium">Entregas em Andamento</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">12</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <Package className="text-emerald-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-600 font-medium">Produtos em Estoque</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">284</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-violet-50 p-4 rounded-lg">
                <BarChart3 className="text-violet-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-600 font-medium">Vendas do Dia</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">R$ 5.240</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Entregas em Andamento */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Entregas em Andamento</h2>
            <div className="flex gap-3">
              <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Ver Todas
              </button>
              <button 
                onClick={() => setIsNewDeliveryModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Nova Carga
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Código</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Entregador</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Unidade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Veículo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Carga</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Horário Saída</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mockData.deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-700">#{delivery.id}</td>
                    <td className="px-6 py-4 text-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 font-medium">{delivery.deliveryPerson.initials}</span>
                        </div>
                        <span>{delivery.deliveryPerson.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <div>
                        <div className="font-medium">{delivery.unit.city}</div>
                        <div className="text-sm text-slate-500">{delivery.unit.district}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{delivery.vehicle.model} - {delivery.vehicle.plate}</td>
                    <td className="px-6 py-4 text-slate-700">
                      <div>
                        <div className="font-medium">{delivery.products[0].quantity} unidades</div>
                        <div className="text-sm text-slate-500">{delivery.products[0].name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{delivery.departureTime}</td>
                    <td className="px-6 py-4">
                      <span className={`bg-${delivery.status === "Em Rota" ? "amber" : "emerald"}-50 text-${delivery.status === "Em Rota" ? "amber" : "emerald"}-700 text-xs font-medium px-3 py-1 rounded-full border border-${delivery.status === "Em Rota" ? "amber" : "emerald"}-200`}>
                        {delivery.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setIsDetailsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Ver Detalhes
                      </button>
                      <button
                        onClick={() => handleStartEdit(delivery)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"
                      >
                        <Edit size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Seção de Produtos em Estoque */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Produtos em Estoque</h2>
            <div className="flex gap-3">
              <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Ver Todos
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Novo Produto
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Produto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Quantidade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Preço</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-700">Botijão 13kg (Cheio)</td>
                  <td className="px-6 py-4 text-slate-700">150</td>
                  <td className="px-6 py-4 text-slate-700">R$ 120,00</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full border border-emerald-200">
                      Em Estoque
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Ver Produto
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-700">Botijão 45kg (Cheio)</td>
                  <td className="px-6 py-4 text-slate-700">45</td>
                  <td className="px-6 py-4 text-slate-700">R$ 380,00</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full border border-emerald-200">
                      Em Estoque
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Ver Produto
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-700">Botijão 8kg (Cheio)</td>
                  <td className="px-6 py-4 text-slate-700">20</td>
                  <td className="px-6 py-4 text-slate-700">R$ 85,00</td>
                  <td className="px-6 py-4">
                    <span className="bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1 rounded-full border border-amber-200">
                      Estoque Baixo
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Ver Produto
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal de Nova Carga */}
      <NewDeliveryModal
        isOpen={isNewDeliveryModalOpen}
        onClose={() => setIsNewDeliveryModalOpen(false)}
        availableProducts={mockData.availableProducts}
        deliveryPeople={mockData.deliveryPeople}
        vehicles={mockData.vehicles}
        units={mockData.units}
      />

      {/* Modais */}
      {selectedDelivery && (
        <>
          <DeliveryDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            onFinalize={() => {
              setIsDetailsModalOpen(false);
              setIsFinalizeModalOpen(true);
            }}
            onEdit={() => {
              setIsDetailsModalOpen(false);
              handleStartEdit(selectedDelivery);
            }}
            delivery={selectedDelivery}
          />

          <FinalizeDeliveryModal
            isOpen={isFinalizeModalOpen}
            onClose={() => setIsFinalizeModalOpen(false)}
            onConfirm={handleFinalizeDelivery}
            delivery={selectedDelivery}
            units={mockData.units}
            availableProducts={mockData.availableProducts}
          />
        </>
      )}

      {/* Modal de Edição */}
      {isEditingDelivery && <EditModal />}
    </div>
  );
}

// Componente MenuItem para a sidebar
function MenuItem({ icon, text, isOpen }: { icon: React.ReactNode; text: string; isOpen: boolean }) {
  return (
    <a 
      href="#" 
      className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
    >
      <span className="p-2">{icon}</span>
      {isOpen && <span className="ml-2 font-medium">{text}</span>}
    </a>
  );
}
