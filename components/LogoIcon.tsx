import { Flame } from 'lucide-react'
import React from 'react'

const LogoIcon = () => {
  return (
    <div className="w-12 h-12 bg-linear-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center pulse-glow">
        <Flame className="text-white" size={24} />
      </div>
  )
}

export default LogoIcon