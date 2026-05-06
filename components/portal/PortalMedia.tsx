import React, { useState, useEffect } from "react";
import { Upload, FileIcon, Trash2, Download, Loader2, FolderOpen, AlertCircle } from "lucide-react";
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';

// Utility for formatting bytes
function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

type MediaItem = {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    size: number;
    category: 'Brand Assets' | 'Mockups' | 'Final Designs';
    created_at: string;
    uploader_id: string;
};

type ClientFile = {
    id: string;
    title: string;
    status: string;
    file_url: string;
    type: 'Contract' | 'Invoice' | 'Tax Document';
    created_at: string;
    organization_id: string;
};

export const PortalMedia: React.FC = () => {
    const { organization, profile } = useAuth();
    const [activeTab, setActiveTab] = useState<string>("Brand Assets");
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [fileItems, setFileItems] = useState<ClientFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    const isFileTab = activeTab === "Files" || activeTab === "Taxes";

    useEffect(() => {
        if (!organization) {
            setLoading(false);
            return;
        }

        const fetchItems = async () => {
            setLoading(true);

            if (isFileTab) {
                let query = supabase
                    .from('contracts')
                    .select('*')
                    .eq('organization_id', organization.id)
                    .order('created_at', { ascending: false });

                if (activeTab === "Taxes") {
                    query = query.eq('type', 'Tax Document');
                } else {
                    query = query.neq('type', 'Tax Document');
                }

                const { data } = await query;
                if (data) setFileItems(data as ClientFile[]);
            } else {
                const { data } = await supabase
                    .from('media_items')
                    .select('*')
                    .eq('organization_id', organization.id)
                    .eq('category', activeTab)
                    .order('created_at', { ascending: false });

                if (data) setMediaItems(data as MediaItem[]);
            }
            setLoading(false);
        };

        fetchItems();

        const channel = supabase
            .channel(`media-gallery-${organization.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', filter: `organization_id=eq.${organization.id}` }, () => fetchItems())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [organization, activeTab]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !organization || !profile) return;
        setUploading(true);

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

        try {
            let bucket = 'organization-assets';
            let filePath = isFileTab 
                ? `${organization.id}/documents/${fileName}`
                : `${organization.id}/${activeTab}/${fileName}`;

            const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
            if (uploadError) throw uploadError;

            if (isFileTab) {
                const { error: dbError } = await supabase.from('contracts').insert({
                    organization_id: organization.id,
                    title: file.name,
                    file_url: filePath,
                    type: activeTab === 'Taxes' ? 'Tax Document' : 'Contract',
                    status: 'pending',
                    metadata: { uploaded_by: profile.id, size: file.size, original_name: file.name }
                });
                if (dbError) throw dbError;
            } else {
                const { error: dbError } = await supabase.from('media_items').insert({
                    organization_id: organization.id,
                    uploader_id: profile.id,
                    file_path: filePath,
                    file_name: file.name,
                    file_type: file.type,
                    size: file.size,
                    category: activeTab,
                });
                if (dbError) throw dbError;
            }

            // Let real-time subscription handle the UI update
        } catch (error: any) {
            console.error(error);
            alert("Upload failed: " + error.message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDownload = async (path: string, fileName: string) => {
        try {
            const { data, error } = await supabase.storage.from('organization-assets').download(path);
            if (error) throw error;
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error(error);
            alert("Download failed");
        }
    };

    const handleDelete = async (id: string, path: string, isFile: boolean) => {
        if (!confirm("Are you sure you want to delete this file?")) return;
        try {
            await supabase.storage.from('organization-assets').remove([path]);
            const table = isFile ? 'contracts' : 'media_items';
            await supabase.from(table).delete().eq('id', id);
        } catch (error) {
            console.error(error);
            alert("Deletion failed");
        }
    };

    if (!organization) {
        return <div className="text-center py-12 text-gray-500 font-medium">Please join an organization.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-lsl-black">Media & Files</h2>
                <div className="relative">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <label htmlFor="file-upload" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm ${
                        uploading ? 'bg-gray-100 text-gray-400' : 'bg-lsl-black text-white hover:bg-lsl-black/90'
                    }`}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Upload {isFileTab ? 'Document' : 'Image'}
                    </label>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                {["Brand Assets", "Mockups", "Final Designs", "Files", "Taxes"].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-5 py-2 text-sm font-bold transition-all rounded-lg ${
                            activeTab === cat
                                ? "bg-lsl-black text-white shadow-sm"
                                : "text-gray-500 hover:text-lsl-black hover:bg-gray-50"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                    </div>
                ) : isFileTab ? (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fileItems.map((file) => (
                                        <tr key={file.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <span className="bg-gray-100 text-gray-600 font-bold text-[10px] uppercase px-3 py-1 rounded-full">
                                                    {file.type}
                                                </span>
                                            </td>
                                            <td className="p-4 font-semibold text-lsl-black">{file.title}</td>
                                            <td className="p-4 text-sm text-gray-500">{new Date(file.created_at).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <span className={`font-bold uppercase text-[10px] px-3 py-1 rounded-full border ${
                                                    (file.status === 'signed' || file.status === 'paid') ? 'border-green-200 bg-green-50 text-green-700' :
                                                    file.status === 'pending' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                                                    'border-red-200 bg-red-50 text-red-700'
                                                }`}>
                                                    {file.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {file.file_url && (
                                                    <button onClick={() => handleDownload(file.file_url, file.title)} className="p-2 text-gray-400 hover:text-lsl-black hover:bg-gray-100 rounded-lg transition-colors">
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {fileItems.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-gray-400 italic">
                                                No {activeTab} found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <>
                        {mediaItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
                                <div className="p-5 bg-gray-50 rounded-2xl mb-4">
                                    <FolderOpen className="h-8 w-8 text-gray-300" />
                                </div>
                                <p className="font-bold text-lsl-black">No files in {activeTab}</p>
                                <p className="text-sm text-gray-500 mt-1">Upload your first file here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {mediaItems.map((item) => (
                                    <div key={item.id} className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm">
                                        <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
                                            {item.file_type.startsWith('image/') ? (
                                                <StorageImage path={item.file_path} alt={item.file_name} />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <FileIcon className="h-10 w-10 text-gray-300" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.file_type.split('/')[1] || 'FILE'}</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-lsl-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                                                <button onClick={() => handleDownload(item.file_path, item.file_name)} className="h-10 w-10 bg-white text-lsl-black flex items-center justify-center rounded-full hover:scale-110 transition-transform">
                                                    <Download className="h-5 w-5" />
                                                </button>
                                                {/* Only allow deleting if they uploaded it */}
                                                {item.uploader_id === profile?.id && (
                                                    <button onClick={() => handleDelete(item.id, item.file_path, false)} className="h-10 w-10 bg-red-500 text-white flex items-center justify-center rounded-full hover:scale-110 transition-transform">
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <p className="font-bold text-xs text-lsl-black truncate mb-1" title={item.file_name}>{item.file_name}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-gray-400 font-medium">{formatBytes(item.size)}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">{new Date(item.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

function StorageImage({ path, alt }: { path: string, alt: string }) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const getUrl = async () => {
            const { data } = await supabase.storage.from('organization-assets').createSignedUrl(path, 3600);
            if (data?.signedUrl) setUrl(data.signedUrl);
        };
        getUrl();
    }, [path]);

    if (!url) return <div className="h-full w-full flex items-center justify-center bg-gray-50"><Loader2 className="h-4 w-4 animate-spin text-gray-300" /></div>;

    return <img src={url} alt={alt} className="h-full w-full object-cover" />;
}
