"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/Container";
import { Flame, Skull, Snowflake, Zap, Shield, Swords, Clock } from "lucide-react";

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

  // Timer states
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleStartScan = () => {
    if (isScanning) {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      setIsScanning(false);
      setScanStatus("LINK TERMINATED - OUT OF HELL!");
      setTimeRemaining(timerSeconds);
      // Clear status after 3 seconds
      setTimeout(() => {
        setScanStatus("");
      }, 3000);
    } else {
      setIsScanning(true);
      setScanStatus("SCANNING BODY...");
      setTimeRemaining(timerSeconds);

      let currentSecs = timerSeconds;
      const interval = setInterval(() => {
        currentSecs -= 1;
        setTimeRemaining(currentSecs);

        if (currentSecs <= 0) {
          clearInterval(interval);
          setTimerInterval(null);
          setIsScanning(false);
          setScanStatus("OUT WHEN TIME ENDS!");
          // Reset status after a delay
          setTimeout(() => {
            setScanStatus("");
          }, 4000);
        } else if (currentSecs < timerSeconds - 2) {
          setScanStatus("LINKED TO HELL ZONE");
        }
      }, 1000);

      setTimerInterval(interval);
    }
  };

  // Synchronize dynamic timer duration edits when not scanning
  useEffect(() => {
    if (!isScanning) {
      setTimeRemaining(timerSeconds);
    }
  }, [timerSeconds, isScanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  return (
    <section className="relative w-full overflow-hidden bg-zinc-950 rounded-2xl py-10 border border-zinc-900 mt-12">
      {/* Background ambient glows */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-shop-dark-red/40 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-shop-dark-red/20 blur-3xl rounded-full pointer-events-none" />
      
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Heading */}
          <h2 className="font-gaming text-3xl md:text-5xl font-black uppercase text-center text-white tracking-widest mb-10 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
            Team Up With The{" "}
            <span className="text-shop_light_red drop-shadow-[0_0_25px_rgba(220,38,38,0.9)]">
              Fighters
            </span>
          </h2>

          {/* Two-Column Grid: Scanner controls on Left, Training description on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mt-6">
            
            {/* Left side: Scan Input & Timer Clock */}
            <div className="md:col-span-7 flex flex-col gap-4 bg-zinc-900/40 p-5 rounded-xl border border-zinc-800/60 justify-between">
              
              {/* Fighter inputs */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <input
                  type="text"
                  placeholder="Fighter Name"
                  value={fighterName}
                  onChange={(e) => setFighterName(e.target.value)}
                  className="flex-1 bg-transparent border border-zinc-700 hover:border-shop_light_red/60 focus:border-shop_light_red focus:outline-none text-zinc-300 placeholder-zinc-650 px-4 py-3 rounded-lg text-sm transition-colors duration-200"
                />
                <input
                  type="text"
                  placeholder="Dimension Origin"
                  value={dimensionOrigin}
                  onChange={(e) => setDimensionOrigin(e.target.value)}
                  className="flex-1 bg-transparent border border-zinc-700 hover:border-shop_light_red/60 focus:border-shop_light_red focus:outline-none text-zinc-300 placeholder-zinc-650 px-4 py-3 rounded-lg text-sm transition-colors duration-200"
                />
              </div>

              {/* Timer Config and Clock */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-zinc-350 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    Timer of How Long in Hell and Out when Time Ends
                  </span>
                  
                  {/* Select Quick-presets or manual input */}
                  <div className="flex items-center gap-1.5 self-end">
                    <button
                      onClick={() => setTimerSeconds(10)}
                      className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer ${timerSeconds === 10 ? 'bg-shop_light_red text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'}`}
                      disabled={isScanning}
                    >
                      10s
                    </button>
                    <button
                      onClick={() => setTimerSeconds(30)}
                      className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer ${timerSeconds === 30 ? 'bg-shop_light_red text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'}`}
                      disabled={isScanning}
                    >
                      30s
                    </button>
                    <button
                      onClick={() => setTimerSeconds(60)}
                      className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer ${timerSeconds === 60 ? 'bg-shop_light_red text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'}`}
                      disabled={isScanning}
                    >
                      60s
                    </button>
                    <input
                      type="number"
                      min="5"
                      max="3600"
                      value={timerSeconds}
                      onChange={(e) => setTimerSeconds(Math.max(5, Number(e.target.value)))}
                      className="w-14 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-center font-mono text-[11px] text-white focus:outline-none focus:border-shop_light_red"
                      disabled={isScanning}
                    />
                  </div>
                </div>

                {/* The Timer Clock */}
                <div className="flex items-center justify-center bg-zinc-950 border border-zinc-900 rounded-lg p-3 gap-3">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Clock size={16} className={isScanning ? "text-shop_light_red animate-pulse" : ""} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Remaining Time:</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-mono font-black text-shop_light_red tracking-wider">
                    {formatTime(timeRemaining)}
                  </span>
                  {scanStatus && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-yellow-500 animate-pulse uppercase">
                      {scanStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Scanning Actions */}
              <button
                onClick={handleStartScan}
                className="w-full bg-shop_light_red hover:bg-shop-dark-red text-white font-black uppercase tracking-wider sm:tracking-widest py-3 px-4 rounded-lg text-xs transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-[1.02] font-gaming cursor-pointer"
              >
                {isScanning ? "Terminate Hell Scan Link" : "Initiate System Link Scan Body to Hell"}
              </button>
            </div>

            {/* Right side: Training Techniques Description */}
            <div className="md:col-span-5 bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3 justify-between">
              <div>
                <h3 className="font-gaming text-xs font-black uppercase text-shop_light_red tracking-wider border-b border-zinc-800 pb-2">
                  Way of Mortal Fang Training Techniques
                </h3>
                {/* Scrollable list with fixed heights to prevent long page scrolling */}
                <div className="max-h-56 overflow-y-auto text-[11px] text-zinc-400 space-y-3.5 pr-1.5 mt-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  <p className="leading-relaxed">
                    Align your body metrics to complete dimension coordinates:
                  </p>
                  
                  <div className="flex gap-2.5">
                    <span className="text-shop_light_red font-black font-mono">01</span>
                    <div className="leading-relaxed">
                      <strong className="text-white block font-bold mb-0.5">Frequency Breathing</strong>
                      Stance-lock breathing to match the cryo levels of Sub Zero, cooling internal thermal registers.
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <span className="text-shop_light_red font-black font-mono">02</span>
                    <div className="leading-relaxed">
                      <strong className="text-white block font-bold mb-0.5">Mind Core Isolation</strong>
                      Target fighter coordinates exactly to avoid coordinates drift in the scan streams.
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <span className="text-shop_light_red font-black font-mono">03</span>
                    <div className="leading-relaxed">
                      <strong className="text-white block font-bold mb-0.5">Hell Dimension Scan Anchor</strong>
                      Initiate links only when stable. Maintain balance as the link locks coordinates.
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <span className="text-shop_light_red font-black font-mono">04</span>
                    <div className="leading-relaxed">
                      <strong className="text-white block font-bold mb-0.5">Auto-Out Protocol</strong>
                      Once the countdown timer completes, the link naturally severs, automatically bringing you out of the combat zone.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Fine print at bottom */}
          <div className="border-t border-zinc-900 mt-6 pt-4">
            <p className="text-center text-zinc-500 text-xs px-4">
              with a system sign up from{" "}
              <span className="text-shop_light_red">Daniel Larussa Fong</span>,
              Mortal Kombat Mr. Scorpion,{" "}
              <span className="text-shop_light_red">Terry Silver Fong</span> and
              Mortal Kombat Mr. Sub Zero
            </p>
            <p className="text-center text-shop_light_red/70 text-[10px] italic mt-1.5 px-4">
              This system and buttons only works for certain fighters in dimension worlds only
            </p>
            <p className="text-center text-shop_light_red/50 text-[10px] italic mt-1 px-4">
              sign up only works for certain fighters out there in dimension worlds only And the
              buttons sends you to Mortal Fang Kombat Hell or the Dark side of Hell depending on
              which person you are
            </p>
          </div>

          {/* Fighter grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
            {fighters.map((fighter) => (
              <button
                key={fighter.id}
                onClick={() => setActiveFighter(fighter.id)}
                className={`
                  flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border cursor-pointer
                  transition-all duration-300 hover:scale-[1.03] text-center
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
                  <p className="text-zinc-500 text-[9px] mt-0.5">{fighter.label}</p>
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
