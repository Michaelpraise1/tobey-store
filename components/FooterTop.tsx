import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import React from 'react';

interface ContactItemData {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const data: ContactItemData[] = [
  // {
  //   title: "Visit Us",
  //   subtitle: "New York, 1234 Street, USA",
  //   icon: (<MapPin className='h-6 w-6 ttext-gray-600 group-hover:text-pprimart transitioin-colors'/>)
  // },
  //  {
  //   title: "Call Us",
  //   subtitle: "+1234567890",
  //   icon: (<Phone className='h-6 w-6 ttext-gray-600 group-hover:text-pprimart transitioin-colors'/>)
  // },
  {
    title: "working Hours",
    subtitle: "Monday - Saturday: 10:00 - 22:00",
    icon: (<Clock className='h-6 w-6 ttext-gray-600 group-hover:text-pprimart transitioin-colors' />)
  },

  {
    title: "Email Us",
    subtitle: "tobeystudios@gmail.coom",
    icon: (<Mail className='h-6 w-6 ttext-gray-600 group-hover:text-pprimart transitioin-colors' />)
  },
]

const FooterTop = () => {
  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-8 border-b'>
      {data?.map((item, index) => (
        <div key={index} className='flex items-center gap-3 group hover:bg-gray-50 transition-colors '>
          {item?.icon}
          <div>
            <h3 className='font-semibold text-gray-900 group-hover:text-black'>{item?.title}</h3>
            <p className='text-gray-600 text-sm mt-1 group-hover::text-gray-900'>{item?.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// const ContactItem=()=>{
//   return <div>
//     <p>hello</p>
//   </div>
// }

export default FooterTop 