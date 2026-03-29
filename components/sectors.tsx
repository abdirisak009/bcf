"use client";

import { motion } from "framer-motion";
import { 
  Landmark, 
  Search, 
  BarChart3, 
  Users, 
  Leaf, 
  Calculator, 
  LineChart, 
  GraduationCap, 
  Briefcase 
} from "lucide-react";

export default function Sectors() {
  const sectors = [
    {
      icon: Landmark,
      title: "Strategic Policy & Governance",
      description: "Comprehensive policy development and governance frameworks for sustainable institutional growth"
    },
    {
      icon: Search,
      title: "Audit Assurance & Risk Management",
      description: "Comprehensive audit services, compliance reviews, and enterprise risk management solutions"
    },
    {
      icon: BarChart3,
      title: "Research and Data Analysis",
      description: "Baseline surveys, impact evaluations, and evidence-based decision support using advanced digital tools"
    },
    {
      icon: Users,
      title: "Institution and Human Capital Development",
      description: "End-to-end HR management solutions enhancing operational efficiency and staff performance"
    },
    {
      icon: Leaf,
      title: "Environmental and Climate Change Consulting",
      description: "Environmental assessments, climate change adaptation, and sustainable natural resource management"
    },
    {
      icon: Calculator,
      title: "Tax & Financial Management",
      description: "Tax compliance advisory, accounting systems, and comprehensive financial management services"
    },
    {
      icon: LineChart,
      title: "Monitoring and Evaluation",
      description: "Design and implementation of comprehensive M&E systems with real-time tracking capabilities"
    },
    {
      icon: GraduationCap,
      title: "Education Consultancy",
      description: "Comprehensive education reform and development services for academic institutions"
    },
    {
      icon: Briefcase,
      title: "Business Development Services",
      description: "Strategic business growth initiatives and comprehensive project management across development sectors"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="sectors" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-4">
            Sectors We Work With
          </h2>
          <div className="w-16 h-1 bg-brand-teal mx-auto mb-6" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Delivering excellence across diverse industries
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {sectors.map((sector, index) => {
            const Icon = sector.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 } 
                }}
                className="group relative"
              >
                <div className="bg-white border border-gray-100 rounded-xl p-5 h-full hover:shadow-lg hover:border-brand-teal/30 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-brand-navy/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand-teal/10 transition-colors duration-300">
                      <Icon className="w-5 h-5 text-brand-navy group-hover:text-brand-teal transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-brand-navy mb-1 group-hover:text-brand-teal transition-colors duration-300">
                        {sector.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {sector.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
