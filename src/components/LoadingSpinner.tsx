import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const { isDark } = useTheme();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <div className={`rounded-full border-2 border-t-transparent ${
        isDark ? 'border-purple-400' : 'border-purple-600'
      }`} style={{ width: '100%', height: '100%' }}></div>
    </motion.div>
  );
}