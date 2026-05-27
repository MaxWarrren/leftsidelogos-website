import React, { useState, useEffect } from 'react';
import { ShoppingBag, MessageSquare, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';

export const PortalDashboard: React.FC<{ onNavigate: (tab: 'overview' | 'orders' | 'media' | 'messages') => void }> = ({ onNavigate }) => {
    const { profile, organization } = useAuth();
    const [loading, setLoading] = useState(true);

    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [activeFiles, setActiveFiles] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!organization || !profile) {
                setLoading(false);
                return;
            }

            // 1. Fetch Recent Orders
            const { data: orders } = await supabase
                .from('orders')
                .select('*')
                .eq('organization_id', organization.id)
                .order('created_at', { ascending: false })
                .limit(3);
            if (orders) setRecentOrders(orders);

            // 2. Fetch Unread Messages Count
            const { data: receipt } = await supabase
                .from('message_reads')
                .select('last_read_at')
                .eq('organization_id', organization.id)
                .eq('user_id', profile.id)
                .maybeSingle();

            const msgQuery = supabase
                .from('messages')
                .select('id', { count: 'exact', head: true })
                .eq('organization_id', organization.id)
                .neq('sender_id', profile.id);

            if (receipt) {
                msgQuery.gt('created_at', receipt.last_read_at);
            }

            const { count: msgCount } = await msgQuery;
            setUnreadMessages(msgCount || 0);

            // 3. Fetch Active Files (Pending Contracts/Unpaid Invoices)
            const { data: files } = await supabase
                .from('contracts')
                .select('*')
                .eq('organization_id', organization.id)
                .or('status.eq.pending,status.eq.unpaid')
                .order('created_at', { ascending: false })
                .limit(3);
            if (files) setActiveFiles(files);

            setLoading(false);
        };

        fetchData();

        // Real-time Subscriptions
        if (!organization) return;

        const channel = supabase
            .channel('customer-dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `organization_id=eq.${organization.id}` }, () => fetchData())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `organization_id=eq.${organization.id}` }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts', filter: `organization_id=eq.${organization.id}` }, () => fetchData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [organization, profile]);

    if (loading) {
        return <div className="text-center py-12 text-gray-500 font-medium">Loading dashboard...</div>;
    }

    if (!organization) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500 font-medium">Please join an organization to view your dashboard.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Orders Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col shadow-sm">
                <div className="flex flex-row items-center justify-between pb-4">
                    <h3 className="text-lg font-bold text-lsl-black">Recent Orders</h3>
                    <ShoppingBag className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                    {recentOrders.length > 0 ? (
                        <div className="space-y-4">
                            {recentOrders.map(order => (
                                <div key={order.id} className="flex flex-col gap-1 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-lsl-black text-sm">
                                            {order.name}
                                        </span>
                                        <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-lsl-blue/10 text-lsl-blue'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>Qty: {(order.details || []).reduce((sum: number, d: any) => sum + (d.qty || 0), 0)}</span>
                                        <span>Step {order.timeline_step}/4</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic py-4 text-center">No active orders.</p>
                    )}
                </div>
                <div className="pt-4 mt-auto">
                    <button 
                        onClick={() => onNavigate('orders')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:text-lsl-black hover:bg-gray-50 transition-colors"
                    >
                        View All Orders <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Messages Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col shadow-sm">
                <div className="flex flex-row items-center justify-between pb-4">
                    <h3 className="text-lg font-bold text-lsl-black">Messages</h3>
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 flex flex-col justify-center items-center text-center py-6">
                    {unreadMessages > 0 ? (
                        <>
                            <div className="h-12 w-12 rounded-full bg-lsl-blue/10 flex items-center justify-center mb-3">
                                <span className="text-lsl-blue font-bold text-lg">{unreadMessages}</span>
                            </div>
                            <p className="text-lsl-black font-medium">New Messages</p>
                            <p className="text-xs text-gray-500 mt-1">Check the chat for updates.</p>
                        </>
                    ) : (
                        <>
                            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                <MessageSquare className="h-6 w-6 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">All caught up!</p>
                        </>
                    )}
                </div>
                <div className="pt-4 mt-auto">
                    <button 
                        onClick={() => onNavigate('messages')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-lsl-black hover:bg-lsl-black/90 text-white text-sm font-bold transition-colors"
                    >
                        {unreadMessages > 0 ? "Go to Chat" : "Start Conversation"}
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Files Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col shadow-sm">
                <div className="flex flex-row items-center justify-between pb-4">
                    <h3 className="text-lg font-bold text-lsl-black">Pending Files</h3>
                    <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                    {activeFiles.length > 0 ? (
                        <div className="space-y-3">
                            {activeFiles.map(file => (
                                <button key={file.id} onClick={() => onNavigate('media')} className="w-full text-left group">
                                    <div className="flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors">
                                        <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-lsl-black truncate group-hover:text-lsl-blue transition-colors">
                                                {file.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {file.type} • {new Date(file.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-4">
                            <p className="text-sm text-gray-400 italic">No pending contracts or invoices.</p>
                        </div>
                    )}
                </div>
                <div className="pt-4 mt-auto">
                    <button 
                        onClick={() => onNavigate('media')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:text-lsl-black hover:bg-gray-50 transition-colors"
                    >
                        View All Files <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
