import React from 'react'
import Container from './Container'
import Logo from './Logo'
import HeaderMenu from './HeaderMenu'
import SearchBar from './SearchBar'
import FavoriteButton from './FavoriteButton'
import CartIcon from './CartIcon'
import MobileMenu from './MobileMenu'
import AuthButtons from './AuthButtons'
import { ClerkLoaded } from '@clerk/nextjs'
import LogoIcon from './LogoIcon'
import AdminButton from './AdminButton'

const Header = () => {
  return (
    <header className="bg-white py-5 px-3  ">
      <Container className='flex items-center justify-between text-lightColor'>
       <div className='w-auto md:w1/3 flex items-center gap-2.5 justify-start md:gap-0'>
       <MobileMenu/>
       <div className='flex items-center gap-2'>
        <LogoIcon/>
         <Logo/>
       </div>
       
        
        </div>
        <HeaderMenu/>
        <div className='w-auto md:w-1/3 flex items-center justify-end gap-3'>
          
          <ClerkLoaded>
            <AdminButton />
          </ClerkLoaded>

          <SearchBar/>
          <CartIcon/>
          <FavoriteButton/>
          
          <ClerkLoaded>
            <AuthButtons />
          </ClerkLoaded>
        </div>
      </Container>
    </header>
  )
}

export default Header;
