"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const partners = [
  {
    name: "SIMAD iLab",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-03-26%20at%2011.52.25%E2%80%AFPM-j4eSnLtBmBmZBqgFzXpzzoz8lj5XHq.png",
    color: "#175E7E",
  },
  {
    name: "Benadir University",
    logo: null,
    color: "#ffffff",
  },
  {
    name: "Premier Bank",
    logo: null,
    color: "#175E7E",
  },
  {
    name: "Somali Bankers Association",
    logo: null,
    color: "#175E7E",
  },
  {
    name: "HI-CAD Africa Limited",
    logo: null,
    color: "#ffffff",
  },
];

export default function Partners() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-brand-teal/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-brand-navy/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-brand-navy/10 text-brand-navy text-sm font-medium rounded-full mb-4">
            Our Network
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">
            Strategic Partners
          </h2>
          <div className="w-16 h-1 bg-brand-teal mx-auto mb-4" />
          <p className="text-brand-teal max-w-2xl mx-auto">
            Collaborating with leading institutions to drive innovation and excellence in Somalia
          </p>
        </motion.div>

        {/* Partners Grid */}
        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
          {/* SIMAD iLab */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            className="w-40 h-40 bg-brand-navy rounded-2xl flex items-center justify-center p-4 cursor-pointer transition-all duration-300 border border-transparent hover:border-brand-teal/30"
          >
            <div className="text-center">
              <div className="text-white font-bold text-lg">SIMAD</div>
              <div className="text-brand-teal font-bold text-xl">iLab</div>
            </div>
          </motion.div>

          {/* Benadir University */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center p-4 cursor-pointer transition-all duration-300 border-2 border-gray-100 hover:border-brand-teal/30"
          >
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-brand-teal">
                <span className="text-white text-2xl font-bold">BU</span>
              </div>
              <div className="text-brand-navy font-semibold text-xs">BENADIR</div>
              <div className="text-brand-navy font-semibold text-xs">UNIVERSITY</div>
            </div>
          </motion.div>

          {/* Premier Bank */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            className="w-40 h-40 bg-brand-navy rounded-2xl flex items-center justify-center p-4 cursor-pointer transition-all duration-300 border border-transparent hover:border-brand-teal/30"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 border-2 border-brand-teal rounded flex items-center justify-center">
                <div className="w-6 h-1 bg-brand-teal" />
              </div>
              <div className="text-white font-bold text-sm">premier bank</div>
            </div>
          </motion.div>

          {/* Somali Bankers */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            className="w-40 h-40 bg-brand-navy rounded-2xl flex items-center justify-center p-4 cursor-pointer transition-all duration-300 border border-transparent hover:border-brand-teal/30"
          >
            <div className="text-center">
              <div className="text-brand-teal text-3xl mb-1">🏛️</div>
              <div className="text-white font-bold text-xs">SOMALI BANKERS</div>
              <div className="text-brand-teal text-[10px]">ASSOCIATION</div>
            </div>
          </motion.div>

          {/* HI-CAD Africa */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center p-4 cursor-pointer transition-all duration-300 border-2 border-gray-100 hover:border-brand-teal/30"
          >
            <div className="text-center">
              <div className="text-brand-navy font-bold text-lg flex items-center gap-1">
                <span className="text-brand-teal">H</span>
                <span>I-CAD</span>
              </div>
              <div className="text-brand-teal font-bold text-sm">AFRICA</div>
              <div className="text-brand-navy text-xs">LIMITED</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
