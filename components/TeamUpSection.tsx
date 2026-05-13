"use client";

import React, { useState } from "react";
import Container from "@/components/Container";
import { Flame, Skull, Snowflake, Zap, Shield, Swords } from "lucide-react";

const fighters = [
  {
    id: "liu-kang",
    name: "Liu Kang",
    label: "Body Scan to Hell",
    icon: <Flame className="w-6 h-6 text-red-500" />,
  },
  {
    id: "daniel-larusso",
    name: "Daniel Larusso",
    label: "Body Scan to Hell",
    icon: <Shield className="w-6 h-6 text-red-400" />,
  },
  {
    id: "scorpion",
    name: "Scorpion",
    label: "Body Scan to Hell",
    icon: <Zap className="w-6 h-6 text-yellow-400" />,
  },
  {
    id: "terry-silver",
    name: "Terry Silver",
    label: "Body Scan to Hell",
    icon: <Swords className="w-6 h-6 text-red-400" />,
  },
  {
    id: "sub-zero",
    name: "Sub Zero",
    label: "Dark Side of Body Scan to Hell",
    icon: <Snowflake className="w-6 h-6 text-blue-400" />,
  },
  {
    id: "john-kreese",
    name: "John Kreese",
    label: "Body Scan to Hell",
    icon: <Skull className="w-6 h-6 text-zinc-400" />,
  },
];

const TeamUpSection = () => {
  const [fighterName, setFighterName] = useState("");
  const [dimensionOrigin, setDimensionOrigin] = useState("");
  const [activeFighter, setActiveFighter] = useState("scorpion");

  return (
    <section className="w-full bg-zinc-950 rounded-2xl py-10 ">
      {/* Background ambient glows */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-shop-dark-red/40 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-shop_light_red/20 blur-[100px] rounded-full pointer-events-none" />
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Heading */}
          <h2 className="font-gaming text-3xl md:text-5xl font-black uppercase text-center text-white tracking-widest mb-10 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
            Team Up With The{" "}
            <span className="text-shop_light_red drop-shadow-[0_0_25px_rgba(220,38,38,0.9)]">
              Fighters
            </span>
          </h2>

          {/* Input row + CTA */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
              <input
                type="text"
                placeholder="Fighter Name"
                value={fighterName}
                onChange={(e) => setFighterName(e.target.value)}
                className="flex-1 bg-transparent border border-zinc-700 hover:border-shop_light_red/60 focus:border-shop_light_red focus:outline-none text-zinc-300 placeholder-zinc-600 px-4 py-3 rounded-lg text-sm transition-colors duration-200"
              />
              <input
                type="text"
                placeholder="Dimension Origin"
                value={dimensionOrigin}
                onChange={(e) => setDimensionOrigin(e.target.value)}
                className="flex-1 bg-transparent border border-zinc-700 hover:border-shop_light_red/60 focus:border-shop_light_red focus:outline-none text-zinc-300 placeholder-zinc-600 px-4 py-3 rounded-lg text-sm transition-colors duration-200"
              />
            </div>

            <button className="w-full max-w-xl bg-shop_light_red hover:bg-shop-dark-red text-white font-black uppercase tracking-widest py-3 px-8 rounded-lg text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-105 font-gaming">
              Initiate System Link Scan Body to Hell
            </button>
          </div>

          {/* Fine print */}
          <p className="text-center text-zinc-500 text-xs mt-5">
            with a system sign up from{" "}
            <span className="text-shop_light_red">Daniel Larussa Fong</span>,
            Mortal Kombat Mr. Scorpion,{" "}
            <span className="text-shop_light_red">Terry Silver Fong</span> and
            Mortal Kombat Mr. Sub Zero
          </p>
          <p className="text-center text-shop_light_red/70 text-xs italic mt-2">
            This system and buttons only works for certain fighters in dimension worlds only
          </p>
          <p className="text-center text-shop_light_red/50 text-xs italic mt-1">
            sign up only works for certain fighters out there in dimension worlds only And the
            buttons sends you to Mortal Fang Kombat Hell or the Dark side of Hell depending on
            which person you are
          </p>

          {/* Fighter grid */}
          <div className="grid grid-cols-3 gap-3 mt-10">
            {fighters.map((fighter) => (
              <button
                key={fighter.id}
                onClick={() => setActiveFighter(fighter.id)}
                className={`
                  flex flex-col items-center justify-center gap-2 p-4 rounded-xl border
                  transition-all duration-300 hover:scale-105 text-center
                  ${activeFighter === fighter.id
                    ? "border-yellow-500/70 bg-zinc-800 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                    : "border-shop-dark-red/40 bg-zinc-900/80 hover:border-shop_light_red/60 hover:bg-zinc-800"
                  }
                `}
              >
                {fighter.icon}
                <div>
                  <p className="text-white text-xs font-bold uppercase tracking-wider">
                    {fighter.name}
                  </p>
                  <p className="text-zinc-500 text-[10px] mt-0.5">{fighter.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TeamUpSection;
