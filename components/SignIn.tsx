import {  SignInButton } from '@clerk/nextjs';
import React from 'react'

const Signin = () => {
  return (
   <SignInButton mode='modal'>
     <button className='text-sm font-semibold hover:text-dark-color text-light-color hover:cursor-pointer hoverEffect'>
      Login
    </button>
   </SignInButton>
  )
}

export default Signin;