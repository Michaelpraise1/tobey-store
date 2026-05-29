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
    <header className="bg-white py-4 px-2 sm:px-4 sticky top-0 z-50 border-b border-gray-100">
      <Container className='flex items-center justify-between text-light-color gap-2'>
       <div className='flex items-center gap-1.5 sm:gap-2.5 justify-start md:w-1/3'>
       <MobileMenu/>
       <div className='flex items-center gap-1.5 sm:gap-2'>
        <div className="hidden sm:block">
          <LogoIcon/>
        </div>
        <Logo/>
       </div>
       
        
        </div>
        <HeaderMenu/>
        <div className='flex items-center justify-end gap-2 sm:gap-3 md:w-1/3'>
          
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
