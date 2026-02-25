import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, properties } = body as {
      apiKey: string;
      properties: Record<string, string>;
    };

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    if (!properties || Object.keys(properties).length === 0) {
      return NextResponse.json({ error: 'At least one property is required' }, { status: 400 });
    }

    // Validate required email field
    if (!properties.email) {
      return NextResponse.json(
        { error: 'Email is required to create a HubSpot contact' },
        { status: 400 }
      );
    }

    // Call HubSpot API to create contact
    const hubspotResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ properties }),
    });

    if (!hubspotResponse.ok) {
      const errorData = await hubspotResponse.json().catch(() => ({}));
      const message = errorData?.message || `HubSpot API error: ${hubspotResponse.status}`;
      return NextResponse.json({ error: message }, { status: hubspotResponse.status });
    }

    const contactData = await hubspotResponse.json();
    return NextResponse.json({
      message: 'Contact created successfully in HubSpot',
      contactId: contactData.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('HubSpot CRM error:', message);
    return NextResponse.json(
      { error: 'Failed to connect to HubSpot CRM' },
      { status: 500 }
    );
  }
}
