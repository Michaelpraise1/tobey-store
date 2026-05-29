import { Flame } from 'lucide-react'
import React from 'react'

const LogoIcon = () => {
  return (
    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-linear-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center pulse-glow">
        <Flame className="text-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </div>
  )
}

export default LogoIcon