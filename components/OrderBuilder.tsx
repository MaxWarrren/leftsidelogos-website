import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  LogIn,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

import { cn } from '../lib/utils';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { MediaPicker, type MediaItem } from './MediaPicker';
import type { GroupedCartItem } from '../types';
import { OrderBuilderStepper, type Step } from './OrderBuilderStepper';
import { Button } from './ui/button';
import { toast } from './ui/toaster';

type UseCase = 'Company / Team' | 'Event' | 'Brand / Merch' | 'School / Club' | 'Other';
type ServiceInterest = 'Upfront Bulk Order' | 'Merchandise Website';
type Timeline = 'Flexible' | '2–3 weeks' | 'ASAP';

interface OrderDraft {
  // 01 — Contact
  contact: {
    email: string;
    name: string;
    company: string;
  };
  // 02 — Brief
  useCase: UseCase | null;
  serviceInterests: ServiceInterest[];
  timeline: Timeline | null;
  logoPlacement: string;
  // 04 — Logos (cart is 03)
  logoMedia: MediaItem[];
  mockupImageUrl: string | null;
  mockupPrompt: string;
}

const SECTION_IDS = {
  contact: 'ob-contact',
  brief: 'ob-brief',
  cart: 'ob-cart',
  logos: 'ob-logos',
} as const;

// ─── Main ───

export const OrderBuilder: React.FC<{
  className?: string;
  onNavigateToMockup?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToCatalog?: () => void;
}> = ({ className, onNavigateToMockup, onNavigateToContact, onNavigateToCatalog }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  const {
    getGroupedItems,
    getCartTotal,
    getCartCount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { isAuthenticated, user, profile, organization, openAuthModal } = useAuth();

  const groupedItems = getGroupedItems();
  const cartTotal = getCartTotal();
  const cartCount = getCartCount();

  const defaultDraft: OrderDraft = {
    contact: { email: '', name: '', company: '' },
    useCase: null,
    serviceInterests: [],
    timeline: null,
    logoPlacement: '',
    logoMedia: [],
    mockupImageUrl: null,
    mockupPrompt: '',
  };

  const [draft, setDraft] = useState<OrderDraft>(defaultDraft);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>(SECTION_IDS.contact);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Hydrate authenticated user info into the contact step.
  useEffect(() => {
    if (isAuthenticated && profile) {
      setDraft((d) => ({
        ...d,
        contact: {
          email: d.contact.email || profile.email || '',
          name: d.contact.name || profile.full_name || '',
          company: d.contact.company || organization?.name || '',
        },
      }));
    }
  }, [isAuthenticated, profile, organization]);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const saved = localStorage.getItem('lsl_order_draft_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDraft({ ...defaultDraft, ...parsed, logoMedia: [], mockupImageUrl: null });
      } catch {
        /* ignore */
      }
    }
    // Also accept legacy v1 draft for one-shot migration.
    const legacy = localStorage.getItem('lsl_order_draft');
    if (legacy && !saved) {
      try {
        const parsed = JSON.parse(legacy);
        setDraft((d) => ({
          ...d,
          contact: parsed.contact ?? d.contact,
          useCase: parsed.useCase ?? null,
          serviceInterests: parsed.serviceInterests ?? [],
          timeline: parsed.timeline ?? null,
        }));
        localStorage.removeItem('lsl_order_draft');
      } catch {
        /* ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const toSave = { ...draft, logoMedia: [], mockupImageUrl: null };
    localStorage.setItem('lsl_order_draft_v2', JSON.stringify(toSave));
  }, [draft]);

  // IntersectionObserver to track which section is current for the stepper.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the section that's most visible.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setCurrentSection(visible.target.id);
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const setRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  // ─── Validation ───

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contact.email.trim()),
    [draft.contact.email],
  );
  const hasName = draft.contact.name.trim().length >= 2;
  const hasCart = groupedItems.length > 0;
  const hasBriefBasics = !!draft.useCase && !!draft.timeline;

  // Step state for the sticky stepper.
  const stepperSteps: Step[] = useMemo(
    () => [
      {
        id: SECTION_IDS.contact,
        label: 'Contact',
        state: getStepperState({
          id: SECTION_IDS.contact,
          isValid: isValidEmail && hasName,
          hasError: submitAttempted && (!isValidEmail || !hasName),
          current: currentSection,
        }),
      },
      {
        id: SECTION_IDS.brief,
        label: 'Project',
        state: getStepperState({
          id: SECTION_IDS.brief,
          isValid: hasBriefBasics,
          hasError: submitAttempted && !hasBriefBasics,
          current: currentSection,
        }),
      },
      {
        id: SECTION_IDS.cart,
        label: 'Items',
        state: getStepperState({
          id: SECTION_IDS.cart,
          isValid: hasCart,
          hasError: submitAttempted && !hasCart,
          current: currentSection,
        }),
      },
      {
        id: SECTION_IDS.logos,
        label: 'Logos',
        state: getStepperState({
          id: SECTION_IDS.logos,
          isValid: draft.logoMedia.length > 0,
          hasError: false,
          current: currentSection,
        }),
      },
    ],
    [
      currentSection,
      draft.logoMedia.length,
      hasBriefBasics,
      hasCart,
      hasName,
      isValidEmail,
      submitAttempted,
    ],
  );

  const jumpToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const offset = 140;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // ─── Draft helpers ───

  const updateDraft = (patch: Partial<OrderDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const updateContact = (patch: Partial<OrderDraft['contact']>) =>
    setDraft((prev) => ({ ...prev, contact: { ...prev.contact, ...patch } }));

  const toggleService = (item: ServiceInterest) => {
    setDraft((prev) => {
      const has = prev.serviceInterests.includes(item);
      return {
        ...prev,
        serviceInterests: has
          ? prev.serviceInterests.filter((i) => i !== item)
          : [...prev.serviceInterests, item],
      };
    });
  };

  const handleMediaSelect = (items: MediaItem[]) => {
    const remainingSlots = 3 - draft.logoMedia.length;
    if (remainingSlots <= 0) return;
    updateDraft({ logoMedia: [...draft.logoMedia, ...items.slice(0, remainingSlots)] });
  };

  const removeMediaAt = (index: number) => {
    const next = [...draft.logoMedia];
    next.splice(index, 1);
    updateDraft({ logoMedia: next });
  };

  // ─── Drag-and-drop logo upload (auth required, just opens MediaPicker if not) ───

  const onDropFiles = async (files: FileList | File[]) => {
    setIsDragging(false);
    if (!isAuthenticated || !organization) {
      toast.info('Log in first', {
        description: 'Sign in to upload logos directly. Your project draft is saved.',
        action: { label: 'Log in', onClick: openAuthModal },
      });
      return;
    }
    const arr = Array.from(files);
    const remainingSlots = 3 - draft.logoMedia.length;
    if (remainingSlots <= 0) {
      toast.warning('Logo limit reached', { description: 'Up to 3 logos per project.' });
      return;
    }
    const toUpload = arr.slice(0, remainingSlots);
    const uploadedIds: string[] = [];
    for (const file of toUpload) {
      const safeName = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]+/gi, '_')}`;
      const file_path = `${organization.id}/uploads/${safeName}`;
      const { error } = await supabase.storage
        .from('organization-assets')
        .upload(file_path, file, { upsert: false });
      if (error) {
        toast.error('Upload failed', { description: error.message });
        continue;
      }
      const item: MediaItem = {
        id: file_path,
        file_path,
        file_name: file.name,
        file_type: file.type,
        size: file.size,
        category: 'Brand Assets',
        created_at: new Date().toISOString(),
        uploader_id: user?.id ?? '',
      };
      uploadedIds.push(file_path);
      updateDraft({ logoMedia: [...draft.logoMedia, item] });
    }
    if (uploadedIds.length) {
      toast.success(`Uploaded ${uploadedIds.length} file${uploadedIds.length === 1 ? '' : 's'}`);
    }
  };

  // ─── Submit ───

  const handleSubmit = async () => {
    setSubmitAttempted(true);

    // Validation gate.
    if (!isValidEmail) {
      toast.error('Add your email', { description: 'We need it to send your quote.' });
      jumpToSection(SECTION_IDS.contact);
      return;
    }
    if (!hasName) {
      toast.error('Add your name');
      jumpToSection(SECTION_IDS.contact);
      return;
    }
    if (!hasBriefBasics) {
      toast.error('Tell us a little about the project', {
        description: 'Pick a use case and a timeline.',
      });
      jumpToSection(SECTION_IDS.brief);
      return;
    }
    if (!hasCart) {
      toast.error('Your project has no items', {
        description: 'Add at least one product from the catalog.',
      });
      jumpToSection(SECTION_IDS.cart);
      return;
    }

    setIsGenerating(true);
    try {
      // Resolve logo file URLs (already in organization-assets storage).
      const fileUrls: string[] = [];
      for (const media of draft.logoMedia) {
        const { data: urlData } = supabase.storage
          .from('organization-assets')
          .getPublicUrl(media.file_path);
        fileUrls.push(urlData.publicUrl);
      }

      // Upload mockup if present (existing flow).
      if (draft.mockupImageUrl && organization) {
        try {
          const mockupRes = await fetch(draft.mockupImageUrl);
          const blob = await mockupRes.blob();
          const safeName = `${Date.now()}-mockup.png`;
          const filePath = `order-attachments/${organization.id}/${safeName}`;
          const { error: uploadError } = await supabase.storage
            .from('leads-attachments')
            .upload(filePath, blob);
          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('leads-attachments')
              .getPublicUrl(filePath);
            fileUrls.push(urlData.publicUrl);
          }
        } catch (err) {
          console.warn('Mockup upload failed:', err);
        }
      }

      // Build cart breakdown.
      const cartBreakdown = groupedItems.map((g) => ({
        product: g.productName,
        sku: g.sku,
        category: g.category,
        basePrice: g.basePrice,
        totalQuantity: g.totalQuantity,
        subtotal: g.subtotal,
        variants: g.variants.map((v) => ({
          color: v.color,
          size: v.size,
          quantity: v.quantity,
        })),
      }));

      // Build description.
      const descParts: string[] = [];
      if (draft.useCase) descParts.push(`Use case: ${draft.useCase}`);
      if (draft.serviceInterests.length)
        descParts.push(`Services: ${draft.serviceInterests.join(', ')}`);
      if (draft.timeline) descParts.push(`Timeline: ${draft.timeline}`);
      if (draft.logoPlacement) descParts.push(`Placement: ${draft.logoPlacement}`);

      // Generate AI summary (best-effort; failure does not block submit).
      let aiSummary = '';
      try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_FREE_GEMINI_API_KEY });
        const prompt = `
Write a concise 2-3 sentence summary of this custom apparel order request.
Organization: ${organization?.name ?? draft.contact.company ?? 'Guest project'}
Details:
${descParts.join('\n')}
Items:
${cartBreakdown.map((g) => `- ${g.totalQuantity}x ${g.product} (${g.category})`).join('\n')}`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-preview',
          contents: prompt,
        });
        aiSummary = response.text || '';
      } catch (err) {
        console.error('Failed to generate AI summary:', err);
      }

      const orderName = `${
        organization?.name || draft.contact.company || draft.contact.name
      } - Website Order`;

      const isGuest = !isAuthenticated || !organization;

      // Authenticated path inserts an order; guest path posts a lead row through n8n.
      let createdOrderId: string | null = null;
      if (!isGuest && organization) {
        const orderData = {
          organization_id: organization.id,
          name: orderName,
          status: 'pending',
          timeline_step: 1,
          price: cartTotal,
          details: cartBreakdown,
          description: descParts.join('\n'),
          source: 'website',
          submitted_by: user?.id,
          attachments: fileUrls,
          ai_summary: aiSummary,
        };

        const { data: insert, error } = await supabase
          .from('orders')
          .insert(orderData)
          .select('id')
          .single();
        if (error) throw new Error(error.message);
        createdOrderId = insert?.id ?? null;
      }

      // Webhook payload (carries everything n8n needs, including guest leads).
      const webhookPayload = {
        is_guest: isGuest,
        order_id: createdOrderId,
        organization_id: organization?.id ?? null,
        organization_name: organization?.name ?? draft.contact.company ?? null,
        contact: draft.contact,
        name: orderName,
        status: 'pending',
        timeline_step: 1,
        price: cartTotal,
        details: cartBreakdown,
        description: descParts.join('\n'),
        source: 'website',
        submitted_by: user?.id ?? null,
        user_email: profile?.email ?? draft.contact.email,
        user_name: profile?.full_name ?? draft.contact.name,
        attachments: fileUrls,
        ai_summary: aiSummary,
      };

      try {
        const testUrl =
          'https://n8n.maxwellwarren.dev/webhook-test/76e4d8b0-e9eb-4dad-85e7-115c1d453a99';
        const prodUrl =
          'https://n8n.maxwellwarren.dev/webhook/76e4d8b0-e9eb-4dad-85e7-115c1d453a99';
        const res = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        });
        if (!res.ok) {
          await fetch(prodUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload),
          });
        }
      } catch (err) {
        try {
          await fetch(
            'https://n8n.maxwellwarren.dev/webhook/76e4d8b0-e9eb-4dad-85e7-115c1d453a99',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(webhookPayload),
            },
          );
        } catch (prodErr) {
          console.error('Webhook failed:', prodErr);
        }
      }

      localStorage.removeItem('lsl_order_draft_v2');
      clearCart();
      setSubmittedOrderId(createdOrderId);
      setIsSubmitted(true);
    } catch (e: any) {
      console.error('Submission failed', e);
      toast.error('Something went wrong', {
        description: e?.message ?? 'Please check your connection and try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Render ───

  if (isSubmitted) {
    return (
      <SuccessScreen
        email={draft.contact.email || profile?.email}
        orderId={submittedOrderId}
        onNewOrder={() => {
          setIsSubmitted(false);
          setDraft(defaultDraft);
          setTouched({});
          setSubmitAttempted(false);
          setSubmittedOrderId(null);
        }}
        onScheduleCall={onNavigateToContact}
      />
    );
  }

  return (
    <>
      <div
        className={cn('min-h-screen bg-lsl-cream pt-20 pb-24 md:pt-24', className)}
      >
        <div className="mx-auto max-w-3xl px-6 md:px-10">
          <header className="mb-8 md:mb-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-lsl-navy">
              Order Builder
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-lsl-ink md:text-5xl">
              Build your project.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-lsl-graphite">
              Tell us what you need, drop in your logos, and we&apos;ll send a proof and a quote — usually same day.
            </p>
          </header>

          <OrderBuilderStepper steps={stepperSteps} onJump={jumpToSection} />

          <div className="mt-10 space-y-16">
            {/* ── 01 — Contact (moved to top) ── */}
            <Section
              ref={setRef(SECTION_IDS.contact)}
              id={SECTION_IDS.contact}
              number="01"
              title="How can we reach you?"
              subtitle="No spam. We use this only for proofs, the quote, and your invoice."
            >
              {isAuthenticated && profile ? (
                <SignedInBlock
                  profile={profile}
                  organization={organization}
                />
              ) : (
                <div className="mb-4 rounded-xl border border-lsl-stone bg-white p-4">
                  <p className="text-sm text-lsl-graphite">
                    Continuing as a guest is fine — or{' '}
                    <button
                      type="button"
                      onClick={openAuthModal}
                      className="font-medium text-lsl-navy underline-offset-4 hover:underline"
                    >
                      log in
                    </button>{' '}
                    to save this project to your portal.
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Email"
                  required
                  error={
                    (touched.email || submitAttempted) && !isValidEmail
                      ? 'Enter a valid email address'
                      : undefined
                  }
                >
                  <input
                    type="email"
                    autoComplete="email"
                    value={draft.contact.email}
                    onChange={(e) => updateContact({ email: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    placeholder="you@company.com"
                    className={inputClass(
                      (touched.email || submitAttempted) && !isValidEmail,
                    )}
                  />
                </Field>
                <Field
                  label="Full name"
                  required
                  error={
                    (touched.name || submitAttempted) && !hasName
                      ? 'Tell us what to call you'
                      : undefined
                  }
                >
                  <input
                    type="text"
                    autoComplete="name"
                    value={draft.contact.name}
                    onChange={(e) => updateContact({ name: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    placeholder="Jane Smith"
                    className={inputClass(
                      (touched.name || submitAttempted) && !hasName,
                    )}
                  />
                </Field>
                <Field
                  label="Company / Organization"
                  hint="Optional"
                  className="md:col-span-2"
                >
                  <input
                    type="text"
                    autoComplete="organization"
                    value={draft.contact.company}
                    onChange={(e) => updateContact({ company: e.target.value })}
                    placeholder="Westview High Athletics"
                    className={inputClass(false)}
                  />
                </Field>
              </div>
            </Section>

            {/* ── 02 — Brief ── */}
            <Section
              ref={setRef(SECTION_IDS.brief)}
              id={SECTION_IDS.brief}
              number="02"
              title="A bit about the project"
              subtitle="Helps us prep the right proofs and pricing before the call."
            >
              <Field
                label="Use case"
                required
                error={
                  submitAttempted && !draft.useCase
                    ? 'Pick the closest match'
                    : undefined
                }
              >
                <ChipGroup
                  options={['Company / Team', 'Event', 'Brand / Merch', 'School / Club', 'Other']}
                  value={draft.useCase}
                  onChange={(v) => updateDraft({ useCase: v as UseCase })}
                />
              </Field>

              <Field label="What do you need from us?" hint="Pick any that apply">
                <div className="grid gap-3 md:grid-cols-2">
                  {(
                    [
                      {
                        value: 'Upfront Bulk Order',
                        desc: 'A single production run for your team or event.',
                      },
                      {
                        value: 'Merchandise Website',
                        desc: 'A custom store for fans / employees to buy direct.',
                      },
                    ] as { value: ServiceInterest; desc: string }[]
                  ).map((opt) => {
                    const checked = draft.serviceInterests.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleService(opt.value)}
                        aria-pressed={checked}
                        className={cn(
                          'group flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all',
                          checked
                            ? 'border-lsl-navy bg-lsl-navy-50 shadow-lsl-card'
                            : 'border-lsl-stone bg-white hover:border-lsl-ink/40',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-md border-2 transition-colors',
                            checked
                              ? 'border-lsl-navy bg-lsl-navy text-lsl-cream'
                              : 'border-lsl-stone bg-white',
                          )}
                        >
                          {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-base font-semibold text-lsl-ink">
                            {opt.value}
                          </span>
                          <span className="mt-0.5 block text-sm text-lsl-graphite">
                            {opt.desc}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field
                label="Timeline"
                required
                error={
                  submitAttempted && !draft.timeline
                    ? 'Give us a rough timeline'
                    : undefined
                }
              >
                <ChipGroup
                  options={['Flexible', '2–3 weeks', 'ASAP']}
                  value={draft.timeline}
                  onChange={(v) => updateDraft({ timeline: v as Timeline })}
                />
              </Field>

              <Field
                label="Logo placement notes"
                hint="Optional · e.g. left chest + back, hat front, sleeve"
              >
                <input
                  type="text"
                  value={draft.logoPlacement}
                  onChange={(e) => updateDraft({ logoPlacement: e.target.value })}
                  placeholder="Left chest, full back, etc."
                  className={inputClass(false)}
                />
              </Field>
            </Section>

            {/* ── 03 — Items ── */}
            <Section
              ref={setRef(SECTION_IDS.cart)}
              id={SECTION_IDS.cart}
              number="03"
              title="Your items"
              subtitle="Estimated subtotal — final pricing confirmed after we review your logos."
              error={
                submitAttempted && !hasCart
                  ? 'Add at least one item to continue.'
                  : undefined
              }
            >
              {groupedItems.length === 0 ? (
                <EmptyCart onNavigateToCatalog={onNavigateToCatalog} />
              ) : (
                <div className="space-y-3">
                  {groupedItems.map((group) => (
                    <CartItemCard
                      key={group.productId}
                      group={group}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                  <div className="flex items-center justify-between rounded-2xl border border-lsl-stone bg-white px-5 py-4">
                    <div className="text-sm">
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-lsl-graphite">
                        {cartCount} items
                      </span>
                      {onNavigateToCatalog && (
                        <button
                          type="button"
                          onClick={onNavigateToCatalog}
                          className="ml-3 text-sm font-medium text-lsl-navy underline-offset-4 hover:underline"
                        >
                          + Add more
                        </button>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-lsl-graphite">
                        Est. total
                      </p>
                      <p className="font-display text-2xl font-semibold tabular-nums text-lsl-ink">
                        ${cartTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="rounded-xl border border-lsl-stone bg-lsl-stone/30 px-4 py-3 text-xs leading-relaxed text-lsl-graphite">
                    Primary supplier:{' '}
                    <a
                      href="https://www.ssactivewear.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-lsl-navy underline-offset-4 hover:underline"
                    >
                      SS Activewear
                    </a>
                    . Anything in their catalog is fair game — just tell us in the brief or on the call.
                  </p>
                </div>
              )}
            </Section>

            {/* ── 04 — Logos ── */}
            <Section
              ref={setRef(SECTION_IDS.logos)}
              id={SECTION_IDS.logos}
              number="04"
              title="Your logos"
              subtitle="Up to 3 files. Vector (SVG, PDF, AI) preferred; high-res PNG is fine."
            >
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  onDropFiles(e.dataTransfer.files);
                }}
                className={cn(
                  'rounded-2xl border-2 border-dashed transition-colors',
                  isDragging
                    ? 'border-lsl-navy bg-lsl-navy-50'
                    : 'border-lsl-stone bg-white',
                )}
              >
                <div className="grid grid-cols-3 gap-3 p-3">
                  {draft.logoMedia.map((media, i) => (
                    <LogoSlot key={i} media={media} onRemove={() => removeMediaAt(i)} />
                  ))}
                  {draft.logoMedia.length < 3 && (
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="grid aspect-square place-items-center gap-2 rounded-xl border-2 border-dashed border-lsl-stone text-lsl-graphite transition-all hover:border-lsl-navy hover:bg-lsl-navy-50 hover:text-lsl-navy"
                    >
                      <Upload className="h-5 w-5" strokeWidth={1.75} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                        Add logo
                      </span>
                    </button>
                  )}
                </div>
                <p className="px-4 pb-3 text-center text-xs text-lsl-graphite">
                  Drag &amp; drop files here, or use the slot above.
                </p>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-lsl-stone bg-lsl-stone/30 px-4 py-4">
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-lsl-thread" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-medium text-lsl-ink">
                    Want a preview before we build a proof?
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-lsl-graphite">
                    Open the Mockup Studio to see your logo on a product. Anything you generate auto-attaches to this project when you come back.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateToMockup?.()}
                    className="mt-2 text-sm font-medium text-lsl-navy underline-offset-4 hover:underline"
                  >
                    Open Mockup Studio →
                  </button>
                </div>
              </div>
            </Section>

            {/* ── Submit ── */}
            <div className="space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={isGenerating}
                size="xl"
                className="w-full"
                variant="primary"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> Submitting…
                  </>
                ) : (
                  <>Send my project</>
                )}
              </Button>
              <p className="text-center text-xs text-lsl-graphite">
                By submitting, you agree to be contacted about this project. No charges until you approve a proof.
              </p>
            </div>
          </div>
        </div>
      </div>

      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        multiple
        defaultCategory="Brand Assets"
        title="Select Media"
      />
    </>
  );
};

// ─── Sub-components ───

interface SectionProps {
  number: string;
  title: string;
  subtitle?: string;
  error?: string;
  id: string;
  children: React.ReactNode;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(function Section(
  { number, title, subtitle, error, id, children },
  ref,
) {
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-40"
    >
      <header className="mb-5 flex items-baseline gap-3">
        <span className="font-mono text-[11px] tabular-nums uppercase tracking-[0.22em] text-lsl-navy">
          {number}
        </span>
        <h2
          id={`${id}-title`}
          className="font-display text-2xl font-semibold tracking-tight text-lsl-ink"
        >
          {title}
        </h2>
      </header>
      {subtitle && (
        <p className="mb-6 -mt-3 text-sm text-lsl-graphite">{subtitle}</p>
      )}
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4" strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}
      <div className="space-y-5">{children}</div>
    </section>
  );
});

function Field({
  label,
  required,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn('block', className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-lsl-graphite">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
        {hint && !error && (
          <span className="text-[11px] text-lsl-graphite/70">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p
          role="alert"
          className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600"
        >
          <AlertCircle className="h-3 w-3" strokeWidth={2.5} /> {error}
        </p>
      )}
    </label>
  );
}

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            type="button"
            key={opt}
            onClick={() => onChange(opt)}
            aria-pressed={selected}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-all',
              selected
                ? 'border-lsl-navy bg-lsl-navy text-lsl-cream shadow-lsl-card'
                : 'border-lsl-stone bg-white text-lsl-ink hover:border-lsl-ink',
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    'w-full rounded-xl border bg-white px-4 py-3 text-base text-lsl-ink placeholder:text-lsl-graphite/60 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-lsl-cream',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
      : 'border-lsl-stone focus:border-lsl-navy focus:ring-lsl-navy/30',
  );
}

function SignedInBlock({
  profile,
  organization,
}: {
  profile: any;
  organization: any;
}) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-lsl-stone bg-white p-4">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-lsl-navy text-lsl-cream">
        <span className="text-sm font-semibold">
          {(profile.full_name?.charAt(0) || '?').toUpperCase()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-lsl-ink">
          {profile.full_name}
        </p>
        <p className="truncate text-xs text-lsl-graphite">{profile.email}</p>
      </div>
      {organization && (
        <span className="hidden text-right text-xs text-lsl-graphite md:block">
          {organization.name}
        </span>
      )}
    </div>
  );
}

function EmptyCart({
  onNavigateToCatalog,
}: {
  onNavigateToCatalog?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-lsl-stone bg-white px-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-lsl-stone/60 text-lsl-graphite">
        <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-lsl-ink">
          No items yet
        </p>
        <p className="mt-1 text-sm text-lsl-graphite">
          Add at least one product from the catalog to continue.
        </p>
      </div>
      {onNavigateToCatalog && (
        <Button
          variant="primary"
          size="md"
          onClick={onNavigateToCatalog}
          className="mt-1"
        >
          <Tag className="h-4 w-4" strokeWidth={1.75} />
          Browse the catalog
        </Button>
      )}
    </div>
  );
}

function CartItemCard({
  group,
  onUpdateQuantity,
  onRemove,
}: {
  group: GroupedCartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-lsl-stone bg-white">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-lsl-cream/40"
      >
        <div className="relative grid h-14 w-14 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-lsl-stone">
          {group.mockupUrl ? (
            <img
              src={group.mockupUrl}
              alt={group.productName}
              className="h-full w-full object-cover"
            />
          ) : group.image ? (
            <img
              src={group.image}
              alt={group.productName}
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <ShoppingBag className="h-6 w-6 text-lsl-graphite" strokeWidth={1.5} />
          )}
          {group.mockupUrl && (
            <div className="absolute right-0 top-0 rounded-bl-lg bg-white/85 p-0.5 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-lsl-thread" strokeWidth={2} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold text-lsl-ink">
            {group.productName}
          </h3>
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.18em] text-lsl-graphite">
            {group.sku} · {group.category} · {group.variants.length} variant
            {group.variants.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="font-display text-base font-semibold tabular-nums text-lsl-ink">
            ${group.subtotal.toFixed(2)}
          </p>
          <p className="text-xs text-lsl-graphite tabular-nums">
            {group.totalQuantity} items
          </p>
        </div>
        <div className="flex-shrink-0 text-lsl-graphite">
          {expanded ? (
            <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-lsl-stone bg-lsl-cream/40">
          <div className="grid grid-cols-[1fr_1fr_140px_44px] gap-3 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-lsl-graphite">
            <span>Color</span>
            <span>Size</span>
            <span className="text-center">Qty</span>
            <span aria-hidden="true" />
          </div>
          {group.variants.map((v) => (
            <div
              key={v.id}
              className="grid grid-cols-[1fr_1fr_140px_44px] items-center gap-3 border-t border-lsl-stone/60 px-5 py-3"
            >
              <span className="truncate text-sm text-lsl-ink">{v.color}</span>
              <span className="text-sm text-lsl-ink">{v.size}</span>
              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(v.id, v.quantity - 1)}
                  disabled={v.quantity <= 1}
                  aria-label="Decrease quantity"
                  className="grid h-9 w-9 place-items-center rounded-md border border-lsl-stone text-lsl-graphite transition-colors hover:border-lsl-ink hover:text-lsl-ink disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                  type="number"
                  min={1}
                  value={v.quantity}
                  onChange={(e) =>
                    onUpdateQuantity(
                      v.id,
                      Math.max(1, parseInt(e.target.value || '1', 10)),
                    )
                  }
                  className="h-9 w-12 rounded-md border border-lsl-stone bg-white text-center font-mono text-sm tabular-nums text-lsl-ink focus:border-lsl-navy focus:outline-none focus:ring-2 focus:ring-lsl-navy/30"
                />
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(v.id, v.quantity + 1)}
                  aria-label="Increase quantity"
                  className="grid h-9 w-9 place-items-center rounded-md border border-lsl-stone text-lsl-graphite transition-colors hover:border-lsl-ink hover:text-lsl-ink"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onRemove(v.id)}
                aria-label="Remove variant"
                className="grid h-9 w-9 place-items-center rounded-md text-lsl-graphite transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LogoSlot({
  media,
  onRemove,
}: {
  media: MediaItem;
  onRemove: () => void;
}) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border border-lsl-stone bg-white p-2">
      <StoragePreviewImage path={media.file_path} alt={media.file_name} />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${media.file_name}`}
        className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-lsl-ink text-lsl-cream shadow-lsl-card transition-transform hover:scale-110"
      >
        <X className="h-3 w-3" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function SuccessScreen({
  email,
  orderId,
  onNewOrder,
  onScheduleCall,
}: {
  email?: string;
  orderId?: string | null;
  onNewOrder: () => void;
  onScheduleCall?: () => void;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="relative min-h-screen overflow-hidden bg-lsl-cream pt-28 pb-20">
      {!reducedMotion && <Confetti />}
      <div className="relative mx-auto max-w-xl px-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-lsl-navy text-lsl-cream shadow-lsl-lift"
        >
          <Check className="h-9 w-9" strokeWidth={2.5} />
        </motion.div>
        <h2 className="mt-8 font-display text-4xl font-semibold tracking-tight text-lsl-ink">
          Project received.
        </h2>
        <p className="mt-3 text-base leading-relaxed text-lsl-graphite">
          Thanks. We&apos;ll review your logos and items and reply with a proof and a quote — usually within one business day.
          {email && (
            <>
              {' '}A copy is on its way to{' '}
              <span className="font-medium text-lsl-ink">{email}</span>.
            </>
          )}
        </p>
        {orderId && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-lsl-stone bg-white px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-lsl-graphite">
            Order ref{' '}
            <span className="font-semibold text-lsl-ink">{orderId.slice(0, 8)}</span>
          </p>
        )}
        <div className="mt-10 flex flex-col gap-3">
          <Button variant="primary" size="lg" onClick={onNewOrder}>
            Start another project
          </Button>
          {onScheduleCall && (
            <Button variant="secondary" size="lg" onClick={onScheduleCall}>
              <Calendar className="h-4 w-4" strokeWidth={1.75} /> Book a design call
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  // Very small CSS-driven confetti — respects reduced-motion via parent gate.
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.4 + Math.random() * 1.2,
        color: ['#003380', '#C2A45F', '#0B0B0E', '#F7F4EE'][i % 4],
        rotate: Math.random() * 360,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -40, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: '110vh',
            x: (Math.random() - 0.5) * 80,
            opacity: [0, 1, 1, 0],
            rotate: p.rotate,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeIn',
          }}
          style={{
            left: `${p.left}%`,
            background: p.color,
          }}
          className="absolute top-10 inline-block h-2.5 w-1.5 rounded-sm"
        />
      ))}
    </div>
  );
}

// ─── Helpers ───

function getStepperState({
  id,
  isValid,
  hasError,
  current,
}: {
  id: string;
  isValid: boolean;
  hasError: boolean;
  current: string;
}): Step['state'] {
  if (hasError) return 'error';
  if (current === id) return 'current';
  if (isValid) return 'valid';
  return 'incomplete';
}

// ─── Storage preview ───

function StoragePreviewImage({ path, alt }: { path: string; alt?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.storage
        .from('organization-assets')
        .createSignedUrl(path, 3600);
      if (mounted && data?.signedUrl) setUrl(data.signedUrl);
    })();
    return () => {
      mounted = false;
    };
  }, [path]);
  if (!url) {
    return (
      <div className="grid h-full w-full place-items-center">
        <Loader2 className="h-4 w-4 animate-spin text-lsl-graphite" />
      </div>
    );
  }
  return <img src={url} alt={alt ?? 'Preview'} className="h-full w-full object-contain" />;
}
