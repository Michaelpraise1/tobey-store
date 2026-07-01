"use client";

import React, { useState } from "react";
import { Cpu, CheckCircle2, RotateCcw } from "lucide-react";

interface AiFitSystemProps {
  availableSizes?: string[];
  onConfirmFit: (recommendedSize: string) => void;
}

export default function AiFitSystem({ availableSizes = [], onConfirmFit }: AiFitSystemProps) {
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(70);
  const [build, setBuild] = useState<string>("Average");
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const calculateFit = () => {
    // Basic AI predictive rules for clothing sizes
    let score = 0;
    
    // Height rules
    if (height < 165) score += 1;
    else if (height < 175) score += 2;
    else if (height < 185) score += 3;
    else if (height < 195) score += 4;
    else score += 5;

    // Weight rules
    if (weight < 60) score += 0;
    else if (weight < 75) score += 1;
    else if (weight < 90) score += 2;
    else if (weight < 105) score += 3;
    else score += 4;

    // Build factor
    if (build === "Slim") score -= 1;
    if (build === "Athletic") score += 0;
    if (build === "Husky") score += 1;

    let sizeRec = "medium";
    if (score <= 1) sizeRec = "small";
    else if (score <= 3) sizeRec = "medium";
    else if (score <= 5) sizeRec = "large";
    else if (score <= 7) sizeRec = "xl";
    else sizeRec = "xxl";

    // Clean match to available sizes if they exist
    if (availableSizes.length > 0) {
      const lowerSizes = availableSizes.map(s => s.toLowerCase());
      if (lowerSizes.includes(sizeRec)) {
        // Match found, use matching casing
        const idx = lowerSizes.indexOf(sizeRec);
        sizeRec = availableSizes[idx];
      } else {
        // Fallback to closest available size
        sizeRec = availableSizes[Math.min(Math.max(0, score - 2), availableSizes.length - 1)];
      }
    }

    setRecommendation(sizeRec);
    setIsCalculated(true);
    localStorage.setItem("mortal-fang-ai-size", sizeRec);
    onConfirmFit(sizeRec);
  };

  const handleReset = () => {
    setIsCalculated(false);
    setRecommendation(null);
  };

  return (
    <div className="bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-800 rounded-xl p-5 mt-4 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="text-shop_light_red w-5 h-5 animate-pulse" />
        <h4 className="font-bold text-sm tracking-wider uppercase">Mortal Fang AI Clothing Fit System</h4>
      </div>

      {!isCalculated ? (
        <div className="space-y-4">
          {/* Height slider */}
          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
              <span>Height</span>
              <span className="text-white font-mono">{height} cm</span>
            </div>
            <input
              type="range"
              min="140"
              max="220"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-shop_light_red"
            />
          </div>

          {/* Weight slider */}
          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
              <span>Weight</span>
              <span className="text-white font-mono">{weight} kg</span>
            </div>
            <input
              type="range"
              min="40"
              max="150"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-shop_light_red"
            />
          </div>

          {/* Build selection */}
          <div>
            <span className="text-xs text-zinc-400 block mb-2">Body Build Type</span>
            <div className="grid grid-cols-4 gap-2">
              {["Slim", "Average", "Athletic", "Husky"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBuild(type)}
                  className={`py-1.5 px-1 text-center text-xs font-semibold rounded transition-colors ${
                    build === type
                      ? "bg-shop_light_red text-white"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={calculateFit}
            className="w-full mt-2 py-2.5 bg-zinc-800 hover:bg-shop_light_red text-white text-xs font-black uppercase tracking-wider rounded border border-zinc-700 hover:border-shop_light_red transition-all duration-200"
          >
            Confirm AI Clothing Fit
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
          <h5 className="text-sm font-bold text-zinc-100">AI Fit Profile Confirmed!</h5>
          <p className="text-xs text-zinc-400 mt-1">
            Based on your height of {height}cm and weight of {weight}kg ({build} build).
          </p>
          <div className="bg-zinc-850 px-4 py-2 rounded-lg border border-zinc-800 mt-3 flex items-center gap-3">
            <span className="text-zinc-500 text-xs font-medium">Recommended Size:</span>
            <span className="text-shop_light_red font-black text-lg uppercase tracking-wider">{recommendation}</span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="mt-4 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Re-calculate Fit
          </button>
        </div>
      )}
    </div>
  );
}
