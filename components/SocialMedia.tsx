import { Facebook,  Instagram, Twitter, Youtube } from 'lucide-react';
import React from 'react'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  className?: string;
  iconClassName?: string;
  tooltipClassName?: string;
}


const socialLink = [
  {
    title: "Facebook",
    href: "https://www.youtube.com/michael",
    icon: <Facebook className='w-5 h-5' />,
  },
  {
    title: "Twitter",
    href: "https://x.com/needaforth?s=21",
    icon: <Twitter className='w-5 h-5' />,
  },

  {
    title: "Instagram",
    href: "https://www.instagram.com/tobey_studios?igsh=Z2pwc3g0Y2R0a2ho&utm_source=qr",
    icon: <Instagram className='w-5 h-5' />,
  },
  {
    title: "Youtube",
    href: "https://www.youtube.com/@OriginalTobeyStudios-r7x",
    icon: <Youtube className='w-5 h-5' />,
  },
  
];


const SocialMedia = ({ className, iconClassName, tooltipClassName }: Props) => {
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-4", className)}>
        {socialLink?.map((item) => (
          <Tooltip key={item?.title}>
            <TooltipTrigger asChild>
              <Link
                target='_blank'
                rel='noopener noreferrer'
                href={item?.href}
                key={item?.title}
                className={cn("p-2 border rounded-full hover:text-white hover:border-shop_light_red hoverEffect", iconClassName)}>
                {item?.icon}
              </Link >
            </TooltipTrigger>
            <TooltipContent className={cn("bg-white text-daarkColor font-semibold border border-[shop_light_red]  p-2", tooltipClassName)}>
              {item?.title}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

    </TooltipProvider>
  )
}

export default SocialMedia; 