import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';
import fr from '@/i18n/locales/fr.json';
import de from '@/i18n/locales/de.json';
import pt from '@/i18n/locales/pt.json';

type TranslationMap = Record<string, Record<string, string>>;

const locales: Record<string, TranslationMap> = { en, es, fr, de, pt };

function getAllKeys(obj: TranslationMap): string[] {
  const keys: string[] = [];
  for (const section of Object.keys(obj)) {
    for (const key of Object.keys(obj[section])) {
      keys.push(`${section}.${key}`);
    }
  }
  return keys.sort();
}

describe('i18n translations', () => {
  const enKeys = getAllKeys(en as TranslationMap);

  it('English has translations', () => {
    expect(enKeys.length).toBeGreaterThan(0);
  });

  it('has at least 5 supported languages', () => {
    expect(Object.keys(locales).length).toBeGreaterThanOrEqual(5);
  });

  // Check that all translations have the same keys as English
  for (const [localeName, locale] of Object.entries(locales)) {
    if (localeName === 'en') continue;

    it(`${localeName} has all keys from English`, () => {
      const localeKeys = getAllKeys(locale);
      for (const key of enKeys) {
        expect(localeKeys).toContain(key);
      }
    });

    it(`${localeName} has no extra keys beyond English`, () => {
      const localeKeys = getAllKeys(locale);
      for (const key of localeKeys) {
        expect(enKeys).toContain(key);
      }
    });

    it(`${localeName} has no empty translations`, () => {
      for (const section of Object.keys(locale)) {
        for (const key of Object.keys(locale[section])) {
          expect(locale[section][key]).toBeTruthy();
        }
      }
    });
  }

  it('English common section has key UI labels', () => {
    const common = (en as TranslationMap).common;
    expect(common.save).toBe('Save');
    expect(common.export).toBe('Export');
    expect(common.undo).toBe('Undo');
    expect(common.redo).toBe('Redo');
    expect(common.cancel).toBe('Cancel');
    expect(common.delete).toBe('Delete');
    expect(common.import).toBe('Import');
  });

  it('Spanish translations differ from English', () => {
    const esCommon = (es as TranslationMap).common;
    expect(esCommon.save).toBe('Guardar');
    expect(esCommon.save).not.toBe('Save');
  });

  it('French translations differ from English', () => {
    const frCommon = (fr as TranslationMap).common;
    expect(frCommon.save).toBe('Enregistrer');
  });

  it('German translations differ from English', () => {
    const deCommon = (de as TranslationMap).common;
    expect(deCommon.save).toBe('Speichern');
  });

  it('Portuguese translations differ from English', () => {
    const ptCommon = (pt as TranslationMap).common;
    expect(ptCommon.save).toBe('Salvar');
  });
});
