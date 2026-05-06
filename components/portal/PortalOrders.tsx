import React, { useState, useEffect } from 'react';
import { CheckCircle2, Truck, Package, ShoppingBag, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';

type OrderDetail = {
    item?: string;
    qty?: number;
    product?: string;
    sku?: string;
    variants?: { size: string; color: string; quantity: number }[];
};

type Order = {
    id: string;
    status: string;
    name: string;
    timeline_step: number;
    details: OrderDetail[];
    created_at: string;
    ai_summary?: string;
};

const timelineSteps = [
    { label: "Approval", icon: CheckCircle2 },
    { label: "Production", icon: Package },
    { label: "Transit", icon: Truck },
    { label: "Delivered", icon: CheckCircle2 }
];

export const PortalOrders: React.FC = () => {
    const { organization } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!organization) {
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            const { data } = await supabase
                .from('orders')
                .select('*')
                .eq('organization_id', organization.id)
                .order('created_at', { ascending: false });

            if (data) setOrders(data as any);
            setLoading(false);
        };

        fetchOrders();

        const channel = supabase
            .channel(`customer-orders-${organization.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `organization_id=eq.${organization.id}` }, () => fetchOrders())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [organization]);

    if (loading) {
        return <div className="text-center py-12 text-gray-500 font-medium">Loading orders...</div>;
    }

    if (!organization) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500 font-medium">Please join an organization to view your orders.</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-lsl-black">No Orders Yet</h3>
                <p className="text-gray-500 max-w-sm mt-2">When you start a new project with us, it will appear here with live tracking.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-lsl-black mb-4">Order Status</h2>

            <div className="grid gap-8">
                {orders.map((order) => {
                    const totalQty = (order.details || []).reduce((sum, d) => {
                        if (d.qty) return sum + d.qty;
                        if (d.variants) return sum + d.variants.reduce((vSum, v) => vSum + v.quantity, 0);
                        return sum;
                    }, 0);
                    
                    return (
                        <div key={order.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                            {/* Progress Bar Top */}
                            <div className="h-1.5 bg-gray-100 w-full overflow-hidden">
                                <div
                                    className="h-full bg-lsl-blue transition-all duration-1000"
                                    style={{ width: `${(order.timeline_step / 4) * 100}%` }}
                                />
                            </div>
                            
                            <div className="p-6 sm:p-8">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-50">
                                    <div className="space-y-1">
                                        <p className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider">
                                            ORD-{order.id.substring(0, 8)}
                                        </p>
                                        <h3 className="text-2xl font-bold text-lsl-black">{order.name}</h3>
                                        <p className="text-sm text-gray-500 font-medium">Total Quantity: {totalQty} units</p>
                                    </div>
                                    <span className={`self-start sm:self-auto text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider ${
                                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                        'bg-lsl-blue/10 text-lsl-blue'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Timeline */}
                                <div className="mb-10 relative px-2 sm:px-8 max-w-3xl mx-auto">
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />

                                    <div className="flex items-center justify-between relative z-10">
                                        {timelineSteps.map((s, i) => {
                                            const stepNum = i + 1;
                                            const isActive = stepNum <= order.timeline_step;
                                            const isCurrent = stepNum === order.timeline_step;

                                            return (
                                                <div key={i} className="flex flex-col items-center gap-3">
                                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                                                        isActive ? 'bg-lsl-black border-lsl-black text-white' : 'bg-white border-gray-100 text-gray-300'
                                                    } ${isCurrent ? 'ring-4 ring-lsl-blue/20 ring-offset-2' : ''}`}>
                                                        <s.icon className="h-5 w-5" />
                                                    </div>
                                                    <span className={`text-[10px] sm:text-xs uppercase font-bold tracking-wider ${
                                                        isActive ? 'text-lsl-black' : 'text-gray-300'
                                                    }`}>
                                                        {s.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3 flex items-center gap-2">
                                        <ShoppingBag className="w-3.5 h-3.5" /> Line Items
                                    </h4>
                                    <div className="space-y-2">
                                        {(order.details || []).map((detail, idx) => {
                                            const name = detail.product || detail.item || 'Unknown Item';
                                            const qty = detail.qty || (detail.variants ? detail.variants.reduce((s, v) => s + v.quantity, 0) : 0);
                                            return (
                                                <div key={idx} className="flex justify-between items-center py-2.5 px-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                                                    <span className="text-sm font-semibold text-lsl-black">{name}</span>
                                                    <span className="text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
                                                        Qty: {qty}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* AI Summary Button */}
                                {order.ai_summary && (
                                    <div className="mt-4">
                                        <details className="group [&_summary::-webkit-details-marker]:hidden">
                                            <summary className="flex items-center gap-2 cursor-pointer bg-blue-50 text-lsl-blue px-4 py-2.5 rounded-lg border border-blue-100 font-semibold text-sm hover:bg-blue-100 transition-colors w-max">
                                                <Sparkles className="w-4 h-4" />
                                                View Project Summary
                                            </summary>
                                            <div className="mt-3 p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 leading-relaxed">
                                                {order.ai_summary}
                                            </div>
                                        </details>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
