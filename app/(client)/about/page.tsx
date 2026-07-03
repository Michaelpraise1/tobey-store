import React from "react";
import Container from "@/components/Container";
import AboutAccordion from "@/components/AboutAccordion";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Mortal Fang Kombat",
  description: "Learn about the training environment, dojo grounds, striking archetypes, and conditioning rituals of Mortal Fang Kombat.",
};

export default function AboutPage() {
  return (
    <Container className="py-12 max-w-4xl mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-black uppercase text-darkColor tracking-widest mb-3">
          About Mortal Fang Kombat
        </h1>
        <div className="w-20 h-1 bg-shop_light_red rounded mb-4"></div>
        <p className="text-gray-500 max-w-2xl text-sm sm:text-base leading-relaxed">
          Step into the Infernal Dojo. Discover the transcendent martial synthesis of Miyagi-Do's tranquility and Mortal Kombat's lethality.
        </p>
      </div>

      <AboutAccordion />
    </Container>
  );
}
