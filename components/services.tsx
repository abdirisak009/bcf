"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      }
    }
  };

  return (
    <section id="services" className="relative overflow-hidden border-t border-slate-100 bg-white py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-teal/[0.06] blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-brand-navy/[0.04] blur-3xl" />
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
          <div className="mx-auto mb-6 h-1 w-16 bg-brand-teal" />
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
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.href}
                variants={cardVariants}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.25 },
                }}
                className="group h-full"
              >
                <Link
                  href={service.href}
                  className="block h-full rounded-2xl bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  aria-label={`${service.title} — open service page`}
                >
                  <div
                    className={cn(
                      "h-full cursor-pointer rounded-2xl bg-white p-6 transition-all duration-300",
                      "shadow-[0_1px_3px_rgba(15,23,42,0.06),0_4px_12px_-4px_rgba(23,94,126,0.08)]",
                      "hover:shadow-[0_8px_24px_-8px_rgba(23,94,126,0.12),0_2px_8px_-2px_rgba(15,23,42,0.06)]",
                    )}
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-teal/12 text-brand-teal transition-colors duration-300 group-hover:bg-brand-teal group-hover:text-white">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold leading-snug tracking-tight text-brand-navy transition-colors group-hover:text-brand-teal">
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {service.description}
                    </p>
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
