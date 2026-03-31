"use client"
import { AlignLeft } from 'lucide-react'
import React, { useState } from 'react'
import SideMenu from './SideMenu'

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
   <>
      <button onClick={()=> setIsOpen(!isOpen)}>
        <AlignLeft className='hover:text-dark-color hoverEffect md:hidden hover:cursor-pointer '/>
      </button>
      <div className='md:hidden'>
       <SideMenu 
       isOpen={isOpen}
       onClose={()=> setIsOpen(false)}
       />
      </div>
      
   </>
  )
}

export default MobileMenu