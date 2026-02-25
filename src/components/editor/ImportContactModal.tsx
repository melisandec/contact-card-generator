'use client';

import { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDesignStore } from '@/store/design-store';
import { parseVCard, readVCardFile } from '@/lib/contactImporter';
import type { ContactData, DesignElement } from '@/types';
import { Upload, User, FileText, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportContactModal({ open, onOpenChange }: ImportContactModalProps) {
  const { addElement } = useDesignStore();
  const [mode, setMode] = useState<'form' | 'vcard'>('form');
  const [contactData, setContactData] = useState<ContactData>({ fullName: '' });
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVCardUpload = async (file: File) => {
    try {
      const content = await readVCardFile(file);
      const parsed = parseVCard(content);
      setContactData(parsed);
      setImportStatus('success');
      setStatusMessage(`Imported: ${parsed.fullName || 'Contact'}`);
    } catch {
      setImportStatus('error');
      setStatusMessage('Failed to parse vCard file');
    }
  };

  const handleApplyToCanvas = () => {
    let yOffset = 50;
    const elementGap = 45;

    // Add name as large text
    if (contactData.fullName) {
      addElement({
        type: 'text',
        x: 50,
        y: yOffset,
        width: 400,
        height: 40,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        content: contactData.fullName,
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
      } as Omit<DesignElement, 'id'>);
      yOffset += elementGap;
    }

    // Add title
    if (contactData.title) {
      addElement({
        type: 'text',
        x: 50,
        y: yOffset,
        width: 400,
        height: 30,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        content: contactData.title,
        fontSize: 14,
        color: '#64748b',
      } as Omit<DesignElement, 'id'>);
      yOffset += elementGap - 10;
    }

    // Add company
    if (contactData.company) {
      addElement({
        type: 'text',
        x: 50,
        y: yOffset,
        width: 400,
        height: 30,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        content: contactData.company,
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
      } as Omit<DesignElement, 'id'>);
      yOffset += elementGap;
    }

    // Add email
    const primaryEmail = contactData.emails?.find((e) => e.preferred)?.address || contactData.emails?.[0]?.address;
    if (primaryEmail) {
      addElement({
        type: 'text',
        x: 50,
        y: yOffset,
        width: 400,
        height: 25,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        content: primaryEmail,
        fontSize: 12,
        color: '#475569',
      } as Omit<DesignElement, 'id'>);
      yOffset += elementGap - 10;
    }

    // Add phone
    const primaryPhone = contactData.phones?.find((p) => p.preferred)?.number || contactData.phones?.[0]?.number;
    if (primaryPhone) {
      addElement({
        type: 'text',
        x: 50,
        y: yOffset,
        width: 400,
        height: 25,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        content: primaryPhone,
        fontSize: 12,
        color: '#475569',
      } as Omit<DesignElement, 'id'>);
      yOffset += elementGap - 10;
    }

    // Add website
    const website = contactData.websites?.[0]?.url;
    if (website) {
      addElement({
        type: 'text',
        x: 50,
        y: yOffset,
        width: 400,
        height: 25,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        content: website,
        fontSize: 12,
        color: '#475569',
      } as Omit<DesignElement, 'id'>);
    }

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setContactData({ fullName: '' });
    setImportStatus('idle');
    setStatusMessage('');
    setMode('form');
  };

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
      title="Import Contact"
      description="Import contact details from a vCard file or enter manually to populate your card."
      size="lg"
    >
      <div className="space-y-4">
        {/* Mode tabs */}
        <div className="flex gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setMode('vcard')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              mode === 'vcard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <FileText className="w-4 h-4" />
            Upload vCard
          </button>
          <button
            onClick={() => setMode('form')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              mode === 'form' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <User className="w-4 h-4" />
            Manual Entry
          </button>
        </div>

        {/* vCard upload */}
        {mode === 'vcard' && (
          <div className="space-y-3">
            <div
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Click to upload a .vcf file</p>
              <p className="text-xs text-slate-400 mt-1">vCard 3.0 and 4.0 supported</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".vcf,.vcard"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleVCardUpload(file);
              }}
            />

            {importStatus === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                <Check className="w-4 h-4 shrink-0" />
                {statusMessage}
              </div>
            )}
            {importStatus === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {statusMessage}
              </div>
            )}
          </div>
        )}

        {/* Manual form */}
        {(mode === 'form' || importStatus === 'success') && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Full Name"
                value={contactData.fullName}
                onChange={(e) => setContactData({ ...contactData, fullName: e.target.value })}
                placeholder="John Doe"
              />
              <Input
                label="Title"
                value={contactData.title || ''}
                onChange={(e) => setContactData({ ...contactData, title: e.target.value })}
                placeholder="Senior Developer"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Company"
                value={contactData.company || ''}
                onChange={(e) => setContactData({ ...contactData, company: e.target.value })}
                placeholder="Acme Corp"
              />
              <Input
                label="Email"
                type="email"
                value={contactData.emails?.[0]?.address || ''}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    emails: [{ type: 'work', address: e.target.value }],
                  })
                }
                placeholder="john@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone"
                value={contactData.phones?.[0]?.number || ''}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    phones: [{ type: 'mobile', number: e.target.value }],
                  })
                }
                placeholder="+1 234 567 8900"
              />
              <Input
                label="Website"
                value={contactData.websites?.[0]?.url || ''}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    websites: [{ type: 'work', url: e.target.value }],
                  })
                }
                placeholder="https://example.com"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleApplyToCanvas}
            disabled={!contactData.fullName}
          >
            Apply to Canvas
          </Button>
        </div>
      </div>
    </Modal>
  );
}
