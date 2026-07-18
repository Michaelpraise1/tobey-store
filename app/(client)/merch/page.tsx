import React from "react";
import Container from "@/components/Container";
import MerchGrid from "@/components/MerchGrid";
import type { Metadata } from "next";
import { Truck, RefreshCw, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Merch",
  description:
    "Official Tobey Studios merchandise — hats, hoodies, tees, mugs and more. Pick your design, choose your color, and ship directly to your door.",
};

const TRUST_BADGES = [
  {
    icon: Truck,
    label: "Print-on-demand",
    sub: "Ships directly to you",
  },
  {
    icon: RefreshCw,
    label: "Made-to-order",
    sub: "No overstock. Ever.",
  },
  {
    icon: Shield,
    label: "Official merch",
    sub: "100% Tobey branded",
  },
];

const MerchPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="relative bg-dark-color overflow-hidden">
        {/* Decorative red gradient orb */}
        <div
          aria-hidden
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-shop-dark-red/30 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-shop-orange/20 blur-3xl pointer-events-none"
        />

        <Container className="relative py-16 sm:py-20 text-center">
          <span className="inline-block text-shop-orange text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Official Tobey Studios
          </span>
          <h1 className="font-gaming text-4xl sm:text-5xl lg:text-6xl font-black text-white text-glow leading-tight">
            Gear Up.
            <br />
            <span className="text-shop-orange">Rep the Brand.</span>
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-gray-400 text-sm sm:text-base font-body leading-relaxed">
            Premium print-on-demand merchandise. Choose your design, pick your
            colorway, and we&apos;ll ship it straight to your door — no
            redirects, no third-party chaos.
          </p>

          {/* Trust badges */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon size={16} className="text-shop-orange" />
                </div>
                <p className="text-white text-xs font-semibold">{label}</p>
                <p className="text-gray-500 text-[10px]">{sub}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Catalog */}
      <Container className="py-12 sm:py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight font-gaming">
              All Products
            </h2>
            <p className="text-sm text-gray-400 mt-1 font-body">
              Filter by category, pick a design, and customize your order.
            </p>
          </div>
        </div>

        <MerchGrid />
      </Container>

      {/* Bottom CTA strip */}
      <div className="bg-shop-dark-red">
        <Container className="py-8 text-center">
          <p className="text-white font-body text-sm sm:text-base">
            Want to collaborate or bulk order?{" "}
            <a
              href="mailto:hello@tobeystudios.com"
              className="font-bold underline underline-offset-2 hover:text-shop-light-pink transition-colors"
            >
              Contact us
            </a>
          </p>
        </Container>
      </div>
    </div>
  );
};

export default MerchPage;
