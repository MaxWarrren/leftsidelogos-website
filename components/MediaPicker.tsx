import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Check, Image as ImageIcon, FolderOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type MediaItem = {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    size: number;
    category: 'Brand Assets' | 'Mockups' | 'Final Designs';
    created_at: string;
    uploader_id: string;
};

interface MediaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (items: MediaItem[]) => void;
    multiple?: boolean;
    defaultCategory?: 'Brand Assets' | 'Mockups' | 'Final Designs';
    title?: string;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({ 
    isOpen, 
    onClose, 
    onSelect, 
    multiple = false, 
    defaultCategory = 'Brand Assets',
    title = "Select Media"
}) => {
    const { organization, profile } = useAuth();
    const [activeTab, setActiveTab] = useState(defaultCategory);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!isOpen || !organization) return;

        const fetchMedia = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('media_items')
                .select('*')
                .eq('organization_id', organization.id)
                .eq('category', activeTab)
                .order('created_at', { ascending: false });

            if (data) setMediaItems(data as MediaItem[]);
            setLoading(false);
        };

        fetchMedia();

        const channel = supabase
            .channel(`media-picker-${organization.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'media_items', filter: `organization_id=eq.${organization.id}` }, () => fetchMedia())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen, organization, activeTab]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !organization || !profile) return;
        
        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${organization.id}/${activeTab}/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage.from('organization-assets').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data, error: dbError } = await supabase.from('media_items').insert({
                organization_id: organization.id,
                uploader_id: profile.id,
                file_path: filePath,
                file_name: file.name,
                file_type: file.type,
                size: file.size,
                category: activeTab,
            }).select().single();

            if (dbError) throw dbError;

            // Auto-select the newly uploaded file
            if (data) {
                if (multiple) {
                    setSelectedIds(prev => new Set(prev).add(data.id));
                } else {
                    setSelectedIds(new Set([data.id]));
                }
            }

        } catch (error: any) {
            console.error(error);
            alert("Upload failed: " + error.message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                if (!multiple) newSet.clear();
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleConfirm = () => {
        const selectedMedia = mediaItems.filter(item => selectedIds.has(item.id));
        onSelect(selectedMedia);
        onClose();
        setSelectedIds(new Set()); // Reset on close
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-lsl-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col relative z-10 overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-lsl-black">{title}</h2>
                        <p className="text-gray-500 text-sm mt-1">Select from your portal or upload a new file.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-lsl-black hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                        <div className="flex flex-wrap gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                            {["Brand Assets", "Mockups", "Final Designs"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat as any)}
                                    className={`px-4 py-2 text-sm font-bold transition-all rounded-lg ${
                                        activeTab === cat
                                            ? "bg-lsl-black text-white shadow-sm"
                                            : "text-gray-500 hover:text-lsl-black hover:bg-gray-50"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        
                        <div className="relative">
                            <input
                                type="file"
                                id="picker-file-upload"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                accept="image/*"
                            />
                            <label htmlFor="picker-file-upload" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm ${
                                uploading ? 'bg-gray-100 text-gray-400' : 'bg-white border border-gray-200 text-lsl-black hover:bg-gray-50'
                            }`}>
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                Upload New
                            </label>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-full min-h-[200px]">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                            </div>
                        ) : mediaItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                                <div className="p-5 bg-white rounded-2xl mb-4 shadow-sm">
                                    <FolderOpen className="h-8 w-8 text-gray-300" />
                                </div>
                                <p className="font-bold text-lsl-black">No files in {activeTab}</p>
                                <p className="text-sm text-gray-500 mt-1">Upload a new file to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {mediaItems.map((item) => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => toggleSelection(item.id)}
                                        className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                                            selectedIds.has(item.id) ? 'border-lsl-blue shadow-md' : 'border-gray-100 hover:border-gray-300 shadow-sm'
                                        }`}
                                    >
                                        <div className="aspect-square bg-gray-50 relative">
                                            {item.file_type.startsWith('image/') ? (
                                                <StorageImagePreview path={item.file_path} />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <ImageIcon className="h-10 w-10 text-gray-300" />
                                                </div>
                                            )}
                                            
                                            {selectedIds.has(item.id) && (
                                                <div className="absolute top-2 right-2 h-6 w-6 bg-lsl-blue rounded-full flex items-center justify-center shadow-md">
                                                    <Check className="h-4 w-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className={`p-3 bg-white ${selectedIds.has(item.id) ? 'bg-lsl-blue/5' : ''}`}>
                                            <p className="font-bold text-xs text-lsl-black truncate" title={item.file_name}>{item.file_name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                    <span className="text-sm font-medium text-gray-500">
                        {selectedIds.size} file{selectedIds.size !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirm}
                            disabled={selectedIds.size === 0}
                            className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
                                selectedIds.size > 0 
                                    ? 'bg-lsl-blue text-white hover:bg-lsl-blue/90' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Confirm Selection
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Helper component
function StorageImagePreview({ path }: { path: string }) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const getUrl = async () => {
            const { data } = await supabase.storage.from('organization-assets').createSignedUrl(path, 3600);
            if (data?.signedUrl) setUrl(data.signedUrl);
        };
        getUrl();
    }, [path]);

    if (!url) return <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-gray-300" /></div>;

    return <img src={url} className="h-full w-full object-cover" alt="Preview" />;
}
