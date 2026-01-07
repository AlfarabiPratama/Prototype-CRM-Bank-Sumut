// ==========================================
// Response Composer Component
// ==========================================
// Professional composer for case responses with:
// - Public Reply vs Internal Note toggle
// - Response templates
// - Indonesian microcopy

import { useState } from 'react';
import { Send, Save, Lock, MessageSquare } from 'lucide-react';

export type ComposerMode = 'public' | 'internal';

interface ResponseTemplate {
  id: string;
  label: string;
  content: string;
  mode: ComposerMode;
}

// Response templates for quick replies
export const RESPONSE_TEMPLATES: ResponseTemplate[] = [
  // Public templates
  {
    id: 'apologize',
    label: 'Permintaan Maaf + Penjelasan',
    mode: 'public',
    content: `Yth. Bapak/Ibu Nasabah,

Kami mohon maaf atas ketidaknyamanan yang Anda alami. Setelah kami tindak lanjuti, masalah ini terjadi karena [penjelasan singkat].

Saat ini, [status penyelesaian].

Terima kasih atas kesabaran dan kepercayaan Anda kepada Bank Sumut.

Hormat kami,
Tim Layanan Nasabah`,
  },
  {
    id: 'instructions',
    label: 'Instruksi Langkah Nasabah',
    mode: 'public',
    content: `Yth. Bapak/Ibu Nasabah,

Untuk menyelesaikan permasalahan ini, mohon lakukan langkah berikut:
1. [Langkah 1]
2. [Langkah 2]
3. [Langkah 3]

Jika masih mengalami kendala, silakan hubungi Call Center 14002.

Hormat kami,
Tim Layanan Nasabah`,
  },
  {
    id: 'resolved',
    label: 'Konfirmasi Selesai',
    mode: 'public',
    content: `Yth. Bapak/Ibu Nasabah,

Kami informasikan bahwa permasalahan yang Anda laporkan telah selesai ditangani.

[Ringkasan penyelesaian]

Apabila dikemudian hari Anda membutuhkan bantuan lebih lanjut, jangan ragu untuk menghubungi kami.

Terima kasih atas kepercayaan Anda kepada Bank Sumut.

Hormat kami,
Tim Layanan Nasabah`,
  },
  // Internal templates
  {
    id: 'investigation',
    label: 'Catatan Investigasi',
    mode: 'internal',
    content: `[INTERNAL] Hasil investigasi:
- Temuan: 
- Penyebab root cause:
- Tindakan yang sudah dilakukan:
- Status: `,
  },
  {
    id: 'escalation_note',
    label: 'Catatan Eskalasi',
    mode: 'internal',
    content: `[INTERNAL] Eskalasi ke Supervisor:
- Alasan eskalasi:
- Sudah dicoba:
- Diperlukan:`,
  },
];

interface ResponseComposerProps {
  onSendPublic: (content: string) => void;
  onSaveInternal: (content: string) => void;
  onClose?: (finalResponse: string) => void;
  canClose?: boolean;
  existingResponse?: string;
  disabled?: boolean;
}

export function ResponseComposer({
  onSendPublic,
  onSaveInternal,
  onClose,
  canClose = false,
  existingResponse = '',
  disabled = false,
}: ResponseComposerProps) {
  const [mode, setMode] = useState<ComposerMode>('public');
  const [content, setContent] = useState(existingResponse);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const filteredTemplates = RESPONSE_TEMPLATES.filter(t => t.mode === mode);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = RESPONSE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setContent(template.content);
    }
  };

  const handleSend = () => {
    if (!content.trim()) return;
    
    if (mode === 'public') {
      onSendPublic(content);
    } else {
      onSaveInternal(content);
    }
    setContent('');
    setSelectedTemplate('');
  };

  const handleCloseCase = () => {
    if (!content.trim()) return;
    onClose?.(content);
  };

  return (
    <div className="response-composer">
      <div className="composer-header">
        <div className="composer-mode-toggle">
          <button
            type="button"
            className={`composer-mode-btn ${mode === 'public' ? 'active' : ''}`}
            onClick={() => setMode('public')}
            disabled={disabled}
          >
            <MessageSquare size={14} />
            Tanggapan Nasabah
          </button>
          <button
            type="button"
            className={`composer-mode-btn internal ${mode === 'internal' ? 'active' : ''}`}
            onClick={() => setMode('internal')}
            disabled={disabled}
          >
            <Lock size={14} />
            Catatan Internal
          </button>
        </div>
      </div>

      {mode === 'internal' && (
        <div className="composer-mode-note">
          <Lock size={12} />
          <span>Catatan ini tidak akan terlihat oleh nasabah</span>
        </div>
      )}

      <div className="composer-template">
        <select
          value={selectedTemplate}
          onChange={(e) => handleTemplateSelect(e.target.value)}
          disabled={disabled}
        >
          <option value="">Pilih template...</option>
          {filteredTemplates.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      <textarea
        className="composer-textarea"
        placeholder={
          mode === 'public' 
            ? 'Tuliskan tanggapan untuk nasabah...' 
            : 'Tambahkan catatan internal (tidak terlihat nasabah)...'
        }
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={disabled}
        rows={6}
      />

      <div className="composer-actions">
        {mode === 'public' && canClose && (
          <button
            type="button"
            className="btn btn-success"
            onClick={handleCloseCase}
            disabled={disabled || !content.trim()}
            title="Kirim tanggapan dan tutup case"
          >
            <Send size={16} />
            Kirim & Tutup Case
          </button>
        )}
        <button
          type="button"
          className={`btn ${mode === 'public' ? 'btn-primary' : 'btn-warning'}`}
          onClick={handleSend}
          disabled={disabled || !content.trim()}
        >
          {mode === 'public' ? (
            <>
              <Send size={16} />
              Kirim Tanggapan
            </>
          ) : (
            <>
              <Save size={16} />
              Simpan Catatan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
