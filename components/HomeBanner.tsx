"use client";
import React, { useEffect, useState } from 'react'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from './ui/carousel'
import { Flame } from 'lucide-react'
import { Button } from './ui/button'
import Image from 'next/image'

import jacketImg from '../images/products/jacket.png'
import hoodieImg from '../images/products/redThickHoodie.jpeg'
import joggersImg from '../images/products/fireJoogers.jpeg'
import Title from './ui/text';

const products = [
  { id: 1, image: jacketImg, title: "Ai Shape Fit Jacket" },
  { id: 2, image: joggersImg, title: "Flamin' Joggers" },
  { id: 3, image: hoodieImg, title: "Premium Hoodie" },
]

const HomeBanner = () => {
  const [api, setApi] = useState<CarouselApi>()

  // 5-second automatic image rotation
  useEffect(() => {
    if (!api) return

    const interval = setInterval(() => {
      api.scrollNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [api])

  return (
    <div className="relative w-full overflow-hidden bg-zinc-950 rounded-2xl p-8 md:p-12 border border-zinc-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
      {/* Background ambient glows */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-shop-dark-red/40 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-shop_light_red/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Left Content - Typography & Buttons */}
      <div className="w-full md:w-1/2 flex flex-col items-start gap-6 z-10">
        <Title className="text-5xl font-gaming drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] md:text-6xl font-bold uppercase text-white leading-tight tracking-widest">
          Flamin&apos; <br/>
          <span className="text-shop_light_red drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]">Hot</span> <br/>
          Merchandise
        </Title>
        <p className="text-zinc-400 text-sm md:text-base font-medium max-w-md">
          Unleash your fighting spirit with exclusive <span className="text-shop_light_red font-bold">Mortal Fang Kombat</span> gear. Premium merchandise for true warriors.
        </p>
        
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Button className="bg-shop_light_red hover:bg-shop-dark-red text-white px-8 py-6 rounded-lg font-bold uppercase tracking-wider text-sm flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] border-none">
            <Flame className="w-5 h-5" /> Shop Now
          </Button>
          <Button variant="outline" className="border-shop_light_red/50 text-shop_light_red hover:bg-shop_light_red hover:text-white px-8 py-6 rounded-lg font-bold uppercase tracking-wider text-sm transition-all duration-300 bg-transparent">
            Ai Shape Fit Product
          </Button>
        </div>
      </div>

      {/* Right Content - 5-Second Carousel (Hidden on Mobile for a cleaner professional look) */}
      <div className="hidden md:flex w-full md:w-1/2 z-10 justify-center md:justify-end">
        <Carousel 
          setApi={setApi} 
          opts={{ loop: true }}
          className="w-full max-w-sm"
        >
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem key={product.id}>
                <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 backdrop-blur-md border border-shop-dark-red/50 rounded-2xl aspect-square gap-6 shadow-[0_0_30px_rgba(127,29,29,0.2)] mx-2">
                   <div className="w-48 h-48 bg-zinc-950 rounded-full flex items-center justify-center border-4 border-shop_light_red/30 shadow-inner overflow-hidden relative">
                     <Image 
                       src={product.image} 
                       alt={product.title} 
                       width={200} 
                       height={200} 
                       className="object-cover w-full h-full hover:scale-110 transition-transform duration-500" 
                       priority // loads instantly for banner
                     />
                   </div>
                   <h3 className="text-white font-black tracking-widest uppercase text-lg text-center">
                     {product.title}
                   </h3>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  )
}

export default HomeBanner;