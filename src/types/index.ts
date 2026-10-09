export type TemplateId = 'classic-wave' | 'polaroid' | 'spotlight';

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;       // Header / dominant accent
  accent: string;        // Secondary ribbon / highlight
  background: string;    // Main card background
  cardBg: string;        // Info panel / card backing
  textColor: string;     // Main info text color
  headingColor: string;  // Section headings color
  textOnPrimary: string; // Text on primary background
  textOnAccent: string;  // Text on accent background
}

export interface DefaultFieldSetting {
  key: 'role' | 'skills' | 'tiktok' | 'instagram' | 'x' | 'hobbies' | 'afterPop' | 'quote';
  label: string;
  enabled: boolean;
  required: boolean;
  maxLength: number;
  placeholder?: string;
  helpText?: string;
}

export interface CustomFieldSetting {
  id: string;
  label: string;
  required: boolean;
  maxLength: number;
  placeholder?: string;
}

export interface RoleOption {
  label: string;
  isExco: boolean;
}

export interface BatchConfig {
  slug: string;
  cdsName: string;
  batchName: string;
  templateId: TemplateId;
  palette: ColorPalette;
  logoUrl?: string; // Optional CDS emblem URL
  defaultFields: DefaultFieldSetting[];
  customFields: CustomFieldSetting[];
  roleOptions: RoleOption[];
  hasExcoCode: boolean;
  isActive: boolean;
  closedMessage?: string;
}

export interface CardMemberData {
  fullName: string;
  photoUrl: string | null;
  role?: string;
  skills?: string[];
  tiktok?: string;
  instagram?: string;
  x?: string;
  hobbies?: string[];
  afterPop?: string;
  quote?: string;
  customValues?: Record<string, string>;
}

export interface SocialItem {
  platform: 'instagram' | 'tiktok' | 'x';
  handle: string;
}

export interface CardDisplayField {
  label: string;
  value: string;
  isQuote?: boolean;
  socials?: SocialItem[];
}
