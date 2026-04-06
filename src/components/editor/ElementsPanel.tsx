'use client';

import { useDesignStore } from '@/store/design-store';
import { Square, Circle, Triangle, Minus, Star, QrCode, Hexagon, Upload, Link2, CreditCard, Globe } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProfiles, getProfileQR } from '@/hooks/useProfile';
import { QRContactGenerator } from '@/lib/qrContactGenerator';
import type { ContactData } from '@/types';

const shapes = [
  { type: 'rectangle', label: 'Rectangle', icon: Square },
  { type: 'circle', label: 'Circle', icon: Circle },
  { type: 'triangle', label: 'Triangle', icon: Triangle },
  { type: 'line', label: 'Line', icon: Minus },
  { type: 'star', label: 'Star', icon: Star },
  { type: 'polygon', label: 'Polygon', icon: Hexagon },
];

type QRMode = 'url' | 'profile' | 'vcard';

export function ElementsPanel() {
  const { addElement, elements } = useDesignStore();
  const [qrUrl, setQrUrl] = useState('https://cardcrafter.app');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrMode, setQrMode] = useState<QRMode>('url');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const { profiles } = useProfiles();

  const addShape = (shapeType: string) => {
    const isLine = shapeType === 'line';
    addElement({
      type: 'shape',
      x: 100,
      y: 100,
      width: isLine ? 200 : 100,
      height: isLine ? 4 : 100,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      shapeType: shapeType as 'rectangle' | 'circle' | 'triangle' | 'line' | 'star' | 'polygon',
      fill: '#6366f1',
      strokeWidth: 0,
      ...(shapeType === 'polygon' ? { sides: 6 } : {}),
    });
  };

  const handleSVGUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.svg';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const svgContent = ev.target?.result as string;
        const dataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;
        addElement({
          type: 'image',
          x: 100,
          y: 100,
          width: 200,
          height: 200,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: 0,
          src: dataUrl,
          objectFit: 'contain',
        });
      };
      reader.readAsText(file);
    };
    input.click();
  }, [addElement]);

  // Build a ContactData object from field-typed text elements on the canvas
  const buildContactDataFromCard = (): ContactData => {
    const get = (fieldType: string) =>
      (elements as Array<{ fieldType?: string; content?: string }>)
        .find((el) => el.fieldType === fieldType)?.content ?? '';

    const name = get('name') || 'Unknown';
    const parts = name.trim().split(/\s+/);
    return {
      fullName: name,
      firstName: parts[0] || undefined,
      lastName: parts.slice(1).join(' ') || undefined,
      title: get('title') || undefined,
      company: get('company') || undefined,
      phones: get('phone') ? [{ type: 'mobile' as const, number: get('phone'), preferred: true }] : [],
      emails: get('email') ? [{ type: 'work' as const, address: get('email'), preferred: true }] : [],
      websites: get('website') ? [{ type: 'work' as const, url: get('website') }] : [],
    };
  };

  const addQRCode = async () => {
    setQrLoading(true);
    try {
      let qrPayload = '';
      let linkedProfileId: string | undefined;

      if (qrMode === 'url') {
        if (!qrUrl.trim()) return;
        qrPayload = qrUrl.trim();
      } else if (qrMode === 'profile') {
        if (!selectedProfileId) return;
        const qrResult = await getProfileQR(selectedProfileId, 400);
        qrPayload = qrResult.profileUrl;
        linkedProfileId = selectedProfileId;
        addElement({
          type: 'qrcode',
          x: 100, y: 100, width: 150, height: 150,
          rotation: 0, opacity: 1, locked: false, visible: true, zIndex: 0,
          src: qrResult.dataUrl,
          qrData: qrResult.profileUrl,
          qrType: 'profile',
          qrLinkedProfileId: linkedProfileId,
        });
        return;
      } else if (qrMode === 'vcard') {
        const contactData = buildContactDataFromCard();
        const generator = new QRContactGenerator(contactData);
        qrPayload = generator.generateVCard();
      }

      const res = await fetch('/api/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: qrPayload, size: 400 }),
      });
      const data = await res.json();
      if (data.dataUrl) {
        addElement({
          type: 'qrcode',
          x: 100, y: 100, width: 150, height: 150,
          rotation: 0, opacity: 1, locked: false, visible: true, zIndex: 0,
          src: data.dataUrl,
          qrData: qrPayload,
          qrType: qrMode,
          ...(linkedProfileId ? { qrLinkedProfileId: linkedProfileId } : {}),
        });
      }
    } catch (error) {
      console.error('QR code generation failed:', error);
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className="p-3 space-y-4">
      {/* Shapes */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Shapes</h4>
        <div className="grid grid-cols-3 gap-2">
          {shapes.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => addShape(type)}
              className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-slate-600 hover:text-indigo-600"
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSVGUpload}
          className="w-full mt-2"
          leftIcon={<Upload className="w-4 h-4" />}
        >
          Upload SVG
        </Button>
      </div>

      {/* QR Code */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">QR Code</h4>

        {/* Mode Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-3">
          {([
            { id: 'url', label: 'URL', icon: Globe },
            { id: 'profile', label: 'Profile', icon: Link2 },
            { id: 'vcard', label: 'Contact', icon: CreditCard },
          ] as { id: QRMode; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setQrMode(id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                qrMode === id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {qrMode === 'url' && (
            <Input
              placeholder="https://example.com"
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
            />
          )}

          {qrMode === 'profile' && (
            <div className="space-y-2">
              {profiles.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">
                  No profiles yet. Create one in the Profile tab.
                </p>
              ) : (
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="">Select a profile…</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} — /{p.slug}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-slate-400 leading-relaxed">
                The QR links to your live profile page. Update your info anytime without reprinting.
              </p>
            </div>
          )}

          {qrMode === 'vcard' && (
            <p className="text-xs text-slate-400 leading-relaxed py-1">
              Encodes your card&apos;s contact fields directly in the QR. Works offline — no internet needed to save the contact.
            </p>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={addQRCode}
            loading={qrLoading}
            disabled={
              (qrMode === 'url' && !qrUrl.trim()) ||
              (qrMode === 'profile' && !selectedProfileId)
            }
            className="w-full"
            leftIcon={<QrCode className="w-4 h-4" />}
          >
            {qrMode === 'profile' ? 'Add Dynamic QR' : qrMode === 'vcard' ? 'Add Contact QR' : 'Add QR Code'}
          </Button>
        </div>
      </div>

      {/* Color palette */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Color Swatches</h4>
        <div className="grid grid-cols-5 gap-2">
          {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'].map((color) => (
            <button
              key={color}
              onClick={() => addElement({
                type: 'shape',
                x: 50,
                y: 50,
                width: 60,
                height: 60,
                rotation: 0,
                opacity: 1,
                locked: false,
                visible: true,
                zIndex: 0,
                shapeType: 'rectangle',
                fill: color,
                strokeWidth: 0,
                borderRadius: 8,
              })}
              className="w-9 h-9 rounded-lg border-2 border-white shadow hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
