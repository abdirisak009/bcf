"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Landmark,
  Search,
  Users,
  BarChart3,
  Calculator,
  LineChart,
  Briefcase,
  GraduationCap,
  Leaf,
} from "lucide-react";

import { cn } from "@/lib/utils";

const tones = [
  {
    bg: "bg-white",
    iconWrap: "bg-brand-navy/10 text-brand-navy group-hover:bg-brand-navy group-hover:text-white group-hover:shadow-brand-navy/30",
    title: "text-brand-navy group-hover:text-brand-teal",
    desc: "text-slate-500",
    arrow: "text-brand-navy/40 group-hover:text-brand-teal",
    ring: "shadow-[0_1px_3px_rgba(15,23,42,0.05),0_6px_20px_-6px_rgba(23,94,126,0.10)] hover:shadow-[0_12px_32px_-10px_rgba(23,94,126,0.18)]",
    accent: "bg-brand-navy",
  },
  {
    bg: "bg-gradient-to-br from-brand-teal to-[color-mix(in_srgb,var(--brand-teal)_82%,var(--brand-navy))]",
    iconWrap: "bg-white/20 text-white ring-1 ring-white/25 group-hover:bg-white group-hover:text-brand-teal group-hover:shadow-white/20",
    title: "text-white group-hover:text-white",
    desc: "text-white/80",
    arrow: "text-white/50 group-hover:text-white",
    ring: "shadow-[0_4px_20px_-6px_rgba(85,197,147,0.35)] hover:shadow-[0_14px_36px_-10px_rgba(85,197,147,0.45)]",
    accent: "bg-white/80",
  },
  {
    bg: "bg-gradient-to-br from-brand-navy to-brand-navy-deep",
    iconWrap: "bg-brand-teal/20 text-brand-teal ring-1 ring-brand-teal/30 group-hover:bg-brand-teal group-hover:text-white group-hover:shadow-brand-teal/30",
    title: "text-white group-hover:text-brand-mint",
    desc: "text-white/70",
    arrow: "text-brand-teal/60 group-hover:text-brand-mint",
    ring: "shadow-[0_4px_20px_-6px_rgba(23,94,126,0.35)] hover:shadow-[0_14px_36px_-10px_rgba(23,94,126,0.45)]",
    accent: "bg-brand-teal",
  },
] as const;

export default function Services() {
  const services = [
    {
      href: "/services/strategic-policy",
      icon: Landmark,
      title: "Strategic Policy & Governance",
      description: "Comprehensive policy development and governance frameworks for sustainable institutional growth"
    },
    {
      href: "/services/audit-assurance",
      icon: Search,
      title: "Audit Assurance & Risk Management",
      description: "Comprehensive audit services, compliance reviews, and enterprise risk management solutions"
    },
    {
      href: "/services/human-capital",
      icon: Users,
      title: "Institution and Human Capital Development",
      description: "End-to-end HR management solutions enhancing operational efficiency and staff performance"
    },
    {
      href: "/services/research-analytics",
      icon: BarChart3,
      title: "Research and Data Analysis",
      description: "Baseline surveys, impact evaluations, and evidence-based decision support using advanced digital tools"
    },
    {
      href: "/services/tax-financial",
      icon: Calculator,
      title: "Tax & Financial Management",
      description: "Tax compliance advisory, accounting systems, and comprehensive financial management services"
    },
    {
      href: "/services/monitoring-evaluation",
      icon: LineChart,
      title: "Monitoring and Evaluation",
      description: "Design and implementation of comprehensive M&E systems with real-time tracking capabilities"
    },
    {
      href: "/services/business-development",
      icon: Briefcase,
      title: "Business Development Services",
      description: "Strategic business growth initiatives and comprehensive project management across development sectors"
    },
    {
      href: "/services/education-consultancy",
      icon: GraduationCap,
      title: "Education Consultancy",
      description: "Comprehensive education reform and development services for academic institutions"
    },
    {
      href: "/services/environmental-climate",
      icon: Leaf,
      title: "Environmental and Climate Change Consulting",
      description: "Environmental assessments, climate change adaptation, and sustainable natural resource management"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  };

  return (
    <section id="services" className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-brand-teal/[0.06] blur-[100px]" />
        <div className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-brand-navy/[0.04] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center md:mb-14"
        >
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-brand-navy md:text-5xl">
            What We <span className="text-brand-teal">Do</span>
          </h2>
          <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-brand-teal to-brand-navy" />
          <p className="mx-auto max-w-3xl text-lg text-slate-600">
            Comprehensive consulting solutions designed to{" "}
            <span className="font-semibold text-brand-teal">transform your organization</span>{" "}
            and drive sustainable growth across all sectors
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            const t = tones[index % 3];
            return (
              <motion.div
                key={service.href}
                variants={cardVariants}
                whileHover={{ y: -7, transition: { duration: 0.25, ease: "easeOut" } }}
                className="group h-full"
              >
                <Link
                  href={service.href}
                  className={cn(
                    "relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2",
                    t.bg,
                    t.ring,
                  )}
                  aria-label={`${service.title} — open service page`}
                >
                  <div
                    className={cn("absolute bottom-0 left-0 h-1 w-full transition-all duration-500 group-hover:h-1.5", t.accent)}
                    aria-hidden
                  />
                  <div
                    className={cn(
                      "mb-5 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-all duration-300",
                      t.iconWrap,
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </div>
                  <h3
                    className={cn(
                      "mb-2 text-[1.075rem] font-bold leading-snug tracking-tight transition-colors duration-300",
                      t.title,
                    )}
                  >
                    {service.title}
                  </h3>
                  <p className={cn("flex-1 text-sm leading-relaxed", t.desc)}>
                    {service.description}
                  </p>
                  <div className={cn("mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-300", t.arrow)}>
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
