"use client";

import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import { Product } from "@/sanity.types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import ProductCard from "@/components/ProductCard";
import { Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";

const HomeProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();

  // Fetch products
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "product"] | order(_createdAt desc)[0..11]`
        );
        setProducts(data);
      } catch (err) {
        console.error("HomeProduct fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Auto-scroll every 3s
  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [api]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-shop_light_red">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading products...</span>
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <section className="py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <h2 className="font-gaming text-2xl md:text-3xl font-black uppercase text-dark-color tracking-widest">
            Featured{" "}
            <span className="text-shop_light_red">Products</span>
          </h2>
          <p className="text-light-color text-sm mt-1">
            Hand-picked gear for true warriors
          </p>
        </div>
        <Link
          href="/shop"
          className="flex items-center gap-1 text-shop_light_red text-sm font-semibold hover:gap-2 transition-all duration-200 group"
        >
          View All
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>

      {/* Carousel */}
      <div className="relative px-8">
        <Carousel
          setApi={setApi}
          opts={{ loop: true, align: "start" }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((product) => (
              <CarouselItem
                key={product._id}
                className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 h-full">
                  <ProductCard product={product} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Nav buttons */}
          <CarouselPrevious className="left-0 border-shop_light_red/40 text-shop_light_red hover:bg-shop_light_red hover:text-white hover:border-shop_light_red transition-all duration-200" />
          <CarouselNext className="right-0 border-shop_light_red/40 text-shop_light_red hover:bg-shop_light_red hover:text-white hover:border-shop_light_red transition-all duration-200" />
        </Carousel>
      </div>
    </section>
  );
};

export default HomeProduct;