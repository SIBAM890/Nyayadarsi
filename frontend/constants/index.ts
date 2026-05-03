/**
 * Application constants with strict typing.
 */
import type { Verdict } from '@/types/evaluation';
import type { CollusionFlagName } from '@/types/collusion';

export const APP_NAME = 'Nyayadarsi' as const;
export const APP_TAGLINE = 'AI that sees justice' as const;
export const APP_DEVANAGARI = 'न्यायदर्शी' as const;

export const TENDER_ID = 'CRPF-2025-CONST-001' as const;
export const CONTRACT_ID = 'CRPF-2025-CONST-001-ACME' as const;

export interface VerdictColorSet {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export const VERDICT_COLORS: Record<Verdict, VerdictColorSet> = {
  GREEN: {
    bg: 'bg-verdict-green/20',
    text: 'text-verdict-green',
    border: 'border-verdict-green/30',
    dot: 'verdict-dot-green',
  },
  YELLOW: {
    bg: 'bg-verdict-yellow/20',
    text: 'text-verdict-yellow',
    border: 'border-verdict-yellow/30',
    dot: 'verdict-dot-yellow',
  },
  RED: {
    bg: 'bg-verdict-red/20',
    text: 'text-verdict-red',
    border: 'border-verdict-red/30',
    dot: 'verdict-dot-red',
  },
} as const;

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/gov', label: 'Create Tender', icon: 'FileText', description: 'Government Officer Dashboard' },
  { href: '/evaluation', label: 'Evaluate Bids', icon: 'Shield', description: 'Evaluation Officer Dashboard' },
  { href: '/builder', label: 'Builder Progress', icon: 'Building', description: 'Builder Monitoring Dashboard' },
  { href: '/audit', label: 'Audit Trail', icon: 'Activity', description: 'Cryptographic Logs' },
] as const;

export interface FlagLabelInfo {
  label: string;
  icon: string;
  description: string;
}

export const FLAG_LABELS: Record<CollusionFlagName, FlagLabelInfo> = {
  BID_CLUSTERING: { label: 'Bid Clustering', icon: 'BarChart3', description: 'Statistical spread analysis' },
  CA_FINGERPRINT: { label: 'CA Fingerprint', icon: 'Fingerprint', description: 'Document formatting similarity' },
  SHARED_ADDRESS: { label: 'Shared Address', icon: 'MapPin', description: 'Registered office overlap' },
  OWNERSHIP_NETWORK: { label: 'Ownership Network', icon: 'Network', description: 'Director/ownership links' },
  DOC_QUALITY_ASYMMETRY: { label: 'Doc Quality', icon: 'FileWarning', description: 'Document quality variance' },
} as const;

/** Icon mapping for collusion flags — Lucide icons used directly in CollusionPanel */
