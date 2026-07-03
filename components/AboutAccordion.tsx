"use client";

import React, { useState } from "react";
import { ChevronDown, Flame, BookOpen, ShieldAlert, Zap, Skull, Swords, Compass } from "lucide-react";

interface AccordionItem {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function AboutAccordion() {
  const [openSections, setOpenSections] = useState<number[]>([0]); // First panel open by default

  const toggleSection = (index: number) => {
    if (openSections.includes(index)) {
      setOpenSections(openSections.filter((i) => i !== index));
    } else {
      setOpenSections([...openSections, index]);
    }
  };

  const accordionData: AccordionItem[] = [
    {
      title: "About Mortal Fang Kombat & Our Mission",
      icon: <Flame className="w-5 h-5 text-red-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-zinc-350 leading-relaxed">
            Mortal Fang Kombat is more than a brand—it's a legacy of warriors. Born from the legendary fighting spirit, we create premium merchandise that embodies the essence of combat excellence.
          </p>
          <p className="text-zinc-350 leading-relaxed">
            From our signature apparel that turns heads on the street to our unique food and beverage products that fuel your inner warrior, every item is crafted with the precision and passion of a true fighter.
          </p>
          <div className="bg-zinc-900 border-l-4 border-shop_light_red p-4 rounded-r-lg">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-1">Our Mission</h4>
            <p className="text-zinc-400 text-xs">
              To equip every warrior with gear that matches their fighting spirit. We believe that true strength comes from within, and our products are designed to amplify that power.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Hellfire Kombat: Light Infernal Dojo Grounds",
      icon: <Compass className="w-5 h-5 text-amber-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-zinc-350 leading-relaxed">
            Deep within the Infernal Dojo, the Heat Energy Feel Conditioning Rituals are considered the highest test of a warrior’s connection between body, mind, and spirit. The environment is filled with a mystical fresh, healthy hot heat—a supernatural warmth that does not simply exhaust the fighters, but becomes a force they must learn to understand and move with.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-lg">
              <strong className="text-white text-xs block mb-1 uppercase tracking-wider">The Infernal Dojo</strong>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Training takes place in a volcanic arena where subterranean stone floors, radiant with molten energy, force constant micro-adjustments in stance. Perimeter fires serve as sentient boundaries; they do not consume flesh but incinerate hesitation, sharpening focus.
              </p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-lg">
              <strong className="text-white text-xs block mb-1 uppercase tracking-wider">Nether-Sanctum</strong>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                A volcanic cathedral where the laws of physics yield to the will of the warrior. The air, saturated with sulfurous ozone, acts as a tonic—purging cellular weakness and hyper-oxygenating the blood.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🥋 Foundational Training Process & Meditation",
      icon: <BookOpen className="w-5 h-5 text-red-400" />,
      content: (
        <div className="space-y-5">
          <div className="flex gap-4">
            <span className="text-shop_light_red font-black text-sm font-mono mt-0.5">01</span>
            <div>
              <strong className="text-white block text-sm mb-1 uppercase">Thermal Transcendence Meditation</strong>
              <p className="text-zinc-400 text-xs">
                Students engage in Hyperthermic Stillness, standing barefoot atop searing obsidian warm stone. By synchronizing their respiratory cycles with the pulse of the magma below, they learn to slow the heart under pressure, developing absolute resistance to pain and fear—effectively "cooling" the soul while the body burns.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-shop_light_red font-black text-sm font-mono mt-0.5">02</span>
            <div>
              <strong className="text-white block text-sm mb-1 uppercase">Pyrotechnic Fluidity (Defensive Mastery)</strong>
              <p className="text-zinc-400 text-xs">
                A twist on Miyagi-Do redirection: move like liquid fire. Instead of blocking, students utilize circular motions to redirect attacks, absorbing the opponent's kinetic energy and cycling it through their own "inner furnace" before venting it back at the source.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-shop_light_red font-black text-sm font-mono mt-0.5">03</span>
            <div>
              <strong className="text-white block text-sm mb-1 uppercase">Infernal Striking Archetypes</strong>
              <p className="text-zinc-400 text-xs">
                Mortal Kombat's raw power refined through Miyagi-Do's precision. Key forms include:
              </p>
              <ul className="list-disc pl-4 text-zinc-400 text-[11px] mt-1 space-y-1.5">
                <li><strong className="text-zinc-200">Hell-Palm Impulse:</strong> A kinetic discharge that liquefies internal defenses without breaking the skin.</li>
                <li><strong className="text-zinc-200">Dragon-Spine Torque:</strong> A multi-axial spinning kick designed to bypass guards and shatter guards.</li>
                <li><strong className="text-zinc-200">Supernova Uppercut:</strong> A vertical kinetic explosion that launches adversaries upwards with volcanic force.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🔥 Heat Energy Feel Conditioning & Escalating Combat",
      icon: <Swords className="w-5 h-5 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-zinc-350 leading-relaxed">
            The Living Heat Chamber, known as the <strong>Crucible of Attrition</strong>, is a volcanic temple where the heat moves like a living presence. The air shimmers with waves of warm energy, pressing against fighters from every direction, demanding total emotional regulation.
          </p>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-2">The Escalating Combat Ritual</h5>
            <ol className="list-decimal text-white/70 pl-4 text-zinc-450 text-[11px] space-y-1.5">
              <li>Controlled sparring begins with deep focus on balance, timing, and defensive postures.</li>
              <li>Fighters use calm, precise techniques while maintaining steady breathing.</li>
              <li>The combat escalates into full-contact battles where the distinction between "practice" and "survival" vanishes.</li>
              <li>Success is achieved in <strong>The Sovereign Trial</strong>: dueling a Master while transitioning seamlessly between Miyagi-Do's passive redirection and Kombat's terminal aggression.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      title: "🧘 The Void State & Final Lesson of the Crucible",
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-zinc-350 leading-relaxed">
            The greatest warriors enter a meditative state known as <strong>The Void State</strong>. In this state:
          </p>
          <div className="grid grid-cols-3 gap-2.5 my-2">
            <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 text-center">
              <span className="text-shop_light_red text-[10px] block uppercase font-bold tracking-wider">No Fear</span>
              <span className="text-[10px] text-zinc-550">Does not control decisions</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 text-center">
              <span className="text-shop_light_red text-[10px] block uppercase font-bold tracking-wider">No Anger</span>
              <span className="text-[10px] text-zinc-550">Does not cloud technique</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 text-center">
              <span className="text-shop_light_red text-[10px] block uppercase font-bold tracking-wider">No Panic</span>
              <span className="text-[10px] text-zinc-550">Does not interrupt breathing</span>
            </div>
          </div>
          <p className="text-zinc-350 leading-relaxed">
            Treating the battle as a test of absolute awareness, the practitioner remains mentally centered even during high-velocity impacts.
          </p>
          <blockquote className="border-l-2 border-yellow-500 pl-4 py-1.5 italic text-zinc-400 text-xs bg-yellow-950/10">
            "The fire outside you is never greater than the fire you control within."
          </blockquote>
        </div>
      )
    },
    {
      title: "🔥 Signature Ability: “Inner Flame State”",
      icon: <Skull className="w-5 h-5 text-red-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-zinc-350 leading-relaxed">
            The pinnacle of the art. Upon mastery, the internal and external heat merge, unlocking a unique combat state where:
          </p>
          <ul className="list-disc pl-4 text-zinc-400 text-xs space-y-2">
            <li>
              <strong className="text-white">Thermodynamic Reflex:</strong> Neural pathways accelerate; the world appears to slow as the user moves with "Cool Heat."
            </li>
            <li>
              <strong className="text-white">Environmental Synthesis:</strong> External fire no longer poses a threat; it becomes an extension of the practitioner’s reach.
            </li>
            <li>
              <strong className="text-white">The Silent Kill:</strong> Movements become eerily graceful and quiet, yet every touch carries the weight of a volcanic eruption.
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "🧠 What Makes This Style Unique",
      icon: <ShieldAlert className="w-5 h-5 text-zinc-400" />,
      content: (
        <div className="space-y-3">
          <ul className="space-y-3">
            <li className="flex gap-2.5">
              <span className="text-shop_light_red text-xs">◆</span>
              <div className="text-xs">
                <strong className="text-white block uppercase tracking-wider text-[10px]">Hybrid Bio-Feedback</strong>
                Bridges the gap between defensive mindfulness and offensive finality.
              </div>
            </li>
            <li className="flex gap-2.5">
              <span className="text-shop_light_red text-xs">◆</span>
              <div className="text-xs">
                <strong className="text-white block uppercase tracking-wider text-[10px]">Stress Inoculation</strong>
                By training in a literal hellscape, standard combat environments feel like a reprieve.
              </div>
            </li>
            <li className="flex gap-2.5">
              <span className="text-shop_light_red text-xs">◆</span>
              <div className="text-xs">
                <strong className="text-white block uppercase tracking-wider text-[10px]">Alchemy of the Soul</strong>
                Transforms a hostile environment into a regenerative battery, turning the universe's most destructive elements into the warrior's greatest allies.
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "🔥 Hellfire Original: Dark Infernal Side of Hell Dojo",
      icon: <Swords className="w-5 h-5 text-rose-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-zinc-350 leading-relaxed">
            A forbidden martial art born from the balance philosophy of Miyagi-Do Karate and the ruthless power of Mortal Kombat. Forged in the subterranean crucible of the underworld—a realm where internal equilibrium and external devastation are the only currencies of survival.
          </p>
          <div className="border-t border-zinc-800 pt-3 mt-3">
            <h6 className="font-bold text-white text-[11px] uppercase tracking-wider mb-2">The Cavern Trials</h6>
            <div className="space-y-3">
              <div>
                <strong className="text-zinc-300 block text-xs">The Burning Stone Walk</strong>
                <span className="text-zinc-450 text-[11px]">Students walk across heated volcanic stones while practicing controlled breathing, proving that the mind controls the body's trauma.</span>
              </div>
              <div>
                <strong className="text-zinc-300 block text-xs">The Shadow Combat Chambers</strong>
                <span className="text-zinc-450 text-[11px]">Fighters enter dark arenas where they face spectral illusions that imitate their fears. Victory comes from maintaining a clear, undisturbed mind.</span>
              </div>
              <div>
                <strong className="text-zinc-300 block text-xs">The Inferno Sparring Trials</strong>
                <span className="text-zinc-450 text-[11px]">Rings surrounded by walls of flame to practice defensive flow, counters, and powerful finishing combinations.</span>
              </div>
              <div>
                <strong className="text-zinc-300 block text-xs">The Trial of the Eternal Flame</strong>
                <span className="text-zinc-450 text-[11px]">Performing all techniques in the hottest chamber without losing focus, earning the title of <strong>Infernal Guardian</strong>.</span>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 p-3.5 rounded border border-zinc-850 text-xs italic text-center text-shop_light_red mt-3">
            "Mercy is the sheath, but Brutality is the edge. One cannot function without the other."
          </div>
        </div>
      )
    },
    {
      title: "🔥 Heat Energy Synchronization",
      icon: <Flame className="w-5 h-5 text-red-500 animate-pulse" />,
      content: (
        <div className="space-y-4">
          <p className="text-zinc-350 leading-relaxed">
            Advanced students synchronize movements with the rhythm of the dojo's ambient heat:
          </p>
          <div className="space-y-3">
            <div className="bg-zinc-950 p-3 rounded border border-zinc-850">
              <strong className="text-white text-xs block mb-0.5">The Flame Flow Kata</strong>
              <span className="text-zinc-450 text-[11px]">Slow, circular movements in the heat to train patience and perfect body control.</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded border border-zinc-850">
              <strong className="text-white text-xs block mb-0.5">The Ember Step</strong>
              <span className="text-zinc-450 text-[11px]">Footwork drills where fighters move through waves of rising heat, maintaining perfect balance.</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded border border-zinc-850">
              <strong className="text-white text-xs block mb-0.5">The Infernal Exchange</strong>
              <span className="text-zinc-450 text-[11px]">A final sparring ritual where two masters fight at maximum intensity while maintaining complete composure and respect.</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-4 mt-8">
      {accordionData.map((item, idx) => {
        const isOpen = openSections.includes(idx);
        return (
          <div
            key={idx}
            className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:border-zinc-800"
          >
            {/* Header Accordion Bar */}
            <button
              onClick={() => toggleSection(idx)}
              className="w-full flex items-center justify-between p-5 text-left text-white bg-zinc-950 hover:bg-zinc-900/30 transition-colors duration-250 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm sm:text-base font-bold uppercase tracking-wider font-sans">
                  {item.title}
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-zinc-550 transition-transform duration-300 ${isOpen ? "rotate-180 text-shop_light_red" : ""
                  }`}
              />
            </button>

            {/* Collapsible Content */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[1000px] border-t border-zinc-900" : "max-h-0"
                }`}
            >
              <div className="p-6 bg-zinc-950/80">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
