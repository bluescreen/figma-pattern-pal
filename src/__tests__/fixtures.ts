import type { RawContainer } from '../scanner';
import type { Memory } from '../types';

// Helper to build containers concisely
function container(
  id: string,
  name: string,
  role: 'container-form' | 'container-filter',
  behavior: string,
  intent: string,
  context: string,
  fields: string[],
  primary: string,
  secondary?: string,
): RawContainer {
  const children = fields.map((f, i) => ({
    id: `${id}-f${i}`,
    name: f,
    role: 'input',
  }));
  children.push({ id: `${id}-submit`, name: primary, role: 'action-primary' });
  if (secondary) {
    children.push({
      id: `${id}-cancel`,
      name: secondary,
      role: 'action-secondary',
    });
  }
  return { id, name, role, behavior, intent, context, children };
}

// ── Calm: 0 divergences ─────────────────────────────────────────
// All patterns within each cluster share the same behavior.
export const calmContainers: RawContainer[] = [
  // Cluster 1: form-create-1-3-page (both submit-validation)
  container(
    'login', 'Login Form', 'container-form',
    'submit-validation', 'create', 'page',
    ['Email', 'Password'], 'Sign In',
  ),
  container(
    'newsletter', 'Newsletter Signup', 'container-form',
    'submit-validation', 'create', 'page',
    ['Email', 'Name'], 'Subscribe',
  ),
  // Cluster 2: form-update-1-3-modal (both inline-validation)
  container(
    'edit-name', 'Edit Display Name', 'container-form',
    'inline-validation', 'update', 'modal',
    ['First Name', 'Last Name'], 'Save',
  ),
  container(
    'edit-avatar', 'Edit Avatar', 'container-form',
    'inline-validation', 'update', 'modal',
    ['Avatar URL', 'Alt Text'], 'Save', 'Cancel',
  ),
];

// ── Confused: 3 divergences ─────────────────────────────────────
// 3 clusters each with mixed behaviors.
export const confusedContainers: RawContainer[] = [
  // Cluster 1: form-create-1-3-page → divergence
  container(
    'login', 'Login Form', 'container-form',
    'submit-validation', 'create', 'page',
    ['Email', 'Password'], 'Sign In',
  ),
  container(
    'signup', 'Quick Signup', 'container-form',
    'inline-validation', 'create', 'page',
    ['Email', 'Password', 'Name'], 'Join',
  ),
  // Cluster 2: filter-filter-1-3-panel → divergence
  container(
    'search', 'Search Filter', 'container-filter',
    'auto-apply', 'filter', 'panel',
    ['Keyword', 'Category'], 'Apply',
  ),
  container(
    'tag-filter', 'Tag Filter', 'container-filter',
    'confirm', 'filter', 'panel',
    ['Tag', 'Status'], 'Apply', 'Reset',
  ),
  // Cluster 3: form-update-1-3-modal → divergence
  container(
    'edit-profile', 'Edit Profile', 'container-form',
    'submit-validation', 'update', 'modal',
    ['Name', 'Bio'], 'Save',
  ),
  container(
    'edit-email', 'Change Email', 'container-form',
    'inline-validation', 'update', 'modal',
    ['New Email', 'Confirm Email'], 'Update', 'Cancel',
  ),
];

// ── Annoyed: 6 divergences ──────────────────────────────────────
// 6 clusters each with mixed behaviors.
export const annoyedContainers: RawContainer[] = [
  // Cluster 1: form-create-1-3-page
  container(
    'login', 'Login', 'container-form',
    'submit-validation', 'create', 'page',
    ['Email', 'Password'], 'Sign In',
  ),
  container(
    'signup', 'Signup', 'container-form',
    'inline-validation', 'create', 'page',
    ['Email', 'Password', 'Name'], 'Join',
  ),
  // Cluster 2: form-create-1-3-modal
  container(
    'quick-contact', 'Quick Contact', 'container-form',
    'submit-validation', 'create', 'modal',
    ['Email', 'Message'], 'Send',
  ),
  container(
    'rsvp', 'RSVP', 'container-form',
    'inline-validation', 'create', 'modal',
    ['Name', 'Email'], 'Confirm',
  ),
  // Cluster 3: form-update-1-3-modal
  container(
    'edit-name', 'Edit Name', 'container-form',
    'inline-validation', 'update', 'modal',
    ['First', 'Last'], 'Save',
  ),
  container(
    'edit-avatar', 'Edit Avatar', 'container-form',
    'submit-validation', 'update', 'modal',
    ['URL', 'Alt'], 'Save', 'Cancel',
  ),
  // Cluster 4: form-update-4-6-page
  container(
    'settings', 'Account Settings', 'container-form',
    'submit-validation', 'update', 'page',
    ['Username', 'Email', 'Language', 'Timezone'], 'Save',
  ),
  container(
    'preferences', 'Preferences', 'container-form',
    'auto-save', 'update', 'page',
    ['Theme', 'Density', 'Font Size', 'Layout'], 'Apply',
  ),
  // Cluster 5: filter-filter-1-3-panel
  container(
    'search', 'Search', 'container-filter',
    'auto-apply', 'filter', 'panel',
    ['Keyword', 'Category'], 'Apply',
  ),
  container(
    'tag-filter', 'Tags', 'container-filter',
    'confirm', 'filter', 'panel',
    ['Tag', 'Status'], 'Filter', 'Reset',
  ),
  // Cluster 6: filter-filter-4-6-panel
  container(
    'advanced-search', 'Advanced Search', 'container-filter',
    'auto-apply', 'filter', 'panel',
    ['Keyword', 'Category', 'Date From', 'Date To'], 'Search',
  ),
  container(
    'report-filter', 'Report Filter', 'container-filter',
    'confirm', 'filter', 'panel',
    ['Period', 'Region', 'Metric', 'Granularity'], 'Generate', 'Reset',
  ),
];

// ── Overstimulated: 8 divergences ───────────────────────────────
// 8 clusters each with mixed behaviors.
export const overstimulatedContainers: RawContainer[] = [
  ...annoyedContainers,
  // Cluster 7: form-create-4-6-page
  container(
    'registration', 'Registration', 'container-form',
    'submit-validation', 'create', 'page',
    ['Name', 'Email', 'Password', 'Confirm Password'], 'Register',
  ),
  container(
    'apply-job', 'Job Application', 'container-form',
    'inline-validation', 'create', 'page',
    ['Name', 'Email', 'Resume', 'Cover Letter'], 'Submit',
  ),
  // Cluster 8: form-update-1-3-page
  container(
    'change-password', 'Change Password', 'container-form',
    'submit-validation', 'update', 'page',
    ['Current', 'New', 'Confirm'], 'Update',
  ),
  container(
    'change-email', 'Change Email', 'container-form',
    'inline-validation', 'update', 'page',
    ['New Email', 'Confirm Email'], 'Change', 'Cancel',
  ),
];

// ── auth01: Figma "auth01" login card (3:192) ───────────────────
export const auth01Containers: RawContainer[] = [
  container(
    'auth01', 'Login', 'container-form',
    'submit-validation', 'create', 'page',
    ['Email', 'Password'], 'Sign in',
  ),
];

// ── auth02: Figma "auth02" login card (3:259) ───────────────────
export const auth02Containers: RawContainer[] = [
  container(
    'auth02', 'Login', 'container-form',
    'submit-validation', 'create', 'page',
    ['Email', 'Password'], 'Login', 'Login with Google',
  ),
];

// ── auth03: Figma "auth04/card" split-screen login (3:357) ──────
export const auth03Containers: RawContainer[] = [
  container(
    'auth03', 'Login', 'container-form',
    'submit-validation', 'create', 'page',
    ['Email', 'Password'], 'Login', 'Login with Google',
  ),
];

// ── Cross-file memory with historical behaviors ─────────────────
// Simulate prior scans where 'submit-validation' was dominant.
export function buildHistoricalMemory(fingerprints: string[]): Memory {
  const memory: Memory = {};
  for (const fp of fingerprints) {
    memory[fp] = {
      totalObservations: 12,
      behaviorCounts: { 'submit-validation': 10, 'inline-validation': 2 },
      lastSeen: Date.now() - 86_400_000,
    };
  }
  return memory;
}
