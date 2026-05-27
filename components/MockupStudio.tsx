import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Group,
  Image as KonvaImage,
  Layer,
  Rect,
  Stage,
  Transformer,
} from 'react-konva';
import type Konva from 'konva';
import useImage from 'use-image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Crop,
  Download,
  Info,
  Loader2,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Trash2,
  Upload,
} from 'lucide-react';

import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { colorToHex, isLightColor, normalizeColorKey } from '../lib/colors';
import { useCart } from './CartContext';
import { useCartDrawer } from './CartDrawer';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from './ui/toaster';
import type {
  CatalogProduct,
  MockupPlacement,
  ProductPrintAreas,
} from '../types';

// ─── Constants ───

const DEFAULT_PRINT_AREA = { x: 0.32, y: 0.26, width: 0.36, height: 0.34 };
const STAGE_ASPECT = 1; // square canvas
const MAX_LOGO_BYTES = 8 * 1024 * 1024;
const PRINT_AREA_ID = '__print_area__';
const MIN_PRINT_AREA_FRAC = 0.08; // never shrink below 8% of stage in either dimension
const VIEW_ORDER = ['front', 'side', 'back'] as const;
const VISIBLE_SWATCH_LIMIT = 8;

// ─── Public component ───

interface MockupStudioProps {
  product: CatalogProduct | null;
  onSwitchToQuote?: () => void;
  onNavigateToBuildOrder?: () => void;
}

export const MockupStudio: React.FC<MockupStudioProps> = ({
  product,
  onSwitchToQuote,
  onNavigateToBuildOrder,
}) => {
  if (!product) {
    return <NoProductSelected onSwitchToQuote={onSwitchToQuote} />;
  }
  return (
    <Studio
      product={product}
      onNavigateToBuildOrder={onNavigateToBuildOrder}
    />
  );
};

// ─── Inner studio ───

function Studio({
  product,
  onNavigateToBuildOrder,
}: {
  product: CatalogProduct;
  onNavigateToBuildOrder?: () => void;
}) {
  const { addToCart } = useCart();
  const { openDrawer } = useCartDrawer();
  const { user, organization, isAuthenticated, openAuthModal } = useAuth();
  void onNavigateToBuildOrder; // Add-to-project now stays on this page.

  // Available angles, derived from `image_variants` with stable Front→Side→Back ordering.
  // Filter out "on model" variants — only flat product shots are editable; you
  // can't drop a logo onto a posed model photo and have it look right.
  const angles = useMemo(() => {
    const fromVariants = product.image_variants
      ? Object.keys(product.image_variants)
      : [];
    const flat = fromVariants.filter((v) => !/model/i.test(v));
    if (!flat.length) return product.images?.length ? ['front'] : [];
    const ordered: string[] = [];
    for (const target of VIEW_ORDER) {
      const found = flat.find((v) => v.toLowerCase() === target);
      if (found) ordered.push(found);
    }
    for (const v of flat) if (!ordered.includes(v)) ordered.push(v);
    return ordered;
  }, [product]);

  const printAreas: ProductPrintAreas = useMemo(() => {
    if (product.print_areas && Object.keys(product.print_areas).length) {
      return product.print_areas;
    }
    const synth: ProductPrintAreas = {};
    for (const a of angles) synth[a] = DEFAULT_PRINT_AREA;
    return synth;
  }, [product, angles]);

  const [activeAngle, setActiveAngle] = useState<string>(angles[0] ?? 'front');
  const [activeColor, setActiveColor] = useState<string>(
    product.base_color ?? product.colors[0] ?? 'Black',
  );

  // In-page cart form state.
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes[0] ?? '',
  );
  const [quantity, setQuantity] = useState<number>(12);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Public URLs of raw logo files the customer has uploaded during this session.
  const [uploadedLogoUrls, setUploadedLogoUrls] = useState<string[]>([]);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Track which (product, color) pairs we've already snapshotted to the Portal
  // Mockups folder in this session, so adding multiple sizes of the same shirt
  // doesn't spam duplicate files.
  const savedMockupKeys = useRef<Set<string>>(new Set());

  // Placements live globally across views — they sit at the same canvas coords
  // regardless of which angle the user is looking at.
  const [placements, setPlacements] = useState<MockupPlacement[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Print-area edit mode. While ON, the placements layer is dimmed + locked
  // and the print-area Rect (on its own layer above) becomes interactive.
  const [isEditingPrintArea, setIsEditingPrintArea] = useState(false);

  // Customer overrides for the print area, per angle.
  const [printAreaOverrides, setPrintAreaOverrides] = useState<ProductPrintAreas>({});
  const currentPrintArea = useMemo(
    () =>
      printAreaOverrides[activeAngle] ??
      printAreas[activeAngle] ??
      DEFAULT_PRINT_AREA,
    [printAreaOverrides, printAreas, activeAngle],
  );
  const setPrintAreaForActiveAngle = useCallback(
    (next: { x: number; y: number; width: number; height: number }) => {
      const clamped = {
        x: Math.max(0, Math.min(1 - MIN_PRINT_AREA_FRAC, next.x)),
        y: Math.max(0, Math.min(1 - MIN_PRINT_AREA_FRAC, next.y)),
        width: Math.max(MIN_PRINT_AREA_FRAC, Math.min(1 - next.x, next.width)),
        height: Math.max(MIN_PRINT_AREA_FRAC, Math.min(1 - next.y, next.height)),
      };
      setPrintAreaOverrides((prev) => ({ ...prev, [activeAngle]: clamped }));
    },
    [activeAngle],
  );
  const resetPrintArea = useCallback(() => {
    setPrintAreaOverrides((prev) => {
      const next = { ...prev };
      delete next[activeAngle];
      return next;
    });
  }, [activeAngle]);
  const isPrintAreaCustomized = !!printAreaOverrides[activeAngle];

  // Canvas sizing: fill the available column, square.
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 600, height: 600 });
  useLayoutEffect(() => {
    if (!stageWrapRef.current) return;
    const el = stageWrapRef.current;
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width);
      const h = Math.floor(w / STAGE_ASPECT);
      setStageSize({ width: w, height: h });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stageRef = useRef<Konva.Stage>(null);

  // Resolve the active product image — no tinting fallback, just first-color fallback.
  const resolvedImageUrl = useMemo(() => {
    const colorKey = normalizeColorKey(activeColor);
    const variantsForAngle = product.image_variants?.[activeAngle];
    if (variantsForAngle) {
      if (variantsForAngle[colorKey]) return variantsForAngle[colorKey];
      const firstKey = Object.keys(variantsForAngle)[0];
      if (firstKey) return variantsForAngle[firstKey];
    }
    return product.images?.[0] ?? null;
  }, [activeAngle, activeColor, product]);

  // ─── Mutations ───

  const upsertPlacement = useCallback((next: MockupPlacement) => {
    setPlacements((current) => {
      const exists = current.some((p) => p.id === next.id);
      return exists
        ? current.map((p) => (p.id === next.id ? next : p))
        : [...current, next];
    });
  }, []);

  const removePlacement = useCallback(
    (id: string) => {
      setPlacements((current) => current.filter((p) => p.id !== id));
      if (selectedId === id) setSelectedId(null);
    },
    [selectedId],
  );

  const duplicatePlacement = useCallback((id: string) => {
    setPlacements((current) => {
      const target = current.find((p) => p.id === id);
      if (!target) return current;
      const dup: MockupPlacement = {
        ...target,
        id: `${target.id}-${Date.now().toString(36)}`,
        x: target.x + 24,
        y: target.y + 24,
      };
      return [...current, dup];
    });
  }, []);

  const fitToPrintArea = useCallback(
    (id: string) => {
      const area = currentPrintArea;
      setPlacements((current) =>
        current.map((p) =>
          p.id === id
            ? {
                ...p,
                x: area.x * stageSize.width,
                y: area.y * stageSize.height,
                width: area.width * stageSize.width,
                height: area.height * stageSize.height,
                rotation: 0,
              }
            : p,
        ),
      );
    },
    [currentPrintArea, stageSize],
  );

  // ─── Logo upload ───

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!arr.length) {
      toast.error('Pick an image file', { description: 'PNG, JPG, or SVG.' });
      return;
    }
    setIsUploadingLogo(true);
    let placedAnyWithoutOrg = false;
    try {
      for (const file of arr) {
        if (file.size > MAX_LOGO_BYTES) {
          toast.error(`${file.name} is too large`, {
            description: 'Max logo size is 8MB.',
          });
          continue;
        }
        const dataUrl = await fileToDataUrl(file);
        const intrinsic = await measureImage(dataUrl);
        const area = currentPrintArea;
        const placementWidth = area.width * stageSize.width;
        const aspect = intrinsic.width / intrinsic.height || 1;
        const placementHeight = placementWidth / aspect;
        const placement: MockupPlacement = {
          id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
          imageDataUrl: dataUrl,
          x: area.x * stageSize.width + (area.width * stageSize.width - placementWidth) / 2,
          y: area.y * stageSize.height + (area.height * stageSize.height - placementHeight) / 2,
          width: placementWidth,
          height: placementHeight,
          rotation: 0,
          opacity: 1,
        };
        upsertPlacement(placement);
        setSelectedId(placement.id);

        // Persist to the canonical brand-assets bucket only when signed in
        // AND a real org exists. Otherwise, canvas-only preview.
        if (!isAuthenticated || !user || !organization) {
          placedAnyWithoutOrg = true;
          continue;
        }

        const ext = file.name.split('.').pop() || 'png';
        const safeName = file.name
          .replace(/\.[^.]+$/, '')
          .replace(/[^a-zA-Z0-9-_]+/g, '-')
          .slice(0, 60);
        const path = `${organization.id}/Brand Assets/mockup-${user.id}-${Date.now()}-${safeName}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('organization-assets')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
          });
        if (uploadError) {
          toast.error(`Couldn't save ${file.name}`, { description: uploadError.message });
          continue;
        }
        const { data } = supabase.storage
          .from('organization-assets')
          .getPublicUrl(path);

        // Register the upload in media_items so the Portal's MediaPicker
        // (filtered by organization_id + category='Brand Assets') finds it.
        const { error: mediaError } = await supabase.from('media_items').insert({
          organization_id: organization.id,
          uploader_id: user.id,
          file_path: path,
          file_name: file.name,
          file_type: file.type,
          size: file.size,
          category: 'Brand Assets',
        });
        if (mediaError) {
          // Non-fatal — the file is in Storage; just log so the customer
          // doesn't see a scary toast over a metadata write hiccup.
          console.warn('media_items insert failed', mediaError);
        }

        setUploadedLogoUrls((prev) =>
          prev.includes(data.publicUrl) ? prev : [...prev, data.publicUrl],
        );
      }
      if (placedAnyWithoutOrg) {
        toast.message("Sign up and we'll save your logo to your brand assets.", {
          description: 'You can keep designing — we just need an account to send it to production.',
          action: { label: 'Sign in', onClick: () => openAuthModal() },
        });
      }
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.length) return;
    handleFiles(e.dataTransfer.files);
  };

  // ─── Keyboard nudging ───

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      const step = e.shiftKey ? 10 : 1;
      const isArea = selectedId === PRINT_AREA_ID;
      const nudgeArea = (dx: number, dy: number) =>
        setPrintAreaForActiveAngle({
          x: currentPrintArea.x + dx / stageSize.width,
          y: currentPrintArea.y + dy / stageSize.height,
          width: currentPrintArea.width,
          height: currentPrintArea.height,
        });
      let handled = true;
      switch (e.key) {
        case 'ArrowLeft':
          if (isArea) nudgeArea(-step, 0);
          else
            setPlacements((cur) =>
              cur.map((p) => (p.id === selectedId ? { ...p, x: p.x - step } : p)),
            );
          break;
        case 'ArrowRight':
          if (isArea) nudgeArea(step, 0);
          else
            setPlacements((cur) =>
              cur.map((p) => (p.id === selectedId ? { ...p, x: p.x + step } : p)),
            );
          break;
        case 'ArrowUp':
          if (isArea) nudgeArea(0, -step);
          else
            setPlacements((cur) =>
              cur.map((p) => (p.id === selectedId ? { ...p, y: p.y - step } : p)),
            );
          break;
        case 'ArrowDown':
          if (isArea) nudgeArea(0, step);
          else
            setPlacements((cur) =>
              cur.map((p) => (p.id === selectedId ? { ...p, y: p.y + step } : p)),
            );
          break;
        case 'Delete':
        case 'Backspace':
          if (!isArea) removePlacement(selectedId);
          break;
        default:
          handled = false;
      }
      if (handled) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, currentPrintArea, stageSize]);

  // ─── Add to project (stays on page) ───

  const handleAddToProject = async () => {
    if (!stageRef.current) return;
    if (!isAuthenticated) {
      toast.message('Sign in to send this to production', {
        description: 'Your project lives on your account so we can quote and confirm.',
        action: { label: 'Sign in', onClick: () => openAuthModal() },
      });
    }
    if (!selectedSize) {
      toast.error('Pick a size first');
      return;
    }
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    setIsAddingToCart(true);
    try {
      setSelectedId(null);
      // Exit print-area edit mode so its transform handles don't render into
      // the exported PNG either.
      setIsEditingPrintArea(false);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const mockupUrl = stageRef.current.toDataURL({
        pixelRatio: 2,
        mimeType: 'image/png',
      });

      // Save one mockup per (product, color) to the Portal Mockups folder.
      // Multiple sizes of the same shirt share the same artwork, so we dedupe
      // by productId+color within this session.
      const mockupKey = `${product.id}::${activeColor}`;
      if (
        isAuthenticated &&
        user &&
        organization &&
        !savedMockupKeys.current.has(mockupKey)
      ) {
        const blob = dataUrlToBlob(mockupUrl);
        const colorSlug = slugify(activeColor);
        const productSlug = product.slug || slugify(product.name);
        const path = `${organization.id}/Mockups/${productSlug}-${colorSlug}-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from('organization-assets')
          .upload(path, blob, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/png',
          });
        if (uploadError) {
          console.warn('Mockup upload failed', uploadError);
        } else {
          const { error: mediaError } = await supabase.from('media_items').insert({
            organization_id: organization.id,
            uploader_id: user.id,
            file_path: path,
            file_name: `${product.name} – ${activeColor}.png`,
            file_type: 'image/png',
            size: blob.size,
            category: 'Mockups',
          });
          if (mediaError) {
            console.warn('media_items insert failed', mediaError);
          } else {
            savedMockupKeys.current.add(mockupKey);
          }
        }
      }

      addToCart({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        color: activeColor,
        size: selectedSize,
        quantity,
        basePrice: product.base_price,
        image: resolvedImageUrl ?? product.images?.[0] ?? null,
        mockupUrl,
        sourceLogoUrls: uploadedLogoUrls,
        printArea: { angle: activeAngle, ...currentPrintArea },
      });

      toast.success('Added to project', {
        description: `${quantity}× ${product.name} · ${activeColor} · ${selectedSize}`,
        action: { label: 'View cart', onClick: openDrawer },
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleDownload = async () => {
    if (!stageRef.current) return;
    setSelectedId(null);
    setIsEditingPrintArea(false);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    const dataUrl = stageRef.current.toDataURL({
      pixelRatio: 2,
      mimeType: 'image/png',
    });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${product.slug}-${activeAngle}-mockup.png`;
    a.click();
  };

  // ─── Render ───

  const selected = placements.find((p) => p.id === selectedId) ?? null;
  const printArea = currentPrintArea;
  const lightActiveColor = isLightColor(activeColor);

  return (
    <div className="min-h-screen bg-lsl-cream pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-sans text-sm font-semibold text-lsl-navy">
              Mockup Studio
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-lsl-ink md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-1 text-sm text-lsl-graphite">
              Drop a logo into the print area. Use the toolbar to resize the print area if you need to move where it lands.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={handleDownload}>
              <Download className="h-4 w-4" strokeWidth={1.75} /> Download PNG
            </Button>
          </div>
        </div>

        {/* Top toolbar */}
        <StudioToolbar
          angles={angles}
          activeAngle={activeAngle}
          onAngleChange={(a) => {
            setActiveAngle(a);
            setSelectedId(null);
          }}
          colors={product.colors}
          activeColor={activeColor}
          onColorChange={setActiveColor}
          isEditingPrintArea={isEditingPrintArea}
          isPrintAreaCustomized={isPrintAreaCustomized}
          onTogglePrintAreaEdit={() => {
            setIsEditingPrintArea((v) => {
              const next = !v;
              if (next) setSelectedId(PRINT_AREA_ID);
              else if (selectedId === PRINT_AREA_ID) setSelectedId(null);
              return next;
            });
          }}
          onResetPrintArea={() => {
            resetPrintArea();
            if (selectedId === PRINT_AREA_ID) setSelectedId(null);
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Canvas */}
          <div
            ref={stageWrapRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="relative overflow-hidden rounded-2xl border border-lsl-stone bg-white shadow-lsl-card"
            style={{ aspectRatio: `${STAGE_ASPECT} / 1` }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedId(null);
            }}
          >
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              onMouseDown={(e) => {
                if (e.target === e.target.getStage()) {
                  if (!isEditingPrintArea) setSelectedId(null);
                }
              }}
              onTouchStart={(e) => {
                if (e.target === e.target.getStage()) {
                  if (!isEditingPrintArea) setSelectedId(null);
                }
              }}
            >
              {/* Product image — never listens to events. */}
              <Layer listening={false}>
                <ProductLayer
                  imageUrl={resolvedImageUrl}
                  stageSize={stageSize}
                />
              </Layer>

              {/* Placements — dimmed + non-draggable when editing the print area. */}
              <Layer opacity={isEditingPrintArea ? 0.6 : 1}>
                <Group
                  clipFunc={(ctx) => {
                    const px = printArea.x * stageSize.width;
                    const py = printArea.y * stageSize.height;
                    const pw = printArea.width * stageSize.width;
                    const ph = printArea.height * stageSize.height;
                    ctx.rect(px, py, pw, ph);
                  }}
                >
                  {placements.map((p) => (
                    <PlacementImage
                      key={p.id}
                      placement={p}
                      isSelected={!isEditingPrintArea && p.id === selectedId}
                      draggable={!isEditingPrintArea}
                      onSelect={() => {
                        if (!isEditingPrintArea) setSelectedId(p.id);
                      }}
                      onChange={(next) => upsertPlacement(next)}
                    />
                  ))}
                </Group>
              </Layer>

              {/* Print area — its OWN layer above placements. The whole layer
                  ignores hits unless we're in edit mode, so the dashed border
                  is a pure visual cue otherwise and logos remain clickable. */}
              <Layer listening={isEditingPrintArea}>
                <EditablePrintArea
                  printArea={printArea}
                  stageSize={stageSize}
                  light={lightActiveColor}
                  isEditing={isEditingPrintArea}
                  isSelected={isEditingPrintArea && selectedId === PRINT_AREA_ID}
                  onSelect={() => {
                    if (isEditingPrintArea) setSelectedId(PRINT_AREA_ID);
                  }}
                  onChange={setPrintAreaForActiveAngle}
                />
              </Layer>
            </Stage>

            {placements.length === 0 && !isEditingPrintArea && (
              <DropHint onClick={() => fileInputRef.current?.click()} />
            )}

            {isEditingPrintArea && (
              <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-lsl-ink/90 px-3 py-1 font-sans text-xs font-medium text-lsl-cream shadow-lsl-card">
                Editing print area
              </div>
            )}
          </div>

          {/* Right rail — Logos (upload + layers), Inspector, Add to project */}
          <aside className="space-y-4">
            <PanelSection title="Logos">
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="w-full"
                >
                  {isUploadingLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                  ) : (
                    <Upload className="h-4 w-4" strokeWidth={1.75} />
                  )}
                  {isUploadingLogo ? 'Uploading…' : 'Upload logo'}
                </Button>
                {placements.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-lsl-stone bg-lsl-cream/40 px-3 py-3 text-center text-xs text-lsl-graphite">
                    PNG, JPG or SVG · up to 8MB. Drag onto the canvas too.
                  </p>
                ) : (
                <ul className="space-y-1.5">
                  {placements
                    .slice()
                    .reverse()
                    .map((p, i) => {
                      const stackIndex = placements.length - i;
                      const active = p.id === selectedId;
                      return (
                        <li key={p.id}>
                          <div
                            className={cn(
                              'flex items-center gap-2 rounded-lg border px-2 py-2 transition-colors',
                              active
                                ? 'border-lsl-ink bg-lsl-cream'
                                : 'border-lsl-stone bg-white hover:border-lsl-ink/40',
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingPrintArea(false);
                                setSelectedId(p.id);
                              }}
                              className="flex min-w-0 flex-1 items-center gap-2 text-left"
                            >
                              <span className="grid h-7 w-7 flex-shrink-0 place-items-center overflow-hidden rounded-md border border-lsl-stone bg-white">
                                <img
                                  src={p.imageDataUrl}
                                  alt=""
                                  className="h-full w-full object-contain"
                                />
                              </span>
                              <span className="min-w-0 flex-1 truncate font-sans text-sm text-lsl-graphite">
                                Logo {stackIndex}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => duplicatePlacement(p.id)}
                              aria-label="Duplicate"
                              className="grid h-7 w-7 place-items-center rounded-md text-lsl-graphite transition-colors hover:bg-lsl-stone/60 hover:text-lsl-ink"
                            >
                              <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                            </button>
                            <button
                              type="button"
                              onClick={() => fitToPrintArea(p.id)}
                              aria-label="Fit to print area"
                              className="grid h-7 w-7 place-items-center rounded-md text-lsl-graphite transition-colors hover:bg-lsl-stone/60 hover:text-lsl-ink"
                            >
                              <Maximize2
                                className="h-3.5 w-3.5"
                                strokeWidth={1.75}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => removePlacement(p.id)}
                              aria-label="Delete"
                              className="grid h-7 w-7 place-items-center rounded-md text-lsl-graphite transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2
                                className="h-3.5 w-3.5"
                                strokeWidth={1.75}
                              />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                </ul>
                )}
              </div>
            </PanelSection>

            {selected && !isEditingPrintArea && (
              <PanelSection title="Selected">
                <PlacementInspector
                  placement={selected}
                  stageSize={stageSize}
                  onChange={(next) => upsertPlacement(next)}
                />
              </PanelSection>
            )}

            <PanelSection title="Add to project">
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <div className="space-y-1">
                    <label className="font-sans text-xs font-medium text-lsl-graphite">
                      Size
                    </label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="h-10 w-full rounded-lg border border-lsl-stone bg-white px-3 text-sm text-lsl-ink focus:outline-none focus:ring-2 focus:ring-lsl-navy/30"
                    >
                      {product.sizes.length === 0 ? (
                        <option value="">No sizes</option>
                      ) : (
                        product.sizes.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-sans text-xs font-medium text-lsl-graphite">
                      Qty
                    </label>
                    <div className="flex h-10 items-center rounded-lg border border-lsl-stone bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        className="grid h-full w-9 place-items-center text-lsl-graphite hover:text-lsl-ink"
                      >
                        <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                        }
                        className="h-full w-14 border-0 bg-transparent text-center font-sans text-sm tabular-nums text-lsl-ink focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        aria-label="Increase quantity"
                        className="grid h-full w-9 place-items-center text-lsl-graphite hover:text-lsl-ink"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-lsl-cream/60 px-3 py-2 text-xs text-lsl-graphite">
                  <span className="text-lsl-ink font-medium">{activeColor}</span>
                  <span className="tabular-nums">
                    ${product.base_price.toFixed(2)}
                    <span className="text-lsl-graphite"> / unit</span>
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleAddToProject}
                  disabled={isAddingToCart || product.sizes.length === 0}
                  className="w-full"
                >
                  {isAddingToCart ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                  ) : (
                    <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
                  )}
                  {isAddingToCart ? 'Adding…' : 'Add to project'}
                </Button>
                <div className="flex items-start gap-2 rounded-lg border border-lsl-thread/30 bg-lsl-thread/8 px-3 py-2.5">
                  <Info
                    className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-lsl-thread"
                    strokeWidth={2}
                  />
                  <p className="text-xs leading-relaxed text-lsl-graphite">
                    <span className="font-medium text-lsl-ink">Designs and pricing aren&apos;t final.</span>{' '}
                    This is a quick mockup so you and our design team can see what you&apos;re going for — we&apos;ll refine the artwork and confirm the price with you before anything is paid.
                  </p>
                </div>
              </div>
            </PanelSection>

            <p className="px-1 text-xs leading-relaxed text-lsl-graphite/80">
              <Crop className="-mt-0.5 mr-1 inline h-3 w-3" strokeWidth={2} />
              Logo is clipped to the print area. Use ↑↓←→ to nudge (Shift = 10px), Backspace to delete.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Top toolbar ───

function StudioToolbar({
  angles,
  activeAngle,
  onAngleChange,
  colors,
  activeColor,
  onColorChange,
  isEditingPrintArea,
  isPrintAreaCustomized,
  onTogglePrintAreaEdit,
  onResetPrintArea,
}: {
  angles: string[];
  activeAngle: string;
  onAngleChange: (a: string) => void;
  colors: string[];
  activeColor: string;
  onColorChange: (c: string) => void;
  isEditingPrintArea: boolean;
  isPrintAreaCustomized: boolean;
  onTogglePrintAreaEdit: () => void;
  onResetPrintArea: () => void;
}) {
  const visibleColors = colors.slice(0, VISIBLE_SWATCH_LIMIT);
  const overflowColors = colors.slice(VISIBLE_SWATCH_LIMIT);
  const [colorsOpen, setColorsOpen] = useState(false);
  const colorPopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!colorsOpen) return;
    const onClickAway = (e: MouseEvent) => {
      if (!colorPopRef.current) return;
      if (!colorPopRef.current.contains(e.target as Node)) setColorsOpen(false);
    };
    window.addEventListener('mousedown', onClickAway);
    return () => window.removeEventListener('mousedown', onClickAway);
  }, [colorsOpen]);

  return (
    <div className="mt-6 rounded-2xl border border-lsl-stone bg-white p-3 shadow-lsl-card">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
        {/* View — segmented pill control */}
        {angles.length > 1 && (
          <div className="flex items-center gap-1 rounded-full bg-lsl-cream/70 p-1">
            {angles.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onAngleChange(a)}
                aria-pressed={a === activeAngle}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-all',
                  a === activeAngle
                    ? 'bg-lsl-ink text-lsl-cream shadow-sm'
                    : 'text-lsl-graphite hover:text-lsl-ink',
                )}
              >
                {a}
              </button>
            ))}
          </div>
        )}

        {/* Color */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex items-center gap-1.5">
            {visibleColors.map((c) => {
              const hex = colorToHex(c);
              const active = c === activeColor;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onColorChange(c)}
                  aria-pressed={active}
                  title={c}
                  className={cn(
                    'relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border-2 transition-all',
                    active
                      ? 'border-lsl-ink shadow-lsl-lift'
                      : 'border-lsl-stone hover:border-lsl-ink/60',
                  )}
                  style={{ background: hex }}
                >
                  <span className="sr-only">{c}</span>
                </button>
              );
            })}
            {overflowColors.length > 0 && (
              <div className="relative" ref={colorPopRef}>
                <button
                  type="button"
                  onClick={() => setColorsOpen((v) => !v)}
                  className="flex h-8 items-center gap-1 rounded-full border border-lsl-stone bg-white px-3 font-sans text-xs font-medium text-lsl-graphite transition-colors hover:border-lsl-ink hover:text-lsl-ink"
                >
                  +{overflowColors.length}
                  <ChevronDown className="h-3 w-3" strokeWidth={2} />
                </button>
                {colorsOpen && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-xl border border-lsl-stone bg-white p-3 shadow-lsl-lift">
                    <div className="grid grid-cols-7 gap-1.5">
                      {colors.map((c) => {
                        const hex = colorToHex(c);
                        const active = c === activeColor;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              onColorChange(c);
                              setColorsOpen(false);
                            }}
                            title={c}
                            className={cn(
                              'relative aspect-square overflow-hidden rounded-full border-2 transition-transform',
                              active
                                ? 'scale-110 border-lsl-ink'
                                : 'border-lsl-stone hover:border-lsl-ink',
                            )}
                            style={{ background: hex }}
                          >
                            <span className="sr-only">{c}</span>
                            {active && (
                              <span className="absolute inset-0 grid place-items-center">
                                <Check
                                  className={cn(
                                    'h-3 w-3',
                                    isLightColor(c) ? 'text-lsl-ink' : 'text-lsl-cream',
                                  )}
                                  strokeWidth={3}
                                />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 truncate font-sans text-xs text-lsl-graphite">
                      Active · <span className="text-lsl-ink">{activeColor}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <span className="hidden truncate text-sm text-lsl-graphite md:inline">
            {activeColor}
          </span>
        </div>

        {/* Print area — compact segmented + icon reset */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-full bg-lsl-cream/70 p-1">
            <button
              type="button"
              onClick={() => {
                if (isEditingPrintArea) onTogglePrintAreaEdit();
              }}
              aria-pressed={!isEditingPrintArea}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                !isEditingPrintArea
                  ? 'bg-lsl-ink text-lsl-cream shadow-sm'
                  : 'text-lsl-graphite hover:text-lsl-ink',
              )}
            >
              Print area
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isEditingPrintArea) onTogglePrintAreaEdit();
              }}
              aria-pressed={isEditingPrintArea}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                isEditingPrintArea
                  ? 'bg-lsl-ink text-lsl-cream shadow-sm'
                  : 'text-lsl-graphite hover:text-lsl-ink',
              )}
            >
              Resize
            </button>
          </div>
          {isPrintAreaCustomized && (
            <button
              type="button"
              onClick={onResetPrintArea}
              aria-label="Reset print area to default"
              title="Reset print area to default"
              className="grid h-8 w-8 place-items-center rounded-full border border-lsl-stone bg-white text-lsl-graphite transition-colors hover:border-lsl-ink hover:text-lsl-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stage children ───

function ProductLayer({
  imageUrl,
  stageSize,
}: {
  imageUrl: string | null;
  stageSize: { width: number; height: number };
}) {
  const [img] = useImage(imageUrl ?? '', 'anonymous');

  if (!img) {
    return (
      <Rect
        x={0}
        y={0}
        width={stageSize.width}
        height={stageSize.height}
        fill="#F7F4EE"
      />
    );
  }

  // Fit the product image inside the stage, preserving aspect ratio.
  const ratio = img.width / img.height;
  const stageRatio = stageSize.width / stageSize.height;
  let w = stageSize.width;
  let h = stageSize.height;
  if (ratio > stageRatio) {
    h = stageSize.width / ratio;
  } else {
    w = stageSize.height * ratio;
  }
  const x = (stageSize.width - w) / 2;
  const y = (stageSize.height - h) / 2;

  return <KonvaImage image={img} x={x} y={y} width={w} height={h} />;
}

function EditablePrintArea({
  printArea,
  stageSize,
  light,
  isEditing,
  isSelected,
  onSelect,
  onChange,
}: {
  printArea: { x: number; y: number; width: number; height: number };
  stageSize: { width: number; height: number };
  light: boolean;
  isEditing: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (next: { x: number; y: number; width: number; height: number }) => void;
}) {
  const rectRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isEditing && isSelected && transformerRef.current && rectRef.current) {
      transformerRef.current.nodes([rectRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isEditing, isSelected]);

  const px = printArea.x * stageSize.width;
  const py = printArea.y * stageSize.height;
  const pw = printArea.width * stageSize.width;
  const ph = printArea.height * stageSize.height;

  const baseStroke = light ? 'rgba(11,11,14,0.45)' : 'rgba(247,244,238,0.75)';
  const editStroke = '#003380';

  return (
    <>
      <Rect
        ref={rectRef}
        x={px}
        y={py}
        width={pw}
        height={ph}
        stroke={isEditing ? editStroke : baseStroke}
        strokeWidth={isEditing ? 1.5 : 1}
        dash={isEditing ? [4, 3] : [6, 4]}
        fillEnabled={false}
        hitStrokeWidth={isEditing ? 14 : 0}
        draggable={isEditing}
        onMouseDown={isEditing ? onSelect : undefined}
        onTap={isEditing ? onSelect : undefined}
        onDragEnd={(e) => {
          const node = e.target;
          onChange({
            x: node.x() / stageSize.width,
            y: node.y() / stageSize.height,
            width: printArea.width,
            height: printArea.height,
          });
        }}
        onTransformEnd={() => {
          const node = rectRef.current;
          if (!node) return;
          const sx = node.scaleX();
          const sy = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x() / stageSize.width,
            y: node.y() / stageSize.height,
            width: (node.width() * sx) / stageSize.width,
            height: (node.height() * sy) / stageSize.height,
          });
        }}
        perfectDrawEnabled={false}
      />
      {isEditing && isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'middle-left',
            'middle-right',
            'top-center',
            'bottom-center',
          ]}
          anchorStroke="#003380"
          anchorFill="#F7F4EE"
          anchorSize={9}
          borderStroke="#003380"
          borderDash={[4, 4]}
          boundBoxFunc={(_oldBox, newBox) => {
            const minPx = MIN_PRINT_AREA_FRAC * stageSize.width;
            if (newBox.width < minPx || newBox.height < minPx) return _oldBox;
            if (newBox.x < 0 || newBox.y < 0) return _oldBox;
            if (newBox.x + newBox.width > stageSize.width) return _oldBox;
            if (newBox.y + newBox.height > stageSize.height) return _oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

function PlacementImage({
  placement,
  isSelected,
  draggable,
  onSelect,
  onChange,
}: {
  placement: MockupPlacement;
  isSelected: boolean;
  draggable: boolean;
  onSelect: () => void;
  onChange: (next: MockupPlacement) => void;
}) {
  const [img] = useImage(placement.imageDataUrl);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={img}
        x={placement.x}
        y={placement.y}
        width={placement.width}
        height={placement.height}
        rotation={placement.rotation}
        opacity={placement.opacity}
        draggable={draggable}
        onMouseDown={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({ ...placement, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = imageRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...placement,
            x: node.x(),
            y: node.y(),
            width: Math.max(12, node.width() * scaleX),
            height: Math.max(12, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled
          keepRatio
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
          ]}
          anchorStroke="#003380"
          anchorFill="#F7F4EE"
          anchorSize={10}
          borderStroke="#003380"
          borderDash={[4, 4]}
          rotateAnchorOffset={28}
          boundBoxFunc={(_oldBox, newBox) => {
            if (newBox.width < 12 || newBox.height < 12) return _oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

// ─── Side panel pieces ───

function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-lsl-stone bg-white p-4 shadow-lsl-card">
      <h3 className="mb-3 font-sans text-xs font-semibold text-lsl-graphite">
        {title}
      </h3>
      {children}
    </section>
  );
}

function PlacementInspector({
  placement,
  stageSize,
  onChange,
}: {
  placement: MockupPlacement;
  stageSize: { width: number; height: number };
  onChange: (next: MockupPlacement) => void;
}) {
  const setRotation = (deg: number) =>
    onChange({ ...placement, rotation: ((deg % 360) + 360) % 360 });
  const setOpacity = (op: number) =>
    onChange({ ...placement, opacity: Math.max(0.1, Math.min(1, op)) });

  return (
    <div className="space-y-3">
      <NumberRow
        label="Rotation"
        suffix="°"
        value={Math.round(placement.rotation)}
        min={-180}
        max={180}
        onChange={setRotation}
      />
      <NumberRow
        label="Opacity"
        suffix=""
        value={Math.round(placement.opacity * 100)}
        min={10}
        max={100}
        step={5}
        onChange={(v) => setOpacity(v / 100)}
      />
      <NumberRow
        label="Width"
        suffix="px"
        value={Math.round(placement.width)}
        min={12}
        max={stageSize.width}
        onChange={(v) => {
          const aspect = placement.width / placement.height || 1;
          onChange({ ...placement, width: v, height: Math.max(12, v / aspect) });
        }}
      />
    </div>
  );
}

function NumberRow({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-sans text-xs font-medium text-lsl-graphite">
          {label}
        </span>
        <span className="font-sans text-[11px] tabular-nums text-lsl-ink">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-lsl-navy"
      />
    </label>
  );
}

function DropHint({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-lsl-cream/0 text-center"
    >
      <span className="grid h-14 w-14 place-items-center rounded-full border border-dashed border-lsl-stone bg-white/80 text-lsl-graphite backdrop-blur-sm">
        <Upload className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div>
        <p className="font-display text-lg font-semibold text-lsl-ink">
          Drop a logo to start
        </p>
        <p className="mt-0.5 text-xs text-lsl-graphite">
          Or click to choose a file. We&apos;ll clip it to the print area.
        </p>
      </div>
    </motion.button>
  );
}

function NoProductSelected({
  onSwitchToQuote,
}: {
  onSwitchToQuote?: () => void;
}) {
  return (
    <div className="min-h-screen bg-lsl-cream pt-28 pb-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="font-sans text-sm font-semibold text-lsl-navy">
          Mockup Studio
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-lsl-ink">
          Pick a product to start.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-lsl-graphite">
          Open any product in the catalog and tap{' '}
          <span className="font-medium text-lsl-ink">Customize</span> to launch the editor for that item.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={onSwitchToQuote}
            className="min-w-[220px]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Browse catalog
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ───

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function measureImage(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 600, height: 600 });
    img.src = src;
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(',');
  const mimeMatch = meta.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';
}

