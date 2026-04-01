'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
const applicationSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  organization: z.string().min(2, 'Organization name required'),
  jobTitle: z.string().min(2, 'Job title / role required'),
  country: z.string().min(2, 'Required'),
  city: z.string().min(2, 'Required'),
  deliveryPreference: z.enum(['open_public', 'in_house', 'virtual_blended', 'not_sure']),
  participantCount: z.coerce.number().int().min(1).max(500),
  preferredTiming: z.string().optional(),
  howHeard: z.string().optional(),
  goals: z.string().min(30, 'Please describe your goals (at least 30 characters)'),
  agreeTerms: z.boolean().refine((v) => v === true, 'You must accept to continue'),
});

export type TrainingApplicationValues = z.infer<typeof applicationSchema>;

type Props = {
  variant: 'academy' | 'additional';
  academyName: string;
  courseTitle: string;
  courseCode?: string;
  duration: string;
  format: string;
  levelOrTarget: string;
  /** Label for the level/target field (e.g. "Level", "Audience"). */
  levelLabel?: string;
  summary: string;
  /** For API + analytics */
  payloadMeta: Record<string, string>;
};

export function TrainingApplyForm({
  variant,
  academyName,
  courseTitle,
  courseCode,
  duration,
  format,
  levelOrTarget,
  levelLabel = 'Level',
  summary,
  payloadMeta,
}: Props) {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<TrainingApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      deliveryPreference: 'not_sure',
      participantCount: 1,
      agreeTerms: false,
    },
  });

  async function onSubmit(values: TrainingApplicationValues) {
    const res = await fetch('/api/training-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        meta: payloadMeta,
        program: {
          variant,
          academyName,
          courseTitle,
          courseCode,
          duration,
          format,
          levelOrTarget,
          summary,
        },
      }),
    });
    if (!res.ok) {
      form.setError('root', { message: 'Something went wrong. Please try again or email info@bcf.so' });
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-brand-teal/30 bg-brand-teal/5 p-10 text-center">
        <h2 className="text-2xl font-bold text-brand-navy">Application received</h2>
        <p className="mx-auto mt-4 max-w-lg text-slate-600">
          Thank you. Our training team will contact you shortly at the email you provided. If you need anything urgent,
          call{' '}
          <a href="tel:+252613685943" className="font-semibold text-brand-navy underline">
            +252-613-685-943
          </a>{' '}
          or write to{' '}
          <a href="mailto:info@bcf.so" className="font-semibold text-brand-navy underline">
            info@bcf.so
          </a>
          .
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild variant="outline" className="rounded-full border-brand-navy text-brand-navy">
            <Link href="/training">Back to training catalogue</Link>
          </Button>
          <Button asChild className="rounded-full bg-brand-teal hover:bg-[#078a3c]">
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 md:p-8">
          <h2 className="text-lg font-bold text-brand-navy">Applicant details</h2>
          <p className="mt-1 text-sm text-slate-600">All fields marked with * are required.</p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name *</FormLabel>
                  <FormControl>
                    <Input placeholder="As on ID or passport" className="h-11 bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@organization.org" className="h-11 bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (WhatsApp preferred) *</FormLabel>
                  <FormControl>
                    <Input placeholder="+252…" className="h-11 bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ministry, company, NGO…" className="h-11 bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job title / role *</FormLabel>
                  <FormControl>
                    <Input placeholder="Your current position" className="h-11 bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country *</FormLabel>
                  <FormControl>
                    <Input placeholder="Somalia, Kenya…" className="h-11 bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input placeholder="Mogadishu…" className="h-11 bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-bold text-brand-navy">Program preferences</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="deliveryPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred delivery *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 w-full bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="open_public">Open public program</SelectItem>
                      <SelectItem value="in_house">In-house for our organization</SelectItem>
                      <SelectItem value="virtual_blended">Virtual / blended</SelectItem>
                      <SelectItem value="not_sure">Not sure — advise me</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="participantCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of participants *</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={500} className="h-11 bg-white" {...field} />
                  </FormControl>
                  <FormDescription>For group bookings, enter total seats.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredTiming"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Preferred timing (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Q2 2025, after Ramadan, weekends…" className="h-11 bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="howHeard"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>How did you hear about BCF? (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Referral, website, LinkedIn…" className="h-11 bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>What do you want to achieve from this program? *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your learning goals, organizational context, and any specific outcomes you expect."
                      className="min-h-[120px] resize-y bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="agreeTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal text-slate-700">
                  I confirm that the information provided is accurate and I agree to be contacted by Baraarug Consulting
                  Firm regarding this training application. *
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="h-12 rounded-full bg-brand-teal px-10 text-base font-bold hover:bg-[#078a3c]"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit application
              </>
            )}
          </Button>
          <Button type="button" variant="ghost" asChild className="text-brand-navy">
            <Link href="/training" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function TrainingApplyProgramSummary({
  academyName,
  courseTitle,
  courseCode,
  duration,
  format,
  levelOrTarget,
  levelLabel,
  summary,
}: {
  academyName: string;
  courseTitle: string;
  courseCode?: string;
  duration: string;
  format: string;
  levelOrTarget: string;
  levelLabel: string;
  summary: string;
}) {
  return (
    <div className="mb-10 rounded-2xl border border-slate-200 bg-brand-mint/40 p-6 md:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-teal">{academyName}</p>
      {courseCode && (
        <p className="mt-2 text-sm font-semibold text-brand-navy/80">Course {courseCode}</p>
      )}
      <h1 className="mt-2 text-2xl font-bold text-brand-navy md:text-3xl">{courseTitle}</h1>
      <p className="mt-4 text-slate-600 leading-relaxed">{summary}</p>
      <dl className="mt-6 grid gap-3 border-t border-slate-200/80 pt-6 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-semibold text-slate-500">Duration</dt>
          <dd className="text-brand-navy">{duration}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Format</dt>
          <dd className="text-brand-navy">{format}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">{levelLabel}</dt>
          <dd className="text-brand-navy">{levelOrTarget}</dd>
        </div>
      </dl>
    </div>
  );
}
