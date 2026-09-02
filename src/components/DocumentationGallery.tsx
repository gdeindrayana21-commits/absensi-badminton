import React, { useState } from 'react';
import { DocumentationItem, BADMINTON_MATERIALS } from '../types';
import { saveDocumentation } from '../utils/storage';
import {
  Camera,
  Plus,
  Calendar,
  Dumbbell,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Eye
} from 'lucide-react';
import { showToast } from './Toast';

interface DocumentationGalleryProps {
  documentation?: DocumentationItem[];
}

export const DocumentationGallery: React.FC<DocumentationGalleryProps> = ({
  documentation = []
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activePreview, setActivePreview] = useState<DocumentationItem | null>(null);

  const [formData, setFormData] = useState<Omit<DocumentationItem, 'id' | 'timestamp'>>({
    date: new Date().toISOString().split('T')[0],
    title: 'Drill Smash & Turnamen Mini Latihan',
    material: BADMINTON_MATERIALS[6],
    imageUrl: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&w=800&q=80',
    description: 'Dokumentasi pertandingan internal ganda putra dan putri SMA Negeri 1 Tejakula.'
  });

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setFormData((prev) => ({ ...prev, imageUrl: String(evt.target?.result) }));
        showToast('Foto berhasil dimuat!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: DocumentationItem = {
      ...formData,
      id: `doc-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    const updated = [newDoc, ...documentation];
    saveDocumentation(updated);
    showToast('Dokumentasi kegiatan berhasil ditambahkan! 📸', 'success');
    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = documentation.filter((d) => d.id !== id);
    saveDocumentation(updated);
    showToast('Dokumentasi dihapus.', 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sports-glass p-6 rounded-3xl border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide uppercase">
              📸 DOKUMENTASI KEGIATAN BULUTANGKIS
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Galeri foto sesi latihan dan turnamen bulutangkis SMA Negeri 1 Tejakula
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>➕ UPLOAD DOKUMENTASI</span>
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentation.map((doc) => (
          <div
            key={doc.id}
            className="sports-glass-card rounded-3xl overflow-hidden border-emerald-500/20 hover:border-emerald-500/50 transition-all group shadow-xl flex flex-col justify-between"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-950">
              <img
                src={doc.imageUrl}
                alt={doc.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                {doc.date}
              </span>

              <button
                onClick={() => setActivePreview(doc)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md text-white hover:text-emerald-400 border border-slate-700 transition-colors"
                title="Lihat Detail Foto"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5" />
                  {doc.material}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed pt-1 line-clamp-2">
                  {doc.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <span className="text-[11px] text-slate-400">SMAN 1 Tejakula</span>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Hapus Foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-heading uppercase flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                UPLOAD DOKUMENTASI LATIHAN
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Nama Kegiatan *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Contoh: Latihan Smash & Turnamen Ganda Mini"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Tanggal *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Materi *</label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    {BADMINTON_MATERIALS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload or URL */}
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Pilih File Foto atau Input Link</label>
                <div className="flex gap-2 mb-2">
                  <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-emerald-500 cursor-pointer text-slate-300 hover:text-white">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Pilih Foto dari Galeri HP / PC</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="Atau tempel URL gambar langsung..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {formData.imageUrl && (
                <div className="rounded-xl overflow-hidden aspect-video max-h-36 bg-slate-950 border border-slate-800">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Keterangan Foto</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tuliskan keterangan suasana latihan, siswa yang berpartisipasi, dll..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  SIMPAN FOTO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setActivePreview(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:text-emerald-400 border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video bg-black flex items-center justify-center">
              <img
                src={activePreview.imageUrl}
                alt={activePreview.title}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] w-full object-contain"
              />
            </div>
            <div className="p-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span>{activePreview.date}</span>
                <span>{activePreview.material}</span>
              </div>
              <h3 className="text-xl font-bold text-white">{activePreview.title}</h3>
              <p className="text-sm text-slate-300">{activePreview.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
