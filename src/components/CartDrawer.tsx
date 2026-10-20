/**
 * TrustCart AI — Shopping Bag Drawer & Grounded Checkout Simulator
 * Editorial retail design: Complies with official store policies:
 * $50 free shipping threshold (POL-SHP-01) and sales tax compliance (POL-SEC-01).
 */
import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  Truck,
  CreditCard
} from 'lucide-react';
import { CartItem, CurrencyCode, formatCurrencyPrice } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  selectedCurrency?: CurrencyCode;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedCurrency = 'USD'
}) => {
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Real calculations
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Shipping rule per POL-SHP-01: Free shipping on orders >= $50.00
  const freeShippingThreshold = 50.0;
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = items.length === 0 ? 0.0 : (qualifiesForFreeShipping ? 0.0 : 4.99);
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Statutory sales tax per POL-SEC-01: 7.25% average destination sales tax
  const taxRate = 0.0725;
  const estimatedTax = subtotal * taxRate;
  const total = subtotal + shippingCost + estimatedTax;

  const handleSimulateCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      onClearCart();
      setCheckoutSuccess(false);
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E6E4DC] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-[#EAE8E0] flex items-center justify-between bg-[#FBFBFA]">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-5 h-5 text-[#2E4032]" />
              <h2 className="font-serif text-lg font-bold text-[#1A1A18]">Shopping Bag</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAE8E0] text-[#4A4842] font-mono">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#EAE8E0] text-[#7A7870] hover:text-[#1A1A18] transition-colors"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAF9F6]">
            
            {/* Free Shipping Progress Indicator (POL-SHP-01) */}
            {items.length > 0 && (
              <div className="p-3.5 rounded-xl bg-white border border-[#E6E4DC] text-xs space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#4A4842] flex items-center space-x-1.5">
                    <Truck className="w-4 h-4 text-[#2E4032]" />
                    <span>Free Shipping (POL-SHP-01)</span>
                  </span>
                  <span className={`font-semibold font-mono ${qualifiesForFreeShipping ? 'text-[#2E4032]' : 'text-[#7A7870]'}`}>
                    {qualifiesForFreeShipping ? 'UNLOCKED' : `$${amountNeededForFreeShipping.toFixed(2)} away`}
                  </span>
                </div>
                <div className="w-full bg-[#EAE8E0] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2E4032] h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#7A7870]">
                  {qualifiesForFreeShipping
                    ? 'Qualifies for Free Standard Ground Shipping on orders over $50.'
                    : `Add $${amountNeededForFreeShipping.toFixed(2)} more to qualify for Free Ground Shipping.`}
                </p>
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#F0EFEA] flex items-center justify-center mx-auto text-[#8A8880]">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#1A1A18]">Your shopping bag is empty</h3>
                <p className="text-xs text-[#7A7870] max-w-xs mx-auto">
                  Add verified products from the Shopping Assistant or Catalogue to compute exact shipping and taxes.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="p-3.5 rounded-xl bg-white border border-[#E6E4DC] flex items-center space-x-3 text-xs shadow-2xs"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-14 h-14 object-cover rounded-lg bg-[#F6F5F1] border border-[#EAE8E0] shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-[#7A7870]">{product.brand}</span>
                      <h4 className="font-serif font-bold text-[#1A1A18] text-xs truncate">{product.title}</h4>
                      <div className="flex items-center space-x-2 text-[11px]">
                        <span className="font-bold text-[#1A1A18] font-mono tabular-nums">
                          {product.currency === 'INR' ? '₹' : '$'}{product.price.toFixed(2)}
                        </span>
                        <span className="text-[#8A8880]">•</span>
                        <span className="text-[#686660]">{product.leadTimeDays}d lead time</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2 shrink-0">
                      <button
                        onClick={() => onRemoveItem(product.id)}
                        className="text-[#9A9890] hover:text-[#8F3E2B] p-1 transition-colors"
                        title="Remove Item"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center space-x-1.5 bg-[#FAF9F6] border border-[#DDD9CF] rounded-md p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                          className="p-1 text-[#686660] hover:text-[#1A1A18]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1.5 font-bold font-mono text-[#1A1A18] text-xs tabular-nums">{quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stockCount}
                          className="p-1 text-[#686660] hover:text-[#1A1A18] disabled:text-[#C8C5BA]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Breakdown & Checkout Action */}
          {items.length > 0 && (() => {
            const fSubtotal = formatCurrencyPrice(subtotal, 'USD', selectedCurrency);
            const fShipping = formatCurrencyPrice(shippingCost, 'USD', selectedCurrency);
            const fTax = formatCurrencyPrice(estimatedTax, 'USD', selectedCurrency);
            const fTotal = formatCurrencyPrice(total, 'USD', selectedCurrency);

            return (
              <div className="p-5 border-t border-[#EAE8E0] bg-[#FBFBFA] space-y-4">
                <div className="space-y-1.5 text-xs text-[#5A5850]">
                  <div className="flex justify-between">
                    <span>Merchandise Subtotal:</span>
                    <span className="font-mono font-medium text-[#1A1A18] tabular-nums">{fSubtotal.formatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard Ground Shipping (POL-SHP-01):</span>
                    <span className="font-mono font-medium tabular-nums text-[#2E4032]">
                      {qualifiesForFreeShipping ? 'FREE' : fShipping.formatted}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Statutory Sales Tax (POL-SEC-01 ~7.25%):</span>
                    <span className="font-mono font-medium text-[#1A1A18] tabular-nums">{fTax.formatted}</span>
                  </div>
                  <div className="pt-2.5 border-t border-[#EAE8E0] flex justify-between text-sm font-bold text-[#1A1A18]">
                    <span>Total Due:</span>
                    <span className="font-mono text-[#2E4032] tabular-nums">{fTotal.formatted} {selectedCurrency}</span>
                  </div>
                </div>

                {checkoutSuccess ? (
                  <div className="p-3.5 rounded-xl bg-[#F0F4F1] border border-[#D5E0D7] text-[#2E4032] text-center font-medium text-xs flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E4032]" />
                    <span>Order Placed Successfully! Preparing dispatch...</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSimulateCheckout}
                    className="w-full py-3 px-4 rounded-xl font-medium text-xs bg-[#2E4032] hover:bg-[#233226] text-white transition-all shadow-xs active:scale-[0.99] flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Complete Verified Checkout ({fTotal.formatted})</span>
                  </button>
                )}
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
};
