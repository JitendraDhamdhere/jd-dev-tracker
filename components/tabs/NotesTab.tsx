"use client";

import React, { useState } from "react";
import {
  StickyNote,
  Plus,
  Pin,
  PinOff,
  Trash2,
  Download,
  Eye,
  Edit3,
  Search,
  Tag,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Note } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface NotesTabProps {
  notes: Note[];
  onSaveNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("preview");

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const categories = ["All", ...Array.from(new Set(notes.map((n) => n.category || "General")))];

  const filteredNotes = notes.filter((n) => {
    const matchesCat = selectedCategory === "All" || n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleCreateNew = () => {
    const newNote: Note = {
      id: generateId("note"),
      title: "Untitled Note",
      content: "### New Note\nStart typing markdown here...",
      category: "General",
      tags: ["Dev"],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveNote(newNote);
    setSelectedNoteId(newNote.id);
    setPreviewMode("edit");
  };

  const handleFieldChange = (field: keyof Note, value: any) => {
    if (!selectedNote) return;
    const updated = {
      ...selectedNote,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };
    onSaveNote(updated);
  };

  const handleTogglePin = (note: Note) => {
    onSaveNote({
      ...note,
      isPinned: !note.isPinned,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDownload = (note: Note) => {
    const blob = new Blob([note.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      {/* Left Column: Notes List (w-full lg:w-80 shrink-0) */}
      <div className="w-full lg:w-80 flex flex-col glass-card p-4 h-full overflow-hidden">
        {/* Top Action */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
            <StickyNote size={18} className="text-brand-primary" /> Notes
          </h3>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow"
          >
            <Plus size={14} /> New
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-bg-secondary border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredNotes.map((n) => {
            const isSelected = n.id === selectedNote?.id;
            return (
              <div
                key={n.id}
                onClick={() => setSelectedNoteId(n.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-brand-primary/10 border-brand-primary/40 shadow-glow"
                    : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-xs text-text-primary truncate flex-1">
                    {n.title}
                  </div>
                  {n.isPinned && <Pin size={12} className="text-status-warning shrink-0" />}
                </div>
                <div className="text-[11px] text-text-muted line-clamp-2 mt-1">
                  {n.content.replace(/[#*`]/g, "")}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-text-secondary">
                    {n.category || "General"}
                  </span>
                  <span className="text-[9px] text-text-muted">
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Markdown Editor / Live Preview */}
      <div className="flex-1 glass-card p-6 flex flex-col h-full overflow-hidden">
        {selectedNote ? (
          <>
            {/* Note Editor Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-4">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full bg-transparent font-heading font-bold text-lg lg:text-xl text-text-primary focus:outline-none placeholder:text-text-muted"
                  placeholder="Note Title..."
                />
                <div className="flex items-center gap-3 mt-1.5">
                  <input
                    type="text"
                    value={selectedNote.category || ""}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                    placeholder="Category (e.g. Java)"
                    className="bg-white/5 border border-white/10 rounded-md px-2 py-0.5 text-xs text-text-secondary focus:outline-none focus:border-brand-primary"
                  />
                  <span className="text-xs text-text-muted">
                    Tags: {selectedNote.tags?.join(", ") || "None"}
                  </span>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-bg-secondary p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setPreviewMode("edit")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                      previewMode === "edit"
                        ? "bg-brand-primary text-white"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setPreviewMode("preview")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                      previewMode === "preview"
                        ? "bg-brand-primary text-white"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Eye size={13} /> Preview
                  </button>
                </div>

                <button
                  onClick={() => handleTogglePin(selectedNote)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-status-warning border border-white/10 transition-all"
                  title={selectedNote.isPinned ? "Unpin Note" : "Pin Note"}
                >
                  {selectedNote.isPinned ? <PinOff size={15} /> : <Pin size={15} />}
                </button>

                <button
                  onClick={() => handleDownload(selectedNote)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary border border-white/10 transition-all"
                  title="Download .md"
                >
                  <Download size={15} />
                </button>

                <button
                  onClick={() => onDeleteNote(selectedNote.id)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-status-danger/20 text-text-secondary hover:text-status-danger border border-white/10 transition-all"
                  title="Delete Note"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Note Content (Editor or Preview) */}
            <div className="flex-1 overflow-y-auto">
              {previewMode === "edit" ? (
                <textarea
                  value={selectedNote.content}
                  onChange={(e) => handleFieldChange("content", e.target.value)}
                  placeholder="Write your markdown note here..."
                  className="w-full h-full bg-transparent text-sm font-mono text-text-primary leading-relaxed focus:outline-none resize-none p-2"
                />
              ) : (
                <div className="prose prose-invert max-w-none text-sm text-text-primary leading-relaxed space-y-3">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedNote.content || "*No content written yet. Click Edit to begin.*"}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
            Select a note or click &quot;New&quot; to create one.
          </div>
        )}
      </div>
    </div>
  );
};
