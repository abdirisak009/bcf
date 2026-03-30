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
  Leaf 
} from "lucide-react";

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
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="services" className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-navy/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-4">
            What We <span className="text-brand-teal">Do</span>
          </h2>
          <div className="w-16 h-1 bg-brand-teal mx-auto mb-6" />
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
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
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.href}
                variants={cardVariants}
                whileHover={{ 
                  y: -8, 
                  transition: { duration: 0.3 } 
                }}
                className="group h-full"
              >
                <Link
                  href={service.href}
                  className="block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  aria-label={`${service.title} — open service page`}
                >
                  <div className="bg-slate-50 rounded-xl p-6 h-full border border-slate-200/80 shadow-sm hover:border-brand-teal/40 hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-teal/15 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-brand-teal group-hover:text-brand-navy transition-colors duration-300" aria-hidden />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-navy mb-2 group-hover:text-brand-teal transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
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
