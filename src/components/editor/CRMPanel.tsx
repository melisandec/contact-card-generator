'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ContactData } from '@/types';
import { Building2, Send, Check, AlertCircle, Link2 } from 'lucide-react';

interface CRMPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactData?: Partial<ContactData>;
}

interface FieldMapping {
  cardField: string;
  crmField: string;
  value: string;
}

const CRM_FIELDS = [
  { key: 'firstname', label: 'First Name' },
  { key: 'lastname', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'company', label: 'Company' },
  { key: 'jobtitle', label: 'Job Title' },
  { key: 'website', label: 'Website' },
  { key: 'address', label: 'Address' },
];

export function CRMPanel({ open, onOpenChange, contactData }: CRMPanelProps) {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const [mappings, setMappings] = useState<FieldMapping[]>(() =>
    buildDefaultMappings(contactData)
  );

  const handleConnect = () => {
    if (!apiKey.trim()) return;
    setIsConnected(true);
    setMappings(buildDefaultMappings(contactData));
  };

  const handlePushToCRM = async () => {
    setIsSending(true);
    setStatus('idle');

    try {
      const properties: Record<string, string> = {};
      for (const m of mappings) {
        if (m.crmField && m.value) {
          properties[m.crmField] = m.value;
        }
      }

      const res = await fetch('/api/crm/hubspot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, properties }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setStatusMessage(data.message || 'Contact created in HubSpot');
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Failed to create contact');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Network error. Please check your connection.');
    } finally {
      setIsSending(false);
    }
  };

  const updateMapping = (index: number, field: string, value: string) => {
    setMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Connect to CRM"
      description="Push contact information to HubSpot CRM"
      size="lg"
    >
      <div className="space-y-4">
        {/* CRM selection header */}
        <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
          <Building2 className="w-5 h-5 text-orange-600 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-orange-900">HubSpot CRM</div>
            <div className="text-xs text-orange-700">
              {isConnected ? 'Connected' : 'Enter your API key to connect'}
            </div>
          </div>
          {isConnected && <Check className="w-4 h-4 text-emerald-500 ml-auto" />}
        </div>

        {/* API Key input */}
        {!isConnected && (
          <div className="space-y-2">
            <Input
              label="HubSpot API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              hint="Find your API key in HubSpot Settings → Integrations → API key"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={handleConnect}
              disabled={!apiKey.trim()}
              leftIcon={<Link2 className="w-4 h-4" />}
            >
              Connect
            </Button>
          </div>
        )}

        {/* Field mapping */}
        {isConnected && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Field Mapping
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mappings.map((mapping, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-20 shrink-0">
                      {mapping.cardField}
                    </span>
                    <span className="text-slate-300">→</span>
                    <select
                      value={mapping.crmField}
                      onChange={(e) => updateMapping(index, 'crmField', e.target.value)}
                      className="flex-1 h-8 text-xs border border-slate-200 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">Skip</option>
                      {CRM_FIELDS.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                    <input
                      value={mapping.value}
                      onChange={(e) => updateMapping(index, 'value', e.target.value)}
                      className="flex-1 h-8 text-xs border border-slate-200 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Value"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            {status === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                <Check className="w-4 h-4 shrink-0" />
                {statusMessage}
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {statusMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsConnected(false);
                  setApiKey('');
                  setStatus('idle');
                }}
              >
                Disconnect
              </Button>
              <Button
                className="flex-1"
                onClick={handlePushToCRM}
                loading={isSending}
                leftIcon={isSending ? undefined : <Send className="w-4 h-4" />}
              >
                {isSending ? 'Sending...' : 'Push to HubSpot'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function buildDefaultMappings(contactData?: Partial<ContactData>): FieldMapping[] {
  const mappings: FieldMapping[] = [];

  if (contactData?.firstName || contactData?.fullName) {
    const firstName = contactData.firstName || contactData.fullName?.split(' ')[0] || '';
    mappings.push({ cardField: 'First Name', crmField: 'firstname', value: firstName });
  }

  if (contactData?.lastName || contactData?.fullName) {
    const lastName = contactData.lastName || contactData.fullName?.split(' ').slice(1).join(' ') || '';
    if (lastName) mappings.push({ cardField: 'Last Name', crmField: 'lastname', value: lastName });
  }

  const email = contactData?.emails?.[0]?.address;
  if (email) {
    mappings.push({ cardField: 'Email', crmField: 'email', value: email });
  }

  const phone = contactData?.phones?.[0]?.number;
  if (phone) {
    mappings.push({ cardField: 'Phone', crmField: 'phone', value: phone });
  }

  if (contactData?.company) {
    mappings.push({ cardField: 'Company', crmField: 'company', value: contactData.company });
  }

  if (contactData?.title) {
    mappings.push({ cardField: 'Job Title', crmField: 'jobtitle', value: contactData.title });
  }

  const website = contactData?.websites?.[0]?.url;
  if (website) {
    mappings.push({ cardField: 'Website', crmField: 'website', value: website });
  }

  // If no contact data, add empty rows for all fields
  if (mappings.length === 0) {
    mappings.push({ cardField: 'First Name', crmField: 'firstname', value: '' });
    mappings.push({ cardField: 'Last Name', crmField: 'lastname', value: '' });
    mappings.push({ cardField: 'Email', crmField: 'email', value: '' });
    mappings.push({ cardField: 'Phone', crmField: 'phone', value: '' });
    mappings.push({ cardField: 'Company', crmField: 'company', value: '' });
    mappings.push({ cardField: 'Job Title', crmField: 'jobtitle', value: '' });
  }

  return mappings;
}
