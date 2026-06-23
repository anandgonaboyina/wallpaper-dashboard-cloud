'use client';
import { useState, useEffect, useRef } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Plus, X, StickyNote, Trash2, Undo, Redo, Bold, Italic, Underline, List, Download, ChevronLeft } from 'lucide-react';
import ScrollableWithArrows from './ScrollableWithArrows';

function EditorBlock({ date, initialHtml, onChange }: { date: string; initialHtml: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    // Only set initial HTML once when mounting to prevent cursor jumps
    if (editorRef.current && editorRef.current.innerHTML === '') {
      editorRef.current.innerHTML = initialHtml;
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Ensure we save when the component unmounts (e.g. modal closed)
      if (editorRef.current) {
        onChangeRef.current(editorRef.current.innerHTML);
      }
    };
  }, [initialHtml]);

  const handleInput = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (editorRef.current) {
        onChangeRef.current(editorRef.current.innerHTML);
      }
    }, 30000); // Wait 30 seconds of inactivity before auto-saving
  };

  const handleBlur = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (editorRef.current) {
      onChangeRef.current(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="mb-4 md:mb-8 relative group">
      <h3 className="text-[10px] md:text-xl font-bold text-white/50 border-b border-white/10 pb-1 md:pb-2 mb-1.5 md:mb-3 select-none tracking-wide">
        {date}
      </h3>
      <div
        ref={editorRef}
        contentEditable
        spellCheck={false}
        onInput={handleInput}
        onBlur={handleBlur}
        className="select-text cursor-text outline-none text-white/90 min-h-[40px] md:min-h-[60px] text-xs md:text-lg leading-relaxed transition-all focus:bg-white/5 p-2 md:p-4 rounded-lg md:rounded-2xl border border-transparent focus:border-white/10 [&_h1]:text-lg md:[&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-1.5 md:[&_h1]:mb-4 [&_h2]:text-base md:[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-1 md:[&_h2]:mb-3 [&_p]:mb-1 md:[&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 md:[&_ul]:ml-6 [&_b]:font-bold [&_i]:italic [&_u]:underline"
      />
    </div>
  );
}

export default function NotesManager() {
  const { isNotesOpen, toggleNotes, notes, activeNoteId, addNote, updateNoteTitle, updateNoteEntry, deleteNote, setActiveNote } = useDashboardStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !isNotesOpen) return null;

  return (
    <NotepadModal
      toggleNotes={toggleNotes}
      notes={notes}
      activeNoteId={activeNoteId}
      addNote={addNote}
      updateNoteTitle={updateNoteTitle}
      updateNoteEntry={updateNoteEntry}
      deleteNote={deleteNote}
      setActiveNote={setActiveNote}
    />
  );
}

function NotepadModal({ toggleNotes, notes, activeNoteId, addNote, updateNoteTitle, updateNoteEntry, deleteNote, setActiveNote }: any) {
  const [format, setFormat] = useState({ bold: false, italic: false, underline: false, list: false });

  // Controls mobile drill-down view
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);

  useEffect(() => {
    const checkFormat = () => {
      setFormat({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        list: document.queryCommandState('insertUnorderedList')
      });
    };
    document.addEventListener('selectionchange', checkFormat);
    return () => document.removeEventListener('selectionchange', checkFormat);
  }, []);

  const activeNote = notes.find((n: any) => n.id === activeNoteId) || notes[0];

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Handle legacy notes from old storage format safely
  const entries = activeNote?.entries || {};
  if (activeNote && !activeNote.entries && activeNote.content) {
    entries[todayStr] = activeNote.content; // Recover old text
  }

  // Get all existing dates for the active note
  const existingDates = Object.keys(entries).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  if (!existingDates.includes(todayStr)) {
    existingDates.push(todayStr); // Always show today at the bottom
  }

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
  };

  const downloadSingleNote = (note: any) => {
    const jsonString = JSON.stringify(note, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeTitle = (note.title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `note-${safeTitle}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto">
      <div
        className="absolute inset-0"
        onClick={() => {
          toggleNotes();
          setIsMobileDetailView(false);
        }}
      />

      <div className="relative w-full max-w-6xl h-[80vh] md:h-[70vh] flex flex-col md:flex-row rounded-2xl md:rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">

        {/* Top/Left Sidebar: Notes List */}
        <div className={`${isMobileDetailView ? 'hidden md:flex' : 'flex'} w-full md:w-1/4 md:max-w-[300px] h-full bg-white/5 border-r border-white/10 flex-col shrink-0`}>
          <div className="p-2.5 md:p-4 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
            <h2 className="text-sm md:text-lg font-medium text-white tracking-wide flex items-center gap-1.5 md:gap-2">
              <StickyNote className="text-yellow-400 w-4 h-4 md:w-[18px] md:h-[18px]" /> Notes
            </h2>
            <div className="flex items-center gap-0.5 md:gap-1">
              <button
                onClick={() => {
                  const token = localStorage.getItem('dashboard_sync_token') || localStorage.getItem('dashboard_token');
                  if (token) {
                    window.location.href = `/api/export/notes?token=${token}`;
                  } else {
                    alert('Please log in first.');
                  }
                }}
                className="p-1.5 md:p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg md:rounded-xl transition-colors"
                title="Export All Notes"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={addNote}
                className="p-1.5 md:p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg md:rounded-xl transition-colors"
                title="New Note"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              {/* Mobile Only Modal Close Button when in List View */}
              <button
                onClick={() => {
                  toggleNotes();
                  setIsMobileDetailView(false);
                }}
                className="md:hidden p-1.5 text-white/60 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden flex flex-col">
            <ScrollableWithArrows className="p-1.5 md:p-2 flex flex-col gap-1 pr-1">
              {notes.map((note: any) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveNote(note.id);
                    setIsMobileDetailView(true);
                  }}
                  className={`group flex items-center justify-between p-2 md:p-3 rounded-lg md:rounded-xl cursor-pointer transition-all min-w-0 ${activeNoteId === note.id ? 'bg-white/20 text-white shadow-md' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                >
                  <span className="font-medium truncate pr-2 text-xs md:text-base flex-1">{note.title || 'Untitled Note'}</span>
                  <div className="flex items-center gap-0.5 md:gap-1 shrink-0 transition-all">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSingleNote(note);
                      }}
                      className="p-1 md:p-1.5 rounded-md md:rounded-lg hover:bg-blue-500/20 hover:text-blue-400 transition-all text-white/40 group-hover:text-white/80"
                      title="Download Note"
                    >
                      <Download className="w-3.5 h-3.5 md:w-[14px] md:h-[14px]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete "${note.title || 'Untitled Note'}"?`)) {
                          deleteNote(note.id);
                        }
                      }}
                      className={`p-1 md:p-1.5 rounded-md md:rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all text-white/40 group-hover:text-white/80 ${notes.length === 1 ? 'hidden' : ''}`}
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5 md:w-[14px] md:h-[14px]" />
                    </button>
                  </div>
                </div>
              ))}
            </ScrollableWithArrows>
          </div>
        </div>

        {/* Bottom/Right Pane: Editor Area */}
        <div className={`${isMobileDetailView ? 'flex' : 'hidden md:flex'} flex-1 flex-col relative bg-black/20 min-h-0 w-full`}>

          {/* Editor Top Bar */}
          {activeNote && (
            <div className="flex items-center justify-between p-2 md:p-4 border-b border-white/10 shrink-0 bg-black/20">
              <div className="flex items-center flex-1 min-w-0 pr-2 md:pr-4">
                {isMobileDetailView && (
                  <button
                    onClick={() => setIsMobileDetailView(false)}
                    className="md:hidden flex items-center justify-center p-1.5 mr-2 bg-white/5 border border-white/10 rounded-md text-white/60 hover:text-white transition-colors shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => updateNoteTitle(activeNote.id, e.target.value)}
                  placeholder="Note Title"
                  className="bg-transparent text-sm md:text-2xl font-bold text-white outline-none placeholder:text-white/20 w-full min-w-0 truncate"
                />
              </div>

              <button
                onClick={() => {
                  toggleNotes();
                  setIsMobileDetailView(false);
                }}
                className="p-1.5 md:p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg md:rounded-xl transition-colors shrink-0"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          )}

          {activeNote && (
            <div className="flex-1 flex flex-col relative overflow-hidden">
              <ScrollableWithArrows className="px-3 md:px-6 pt-3 md:pt-6 pb-20 md:pb-32" downArrowOffset="bottom-16 md:bottom-24">
                {existingDates.map((date) => (
                  <EditorBlock
                    key={`${activeNote.id}-${date}`}
                    date={date}
                    initialHtml={entries[date] || ''}
                    onChange={(html) => updateNoteEntry(activeNote.id, date, html)}
                  />
                ))}
              </ScrollableWithArrows>
            </div>
          )}

          {/* Floating Toolbar - Responsive Scrollable Container */}
          {activeNote && (
            <div className="absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 md:gap-1.5 px-1.5 md:px-4 py-1.5 md:py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg md:rounded-2xl shadow-2xl z-50 w-max max-w-[95%] overflow-x-auto no-scrollbar">
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('undo')} className="p-1.5 md:p-2.5 hover:bg-white/10 rounded-md md:rounded-xl text-white transition-colors shrink-0" title="Undo"><Undo className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" /></button>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('redo')} className="p-1.5 md:p-2.5 hover:bg-white/10 rounded-md md:rounded-xl text-white transition-colors shrink-0" title="Redo"><Redo className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" /></button>

              <div className="w-px h-4 md:h-8 bg-white/20 mx-0.5 md:mx-2 shrink-0" />

              <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('formatBlock', 'H1')} className="p-1.5 md:p-2.5 hover:bg-white/10 rounded-md md:rounded-xl text-white font-bold text-[9px] md:text-sm transition-colors shrink-0" title="Heading 1">H1</button>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('formatBlock', 'H2')} className="p-1.5 md:p-2.5 hover:bg-white/10 rounded-md md:rounded-xl text-white font-bold text-[9px] md:text-sm transition-colors shrink-0" title="Heading 2">H2</button>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('formatBlock', 'P')} className="p-1.5 md:p-2.5 hover:bg-white/10 rounded-md md:rounded-xl text-white text-[9px] md:text-sm transition-colors shrink-0" title="Normal Text">P</button>

              <div className="w-px h-4 md:h-8 bg-white/20 mx-0.5 md:mx-2 shrink-0" />

              <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')} className={`p-1.5 md:p-2.5 rounded-md md:rounded-xl transition-colors shrink-0 ${format.bold ? 'bg-blue-500 text-white' : 'hover:bg-white/10 text-white'}`} title="Bold"><Bold className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" /></button>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')} className={`p-1.5 md:p-2.5 rounded-md md:rounded-xl transition-colors shrink-0 ${format.italic ? 'bg-blue-500 text-white' : 'hover:bg-white/10 text-white'}`} title="Italic"><Italic className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" /></button>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('underline')} className={`p-1.5 md:p-2.5 rounded-md md:rounded-xl transition-colors shrink-0 ${format.underline ? 'bg-blue-500 text-white' : 'hover:bg-white/10 text-white'}`} title="Underline"><Underline className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" /></button>

              <div className="w-px h-4 md:h-8 bg-white/20 mx-0.5 md:mx-2 shrink-0" />

              <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('insertUnorderedList')} className={`p-1.5 md:p-2.5 rounded-md md:rounded-xl transition-colors shrink-0 ${format.list ? 'bg-blue-500 text-white' : 'hover:bg-white/10 text-white'}`} title="Bullet List"><List className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" /></button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}