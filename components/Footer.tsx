import React from 'react'
import Container from './Container'
import FooterTop from './FooterTop';
import Logo from './Logo';
import LogoIcon from './LogoIcon';
import SocialMedia from './SocialMedia';
import { SubText, SubTitle} from './ui/text';
import { ArsenalData, SupportData } from '@/constants/data';
import Link from 'next/link';
import { Button } from './ui/button';

const Footer = () => {
  return (
   <footer className='bg-white border-t'>
    <Container>
      <FooterTop/>
      <div className='py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
        <div className='space-y-4'>
          <div className='flex item-center gap-3 '>
            <LogoIcon/>
            <Logo/>
          </div>
          <SubText >Equipping warriors with legendary merchandise since the dawn of combat.</SubText>
          <SocialMedia className='text-darkColor/60'
           iconClassName=' border-shop_light_red hover:text-shop_light_red'
           tooltipClassName='bg-red-500 text-white'
           />
        </div>
        <div>
          <SubTitle>
            ARSENAL
          </SubTitle>
          <ul className='space-y-3 mt-4'>
              {ArsenalData?.map((item)=>(
                <li key={item.title}>
                  <Link href={item?.href} className='hover:text-shop_light_red hoverEffect font-medium'>
                  {item?.title}
                  </Link>
                </li>
              ))}
            </ul>
        </div>
        <div>
           <SubTitle>
            SUPPORT
          </SubTitle>
          <ul className='space-y-3 mt-4'>
              {SupportData?.map((item)=>(
                <li key={item.title}>
                  <Link href={item?.href} className='hover:text-shop_light_red hoverEffect font-medium'>
                  {item?.title}
                  </Link>
                </li>
              ))}
            </ul>
        </div>
        <div className='space-y-4'>
           <SubTitle>Newsletter</SubTitle>
           <SubText>Subcribe to our newsletter to recieve update and exclusive offers </SubText>
           <form className='space-y-3'>
            <input placeholder='Enter your email' className='w-full border-gray-300 hover:border-shop_light_red border-2 rounded-sm'  type='email' required/>
            <Button className='w-full'>Subscribe</Button>
           </form>
        </div>
      </div>
      <div className='py-6 border-t text-center text-sm text-gray-600 flex flex-col align-center'>
        <p className='text-sm'>
          © {new Date().getFullYear()}{" "}
          <span className=' text-shop-dark-red font-black tracking-wider uppercase hover:text-shop_light_red hoverEffect group font-sans text-sm'> Original Tobey
             {" "} <span className='text-shop_light_red group-hover:text-shop-dark-red hoverEffect text-sm'>studio</span>
          </span>
          . All rights reserved. Built for warriors, by warriors.
        </p>
      </div>
    </Container>
    </footer>
  )
}

export default Footer;