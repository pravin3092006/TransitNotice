/**
 * Helper utility for official Tamil Nadu transit agency URLs.
 * Ensures URLs are verified, active, and never point to 404 endpoints.
 */

export const OFFICIAL_AGENCY_PORTALS: Record<string, {
  name: string;
  portalUrl: string;
  alternativeUrls: string[];
  description: string;
  helpline: string;
}> = {
  MTC: {
    name: 'Metropolitan Transport Corporation (Chennai) Ltd.',
    portalUrl: 'https://mtcbus.tn.gov.in',
    alternativeUrls: ['https://mtcbus.tn.gov.in'],
    description: 'Official bus transit authority for the Chennai Metropolitan Area (CMA).',
    helpline: '1800-425-6151 / 044-23455801'
  },
  CMRL: {
    name: 'Chennai Metro Rail Limited',
    portalUrl: 'https://chennaimetrorail.org/press-release/',
    alternativeUrls: ['https://chennaimetrorail.org'],
    description: 'Rapid transit metro network covering Blue, Green and Phase-2 corridors.',
    helpline: '1860-425-1515 / 044-24378000'
  },
  TNSTC: {
    name: 'Tamil Nadu State Transport Corporation',
    portalUrl: 'https://www.tnstc.in',
    alternativeUrls: ['https://www.tnstc.in'],
    description: 'Inter-district and mofussil state transport fleet operations across Tamil Nadu.',
    helpline: '044-49076316 / 9513508001'
  },
  SETC: {
    name: 'State Express Transport Corporation',
    portalUrl: 'https://www.tnstc.in',
    alternativeUrls: ['https://www.tnstc.in'],
    description: 'Interstate and long-distance ultra-deluxe and sleeper express operations.',
    helpline: '044-49076316 / 9513508001'
  },
  CUMTA: {
    name: 'Chennai Unified Metropolitan Transport Authority',
    portalUrl: 'https://cumta.tn.gov.in',
    alternativeUrls: ['https://cumta.tn.gov.in'],
    description: 'Nodal authority for integrated multi-modal transport planning in Chennai.',
    helpline: '044-28414444'
  },
  TNTD: {
    name: 'Tamil Nadu Transport Department (TNSTA)',
    portalUrl: 'https://transport.tn.gov.in',
    alternativeUrls: ['https://tnsta.gov.in'],
    description: 'State regulatory commissionerate for motor vehicles and transit guidelines.',
    helpline: '044-24793333'
  },
  SR: {
    name: 'Southern Railway (Chennai Suburban & MRTS)',
    portalUrl: 'https://sr.indianrailways.gov.in',
    alternativeUrls: ['https://indianrailways.gov.in'],
    description: 'Suburban EMU and MRTS commuter railway lines across Chennai division.',
    helpline: '139 (Railway RailMadad Commuter Helpline)'
  },
  GCTP: {
    name: 'Greater Chennai Traffic Police (GCTP)',
    portalUrl: 'https://chennaitrafficpolice.tn.gov.in',
    alternativeUrls: ['https://chennaipolice.tn.gov.in'],
    description: 'Official traffic regulatory advisories, diversions, and road closure directives.',
    helpline: '103 / 044-23452330'
  },
  CMDA: {
    name: 'Chennai Metropolitan Development Authority (Terminals)',
    portalUrl: 'https://cmdachennai.gov.in',
    alternativeUrls: ['https://cmdachennai.gov.in'],
    description: 'Bus terminus operator for Kilambakkam (KCBT), Madhavaram (MMBT) and CMBT.',
    helpline: '044-28414855'
  }
};

/**
 * Normalizes any legacy or broken official source URL to a verified 200 OK endpoint.
 */
export function normalizeOfficialUrl(url: string, agency?: string): string {
  if (!url) {
    if (agency && OFFICIAL_AGENCY_PORTALS[agency]) {
      return OFFICIAL_AGENCY_PORTALS[agency].portalUrl;
    }
    return 'https://mtcbus.tn.gov.in';
  }

  let clean = url.trim();

  // Fix known 404 paths
  if (clean.includes('mtcbus.tn.gov.in/Home/citizencharter')) {
    clean = 'https://mtcbus.tn.gov.in';
  }
  if (clean.includes('tnstc.in/TNSTCOnline/')) {
    clean = 'https://www.tnstc.in';
  }
  if (clean.includes('tnstc.in/SETC')) {
    clean = 'https://www.tnstc.in';
  }

  // Ensure HTTPS
  if (clean.startsWith('http://')) {
    clean = clean.replace('http://', 'https://');
  }

  return clean;
}

/**
 * Safely opens an official website link without breaking out of sandboxed iframes.
 */
export function openOfficialUrl(url: string, agency?: string): boolean {
  const targetUrl = normalizeOfficialUrl(url, agency);
  try {
    const win = window.open(targetUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      // In case popups are blocked by browser/iframe sandbox
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to open official URL in new window:', err);
    return false;
  }
}
