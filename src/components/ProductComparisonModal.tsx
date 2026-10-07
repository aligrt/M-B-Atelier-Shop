import React from 'react';
import { X, Check, Star, ShieldCheck, Zap, ShoppingBag, Scale } from 'lucide-react';
import { Product } from '../types';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  allProducts: Product[];
  onAddProduct: (product: Product) => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onAddToCart,
  onBuyNow,
  allProducts,
  onAddProduct,
}) => {
  if (!isOpen) return null;

  const availableToAdd = allProducts.filter(
    (p) => !products.some((selected) => selected.id === p.id)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-2 sm:px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal Container */}
        <div className="inline-block align-bottom bg-[#16181B] border border-[#2B3038] rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#2B3038] flex items-center justify-between bg-[#14171A]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1C2025] border border-[#2B3038] flex items-center justify-center text-[#E2B29F]">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                  Technical Specification Comparison
                </h3>
                <p className="text-xs text-neutral-400">
                  Comparing {products.length} of {allProducts.length} Atelier Models
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {availableToAdd.length > 0 && (
                <div className="hidden md:flex items-center gap-1.5 text-xs">
                  <span className="text-neutral-400">Add to compare:</span>
                  {availableToAdd.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onAddProduct(p)}
                      className="px-2.5 py-1 bg-[#1C2025] hover:bg-[#23282F] text-neutral-300 hover:text-white rounded border border-[#2B3038] hover:border-[#C88D76] transition-colors cursor-pointer"
                    >
                      + {p.name.replace('The ', '')}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Close comparison modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body: Comparison Table */}
          <div className="p-4 sm:p-6 overflow-x-auto max-h-[80vh]">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Scale className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <h4 className="text-base font-semibold text-white">No bags selected for comparison</h4>
                <p className="text-xs text-neutral-400 mt-1 mb-5">
                  Select at least one bag from the catalog or add one below to view detailed technical specifications.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {allProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onAddProduct(p)}
                      className="px-4 py-2 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] text-neutral-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      + Add {p.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="min-w-[680px]">
                {/* Comparison Grid Table */}
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#2B3038]">
                      {/* First Column Header: Specs Attribute Label */}
                      <th className="py-4 px-3 w-48 text-xs font-bold uppercase tracking-wider text-neutral-400 align-bottom bg-[#14171A]/60">
                        Product
                      </th>

                      {/* Columns for each compared product */}
                      {products.map((product) => (
                        <th
                          key={product.id}
                          className="py-4 px-3 w-64 align-top border-l border-[#2B3038]/60"
                        >
                          <div className="relative">
                            {/* Remove button */}
                            {products.length > 1 && (
                              <button
                                onClick={() => onRemoveProduct(product.id)}
                                className="absolute top-0 right-0 p-1 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                                title="Remove from comparison"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}

                            {/* Thumbnail & Title */}
                            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-[#2B3038] mb-3 max-w-[200px]">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <span className="text-[10px] font-bold text-[#E2B29F] uppercase tracking-wider block mb-0.5">
                              {product.badge}
                            </span>
                            <h4 className="font-display font-bold text-sm text-white line-clamp-1 mb-1">
                              {product.name}
                            </h4>

                            {/* Price */}
                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="font-extrabold text-base text-white tabular-nums">
                                PKR {product.price.toLocaleString()}
                              </span>
                              <span className="text-xs text-neutral-500 line-through tabular-nums">
                                PKR {product.originalPrice.toLocaleString()}
                              </span>
                            </div>

                            {/* CTAs */}
                            <div className="space-y-1.5">
                              <button
                                onClick={() => {
                                  onBuyNow(product);
                                  onClose();
                                }}
                                className="w-full py-2 px-3 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] hover:from-[#F0C0B0] hover:to-[#D49D87] text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <Zap className="w-3.5 h-3.5 fill-neutral-950" />
                                <span>Buy Now (Free COD)</span>
                              </button>
                              <button
                                onClick={() => onAddToCart(product)}
                                className="w-full py-1.5 px-3 bg-[#1C2025] hover:bg-[#23282F] border border-[#2B3038] text-neutral-300 hover:text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <ShoppingBag className="w-3 h-3 text-[#E2B29F]" />
                                <span>Add to Cart</span>
                              </button>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#2B3038]/60 text-xs">
                    
                    {/* Material */}
                    <tr>
                      <td className="py-3.5 px-3 font-semibold text-neutral-300 bg-[#14171A]/40">
                        Primary Material
                      </td>
                      {products.map((p) => (
                        <td key={p.id} className="py-3.5 px-3 text-neutral-200 border-l border-[#2B3038]/60">
                          {p.specs.material}
                        </td>
                      ))}
                    </tr>

                    {/* Capacity / Volume */}
                    <tr>
                      <td className="py-3.5 px-3 font-semibold text-neutral-300 bg-[#14171A]/40">
                        Volume / Capacity
                      </td>
                      {products.map((p) => (
                        <td key={p.id} className="py-3.5 px-3 font-bold text-white border-l border-[#2B3038]/60 tabular-nums">
                          {p.specs.capacity}
                        </td>
                      ))}
                    </tr>

                    {/* Dry Weight */}
                    <tr>
                      <td className="py-3.5 px-3 font-semibold text-neutral-300 bg-[#14171A]/40">
                        Dry Weight
                      </td>
                      {products.map((p) => (
                        <td key={p.id} className="py-3.5 px-3 text-neutral-200 border-l border-[#2B3038]/60 tabular-nums">
                          {p.specs.weight}
                        </td>
                      ))}
                    </tr>

                    {/* Dimensions */}
                    <tr>
                      <td className="py-3.5 px-3 font-semibold text-neutral-300 bg-[#14171A]/40">
                        Dimensions (H x W x D)
                      </td>
                      {products.map((p) => (
                        <td key={p.id} className="py-3.5 px-3 text-neutral-200 border-l border-[#2B3038]/60 tabular-nums">
                          {p.specs.dimensions}
                        </td>
                      ))}
                    </tr>

                    {/* Device / Laptop Fit */}
                    <tr>
                      <td className="py-3.5 px-3 font-semibold text-neutral-300 bg-[#14171A]/40">
                        Laptop / Tablet Fit
                      </td>
                      {products.map((p) => (
                        <td key={p.id} className="py-3.5 px-3 text-white border-l border-[#2B3038]/60">
                          <span className="font-medium text-[#E2B29F]">{p.specs.laptopFit}</span>
                        </td>
                      ))}
                    </tr>

                    {/* Weatherproof & Rain Protection */}
                    <tr>
                      <td className="py-3.5 px-3 font-semibold text-neutral-300 bg-[#14171A]/40">
                        Waterproof Rating
                      </td>
                      {products.map((p) => (
                        <td key={p.id} className="py-3.5 px-3 text-neutral-200 border-l border-[#2B3038]/60">
                          {p.specs.waterproofRating}
                        </td>
                      ))}
                    </tr>

                    {/* Key Distinguishing Features */}
                    <tr>
                      <td className="py-3.5 px-3 font-semibold text-neutral-300 bg-[#14171A]/40 align-top">
                        Key Features
                      </td>
                      {products.map((p) => (
                        <td key={p.id} className="py-3.5 px-3 border-l border-[#2B3038]/60 align-top">
                          <ul className="space-y-1.5 text-neutral-300">
                            {p.features.map((f, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <Check className="w-3.5 h-3.5 text-[#E2B29F] shrink-0 mt-0.5" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>

                    {/* Ideal Daily Ride / Usage */}
                    <tr>
                      <td className="py-3.5 px-3 font-semibold text-neutral-300 bg-[#14171A]/40">
                        Best Suited For
                      </td>
                      {products.map((p) => (
                        <td key={p.id} className="py-3.5 px-3 text-neutral-300 border-l border-[#2B3038]/60">
                          {p.id === 'metro-commuter' && '70cc/125cc Motorbike Riders, Monsoon Rain, College & Heavy Tech'}
                          {p.id === 'tech-exec' && 'Executive Office, Arfa Tower Tech Leads, Air Travel, 180° Clamshell'}
                          {p.id === 'urban-sling' && 'Quick City Runs, Bazaars, Everyday Carry, iPad & Essentials'}
                        </td>
                      ))}
                    </tr>

                    {/* Local Warranty & Open Parcel */}
                    <tr>
                      <td className="py-3.5 px-3 font-semibold text-neutral-300 bg-[#14171A]/40">
                        Protection Guarantee
                      </td>
                      {products.map((p) => (
                        <td key={p.id} className="py-3.5 px-3 text-emerald-400 font-medium border-l border-[#2B3038]/60">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>1-Yr Sialkot Warranty + Open Parcel COD</span>
                          </div>
                        </td>
                      ))}
                    </tr>

                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-6 py-3.5 bg-[#14171A] border-t border-[#2B3038] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Free Cash on Delivery across Pakistan. Open and inspect bag before paying.</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#1C2025] hover:bg-[#23282F] text-white rounded-lg transition-colors cursor-pointer"
            >
              Done Comparing
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
