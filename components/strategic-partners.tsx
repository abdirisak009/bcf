"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { ClientLogoCarousel } from "@/components/client-logo-carousel";
import { getApiBase } from "@/lib/api";

/** Must match `GET /api/clients` JSON (database `clients` table). */
type ClientRow = {
  id: string;
  name: string;
  logo_url?: string | null;
  sort_order?: number;
};

export default function StrategicPartners() {
  const [apiClients, setApiClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${getApiBase()}/api/clients?limit=100`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) {
            setLoadError(`Could not load clients (${res.status})`);
            setApiClients([]);
          }
          return;
        }
        const json = (await res.json()) as {
          success?: boolean;
          data?: { items?: ClientRow[] };
        };
        if (cancelled) return;
        const raw = json.success && json.data?.items ? json.data.items : [];
        const sorted = [...raw].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || String(a.id).localeCompare(String(b.id)),
        );
        setApiClients(sorted);
      } catch {
        if (!cancelled) {
          setLoadError("Could not load clients. Check API connection.");
          setApiClients([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20 md:py-24">
      <div className="absolute left-0 top-0 h-80 w-80 -translate-x-1/3 -translate-y-1/4 rounded-full bg-brand-teal/[0.07]" />
      <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/4 rounded-full bg-brand-navy/[0.06]" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center md:mb-16"
        >
          <span className="mb-4 inline-block rounded-full border border-brand-teal/35 bg-brand-teal/15 px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-navy shadow-sm md:text-sm">
            Trusted organizations
          </span>
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-brand-navy md:text-5xl lg:text-[3.25rem]">
            Our Clients
          </h2>
          <div className="mx-auto mb-6 h-1.5 w-20 rounded-full bg-brand-teal md:w-24" />
          <p className="mx-auto max-w-2xl text-lg font-bold leading-snug text-brand-navy md:text-xl md:leading-relaxed">
            Leading institutions and organizations we work with to drive innovation and excellence
            across Somalia
          </p>
        </motion.div>

        <ClientLogoCarousel
          items={apiClients}
          loading={loading}
          loadError={loadError}
          emptyMessage="No clients in the directory yet. Add clients with logos in the dashboard to show them here."
        />

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mx-auto mt-16 h-px max-w-md bg-gradient-to-r from-transparent via-brand-teal/40 to-transparent"
        />
      </div>
    </section>
  );
}
