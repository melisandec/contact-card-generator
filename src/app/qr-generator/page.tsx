'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ContactData } from '@/types';
import { QrCode, Download, Copy, Check, ArrowLeft, FileDown } from 'lucide-react';
import Link from 'next/link';

export default function QRGeneratorPage() {
  const [contactData, setContactData] = useState<ContactData>({
    fullName: '',
  });
  const [format, setFormat] = useState<'vcard' | 'mecard'>('vcard');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [vcardString, setVcardString] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!contactData.fullName.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/qr/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactData,
          options: { format, size: 300, errorCorrection: 'M' },
        }),
      });

      const data = await res.json();
      if (data.dataUrl) {
        setQrDataUrl(data.dataUrl);
        setVcardString(data.qrString);
      }
    } catch (error) {
      console.error('QR generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-contact-${contactData.fullName.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  const handleDownloadVCard = () => {
    if (!vcardString) return;
    const blob = new Blob([vcardString], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contactData.fullName.replace(/\s+/g, '-').toLowerCase()}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!vcardString) return;
    await navigator.clipboard.writeText(vcardString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-semibold text-slate-900">QR Contact Generator</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Contact Details
              </h2>

              <Input
                label="Full Name *"
                value={contactData.fullName}
                onChange={(e) => setContactData({ ...contactData, fullName: e.target.value })}
                placeholder="John Doe"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={contactData.firstName || ''}
                  onChange={(e) => setContactData({ ...contactData, firstName: e.target.value })}
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  value={contactData.lastName || ''}
                  onChange={(e) => setContactData({ ...contactData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
              <Input
                label="Title"
                value={contactData.title || ''}
                onChange={(e) => setContactData({ ...contactData, title: e.target.value })}
                placeholder="Senior Developer"
              />
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

              {/* Format selection */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  QR Format
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormat('vcard')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      format === 'vcard'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    vCard
                  </button>
                  <button
                    onClick={() => setFormat('mecard')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      format === 'mecard'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    MECARD
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {format === 'vcard'
                    ? 'Full contact info, widely supported'
                    : 'Compact format, smaller QR code'}
                </p>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              loading={isGenerating}
              disabled={!contactData.fullName.trim()}
              leftIcon={<QrCode className="w-5 h-5" />}
            >
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[400px]">
              {qrDataUrl ? (
                <>
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
                    Your QR Code
                  </h2>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUrl}
                    alt="Generated QR Code"
                    className="w-64 h-64 rounded-lg shadow-md"
                  />
                  <p className="text-xs text-slate-500 mt-3 text-center">
                    Scan this QR code to save the contact
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">
                    Fill in the form and click Generate
                  </p>
                </div>
              )}
            </div>

            {/* Download actions */}
            {qrDataUrl && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDownloadQR}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download PNG
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDownloadVCard}
                  leftIcon={<FileDown className="w-4 h-4" />}
                >
                  Download vCard
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  title="Copy vCard text"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
