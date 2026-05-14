
import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";

interface ParallaxLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function ParallaxLogo({ size = "md", className = "" }: ParallaxLogoProps) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [15, -15]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-15, 15]), { stiffness: 100, damping: 30 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    x.set(mouseX / rect.width);
    y.set(mouseY / rect.height);
  }

  function handleMouseLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  const dimensions = {
    sm: "w-12 h-12",
    md: "w-16 h-16 md:w-20 md:h-20",
    lg: "w-24 h-24 md:w-32 md:h-32",
    xl: "w-32 h-32 md:w-48 md:h-48"
  }[size];

  const borderSize = size === "xl" ? "border-4" : "border-2";

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ y: 0 }}
      animate={{ 
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        perspective: 1200,
      }}
      className={`relative cursor-pointer ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={`relative ${dimensions} flex items-center justify-center overflow-hidden rounded-full ${borderSize} border-editorial-gold/10 bg-white shadow-2xl transition-all duration-500 group-hover:border-editorial-gold/40 group-hover:shadow-[0_20px_50px_rgba(212,175,55,0.3)]`}
      >
        <motion.img 
          src="/logo.png" 
          alt="Rouky Shop Logo" 
          className="w-full h-full object-contain relative z-10 scale-90" 
          style={{ transform: "translateZ(20px)" }}
        />
        
        {/* Dynamic Light Overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent z-20 pointer-events-none"
          style={{ transform: "translateZ(60px)" }}
        />
        
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-editorial-gold/5 z-0" />

        {/* Enhanced Shine effect */}
        <motion.div
          className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-[shine_2s_ease-in-out_infinite]"
          style={{ transform: "translateZ(30px)" }}
        />
      </motion.div>
      
      {/* 3D Shadow Plate */}
      <motion.div 
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-black/10 blur-xl rounded-full"
        style={{ transform: "translateZ(-20px)" }}
      />
    </motion.div>
  );
}
