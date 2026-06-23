"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "./ui/button";
import { SubText, SubTitle } from "./ui/text";

const Newsletter = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const response = await fetch("/api/newsletter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong.");
            }

            toast.success("Successfully subscribed to the newsletter!");
            setEmail("");
        } catch (error: any) {
            console.error("Newsletter submission error:", error);
            toast.error(error.message || "Failed to subscribe. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <SubTitle>Newsletter</SubTitle>
            <SubText>Subscribe to our newsletter to receive updates and exclusive offers.</SubText>
            <form onSubmit={handleSubmit} className="space-y-3 flex flex-col">
              <input 
                placeholder="Enter your email" 
                className="w-full bg-white border border-gray-300 focus:border-shop_light_red focus:ring-1 focus:ring-shop_light_red outline-none text-gray-800 placeholder-gray-400 px-4 py-3 rounded-lg text-sm transition-all duration-200" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required 
              />
              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-shop_light_red hover:bg-shop-dark-red text-white py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 border-none shadow-sm hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
        </div>
    );
};

export default Newsletter;