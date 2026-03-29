"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { getApiBase } from "@/lib/api";

type PartnerRow = { id: string; name: string; logo_url?: string | null };

const fallbackPartners = [
  {
    name: "SIMAD iLab",
    logo: "SIMAD\niLab",
    bgColor: "bg-brand-navy",
    textColor: "text-white",
  },
  {
    name: "Benadir University",
    logo: "BU",
    bgColor: "bg-white",
    textColor: "text-brand-navy",
    hasIcon: true,
  },
  {
    name: "Premier Bank",
    logo: "premier bank",
    bgColor: "bg-brand-navy",
    textColor: "text-white",
  },
  {
    name: "Somali Bankers Association",
    logo: "SBA",
    bgColor: "bg-brand-navy",
    textColor: "text-white",
  },
  {
    name: "HI-CAD Africa Limited",
    logo: "HI-CAD\nAFRICA\nLIMITED",
    bgColor: "bg-white",
    textColor: "text-brand-navy",
  },
];

export default function StrategicPartners() {
  const [apiPartners, setApiPartners] = useState<PartnerRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/partners?limit=100`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const json = (await res.json()) as {
          success?: boolean;
          data?: { items?: PartnerRow[] };
        };
        if (cancelled) return;
        setApiPartners(json.success && json.data?.items ? json.data.items : []);
      } catch {
        if (!cancelled) setApiPartners([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const useApi = apiPartners.length > 0;

  return (
    <section className="relative overflow-hidden bg-slate-50 py-20">
      <div className="absolute top-0 left-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-teal/5" />
      <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-brand-navy/5" />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-gray-200 bg-gray-100 px-4 py-1.5 text-sm font-medium text-brand-navy">
            Our Network
          </span>
          <h2 className="mb-4 text-4xl font-bold text-brand-navy md:text-5xl">
            Strategic Partners
          </h2>
          <div className="mx-auto mb-6 h-1 w-16 bg-brand-teal" />
          <p className="mx-auto max-w-2xl text-gray-600">
            Collaborating with leading institutions to drive innovation and excellence in Somalia
          </p>
        </motion.div>

        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-6">
          {useApi
            ? apiPartners.map((partner, index) => {
                const logo = partner.logo_url?.trim();
                return (
                  <motion.div
                    key={partner.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group"
                  >
                    <div
                      className="relative flex h-32 w-40 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-lg transition-all duration-300 group-hover:shadow-2xl"
                    >
                      <div className="absolute inset-0 bg-brand-teal/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logo}
                          alt={partner.name}
                          className="relative z-10 max-h-20 w-full max-w-[120px] object-contain"
                        />
                      ) : (
                        <span className="relative z-10 text-center text-sm font-bold text-brand-navy">
                          {partner.name}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            : fallbackPartners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <div
                    className={`relative flex h-32 w-40 items-center justify-center overflow-hidden rounded-xl border border-gray-100 p-4 shadow-lg transition-all duration-300 group-hover:shadow-2xl ${partner.bgColor}`}
                  >
                    <div className="absolute inset-0 bg-brand-teal/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {"hasIcon" in partner && partner.hasIcon ? (
                      <div className="relative z-10 text-center">
                        <div className="mx-auto mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-brand-teal">
                          <svg
                            className="h-8 w-8 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <span className={`text-xs font-semibold ${partner.textColor}`}>
                          Benadir University
                        </span>
                      </div>
                    ) : (
                      <span
                        className={`relative z-10 whitespace-pre-line text-center text-sm font-bold ${partner.textColor}`}
                      >
                        {partner.logo}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mx-auto mt-16 h-px max-w-md bg-brand-teal/30"
        />
      </div>
    </section>
  );
}
