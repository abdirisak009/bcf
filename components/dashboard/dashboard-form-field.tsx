'use client'

import type { LucideIcon } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  htmlFor?: string
  icon?: LucideIcon
  children: React.ReactNode
  hint?: string
  className?: string
}

export function DashboardFormField({ label, htmlFor, icon: Icon, children, hint, className }: Props) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={htmlFor}
        className="flex items-center gap-2 text-sm font-semibold tracking-tight text-brand-navy"
      >
        {Icon ? <Icon className="size-4 shrink-0 text-brand-teal" strokeWidth={2} aria-hidden /> : null}
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-slate-500">{hint}</p> : null}
    </div>
  )
}
