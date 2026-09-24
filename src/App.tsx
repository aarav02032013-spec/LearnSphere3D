import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Model3DViewer } from './components/Model3DViewer';
import { AdvancedLab } from './components/AdvancedLab';
import { ChemistryLab } from './components/ChemistryLab';
import { PhysicsSimulations } from './components/PhysicsSimulations';
import { NotesSection } from './components/NotesSection';
import { LabGuideModal } from './components/LabGuideModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GradeLevel, NoteItem } from './types';
import { DEFAULT_NOTES } from './data/defaultNotes';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const LOCAL_STORAGE_NOTES_KEY = 'omnilearn_student_notes_v1';

export default function App() {
  const [activeSection, setActiveSection] = useState<
    'learning' | 'advanced_lab' | 'chemistry' | 'physics' | 'notes'
  >('learning');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [guideOpen, setGuideOpen] = useState<boolean>(false);

  // Notes state with localStorage persistence
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_NOTES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load notes from localStorage', e);
    }
    return DEFAULT_NOTES;
  });

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes to localStorage', e);
    }
  }, [notes]);

  // Toast Notification when a note is logged
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddNote = (
    title: string,
    subject: NoteItem['subject'],
    content: string,
    tags: string[],
    labRef: string
  ) => {
    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      title,
      subject,
      content,
      tags,
      labReference: labRef,
      updatedAt: Date.now()
    };

    setNotes((prev) => [newNote, ...prev]);
    setToastMessage(`Saved "${title}" to your Notes!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveNote = (updatedNote: NoteItem) => {
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === updatedNote.id);
      if (exists) {
        return prev.map((n) => (n.id === updatedNote.id ? updatedNote : n));
      }
      return [updatedNote, ...prev];
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleImportNotes = (imported: NoteItem[]) => {
    setNotes((prev) => {
      const mergedMap = new Map<string, NoteItem>();
      prev.forEach((n) => mergedMap.set(n.id, n));
      imported.forEach((n) => mergedMap.set(n.id, n));
      return Array.from(mergedMap.values());
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Header */}
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        selectedGrade={selectedGrade}
        setSelectedGrade={setSelectedGrade}
        audioMuted={audioMuted}
        setAudioMuted={setAudioMuted}
        onOpenGuide={() => setGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        <ErrorBoundary
          key={activeSection}
          fallbackTitle={`Error in ${
            activeSection === 'learning'
              ? '3D Interactive Learning'
              : activeSection === 'advanced_lab'
              ? 'Advanced Virtual Lab'
              : activeSection === 'chemistry'
              ? 'Chemistry Lab'
              : activeSection === 'physics'
              ? 'Physics Simulations'
              : 'Notes & Study Materials'
          }`}
          fallbackMessage="An unexpected error occurred while rendering this educational module. You can reset this section or refresh the page."
        >
          {activeSection === 'learning' && (
            <Model3DViewer
              selectedGrade={selectedGrade}
              onAddNote={handleAddNote}
              audioMuted={audioMuted}
            />
          )}

          {activeSection === 'advanced_lab' && (
            <AdvancedLab onAddNote={handleAddNote} />
          )}

          {activeSection === 'chemistry' && (
            <ChemistryLab onAddNote={handleAddNote} />
          )}

          {activeSection === 'physics' && (
            <PhysicsSimulations onAddNote={handleAddNote} />
          )}

          {activeSection === 'notes' && (
            <NotesSection
              notes={notes}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onImportNotes={handleImportNotes}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/95 border border-cyan-500/50 rounded-2xl shadow-2xl text-xs text-white backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => {
              setActiveSection('notes');
              setToastMessage(null);
            }}
            className="flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 ml-2"
          >
            <span>View Notes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Guide Modal */}
      <LabGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
