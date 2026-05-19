"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Admin() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [staged, setStaged] = useState([]);
  const [editingCaption, setEditingCaption] = useState(null);
  const inputRef = useRef(null);

  const load = () =>
    fetch("/api/upload").then((r) => r.json()).then(setImages);

  useEffect(() => { load(); }, []);

  const stageFiles = (files) => {
    const newStaged = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: "",
    }));
    setStaged((s) => [...s, ...newStaged]);
  };

  const uploadStaged = async () => {
    setUploading(true);
    for (const item of staged) {
      const form = new FormData();
      form.append("file", item.file);
      form.append("caption", item.caption);
      await fetch("/api/upload", { method: "POST", body: form });
    }
    setStaged([]);
    await load();
    setUploading(false);
  };

  const saveCaption = async (filename, caption) => {
    await fetch("/api/upload", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, caption }),
    });
    setImages((imgs) =>
      imgs.map((img) => img.filename === filename ? { ...img, caption } : img)
    );
    setEditingCaption(null);
  };

  const remove = async (filename) => {
    await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    setImages((imgs) => imgs.filter((img) => img.filename !== filename));
  };

  return (
    <div className="min-h-screen font-ropaSans text-white px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl mb-1">Admin</h1>
      <p className="text-accent-text text-sm mb-8">Life images — shown in the Images tab on search.</p>

      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-y-3 cursor-pointer transition-colors duration-150 mb-6 ${
          dragOver ? "border-[#ADA6CC] bg-white bg-opacity-5" : "border-white border-opacity-20 hover:border-opacity-40"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); stageFiles(e.dataTransfer.files); }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="opacity-40">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="text-accent-text text-sm">drag & drop or click to select</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => stageFiles(e.target.files)} />
      </div>

      {/* Staging area */}
      {staged.length > 0 && (
        <div className="mb-8">
          <p className="text-sm text-accent-text mb-3">{staged.length} image{staged.length > 1 ? "s" : ""} ready to upload — add captions</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {staged.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-y-2">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-dark-purple-300">
                  <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setStaged((s) => s.filter((_, i) => i !== idx))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black bg-opacity-60 flex items-center justify-center hover:bg-opacity-80"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="add a caption..."
                  value={item.caption}
                  onChange={(e) => setStaged((s) => s.map((si, i) => i === idx ? { ...si, caption: e.target.value } : si))}
                  className="bg-accent-color border border-white border-opacity-10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-accent-text focus:outline-none focus:border-opacity-30 w-full"
                />
              </div>
            ))}
          </div>
          <button
            onClick={uploadStaged}
            disabled={uploading}
            className="px-6 py-2 rounded-xl bg-[#ADA6CC] bg-opacity-20 border border-[#ADA6CC] border-opacity-40 text-sm hover:bg-opacity-30 transition-colors duration-150 disabled:opacity-50"
          >
            {uploading ? "uploading..." : `upload ${staged.length} image${staged.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* Uploaded grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.filename} className="flex flex-col gap-y-1.5">
              <div className="group relative aspect-square rounded-lg overflow-hidden bg-dark-purple-300">
                <Image src={`/life-img/${img.filename}`} alt="" fill className="object-cover" />
                <button
                  onClick={() => remove(img.filename)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-opacity-80"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              {editingCaption === img.filename ? (
                <input
                  autoFocus
                  type="text"
                  defaultValue={img.caption}
                  onBlur={(e) => saveCaption(img.filename, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveCaption(img.filename, e.target.value);
                    if (e.key === "Escape") setEditingCaption(null);
                  }}
                  className="bg-accent-color border border-[#ADA6CC] border-opacity-50 rounded-lg px-2 py-1 text-xs text-white focus:outline-none w-full"
                />
              ) : (
                <p
                  onClick={() => setEditingCaption(img.filename)}
                  className="text-xs text-accent-text cursor-pointer hover:text-white transition-colors duration-150 truncate px-0.5"
                  title="click to edit"
                >
                  {img.caption || <span className="opacity-40 italic">add caption</span>}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && staged.length === 0 && (
        <p className="text-accent-text text-sm opacity-50">no images yet</p>
      )}
    </div>
  );
}
