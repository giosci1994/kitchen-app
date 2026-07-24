"use client";

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo2,
  Redo2,
} from 'lucide-react';
import './rich-text-editor.css';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder = "Scrivi il contenuto..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        spellcheck: 'true',
      },
    },
  });

  // Sincronizza il contenuto quando cambia dall'esterno (es. modifica avviso diverso)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div>
      {/* Toolbar */}
      <div className="rte-toolbar" role="toolbar" aria-label="Formattazione testo">
        {/* Gruppo: Formattazione testo */}
        <div className="rte-toolbar-group">
          <button
            type="button"
            className={`rte-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Grassetto (Ctrl+B)"
            aria-label="Grassetto"
          >
            <Bold />
          </button>
          <button
            type="button"
            className={`rte-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Corsivo (Ctrl+I)"
            aria-label="Corsivo"
          >
            <Italic />
          </button>
          <button
            type="button"
            className={`rte-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Sottolineato (Ctrl+U)"
            aria-label="Sottolineato"
          >
            <UnderlineIcon />
          </button>
          <button
            type="button"
            className={`rte-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Barrato"
            aria-label="Barrato"
          >
            <Strikethrough />
          </button>
        </div>

        {/* Gruppo: Struttura */}
        <div className="rte-toolbar-group">
          <button
            type="button"
            className={`rte-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Sottotitolo"
            aria-label="Sottotitolo"
          >
            <Heading3 />
          </button>
          <button
            type="button"
            className={`rte-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Citazione"
            aria-label="Citazione"
          >
            <Quote />
          </button>
        </div>

        {/* Gruppo: Elenchi */}
        <div className="rte-toolbar-group">
          <button
            type="button"
            className={`rte-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Elenco puntato"
            aria-label="Elenco puntato"
          >
            <List />
          </button>
          <button
            type="button"
            className={`rte-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Elenco numerato"
            aria-label="Elenco numerato"
          >
            <ListOrdered />
          </button>
        </div>

        {/* Gruppo: Extra */}
        <div className="rte-toolbar-group">
          <button
            type="button"
            className="rte-btn"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Separatore"
            aria-label="Separatore"
          >
            <Minus />
          </button>
        </div>

        {/* Gruppo: Undo/Redo */}
        <div className="rte-toolbar-group">
          <button
            type="button"
            className="rte-btn"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Annulla (Ctrl+Z)"
            aria-label="Annulla"
          >
            <Undo2 />
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Ripristina (Ctrl+Y)"
            aria-label="Ripristina"
          >
            <Redo2 />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="rte-editor-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
