import { DesignElement } from '@/types';

export type FieldType = NonNullable<DesignElement['fieldType']>;

export const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'title', label: 'Job Title' },
  { value: 'company', label: 'Company' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'website', label: 'Website' },
  { value: 'location', label: 'Location' },
  { value: 'description', label: 'Description' },
  { value: 'custom', label: 'Custom' },
];

export interface ProfileData {
  fullName: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  bio: string;
}

const fieldToProfile: Record<FieldType, keyof ProfileData | null> = {
  name: 'fullName',
  title: 'title',
  company: 'company',
  email: 'email',
  phone: 'phone',
  website: 'website',
  location: null,
  description: 'bio',
  custom: null,
};

const profileToField: Record<string, FieldType> = {
  fullName: 'name',
  title: 'title',
  company: 'company',
  email: 'email',
  phone: 'phone',
  website: 'website',
  bio: 'description',
};

/**
 * Extract profile data from labeled text elements on the card.
 * Uses the first matching element for each field type.
 */
export function cardToProfile(elements: DesignElement[]): Partial<ProfileData> {
  const profile: Partial<ProfileData> = {};
  const seen = new Set<string>();

  for (const el of elements) {
    if (el.type !== 'text' || !el.fieldType) continue;
    const profileKey = fieldToProfile[el.fieldType];
    if (!profileKey || seen.has(profileKey)) continue;
    seen.add(profileKey);
    const value = (el.content ?? '').trim();
    if (value) {
      profile[profileKey] = value;
    }
  }

  return profile;
}

/**
 * Update labeled text elements on the card from profile data.
 * Only updates text content — leaves styles intact.
 * Returns updated elements array.
 */
export function profileToCard(
  elements: DesignElement[],
  profile: ProfileData,
): DesignElement[] {
  return elements.map((el) => {
    if (el.type !== 'text' || !el.fieldType) return el;
    const profileKey = fieldToProfile[el.fieldType];
    if (!profileKey) return el;
    const newValue = profile[profileKey];
    if (newValue !== undefined && newValue !== '') {
      return { ...el, content: newValue };
    }
    return el;
  });
}

/**
 * Get all assignable profile fields for the profileToField mapping.
 */
export function getProfileFieldMapping(): Record<string, FieldType> {
  return { ...profileToField };
}
