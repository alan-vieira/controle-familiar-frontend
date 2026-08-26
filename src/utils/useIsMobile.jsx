import { useState, useEffect } from 'react';

/**
 * Hook para detectar se o dispositivo é mobile
 * @param {number} breakpoint - Largura máxima para considerar mobile (padrão: 768px)
 * @returns {boolean} - true se for mobile, false se for desktop
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;