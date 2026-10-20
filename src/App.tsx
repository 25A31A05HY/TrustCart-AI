/**
 * TruthCart AI - Main Application Container
 * Wires together Conversational Assistant, Product Discovery, Comparison Matrix,
 * Evidence Truth Inspector, Adversarial Benchmark Runner, Ingestion, and Cart.
 */
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatWorkspace } from './components/ChatWorkspace';
import { ProductDiscovery } from './components/ProductDiscovery';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { ClaimInspector } from './components/ClaimInspector';
import { BenchmarkRunner } from './components/BenchmarkRunner';
import { AdminIngestion } from './components/AdminIngestion';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { DuelArena } from './components/DuelArena';
import {
  ChatMessage,
  Product,
  CartItem,
  Citation,
  EngineMode,
  UserConstraints,
  CurrencyCode
} from './types';
import { indexStore } from './engine/indexStore';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'catalogue' | 'compare' | 'duel' | 'evidence' | 'benchmark' | 'admin'>('chat');
  const [engineMode, setEngineMode] = useState<EngineMode>('gemini');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Multi-turn Constraints
  const [activeConstraints, setActiveConstraints] = useState<UserConstraints>({
    inStockOnly: false,
    requiredFeatures: []
  });

  // Refresh products from indexStore
  const refreshProducts = () => {
    const prods = indexStore.getAllProducts();
    setProducts([...prods]);
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Chat message submission
  const handleSendMessage = async (text: string, isRetry: boolean = false, overrideMode?: EngineMode) => {
    if (!text.trim() || isLoading) return;
    const effectiveMode = overrideMode || engineMode;

    if (!isRetry) {
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
        citations: [],
        claims: [],
        retrievedProducts: [],
        engineMode: effectiveMode
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    setIsLoading(true);

    try {
      // Call full-stack API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.filter(m => m && !m.isError),
          constraints: activeConstraints,
          engineMode: effectiveMode
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg: ChatMessage = {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: data?.message || `Server returned ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
          citations: [],
          claims: [],
          retrievedProducts: [],
          engineMode: effectiveMode,
          isError: true,
          errorDetails: data?.details,
          retryable: data?.retryable ?? true
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      if (data?.message) {
        setMessages((prev) => [...prev, data.message]);
      }

      if (data?.updatedConstraints) {
        setActiveConstraints(data.updatedConstraints);
      }
    } catch (err: any) {
      console.error('Chat API request error:', err);
      const networkErrorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `Network connection error: ${err.message}. Please check connection and click Retry.`,
        timestamp: new Date().toISOString(),
        citations: [],
        claims: [],
        retrievedProducts: [],
        engineMode: effectiveMode,
        isError: true,
        retryable: true
      };
      setMessages((prev) => [...prev, networkErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry last user message without duplicating history
  const handleRetryLastMessage = async () => {
    const lastUserMsg = [...messages].reverse().find(m => m?.role === 'user');
    if (!lastUserMsg) return;
    setMessages(prev => prev.filter(m => m && !m.isError));
    await handleSendMessage(lastUserMsg.content, true);
  };

  // Switch to offline deterministic engine and immediately retry
  const handleSwitchToOfflineAndRetry = async () => {
    setEngineMode('deterministic_offline');
    const lastUserMsg = [...messages].reverse().find(m => m?.role === 'user');
    if (!lastUserMsg) return;
    setMessages(prev => prev.filter(m => m && !m.isError));
    await handleSendMessage(lastUserMsg.content, true, 'deterministic_offline');
  };

  // Cart Management
  const handleAddToCart = (product: Product) => {
    if (!product.inStock || product.stockCount <= 0) {
      showToast(`Cannot add ${product.title} to cart: Item is strictly Out of Stock.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockCount) {
          showToast(`Maximum available stock reached (${product.stockCount} units).`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, addedAt: new Date().toISOString() }];
    });

    showToast(`Added "${product.title}" to Cart.`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Comparison Management
  const handleToggleCompare = (product: Product) => {
    setComparedProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        showToast(`Removed "${product.title}" from Comparison.`);
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        showToast('You can compare a maximum of 4 products simultaneously.');
        return prev;
      }
      showToast(`Added "${product.title}" to Comparison.`);
      return [...prev, product];
    });
  };

  const handleRemoveCompare = (productId: string) => {
    setComparedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleClearCompare = () => {
    setComparedProducts([]);
  };

  // Reset conversation
  const handleResetChat = () => {
    setMessages([]);
    setActiveConstraints({ inStockOnly: false, requiredFeatures: [] });
    showToast('Conversation session and multi-turn constraints reset.');
  };

  const latestAssistantMessage = [...messages].reverse().find((m) => m?.role === 'assistant');

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A18] flex flex-col font-sans selection:bg-[#2E4032] selection:text-white">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        engineMode={engineMode}
        setEngineMode={setEngineMode}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        openCart={() => setIsCartOpen(true)}
        activeConstraints={activeConstraints}
        clearConstraints={() => {
          setActiveConstraints({ inStockOnly: false, requiredFeatures: [] });
          showToast('Active constraints cleared.');
        }}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={setSelectedCurrency}
      />

      {/* Main Tab Views */}
      <main className="flex-1">
        {activeTab === 'chat' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Primary Chat Stream */}
            <div className="lg:col-span-8">
              <ChatWorkspace
                messages={messages}
                onSendMessage={handleSendMessage}
                onRetry={handleRetryLastMessage}
                onSwitchToOffline={handleSwitchToOfflineAndRetry}
                isLoading={isLoading}
                onResetChat={handleResetChat}
                onAddToCart={handleAddToCart}
                onInspectProduct={(prod) => setInspectedProduct(prod)}
                onToggleCompare={handleToggleCompare}
                comparedProductIds={comparedProducts.map((p) => p.id)}
                onSelectCitation={(cit) => {
                  setSelectedCitation(cit);
                  setActiveTab('evidence');
                }}
                activeConstraints={activeConstraints}
                selectedCurrency={selectedCurrency}
              />
            </div>

            {/* Side Claim Inspector Panel */}
            <div className="hidden lg:block lg:col-span-4 sticky top-20 self-start">
              <ClaimInspector
                latestMessage={latestAssistantMessage}
                onSelectCitation={(cit) => setSelectedCitation(cit)}
              />
            </div>
          </div>
        )}

        {activeTab === 'catalogue' && (
          <ProductDiscovery
            products={products}
            onAddToCart={handleAddToCart}
            onInspectProduct={(prod) => setInspectedProduct(prod)}
            onToggleCompare={handleToggleCompare}
            comparedProductIds={comparedProducts.map((p) => p.id)}
            selectedCurrency={selectedCurrency}
          />
        )}

        {activeTab === 'compare' && (
          <ComparisonMatrix
            products={products}
            comparedProducts={comparedProducts}
            onRemoveCompare={handleRemoveCompare}
            onAddCompare={(prod) => handleToggleCompare(prod)}
            onClearCompare={handleClearCompare}
            onAddToCart={handleAddToCart}
            selectedCurrency={selectedCurrency}
          />
        )}

        {activeTab === 'duel' && (
          <DuelArena products={products} selectedCurrency={selectedCurrency} />
        )}

        {activeTab === 'evidence' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <ClaimInspector
              latestMessage={latestAssistantMessage}
              onSelectCitation={(cit) => setSelectedCitation(cit)}
            />
          </div>
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkRunner engineMode={engineMode} />
        )}

        {activeTab === 'admin' && (
          <AdminIngestion onDataChanged={refreshProducts} />
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductModal
        product={inspectedProduct}
        onClose={() => setInspectedProduct(null)}
        onAddToCart={handleAddToCart}
        selectedCurrency={selectedCurrency}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        selectedCurrency={selectedCurrency}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A18] border border-[#2E4032] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-[#52B788]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
