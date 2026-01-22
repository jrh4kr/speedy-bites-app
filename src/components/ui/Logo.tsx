interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Logo = ({ size = 'md', className = '' }: LogoProps) => {
  const sizes = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-28 w-28',
    xl: 'h-40 w-40',
  };

  return (
    <img 
      src="https://i.imgur.com/qsKfHzO.jpeg" 
      alt="Kuku Ni Sisi" 
      className={`${sizes[size]} object-contain ${className}`}
    />
  );
};

export default Logo;
