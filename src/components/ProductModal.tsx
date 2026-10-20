/**
 * TrustCart AI — Detailed Product Specification Sheet & Verified Reviews Modal
 * Editorial retail design: High-resolution product showcase, verified specifications,
 * store policy guarantees, verified customer purchase reviews, and an interactive
 * Return Policy & Restocking Fee Calculator.
 */
import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  UserCheck,
  Calculator,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Product, CurrencyCode, formatCurrencyPrice } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  selectedCurrency?: CurrencyCode;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  selectedCurrency = 'USD'
}) => {
  const [returnDays, setReturnDays] = useState<number>(7);
  const [returnCondition, setReturnCondition] = useState<'sealed' | 'opened' | 'damaged'>('sealed');

  if (!product) return null;

  const formattedPrice = formatCurrencyPrice(product.price, product.currency, selectedCurrency);
  const formattedOriginalPrice = product.originalPrice > product.price
    ? formatCurrencyPrice(product.originalPrice, product.currency, selectedCurrency)
    : null;

  // Return & Restocking Fee Calculation Logic based on verified store policies
  const isEarbud = product.category === 'Audio' && (
    product.title.toLowerCase().includes('earbud') ||
    product.title.toLowerCase().includes('in-ear') ||
    product.title.toLowerCase().includes('wf-1000xm5')
  );

  const isConsumerElectronics = [
    'Laptops',
    'Audio',
    'Displays',
    'Cameras',
    'Smartphones',
    'Home Appliances'
  ].includes(product.category);

  const isWithinWindow = returnDays <= product.returnWindowDays;

  let returnStatus: 'ELIGIBLE_FULL' | 'ELIGIBLE_RESTOCKING' | 'NON_RETURNABLE' | 'EXPIRED' | 'REJECTED';
  let restockingFeePercent = 0;
  let policyCitation = 'POL-RET-01';
  let explanation = '';

  if (!isWithinWindow) {
    returnStatus = 'EXPIRED';
    explanation = `Return window expired: Purchase was ${returnDays} days ago, but official policy allows a maximum of ${product.returnWindowDays} days.`;
  } else if (returnCondition === 'damaged') {
    returnStatus = 'REJECTED';
    explanation = 'Items with customer-induced physical damage, altered serials, or missing components are ineligible for refund.';
  } else if (isEarbud && returnCondition === 'opened') {
    returnStatus = 'NON_RETURNABLE';
    policyCitation = 'POL-RET-03';
    explanation = 'Opened in-ear audio devices/earbuds cannot be returned for hygiene and health safety compliance under Policy POL-RET-03.';
  } else if (returnCondition === 'opened' && isConsumerElectronics) {
    returnStatus = 'ELIGIBLE_RESTOCKING';
    restockingFeePercent = 0.10;
    policyCitation = 'POL-RET-02';
    explanation = 'Consumer electronics opened or unsealed incur a standard 10% restocking fee under Policy POL-RET-02. Items factory sealed are exempt.';
  } else {
    returnStatus = 'ELIGIBLE_FULL';
    policyCitation = 'POL-RET-01';
    explanation = returnCondition === 'sealed'
      ? 'Factory-sealed original packaging qualifies for 100% full refund with zero restocking fees under Policy POL-RET-01.'
      : 'General merchandise in good condition qualifies for 100% full refund within the 30-day window under Policy POL-RET-01.';
  }

  const restockingFeeAmount = formattedPrice.convertedAmount * restockingFeePercent;
  const netRefundAmount = formattedPrice.convertedAmount - restockingFeeAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-[#E6E4DC] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#FBFBFA] border-b border-[#EAE8E0] flex items-center justify-between sticky top-0 z-10">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-[#7A7870] uppercase">
              {product.brand} &bull; {product.category}
            </span>
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#1A1A18] line-clamp-1">
              {product.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#EAE8E0] text-[#7A7870] hover:text-[#1A1A18] transition-colors"
            aria-label="Close product details modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 bg-white">
          
          {/* Top Hero: Image & Key Facts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="aspect-video sm:aspect-square w-full rounded-xl overflow-hidden bg-[#F6F5F1] border border-[#EAE8E0]">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-[#1A1A18] font-mono tabular-nums">
                    {formattedPrice.formatted}
                  </span>
                  <span className="text-xs text-[#7A7870]">{selectedCurrency}</span>
                  {selectedCurrency !== product.currency && (
                    <span className="text-xs text-[#8A8880] font-mono">
                      (Orig: {product.currency === 'INR' ? '₹' : '$'}{product.price.toFixed(2)})
                    </span>
                  )}
                  {formattedOriginalPrice && (
                    <span className="text-xs text-[#9E9C94] line-through font-mono tabular-nums ml-1">
                      {formattedOriginalPrice.formatted}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex items-center space-x-3 text-xs">
                  {product.inStock && product.stockCount > 0 ? (
                    <span className="inline-flex items-center space-x-1.5 text-[#2E4032] font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>In Stock ({product.stockCount} units)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 text-[#8F3E2B] font-semibold">
                      <XCircle className="w-4 h-4" />
                      <span>Out of Stock</span>
                    </span>
                  )}

                  <div className="flex items-center space-x-1 text-[#C79E38] font-semibold">
                    <Star className="w-4 h-4 fill-[#C79E38]" />
                    <span className="text-[#1A1A18] font-mono">{product.rating.toFixed(1)}</span>
                    <span className="text-[#8A8880] font-normal">({product.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E6E4DC] space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-[#4A4842]">
                  <ShieldCheck className="w-4 h-4 text-[#2E4032] shrink-0" />
                  <span>{product.warrantyMonths} Months Manufacturer Limited Warranty</span>
                </div>
                <div className="flex items-center space-x-2 text-[#4A4842]">
                  <RotateCcw className="w-4 h-4 text-[#2E4032] shrink-0" />
                  <span>{product.returnWindowDays}-Day Return Window (See calculator below)</span>
                </div>
                <div className="flex items-center space-x-2 text-[#4A4842]">
                  <Truck className="w-4 h-4 text-[#2E4032] shrink-0" />
                  <span>Dispatch Lead Time: {product.leadTimeDays} business days</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                disabled={!product.inStock || product.stockCount <= 0}
                className={`w-full py-3 px-4 rounded-xl font-medium text-xs flex items-center justify-center space-x-2 transition-all ${
                  product.inStock && product.stockCount > 0
                    ? 'bg-[#2E4032] hover:bg-[#233226] text-white shadow-xs active:scale-[0.99]'
                    : 'bg-[#F0EFEA] text-[#A09E95] cursor-not-allowed border border-[#DDD9CF]'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{product.inStock && product.stockCount > 0 ? 'Add to Shopping Bag' : 'Out of Stock'}</span>
              </button>
            </div>
          </div>

          {/* Feature: Interactive Return & Restocking Fee Calculator */}
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E6E4DC] space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#ECEAE2]">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-[#2E4032]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A18]">
                  Return & Restocking Fee Eligibility Calculator
                </h4>
              </div>
              <span className="text-[11px] font-mono text-[#7A7870]">
                Window: {product.returnWindowDays} days
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Days since purchase slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#5A5850]">
                  <span>Days since delivery:</span>
                  <strong className="font-mono text-[#1A1A18]">{returnDays} days</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="45"
                  value={returnDays}
                  onChange={(e) => setReturnDays(Number(e.target.value))}
                  className="w-full accent-[#2E4032] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8A8880]">
                  <span>1 day</span>
                  <span>{product.returnWindowDays}d deadline</span>
                  <span>45 days</span>
                </div>
              </div>

              {/* Package Condition Selection */}
              <div className="space-y-1.5">
                <span className="text-[#5A5850] block">Package condition:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'sealed', label: 'Factory Sealed' },
                    { id: 'opened', label: 'Opened / Tested' },
                    { id: 'damaged', label: 'Damaged' }
                  ].map((cond) => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setReturnCondition(cond.id as any)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-all ${
                        returnCondition === cond.id
                          ? 'bg-[#2E4032] text-white border-[#2E4032] shadow-2xs font-semibold'
                          : 'bg-white hover:bg-[#F2F0EB] text-[#5A5850] border-[#DDD9CF]'
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Verdict Card */}
            <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
              returnStatus === 'ELIGIBLE_FULL'
                ? 'bg-[#F0F5F1] border-[#CCE0D1] text-[#24422A]'
                : returnStatus === 'ELIGIBLE_RESTOCKING'
                ? 'bg-[#FDF8EE] border-[#ECDDBA] text-[#7A5B1F]'
                : 'bg-[#FAF1EF] border-[#E8D5D0] text-[#8F3E2B]'
            }`}>
              <div className="flex items-center justify-between font-semibold">
                <div className="flex items-center space-x-1.5">
                  {returnStatus === 'ELIGIBLE_FULL' && <CheckCircle2 className="w-4 h-4 text-[#2E4032]" />}
                  {returnStatus === 'ELIGIBLE_RESTOCKING' && <AlertTriangle className="w-4 h-4 text-[#B88B2A]" />}
                  {(returnStatus === 'NON_RETURNABLE' || returnStatus === 'EXPIRED' || returnStatus === 'REJECTED') && (
                    <XCircle className="w-4 h-4 text-[#8F3E2B]" />
                  )}
                  <span>
                    {returnStatus === 'ELIGIBLE_FULL' && 'Eligible for 100% Full Refund'}
                    {returnStatus === 'ELIGIBLE_RESTOCKING' && `Eligible with 10% Restocking Fee`}
                    {returnStatus === 'NON_RETURNABLE' && 'Strictly Non-Returnable (Hygiene Policy)'}
                    {returnStatus === 'EXPIRED' && 'Return Window Expired'}
                    {returnStatus === 'REJECTED' && 'Ineligible for Return'}
                  </span>
                </div>
                <span className="font-mono text-[11px] underline decoration-dotted">
                  Policy {policyCitation}
                </span>
              </div>

              <p className="text-[11px] opacity-90 leading-relaxed font-sans">
                {explanation}
              </p>

              {returnStatus === 'ELIGIBLE_RESTOCKING' && (
                <div className="pt-1.5 border-t border-black/10 flex items-center justify-between font-mono text-[11px]">
                  <span>Restocking Fee Deduction (10%):</span>
                  <span className="text-[#8F3E2B] font-bold">-{formattedPrice.symbol}{restockingFeeAmount.toFixed(2)}</span>
                  <span>Estimated Net Refund:</span>
                  <span className="text-[#2E4032] font-bold">{formattedPrice.symbol}{netRefundAmount.toFixed(2)}</span>
                </div>
              )}

              {returnStatus === 'ELIGIBLE_FULL' && (
                <div className="pt-1.5 border-t border-black/10 flex items-center justify-between font-mono text-[11px]">
                  <span>Restocking Fee:</span>
                  <span className="text-[#2E4032] font-bold">{formattedPrice.symbol}0.00</span>
                  <span>Estimated Full Refund:</span>
                  <span className="text-[#2E4032] font-bold">{formattedPrice.formatted}</span>
                </div>
              )}
            </div>
          </div>

          {/* Key Features List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5850]">Verified Key Features</h4>
            <ul className="space-y-1.5 text-xs text-[#2C2B27]">
              {product.keyFeatures.map((f, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-[#2E4032] font-bold">&bull;</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Detailed Technical Specifications Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5850]">Technical Specifications</h4>
            <div className="rounded-xl border border-[#E6E4DC] overflow-hidden divide-y divide-[#F0EFEA] text-xs">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-[#FAF9F6]">
                  <span className="text-[#686660] capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-[#1A1A18] font-semibold font-mono text-right max-w-[60%]">
                    {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Customer Reviews */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5850]">
                Customer Reviews ({product.reviews.length})
              </h4>
              <span className="text-[#8A8880] text-[11px]">Verified retail purchases</span>
            </div>

            <div className="space-y-3">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E6E4DC] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-[#1A1A18]">{rev.author}</span>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center space-x-1 text-[10px] text-[#2E4032] font-medium">
                          <UserCheck className="w-3 h-3" />
                          <span>Verified Purchase</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[#8A8880] font-mono text-[10px]">{rev.date}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-[#C79E38]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#C79E38]' : 'text-[#DDD9CF]'}`}
                      />
                    ))}
                    <span className="ml-1 text-[#1A1A18] font-medium text-xs">{rev.title}</span>
                  </div>

                  <p className="text-[#5A5850] leading-relaxed font-sans pt-1">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
