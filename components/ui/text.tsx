import { cn } from '@/lib/utils';
import React from 'react'

const Title = ({children, className}: 
  {children: React.ReactNode; 
  className?: string
}) => {
  return(
  <h2 className={cn("text-2xl font-semibold", className)}>
    {children}
  </h2>
  );
};

const SubText = ({children, className}: 
  {children: React.ReactNode; 
  className?: string
}) => {
  return (
    <p className={cn("text-gray-600 text-sm", className)}>
      {children}
    </p>
  );
};

const SubTitle = ({children, className}: 
  {children: React.ReactNode; 
  className?: string
}) => {
  return (
    <h3 className={cn("font-semibold font-sans text-gray-900", className)}>
      {children}
    </h3>
  );
};

export { Title, SubText, SubTitle};
export default Title;