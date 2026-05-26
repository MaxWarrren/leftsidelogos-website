import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

import { Sheet } from './ui/sheet';
import { Button } from './ui/button';
import { useCart } from './CartContext';

type CartDrawerContextValue = {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartDrawerContext = React.createContext<CartDrawerContextValue | null>(null);

export function useCartDrawer() {
  const ctx = React.useContext(CartDrawerContext);
  if (!ctx) throw new Error('useCartDrawer must be used inside CartDrawerProvider');
  return ctx;
}

type ProviderProps = {
  children: React.ReactNode;
  onCheckout: () => void;
};

export function CartDrawerProvider({ children, onCheckout }: ProviderProps) {
  const [open, setOpen] = React.useState(false);
  const openDrawer = React.useCallback(() => setOpen(true), []);
  const closeDrawer = React.useCallback(() => setOpen(false), []);

  return (
    <CartDrawerContext.Provider value={{ open, openDrawer, closeDrawer }}>
      {children}
      <CartDrawer
        open={open}
        onOpenChange={setOpen}
        onCheckout={() => {
          setOpen(false);
          onCheckout();
        }}
      />
    </CartDrawerContext.Provider>
  );
}

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
};

function CartDrawer({ open, onOpenChange, onCheckout }: CartDrawerProps) {
  const { getGroupedItems, getCartCount, getCartTotal, updateQuantity, removeFromCart } = useCart();
  const groups = getGroupedItems();
  const count = getCartCount();
  const total = getCartTotal();

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      title="Your Project"
      description={count === 0 ? 'No items yet.' : `${count} item${count === 1 ? '' : 's'}`}
    >
      {groups.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="flex h-full flex-col">
          <ul className="flex-1 space-y-4">
            <AnimatePresence initial={false}>
              {groups.map((group) => (
                <motion.li
                  key={group.productId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.22 }}
                  className="rounded-xl border border-lsl-stone bg-white p-3 shadow-lsl-card"
                >
                  <div className="flex gap-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-lsl-stone">
                      {group.image ? (
                        <img
                          src={group.image}
                          alt={group.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-semibold text-lsl-ink">
                        {group.productName}
                      </p>
                      <p className="font-mono text-[11px] uppercase text-lsl-graphite">
                        {group.sku}
                      </p>
                      <p className="mt-1 text-sm font-medium text-lsl-ink tabular-nums">
                        ${group.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-2 border-t border-lsl-stone/70 pt-3">
                    {group.variants.map((v) => (
                      <li
                        key={v.id}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="min-w-0 truncate text-lsl-graphite">
                          {v.color} · {v.size}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(v.id, v.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="grid h-7 w-7 place-items-center rounded-md border border-lsl-stone text-lsl-graphite transition-colors hover:border-lsl-ink hover:text-lsl-ink disabled:opacity-40"
                            disabled={v.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" strokeWidth={2} />
                          </button>
                          <span className="w-7 text-center font-mono tabular-nums">
                            {v.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(v.id, v.quantity + 1)}
                            aria-label="Increase quantity"
                            className="grid h-7 w-7 place-items-center rounded-md border border-lsl-stone text-lsl-graphite transition-colors hover:border-lsl-ink hover:text-lsl-ink"
                          >
                            <Plus className="h-3 w-3" strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(v.id)}
                            aria-label="Remove variant"
                            className="ml-1 grid h-7 w-7 place-items-center rounded-md text-lsl-graphite transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" strokeWidth={2} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="mt-6 space-y-3 border-t border-lsl-stone pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-lsl-graphite">Estimated subtotal</span>
              <span className="font-display text-2xl font-semibold tabular-nums text-lsl-ink">
                ${total.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-lsl-graphite">
              Final pricing confirmed after we review your logos and quantities. No charges until you approve a proof.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={onCheckout}
              className="w-full"
            >
              Continue to Order Builder
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function EmptyCart() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-lsl-stone/60 text-lsl-graphite">
        <ShoppingBag className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <p className="mt-4 font-display text-lg font-semibold text-lsl-ink">
        No items yet
      </p>
      <p className="mt-1 max-w-[28ch] text-sm text-lsl-graphite">
        Browse the catalog and add pieces to your project. Your selections save automatically.
      </p>
    </div>
  );
}
