import { cardToProfile, profileToCard, FIELD_TYPE_OPTIONS, type ProfileData } from '@/lib/fieldSync';
import { DesignElement } from '@/types';

function makeTextElement(overrides: Partial<DesignElement> = {}): DesignElement {
  return {
    id: `el-${Math.random().toString(36).slice(2)}`,
    type: 'text',
    x: 0,
    y: 0,
    width: 200,
    height: 40,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    content: 'Test',
    ...overrides,
  };
}

describe('Field Sync', () => {
  describe('FIELD_TYPE_OPTIONS', () => {
    it('contains the expected field types', () => {
      const values = FIELD_TYPE_OPTIONS.map((o) => o.value);
      expect(values).toContain('name');
      expect(values).toContain('title');
      expect(values).toContain('company');
      expect(values).toContain('email');
      expect(values).toContain('phone');
      expect(values).toContain('website');
      expect(values).toContain('location');
      expect(values).toContain('description');
      expect(values).toContain('custom');
    });
  });

  describe('cardToProfile', () => {
    it('extracts profile data from labeled text elements', () => {
      const elements: DesignElement[] = [
        makeTextElement({ content: 'John Doe', fieldType: 'name' }),
        makeTextElement({ content: 'CEO', fieldType: 'title' }),
        makeTextElement({ content: 'Acme Corp', fieldType: 'company' }),
        makeTextElement({ content: 'john@acme.com', fieldType: 'email' }),
        makeTextElement({ content: '+1 555-1234', fieldType: 'phone' }),
        makeTextElement({ content: 'acme.com', fieldType: 'website' }),
      ];
      const profile = cardToProfile(elements);
      expect(profile.fullName).toBe('John Doe');
      expect(profile.title).toBe('CEO');
      expect(profile.company).toBe('Acme Corp');
      expect(profile.email).toBe('john@acme.com');
      expect(profile.phone).toBe('+1 555-1234');
      expect(profile.website).toBe('acme.com');
    });

    it('uses the first matching element for duplicate field types', () => {
      const elements: DesignElement[] = [
        makeTextElement({ content: 'First Name', fieldType: 'name' }),
        makeTextElement({ content: 'Second Name', fieldType: 'name' }),
      ];
      const profile = cardToProfile(elements);
      expect(profile.fullName).toBe('First Name');
    });

    it('ignores non-text elements', () => {
      const elements: DesignElement[] = [
        { ...makeTextElement(), type: 'shape', fieldType: 'name', content: 'Shape' },
        makeTextElement({ content: 'Real Name', fieldType: 'name' }),
      ];
      const profile = cardToProfile(elements);
      expect(profile.fullName).toBe('Real Name');
    });

    it('ignores elements without fieldType', () => {
      const elements: DesignElement[] = [
        makeTextElement({ content: 'Unlabeled text' }),
      ];
      const profile = cardToProfile(elements);
      expect(profile.fullName).toBeUndefined();
    });

    it('ignores elements with empty content', () => {
      const elements: DesignElement[] = [
        makeTextElement({ content: '', fieldType: 'name' }),
        makeTextElement({ content: '  ', fieldType: 'title' }),
      ];
      const profile = cardToProfile(elements);
      expect(profile.fullName).toBeUndefined();
      expect(profile.title).toBeUndefined();
    });

    it('maps description fieldType to bio', () => {
      const elements: DesignElement[] = [
        makeTextElement({ content: 'About me...', fieldType: 'description' }),
      ];
      const profile = cardToProfile(elements);
      expect(profile.bio).toBe('About me...');
    });

    it('returns empty object for location and custom fields', () => {
      const elements: DesignElement[] = [
        makeTextElement({ content: 'New York', fieldType: 'location' }),
        makeTextElement({ content: 'Custom data', fieldType: 'custom' }),
      ];
      const profile = cardToProfile(elements);
      // location and custom have no profile mapping
      expect(Object.keys(profile)).toHaveLength(0);
    });
  });

  describe('profileToCard', () => {
    it('updates labeled text elements with profile data', () => {
      const elements: DesignElement[] = [
        makeTextElement({ content: 'Old Name', fieldType: 'name', fontWeight: '700' }),
        makeTextElement({ content: 'Old Title', fieldType: 'title' }),
        makeTextElement({ content: 'Unlabeled', fontFamily: 'Arial' }),
      ];
      const profile: ProfileData = {
        fullName: 'Jane Smith',
        title: 'CTO',
        company: 'Tech Co',
        email: 'jane@tech.co',
        phone: '+1 555-9999',
        website: 'tech.co',
        bio: 'A bio',
      };
      const updated = profileToCard(elements, profile);
      // Name should be updated
      expect(updated[0].content).toBe('Jane Smith');
      // Styles should be preserved
      expect(updated[0].fontWeight).toBe('700');
      // Title should be updated
      expect(updated[1].content).toBe('CTO');
      // Unlabeled element should not change
      expect(updated[2].content).toBe('Unlabeled');
      expect(updated[2].fontFamily).toBe('Arial');
    });

    it('does not update elements without matching fieldType', () => {
      const elements: DesignElement[] = [
        makeTextElement({ content: 'Email here', fieldType: 'email' }),
      ];
      const profile: ProfileData = {
        fullName: 'Test',
        title: '',
        company: '',
        email: 'test@example.com',
        phone: '',
        website: '',
        bio: '',
      };
      const updated = profileToCard(elements, profile);
      expect(updated[0].content).toBe('test@example.com');
    });

    it('preserves elements with unmappable field types', () => {
      const elements: DesignElement[] = [
        makeTextElement({ content: 'NYC', fieldType: 'location' }),
      ];
      const profile: ProfileData = {
        fullName: 'Test',
        title: '',
        company: '',
        email: '',
        phone: '',
        website: '',
        bio: '',
      };
      const updated = profileToCard(elements, profile);
      // location has no profile mapping, so content stays
      expect(updated[0].content).toBe('NYC');
    });

    it('does not overwrite with empty profile values', () => {
      const elements: DesignElement[] = [
        makeTextElement({ content: 'Existing Name', fieldType: 'name' }),
      ];
      const profile: ProfileData = {
        fullName: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        website: '',
        bio: '',
      };
      const updated = profileToCard(elements, profile);
      // Empty profile value should not overwrite
      expect(updated[0].content).toBe('Existing Name');
    });
  });
});
