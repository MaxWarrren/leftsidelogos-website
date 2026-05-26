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
  Copy,
  Crop,
  Download,
  Maximize2,
  ShoppingBag,
  Trash2,
  Upload,
} from 'lucide-react';

import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { colorToHex, isLightColor, normalizeColorKey } from '../lib/colors';
import { useCart } from './CartContext';
import { useCartDrawer } from './CartDrawer';
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

  // Available angles, derived from `image_variants` (falls back to a synthetic "front" using images[0]).
  const angles = useMemo(() => {
    const fromVariants = product.image_variants
      ? Object.keys(product.image_variants)
      : [];
    if (fromVariants.length) return fromVariants;
    return product.images?.length ? ['front'] : [];
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

  // Per-angle placements. Each entry is the layer stack for that view.
  const [placementsByAngle, setPlacementsByAngle] = useState<
    Record<string, MockupPlacement[]>
  >(() => Object.fromEntries(angles.map((a) => [a, [] as MockupPlacement[]])));
  const placements = placementsByAngle[activeAngle] ?? [];

  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  // Resolve the active product image (variant if present, else first images array entry).
  const resolvedImageUrl = useMemo(() => {
    const colorKey = normalizeColorKey(activeColor);
    const variantsForAngle = product.image_variants?.[activeAngle];
    if (variantsForAngle) {
      if (variantsForAngle[colorKey]) return variantsForAngle[colorKey];
      // First available color for this angle as fallback.
      const firstKey = Object.keys(variantsForAngle)[0];
      if (firstKey) return variantsForAngle[firstKey];
    }
    return product.images?.[0] ?? null;
  }, [activeAngle, activeColor, product]);

  // True when the currently rendered PNG already represents this color → skip tinting.
  const isExactColorImage = useMemo(() => {
    const colorKey = normalizeColorKey(activeColor);
    return !!product.image_variants?.[activeAngle]?.[colorKey];
  }, [activeAngle, activeColor, product]);

  // ─── Mutations ───

  const updatePlacements = useCallback(
    (mutator: (current: MockupPlacement[]) => MockupPlacement[]) => {
      setPlacementsByAngle((prev) => ({
        ...prev,
        [activeAngle]: mutator(prev[activeAngle] ?? []),
      }));
    },
    [activeAngle],
  );

  const upsertPlacement = (next: MockupPlacement) => {
    updatePlacements((current) => {
      const exists = current.some((p) => p.id === next.id);
      return exists ? current.map((p) => (p.id === next.id ? next : p)) : [...current, next];
    });
  };

  const removePlacement = (id: string) => {
    updatePlacements((current) => current.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicatePlacement = (id: string) => {
    updatePlacements((current) => {
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
  };

  const fitToPrintArea = (id: string) => {
    const area = printAreas[activeAngle] ?? DEFAULT_PRINT_AREA;
    updatePlacements((current) =>
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
  };

  // ─── Logo upload ───

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!arr.length) {
      toast.error('Pick an image file', { description: 'PNG, JPG, or SVG.' });
      return;
    }
    for (const file of arr) {
      if (file.size > MAX_LOGO_BYTES) {
        toast.error(`${file.name} is too large`, {
          description: 'Max logo size is 8MB.',
        });
        continue;
      }
      const dataUrl = await fileToDataUrl(file);
      const intrinsic = await measureImage(dataUrl);
      const area = printAreas[activeAngle] ?? DEFAULT_PRINT_AREA;
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
      let handled = true;
      switch (e.key) {
        case 'ArrowLeft':
          updatePlacements((cur) =>
            cur.map((p) => (p.id === selectedId ? { ...p, x: p.x - step } : p)),
          );
          break;
        case 'ArrowRight':
          updatePlacements((cur) =>
            cur.map((p) => (p.id === selectedId ? { ...p, x: p.x + step } : p)),
          );
          break;
        case 'ArrowUp':
          updatePlacements((cur) =>
            cur.map((p) => (p.id === selectedId ? { ...p, y: p.y - step } : p)),
          );
          break;
        case 'ArrowDown':
          updatePlacements((cur) =>
            cur.map((p) => (p.id === selectedId ? { ...p, y: p.y + step } : p)),
          );
          break;
        case 'Delete':
        case 'Backspace':
          removePlacement(selectedId);
          break;
        default:
          handled = false;
      }
      if (handled) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // ─── Save / export ───

  const handleSave = async () => {
    if (!stageRef.current) return;
    // Deselect so the transform handles don't bleed into the export.
    setSelectedId(null);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    const dataUrl = stageRef.current.toDataURL({
      pixelRatio: 2,
      mimeType: 'image/png',
    });

    // Attach to a new cart line as a quick "this is what I want" mockup.
    addToCart({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      color: activeColor,
      size: product.sizes[0] ?? '—',
      quantity: 12,
      basePrice: product.base_price,
      image: product.images?.[0] ?? null,
      mockupUrl: dataUrl,
    });

    // Stash on session so OrderBuilder can pick it up if user navigates back.
    try {
      sessionStorage.setItem('lsl_last_mockup_url', dataUrl);
    } catch {
      /* ignore quota */
    }

    toast.success('Mockup saved', {
      description: 'Added to your project with the active color and quantity 12. Adjust in the cart.',
      action: { label: 'View cart', onClick: openDrawer },
    });

    if (onNavigateToBuildOrder) {
      // small delay so the user sees the toast
      setTimeout(onNavigateToBuildOrder, 500);
    }
  };

  const handleDownload = async () => {
    if (!stageRef.current) return;
    setSelectedId(null);
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
  const printArea = printAreas[activeAngle] ?? DEFAULT_PRINT_AREA;
  const tintHex = colorToHex(activeColor);
  const lightActiveColor = isLightColor(activeColor);

  return (
    <div className="min-h-screen bg-lsl-cream pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-lsl-navy">
              Mockup Studio
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-lsl-ink md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-1 text-sm text-lsl-graphite">
              Drag a logo onto the print area. Resize and rotate with the handles. Save when you&apos;re happy.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={handleDownload}>
              <Download className="h-4 w-4" strokeWidth={1.75} /> Download PNG
            </Button>
            <Button variant="primary" size="md" onClick={handleSave}>
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} /> Save &amp; add
              to project
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Canvas */}
          <div
            ref={stageWrapRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="relative overflow-hidden rounded-2xl border border-lsl-stone bg-white shadow-lsl-card"
            style={{ aspectRatio: `${STAGE_ASPECT} / 1` }}
            onClick={(e) => {
              // Click outside any layer deselects.
              if (e.target === e.currentTarget) setSelectedId(null);
            }}
          >
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              onMouseDown={(e) => {
                if (e.target === e.target.getStage()) setSelectedId(null);
              }}
              onTouchStart={(e) => {
                if (e.target === e.target.getStage()) setSelectedId(null);
              }}
            >
              <Layer listening={false}>
                <ProductLayer
                  imageUrl={resolvedImageUrl}
                  tintHex={tintHex}
                  applyTint={!isExactColorImage}
                  stageSize={stageSize}
                />
                <PrintAreaGuide
                  printArea={printArea}
                  stageSize={stageSize}
                  light={lightActiveColor}
                />
              </Layer>
              <Layer>
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
                      isSelected={p.id === selectedId}
                      onSelect={() => setSelectedId(p.id)}
                      onChange={(next) => upsertPlacement(next)}
                    />
                  ))}
                </Group>
              </Layer>
            </Stage>

            {placements.length === 0 && (
              <DropHint onClick={() => fileInputRef.current?.click()} />
            )}
          </div>

          {/* Side panel */}
          <aside className="space-y-5">
            <PanelSection title="View">
              <div className="flex flex-wrap gap-1.5">
                {angles.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      setActiveAngle(a);
                      setSelectedId(null);
                    }}
                    aria-pressed={a === activeAngle}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-all',
                      a === activeAngle
                        ? 'border-lsl-ink bg-lsl-ink text-lsl-cream'
                        : 'border-lsl-stone bg-white text-lsl-graphite hover:border-lsl-ink hover:text-lsl-ink',
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </PanelSection>

            <PanelSection title="Color">
              <div className="grid grid-cols-7 gap-1.5">
                {product.colors.map((c) => {
                  const hex = colorToHex(c);
                  const active = c === activeColor;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setActiveColor(c)}
                      aria-pressed={active}
                      title={c}
                      className={cn(
                        'group relative aspect-square overflow-hidden rounded-full border-2 transition-transform',
                        active
                          ? 'scale-110 border-lsl-ink shadow-lsl-lift'
                          : 'border-lsl-stone hover:border-lsl-ink',
                      )}
                      style={{ background: hex }}
                    >
                      <span className="sr-only">{c}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-lsl-graphite">
                Active · <span className="text-lsl-ink">{activeColor}</span>
                {!isExactColorImage && (
                  <span className="ml-2 text-lsl-graphite/70">(tinted preview)</span>
                )}
              </p>
            </PanelSection>

            <PanelSection title="Logo">
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4" strokeWidth={1.75} /> Upload logo
                </Button>
                <p className="text-[11px] leading-relaxed text-lsl-graphite">
                  PNG, JPG, or SVG · up to 8 MB. Drag straight onto the canvas.
                </p>
              </div>
            </PanelSection>

            <PanelSection title="Layers">
              {placements.length === 0 ? (
                <p className="rounded-xl border border-dashed border-lsl-stone bg-white px-3 py-4 text-center text-xs text-lsl-graphite">
                  No logos yet. Drop one anywhere on the canvas.
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
                              onClick={() => setSelectedId(p.id)}
                              className="flex min-w-0 flex-1 items-center gap-2 text-left"
                            >
                              <span className="grid h-7 w-7 flex-shrink-0 place-items-center overflow-hidden rounded-md border border-lsl-stone bg-white">
                                <img
                                  src={p.imageDataUrl}
                                  alt=""
                                  className="h-full w-full object-contain"
                                />
                              </span>
                              <span className="min-w-0 flex-1 truncate font-mono text-[11px] uppercase tracking-[0.16em] text-lsl-graphite">
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
            </PanelSection>

            {selected && (
              <PanelSection title="Selected">
                <PlacementInspector
                  placement={selected}
                  stageSize={stageSize}
                  onChange={(next) => upsertPlacement(next)}
                />
              </PanelSection>
            )}

            <PanelSection title="Tips">
              <ul className="space-y-1 text-[11px] leading-relaxed text-lsl-graphite">
                <li>↑↓←→ to nudge · Shift = 10px steps</li>
                <li>Backspace deletes the selected layer</li>
                <li>
                  <Crop className="-mt-0.5 mr-1 inline h-3 w-3" strokeWidth={2} />
                  Logo is clipped to the print area
                </li>
              </ul>
            </PanelSection>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Stage children ───

function ProductLayer({
  imageUrl,
  tintHex,
  applyTint,
  stageSize,
}: {
  imageUrl: string | null;
  tintHex: string;
  applyTint: boolean;
  stageSize: { width: number; height: number };
}) {
  const [img] = useImage(imageUrl ?? '', 'anonymous');
  const ref = useRef<Konva.Image>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !img) return;
    node.cache();
    node.getLayer()?.batchDraw();
  }, [img, applyTint, tintHex]);

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

  return (
    <KonvaImage
      ref={ref}
      image={img}
      x={x}
      y={y}
      width={w}
      height={h}
      // Tinting: only enable filters when applyTint is true.
      filters={applyTint ? [hexTintFilter(tintHex)] : []}
    />
  );
}

function PrintAreaGuide({
  printArea,
  stageSize,
  light,
}: {
  printArea: { x: number; y: number; width: number; height: number };
  stageSize: { width: number; height: number };
  light: boolean;
}) {
  return (
    <Rect
      x={printArea.x * stageSize.width}
      y={printArea.y * stageSize.height}
      width={printArea.width * stageSize.width}
      height={printArea.height * stageSize.height}
      stroke={light ? 'rgba(11,11,14,0.35)' : 'rgba(247,244,238,0.5)'}
      strokeWidth={1}
      dash={[6, 4]}
      listening={false}
      perfectDrawEnabled={false}
    />
  );
}

function PlacementImage({
  placement,
  isSelected,
  onSelect,
  onChange,
}: {
  placement: MockupPlacement;
  isSelected: boolean;
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
        draggable
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
      <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-lsl-graphite">
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
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-lsl-graphite">
          {label}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-lsl-ink">
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
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-lsl-navy">
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

/**
 * Build a Konva pixel filter that tints the source image toward `hex`.
 * Works well on light/cream source PNGs (the typical product photography baseline).
 * For very dark source images the result will be muted — recommend providing
 * a real color variant in `image_variants` for those.
 */
function hexTintFilter(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return function (this: Konva.Image, imageData: ImageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha === 0) continue;
      // luma of source (perceived brightness)
      const luma = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
      // multiply blend of target color × luma — preserves shading + highlights
      data[i] = Math.min(255, r * luma * 1.05);
      data[i + 1] = Math.min(255, g * luma * 1.05);
      data[i + 2] = Math.min(255, b * luma * 1.05);
    }
  };
}
