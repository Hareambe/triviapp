export interface TeamColor {
  name: string;
  bg: string;
  border: string;
  text: string;
  badge: string;
}

export const TEAM_COLORS: TeamColor[] = [
  { name: 'Amber', bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400', badge: 'bg-amber-500 text-slate-950' },
  { name: 'Sky', bg: 'bg-sky-500/20', border: 'border-sky-500', text: 'text-sky-400', badge: 'bg-sky-500 text-slate-950' },
  { name: 'Emerald', bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500 text-slate-950' },
  { name: 'Rose', bg: 'bg-rose-500/20', border: 'border-rose-500', text: 'text-rose-400', badge: 'bg-rose-500 text-white' },
  { name: 'Purple', bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400', badge: 'bg-purple-500 text-white' },
  { name: 'Orange', bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400', badge: 'bg-orange-500 text-slate-950' },
  { name: 'Cyan', bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-400', badge: 'bg-cyan-500 text-slate-950' },
  { name: 'Fuchsia', bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-500', text: 'text-fuchsia-400', badge: 'bg-fuchsia-500 text-white' },
];

