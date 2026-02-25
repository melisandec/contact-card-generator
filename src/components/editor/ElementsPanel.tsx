'use client';

import { useDesignStore } from '@/store/design-store';
import { generateId } from '@/lib/utils';
import { Square, Circle, Triangle, Minus, Star, QrCode, Hexagon, Upload } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const shapes = [
  { type: 'rectangle', label: 'Rectangle', icon: Square },
  { type: 'circle', label: 'Circle', icon: Circle },
  { type: 'triangle', label: 'Triangle', icon: Triangle },
  { type: 'line', label: 'Line', icon: Minus },
  { type: 'star', label: 'Star', icon: Star },
  { type: 'polygon', label: 'Polygon', icon: Hexagon },
];

export function ElementsPanel() {
  const { addElement } = useDesignStore();
  const [qrUrl, setQrUrl] = useState('https://cardcrafter.app');
  const [qrLoading, setQrLoading] = useState(false);

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

  const addQRCode = async () => {
    if (!qrUrl.trim()) return;
    setQrLoading(true);
    try {
      const res = await fetch('/api/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: qrUrl, size: 200 }),
      });
      const data = await res.json();
      if (data.dataUrl) {
        addElement({
          type: 'qrcode',
          x: 100,
          y: 100,
          width: 150,
          height: 150,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: 0,
          src: data.dataUrl,
          qrData: qrUrl,
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
        <div className="space-y-2">
          <Input
            placeholder="https://example.com"
            value={qrUrl}
            onChange={(e) => setQrUrl(e.target.value)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addQRCode}
            loading={qrLoading}
            className="w-full"
            leftIcon={<QrCode className="w-4 h-4" />}
          >
            Add QR Code
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
