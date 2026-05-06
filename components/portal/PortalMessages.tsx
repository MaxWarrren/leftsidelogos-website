import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare } from "lucide-react";
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';

type Message = {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    organization_id: string;
    profiles?: {
        full_name: string;
        role: string;
    };
};

export const PortalMessages: React.FC = () => {
    const { organization, profile } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch Messages & Subscribe
    useEffect(() => {
        if (!organization || !profile) return;

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*, profiles(full_name, role)')
                .eq('organization_id', organization.id)
                .order('created_at', { ascending: true });

            if (data) setMessages(data as any);
        };

        const markAsRead = async () => {
            await supabase
                .from('message_reads')
                .upsert({
                    organization_id: organization.id,
                    user_id: profile.id,
                    last_read_at: new Date().toISOString()
                }, {
                    onConflict: 'organization_id, user_id'
                });
        };

        fetchMessages();
        markAsRead();

        const channel = supabase
            .channel(`customer-messages-${organization.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `organization_id=eq.${organization.id}` }, () => {
                fetchMessages();
                markAsRead();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, [organization, profile]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !organization || !profile) return;

        await supabase.from('messages').insert({
            organization_id: organization.id,
            sender_id: profile.id,
            content: input
        });

        setInput("");
    };

    if (!organization) {
        return <div className="p-8 text-center text-gray-500 font-medium">Please join an organization.</div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-lsl-black rounded-xl flex items-center justify-center shadow-sm">
                        <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lsl-black text-lg leading-tight"># team-chat</h2>
                        <span className="text-xs text-gray-500 font-medium tracking-wide">Messaging {organization.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Support Online</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-white p-6">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-10" />
                        <p className="text-sm font-medium">Start the conversation below</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isAdmin = msg.profiles?.role === 'admin';
                        const showProfile = !messages[index - 1] || messages[index - 1].sender_id !== msg.sender_id ||
                            (new Date(msg.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000);

                        return (
                            <div key={msg.id} className={`group flex gap-4 px-2 hover:bg-gray-50/50 transition-colors py-1 ${showProfile ? "mt-4 pt-2" : ""}`}>
                                <div className="w-10 shrink-0">
                                    {showProfile ? (
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 text-xs font-bold ${
                                            isAdmin ? "bg-lsl-blue text-white" : "bg-lsl-black text-white"
                                        }`}>
                                            {msg.profiles?.full_name?.substring(0, 2).toUpperCase() || "??"}
                                        </div>
                                    ) : (
                                        <div className="opacity-0 group-hover:opacity-100 text-[9px] text-gray-400 text-center font-medium mt-1">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    {showProfile && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-sm font-bold tracking-tight ${isAdmin ? "text-lsl-blue" : "text-lsl-black"}`}>
                                                {msg.profiles?.full_name}
                                            </span>
                                            {isAdmin && (
                                                <span className="bg-lsl-blue/10 text-lsl-blue text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Support</span>
                                            )}
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {msg.content}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                <div className="relative flex items-end gap-3 bg-gray-50 rounded-2xl border border-gray-200 p-2 focus-within:border-gray-400 transition-all focus-within:shadow-md">
                    <textarea
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none min-h-[44px] max-h-48 text-gray-700 placeholder:text-gray-400 focus:outline-none"
                        placeholder="Message # team-chat"
                        value={input}
                        rows={1}
                        onChange={(e) => {
                            setInput(e.target.value);
                            e.target.style.height = 'inherit';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                                (e.target as HTMLTextAreaElement).style.height = 'inherit';
                            }
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                            input.trim() ? "bg-lsl-black text-white hover:bg-lsl-black/90 scale-100 shadow-sm" : "bg-gray-100 text-gray-400 scale-90"
                        }`}
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex justify-between items-center mt-3 px-1">
                    <p className="text-[10px] text-gray-400 font-medium">
                        <span className="font-bold">Enter</span> to send • <span className="font-bold">Shift + Enter</span> for new line
                    </p>
                </div>
            </div>
        </div>
    );
};
