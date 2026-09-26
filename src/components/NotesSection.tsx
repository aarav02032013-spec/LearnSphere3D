import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Star, 
  Trash2, 
  Download, 
  Upload, 
  Printer, 
  Tag, 
  Clock, 
  Check,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { NoteItem } from '../types';
import { cleanAIMathFormatting } from './StudyBuddy/lumiKnowledgeEngine';

interface NotesSectionProps {
  notes: NoteItem[];
  onSaveNote: (note: NoteItem) => void;
  onDeleteNote: (id: string) => void;
  onImportNotes: (imported: NoteItem[]) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
  onImportNotes
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Form states for active note
  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const [editTitle, setEditTitle] = useState<string>(activeNote?.title || '');
  const [editSubject, setEditSubject] = useState<NoteItem['subject']>(activeNote?.subject || 'General');
  const [editContent, setEditContent] = useState<string>(activeNote?.content || '');
  const [editTags, setEditTags] = useState<string>(activeNote?.tags.join(', ') || '');

  // Synchronize edit inputs when activeNote changes
  React.useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditSubject(activeNote.subject);
      setEditContent(activeNote.content);
      setEditTags(activeNote.tags.join(', '));
      setIsEditing(false);
    }
  }, [selectedNoteId]);

  // Filtering
  const filteredNotes = notes.filter((n) => {
    const matchesSub = selectedSubject === 'All' || n.subject === selectedSubject;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q));
    return matchesSub && matchesSearch;
  });

  const handleCreateNewNote = () => {
    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      title: 'New Study Note',
      subject: selectedSubject === 'All' ? 'General' : (selectedSubject as NoteItem['subject']),
      content: 'Write your scientific hypotheses, experiment observations, and formulas here...',
      tags: ['Study Notes'],
      updatedAt: Date.now()
    };
    onSaveNote(newNote);
    setSelectedNoteId(newNote.id);
    setIsEditing(true);
  };

  const handleSaveCurrent = () => {
    if (!activeNote) return;
    const updated: NoteItem = {
      ...activeNote,
      title: editTitle.trim() || 'Untitled Note',
      subject: editSubject,
      content: editContent,
      tags: editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      updatedAt: Date.now()
    };
    onSaveNote(updated);
    setIsEditing(false);
  };

  const handleToggleFavorite = (note: NoteItem) => {
    onSaveNote({
      ...note,
      favorite: !note.favorite
    });
  };

  // Export JSON
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learnsphere-study-notes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Exported notes file downloaded!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Import JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportNotes(parsed);
          setExportNotice(`Imported ${parsed.length} study notes!`);
          setTimeout(() => setExportNotice(null), 3000);
        }
      } catch (err) {
        alert('Invalid notes JSON format.');
      }
    };
    reader.readAsText(file);
  };

  // Print Document (opens browser print)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Personal Study Notes</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Permanently saved to your browser with tagging, markdown formatting, and one-click experiment attachments.
          </p>
        </div>

        {/* Global Notebook Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            title="Download Notes Backup (JSON)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <label
            title="Import Notes (JSON)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={handlePrint}
            title="Print or Save Formatted PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          <button
            onClick={handleCreateNewNote}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-all shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl text-xs text-cyan-300 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Main Notes Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Note Explorer & Filters */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search & Subject Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search notes, tags, formulas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Subject Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
              {(['All', 'Biology', 'Mathematics', 'Chemistry', 'Physics', 'Engineering'] as const).map(
                (subj) => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedSubject === subj
                        ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {subj}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
                <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-xs">No notes found matching your search.</p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = activeNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white truncate font-display">
                        {note.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(note);
                        }}
                        className="text-slate-500 hover:text-amber-400 transition-colors"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            note.favorite ? 'text-amber-400 fill-amber-400' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span className="font-semibold text-cyan-400">{note.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {cleanAIMathFormatting(note.content).replace(/###|##|#|\*|`/g, '')}
                    </p>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px] text-slate-400">
                        {note.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-slate-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Note Reader & Editor */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 min-h-[580px] flex flex-col">
          {activeNote ? (
            <>
              {/* Note Header / Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-lg font-bold text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Note title..."
                  />
                ) : (
                  <div>
                    <h3 className="text-xl font-bold text-white font-display">
                      {activeNote.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="font-semibold text-cyan-400">{activeNote.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span>Updated {new Date(activeNote.updatedAt).toLocaleString()}</span>
                      {activeNote.labReference && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400 font-mono text-[11px]">
                            {activeNote.labReference}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Editor Action Buttons */}
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <button
                      onClick={handleSaveCurrent}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                    >
                      Edit Note
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteNote(activeNote.id)}
                    title="Delete Note"
                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editing Controls bar */}
              {isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Subject:</label>
                    <select
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value as NoteItem['subject'])}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Biology">Biology</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Physics">Physics</option>
                      <option value="Engineering">Engineering</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Tags (comma-separated):</label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="e.g. Kinematics, Velocity, Earth"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* Content Area */}
              <div className="flex-1">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={16}
                    placeholder="Write detailed observation notes, calculations, and formulas..."
                    className="w-full h-full min-h-[380px] p-4 bg-slate-950/90 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
                  />
                ) : (
                  <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-3 leading-relaxed whitespace-pre-line">
                    {cleanAIMathFormatting(activeNote.content)}
                  </div>
                )}
              </div>

              {/* Footer Tags */}
              {!isEditing && activeNote.tags && activeNote.tags.length > 0 && (
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2 flex-wrap text-xs text-slate-400">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  {activeNote.tags.map((tag, idx) => (
                    <span key={idx} className="text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-slate-500 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs">No notes available. Click "New Note" to create one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
