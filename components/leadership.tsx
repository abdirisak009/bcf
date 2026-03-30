"use client";

import { motion } from "framer-motion";
import { User, Building2, Users } from "lucide-react";

export default function Leadership() {
  const structure = [
    {
      icon: User,
      title: "Executive Leadership",
      description: "Strategic direction and vision for sustainable growth",
      color: "bg-[#e8f5e9]",
      iconBg: "bg-[#c8e6c9]",
      iconColor: "text-[#2e7d32]",
      titleColor: "text-brand-navy"
    },
    {
      icon: Building2,
      title: "Core Departments",
      description: "Specialized teams delivering expert solutions",
      color: "bg-[#e3f2fd]",
      iconBg: "bg-brand-teal",
      iconColor: "text-white",
      titleColor: "text-brand-navy"
    },
    {
      icon: Users,
      title: "Support Functions",
      description: "Enabling seamless operations and delivery",
      color: "bg-[#f3e5f5]",
      iconBg: "bg-[#9c27b0]",
      iconColor: "text-white",
      titleColor: "text-[#9c27b0]"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="inline-block px-4 py-1.5 bg-brand-navy/10 text-brand-navy text-sm font-medium rounded-full mb-4"
          >
            Organizations
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-4">
            Leadership at a glance
          </h2>
          <div className="w-16 h-1 bg-brand-teal mx-auto mb-6" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A framework built for efficiency and excellence.{" "}
            <a
              href="#organizational-structure"
              className="font-semibold text-brand-teal underline-offset-4 hover:underline"
            >
              Full organizational chart
            </a>{" "}
            below.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {structure.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  transition: { duration: 0.3 } 
                }}
                className={`${item.color} rounded-2xl p-8 text-center border border-transparent hover:border-gray-200 transition-all duration-300`}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1, type: "spring" }}
                  className={`w-16 h-16 ${item.iconBg} rounded-xl flex items-center justify-center mx-auto mb-6`}
                >
                  <Icon className={`w-8 h-8 ${item.iconColor}`} />
                </motion.div>
                <h3 className={`text-xl font-bold ${item.titleColor} mb-3`}>
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
