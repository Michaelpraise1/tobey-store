// import { cn } from '@/lib/utils'
// import Link from 'next/link';
// import React from 'react'

// const Logo = ({className}: {className?:string}) => {
//   return (
//     <Link href="/">
//       <h2 className={cn("text-2xl text-[shop_dark_green] font-black  tracking-wider uppercase hover:text-[shop_light_green] hoverEffect group font-sans",className)}> OriginalTobey
//          <span className="text-[shop_light_green] group-hover:text-[shop_dark_green] hoverEfect"> Studio </span>
//           </h2>
//     </Link>
//   )
// }

// export default Logo;

import { cn } from '@/lib/utils'
import Link from 'next/link';
import React from 'react'

const Logo = ({ className, spanDesign }: { className?: string, spanDesign?: string }) => {
  return (
    <Link href="/"  >
      
      <h2
        className={cn(
          "text-lg text-shop-dark-red font-black tracking-wider uppercase hover:text-shop_light_red hoverEffect group font-sans",
          className
        )}
      >
        Original Tobey
        <span className={cn("text-shop_light_red group-hover:text-shop-dark-red hoverEffect", spanDesign)}> Studio </span>
      </h2>
      <h5 className={cn(
        "text-sm text-shop-dark-red  tracking-wider uppercase hover:text-shop_light_red hoverEffect group font-sans",
        className
      )}>PREMIUM GEAR</h5>
    </Link>
  )
}

export default Logo;