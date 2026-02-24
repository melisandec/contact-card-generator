import type { ContactData, QRContactOptions } from '@/types';

const defaultOptions: QRContactOptions = {
  format: 'vcard',
  encoding: 'UTF-8',
  version: '3.0',
  errorCorrection: 'M',
  margin: 4,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  size: 200,
};

export class QRContactGenerator {
  contactData: ContactData;
  options: QRContactOptions;

  constructor(contactData: ContactData, options: Partial<QRContactOptions> = {}) {
    this.contactData = contactData;
    this.options = { ...defaultOptions, ...options };
  }

  generateVCard(): string {
    const { contactData } = this;
    let vcard = 'BEGIN:VCARD\r\n';
    vcard += 'VERSION:3.0\r\n';

    const nameParts = [
      contactData.lastName || '',
      contactData.firstName || '',
      contactData.middleName || '',
      contactData.prefix || '',
      contactData.suffix || '',
    ];
    vcard += `N:${nameParts.join(';')}\r\n`;

    if (contactData.fullName) {
      vcard += `FN:${contactData.fullName}\r\n`;
    }

    if (contactData.company) {
      vcard += `ORG:${contactData.company}`;
      if (contactData.department) {
        vcard += `;${contactData.department}`;
      }
      vcard += '\r\n';
    }

    if (contactData.title) {
      vcard += `TITLE:${contactData.title}\r\n`;
    }

    if (contactData.role) {
      vcard += `ROLE:${contactData.role}\r\n`;
    }

    contactData.phones?.forEach((phone) => {
      const type = phone.type.toUpperCase();
      const pref = phone.preferred ? ';PREF=1' : '';
      vcard += `TEL;TYPE=${type}${pref}:${phone.number}\r\n`;
    });

    contactData.emails?.forEach((email) => {
      const type = email.type.toUpperCase();
      const pref = email.preferred ? ';PREF=1' : '';
      vcard += `EMAIL;TYPE=${type}${pref}:${email.address}\r\n`;
    });

    contactData.addresses?.forEach((addr) => {
      const type = addr.type.toUpperCase();
      const addressStr = [
        '',
        '',
        addr.street || '',
        addr.city || '',
        addr.state || '',
        addr.zip || '',
        addr.country || '',
      ].join(';');
      vcard += `ADR;TYPE=${type}:${addressStr}\r\n`;
    });

    contactData.websites?.forEach((site) => {
      vcard += `URL;TYPE=${site.type.toUpperCase()}:${site.url}\r\n`;
    });

    contactData.socialMedia?.forEach((social) => {
      if (social.url) {
        vcard += `URL;TYPE=${social.platform.toUpperCase()}:${social.url}\r\n`;
      }
    });

    if (contactData.birthday) {
      vcard += `BDAY:${contactData.birthday}\r\n`;
    }

    if (contactData.notes) {
      vcard += `NOTE:${contactData.notes}\r\n`;
    }

    if (contactData.photo) {
      vcard += `PHOTO;VALUE=URL:${contactData.photo}\r\n`;
    }

    if (contactData.nickname) {
      vcard += `NICKNAME:${contactData.nickname}\r\n`;
    }

    contactData.customFields?.forEach((field) => {
      vcard += `X-${field.label.toUpperCase().replace(/\s+/g, '-')}:${field.value}\r\n`;
    });

    vcard += 'END:VCARD\r\n';
    return vcard;
  }

  generateMeCard(): string {
    const { contactData } = this;
    let mecard = 'MECARD:';

    if (contactData.fullName) {
      mecard += `N:${contactData.fullName};`;
    }

    if (contactData.company) {
      mecard += `ORG:${contactData.company};`;
    }

    if (contactData.title) {
      mecard += `TITLE:${contactData.title};`;
    }

    contactData.phones?.forEach((phone) => {
      mecard += `TEL:${phone.number};`;
    });

    contactData.emails?.forEach((email) => {
      mecard += `EMAIL:${email.address};`;
    });

    contactData.addresses?.forEach((addr) => {
      const parts = [addr.street, addr.city, addr.state, addr.zip, addr.country]
        .filter(Boolean)
        .join(', ');
      mecard += `ADR:${parts};`;
    });

    contactData.websites?.forEach((site) => {
      mecard += `URL:${site.url};`;
    });

    if (contactData.birthday) {
      mecard += `BDAY:${contactData.birthday};`;
    }

    if (contactData.notes) {
      mecard += `NOTE:${contactData.notes};`;
    }

    mecard += ';';
    return mecard;
  }

  getQRDataString(): string {
    return this.options.format === 'vcard'
      ? this.generateVCard()
      : this.generateMeCard();
  }
}
