import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { PageHero } from '../PageHero';

import { PortalDashboard } from './PortalDashboard';
import { PortalOrders } from './PortalOrders';
import { PortalMedia } from './PortalMedia';
import { PortalMessages } from './PortalMessages';

type Tab = 'overview' | 'orders' | 'media' | 'messages';

const tabs: { id: Tab; label: string; icon: React.FC<any> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'media', label: 'Media & Files', icon: ImageIcon },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
];

export const CustomerPortal: React.FC = () => {
    const { isAuthenticated, profile, organization, openAuthModal } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    if (!isAuthenticated) {
        return (
            <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
                <div className="text-center space-y-6">
                    <h2 className="font-display text-4xl font-bold tracking-tight text-lsl-black">
                        Portal Access Required
                    </h2>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Please log in to view your orders, media, and messages.
                    </p>
                    <button
                        onClick={() => openAuthModal()}
                        className="px-8 py-4 bg-lsl-blue text-white rounded-xl font-bold hover:-translate-y-1 transition-all hover:shadow-lg"
                    >
                        Log In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageHero className="pt-32 pb-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
                    <motion.header
                        layout
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-4"
                    >
                        <motion.h1
                            layout="position"
                            className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight"
                        >
                            My Portal
                        </motion.h1>
                        <motion.p
                            layout="position"
                            className="text-gray-300 mt-2 font-light text-lg"
                        >
                            {organization ? `Managing account for ${organization.name}` : 'Manage your account and projects.'}
                        </motion.p>
                    </motion.header>
                </div>
            </PageHero>

            <div className="bg-[#f4f4f5] py-12 min-h-[60vh]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Nav */}
                    <div className="w-full md:w-64 shrink-0">
                        <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                                        activeTab === tab.id
                                            ? 'bg-lsl-black text-white'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-lsl-black'
                                    }`}
                                >
                                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'overview' && <PortalDashboard onNavigate={setActiveTab} />}
                            {activeTab === 'orders' && <PortalOrders />}
                            {activeTab === 'media' && <PortalMedia />}
                            {activeTab === 'messages' && <PortalMessages />}
                        </motion.div>
                    </div>
                </div>
                </div>
            </div>
        </>
    );
};
