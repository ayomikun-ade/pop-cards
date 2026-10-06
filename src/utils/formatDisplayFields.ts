import { BatchConfig, CardDisplayField, CardMemberData } from '../types';

export function formatDisplayFields(
  batch: BatchConfig,
  member: CardMemberData
): CardDisplayField[] {
  const fields: CardDisplayField[] = [];

  // Helper to add if valid
  const add = (label: string, value?: string | null, isQuote = false) => {
    if (value && value.trim()) {
      fields.push({ label, value: value.trim(), isQuote });
    }
  };

  // 1. Role (if enabled)
  if (batch.defaultFields.find((f) => f.key === 'role')?.enabled) {
    if (member.role && member.role !== 'Member') {
      add('ROLE IN CDS', member.role);
    }
  }

  // 2. Skills
  if (batch.defaultFields.find((f) => f.key === 'skills')?.enabled) {
    if (member.skills && member.skills.length > 0) {
      add('SKILLS', member.skills.join(', '));
    }
  }

  // 3. Social Handles (Combined under one unified row)
  const socialList: import('../types').SocialItem[] = [];
  if (batch.defaultFields.find((f) => f.key === 'instagram')?.enabled && member.instagram) {
    const clean = member.instagram.replace(/^@/, '').trim();
    if (clean) socialList.push({ platform: 'instagram', handle: clean });
  }
  if (batch.defaultFields.find((f) => f.key === 'tiktok')?.enabled && member.tiktok) {
    const clean = member.tiktok.replace(/^@/, '').trim();
    if (clean) socialList.push({ platform: 'tiktok', handle: clean });
  }
  if (batch.defaultFields.find((f) => f.key === 'x')?.enabled && member.x) {
    const clean = member.x.replace(/^@/, '').trim();
    if (clean) socialList.push({ platform: 'x', handle: clean });
  }

  if (socialList.length > 0) {
    fields.push({
      label: 'SOCIALS',
      value: socialList.map((s) => `@${s.handle}`).join('   '),
      socials: socialList,
    });
  }

  // 6. Hobbies
  if (batch.defaultFields.find((f) => f.key === 'hobbies')?.enabled) {
    if (member.hobbies && member.hobbies.length > 0) {
      add('HOBBY', member.hobbies.join(', '));
    }
  }

  // 7. After POP
  if (batch.defaultFields.find((f) => f.key === 'afterPop')?.enabled) {
    add('AFTER POP?', member.afterPop);
  }

  // 8. Custom Batch Fields
  for (const cf of batch.customFields) {
    const val = member.customValues?.[cf.id];
    if (val && val.trim()) {
      add(cf.label.toUpperCase(), val.trim());
    }
  }

  // 9. Fav Quote (put towards bottom)
  if (batch.defaultFields.find((f) => f.key === 'quote')?.enabled) {
    add('FAV QUOTE', member.quote, true);
  }

  // Strict enforcement: Maximum 7 fields so card never overflows
  return fields.slice(0, 7);
}
