import { BatchConfig, CardMemberData } from '../types';
import { DEFAULT_PALETTE } from './palettes';

export const INITIAL_BATCH_CONFIG: BatchConfig = {
  slug: 'tbc-cds-2026-batch-a',
  cdsName: 'TBC CDS',
  batchName: '2026 Batch A Stream I',
  templateId: 'classic-wave',
  palette: DEFAULT_PALETTE,
  logoUrl: '/sample-cds-logo.svg',
  hasExcoCode: true,
  isActive: true,
  defaultFields: [
    { key: 'role', label: 'CDS Role', enabled: true, required: false, maxLength: 30 },
    { key: 'skills', label: 'Skills', enabled: true, required: false, maxLength: 60 },
    { key: 'tiktok', label: 'TikTok', enabled: true, required: false, maxLength: 25 },
    { key: 'instagram', label: 'Instagram', enabled: true, required: false, maxLength: 25 },
    { key: 'x', label: 'X (Twitter)', enabled: false, required: false, maxLength: 25 },
    { key: 'hobbies', label: 'Hobbies', enabled: true, required: false, maxLength: 60 },
    { key: 'afterPop', label: 'After POP?', enabled: true, required: false, maxLength: 85 },
    { key: 'quote', label: 'Fav Quote / Motto', enabled: true, required: false, maxLength: 115 },
  ],
  customFields: [],
  roleOptions: [
    { label: 'President', isExco: true },
    { label: 'Vice President', isExco: true },
    { label: 'General Secretary', isExco: true },
    { label: 'Welfare Director', isExco: true },
    { label: 'PRO', isExco: true },
    { label: 'Financial Secretary', isExco: true },
    { label: 'Treasurer', isExco: true },
  ],
};

export const INITIAL_MEMBER_DATA: CardMemberData = {
  fullName: 'ADESOKO F. DORCAS',
  photoUrl: '/sample.jpeg',
  role: 'Welfare Director',
  skills: ['Teamwork & Collaboration'],
  tiktok: 'Dorcazin',
  instagram: 'dorcas_feranmi',
  hobbies: ['Reading', 'Cooking', 'Traveling', 'Listening to music'],
  afterPop: 'Secure a good job, build my career, and keep growing',
  quote: 'I can do all things through Christ who strengthens me',
};
