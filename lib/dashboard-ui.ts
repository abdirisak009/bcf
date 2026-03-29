/** Shared dashboard UI — Baraarug brand (solid colors, no gradients). */

export const dashboardDialogContent = 'border-2 border-brand-navy/12 bg-card shadow-xl'

export const dashboardDialogTitle = 'text-brand-navy'

/** Right drawer — wide forms (news, publications, edit article). */
export const dashboardSheetWide =
  'flex h-full max-h-[100dvh] min-h-0 w-full max-w-[100vw] flex-col gap-0 overflow-hidden border-l-2 border-brand-navy/15 bg-card p-0 shadow-2xl sm:max-w-xl md:max-w-[36rem]'

/** Right drawer — compact (category). */
export const dashboardSheetNarrow =
  'flex h-full max-h-[100dvh] min-h-0 w-full max-w-[100vw] flex-col gap-0 overflow-hidden border-l-2 border-brand-navy/15 bg-card p-0 shadow-2xl sm:max-w-md'

/** Form wrapper inside a sheet: required so the scrollable body can shrink (flex min-height). */
export const dashboardSheetForm = 'flex min-h-0 flex-1 flex-col overflow-hidden'

export const dashboardSheetHeader =
  'shrink-0 border-b border-brand-navy/10 bg-brand-mint/35 px-6 pb-4 pt-6 pr-14'

export const dashboardSheetBody =
  'min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-6 py-5 [scrollbar-gutter:stable]'

export const dashboardSheetFooter =
  'flex shrink-0 flex-col gap-3 border-t border-brand-navy/10 bg-brand-mint/25 px-6 py-4 sm:flex-row sm:justify-end'

export const dashboardSheetTitle = 'text-xl font-semibold tracking-tight text-brand-navy'

export const dashboardSheetDescription = 'text-sm leading-relaxed text-slate-600'

export const dashboardFormInputClass =
  'h-11 rounded-lg border-2 border-brand-navy/10 bg-white text-brand-navy shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-mint/70 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-teal focus-visible:ring-2 focus-visible:ring-brand-teal/25'

export const dashboardFormTextareaClass =
  'rounded-lg border-2 border-brand-navy/10 bg-white text-brand-navy shadow-sm placeholder:text-slate-400 focus-visible:border-brand-teal focus-visible:ring-2 focus-visible:ring-brand-teal/25'

export const dashboardFormSelectTriggerClass =
  'h-11 w-full rounded-lg border-2 border-brand-navy/10 bg-white text-brand-navy shadow-sm focus-visible:border-brand-teal focus-visible:ring-2 focus-visible:ring-brand-teal/25'
