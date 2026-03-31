"use client"
import { cn } from '@/lib/utils'
import { motion } from "framer-motion"
import { Loader2 } from 'lucide-react'
import React from 'react'



const NoProductAvailable = ({selectTab, className}: {selectTab?: string, className?: string}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-10 min-h-80 gap-4 bg-gray-100 w-full mt-10", className)}>
       <motion.div
       initial={{ opacity: 0, y: -20}}
       animate={{ opacity:1, y: 0}}
       transition={{duration: 0.5}}
       >

        <h2 className="text-2xl font-bold text-gray-800"> No Product Available</h2>
        </motion.div>

        <motion.p 
        initial={{ opacity: 0}}
        animate={{ opacity:1}}
        transition={{duration: 0.5, delay: 0.2}}
        className="text-gray-600"
        >
          We&apos;re sorry, but there are no products matching on {" "}<span className='font-semibold text-gray-800'>{selectTab}</span> {" "}variant at the moment. Please check back later or explore other categories.


        </motion.p>
        <motion.div
        animate={{ scale: [1, 1.1, 1]}}
        transition={{ repeat: Infinity, duration: 1.5}}
        className="flex items-center space-x-2 text-shop_light_red"
        >
          <Loader2 className='w-5 h-5 animate-spin'/>
          <span>We&apos;re restocking shortly</span>

        </motion.div>
        <motion.p
        initial={{ opacity: 0}}
        animate={{ opacity:1}}
        transition={{duration: 0.5, delay: 0.4}}
        className="text-gray-600 text-sm"
        >
          Please check back later or explore other categories for more options.
        </motion.p>
    </div>
  )
}

export default NoProductAvailable