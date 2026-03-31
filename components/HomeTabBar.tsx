import { productType } from '@/constants/data';
import Link from 'next/link';
import React from 'react';

interface Props {
  selectTab: string;
  onTabselect: (tab: string) => void;
}

const HomeTabBar = ({ selectTab, onTabselect }: Props) => {
  return (
    <div  className='flex items-center justify-between flex-wrap gap-5'>
      <div className='flex items-center gap-1.5 text-sm font-semibold'>
        {productType?.map((item)=>(
          <button key={item?.title} 
           onClick={()=> onTabselect(item?.title)}
           className={`border border-shop_light_red/30 px-4 py-1.5 md:px-6 md:py-2 rounded-full hover:bg-shop_light_red hover:text-white  hover:border-shop_light_red hoverEffect ${selectTab === item?.title ? "bg-shop_light_red text-white border-shop_light_red" :"bg-shop_light_red/30"}`}>
            {item?.title}
          </button>
        ))}
      </div>
      <Link href={"/shop"} className='border border-shop_light_red/30 px-4 py-1.5 md:px-6 md:py-2 rounded-full hover:bg-shop_light_red hover:border-shop_light_red hover:text-white hoverEffect'>See all</Link>
    </div>
  )
}

export default HomeTabBar;