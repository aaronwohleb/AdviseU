import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import advisingBg from '../assets/advising-bg.png';

export default function MainMenu() {
    const navigate = useNavigate();
  // Mouse tracking setup for title shimmer
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 70, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 70, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const percentX = useTransform(smoothX, [-1, 1], [0, 100]);
  const percentY = useTransform(smoothY, [-1, 1], [0, 100]);

  const borderBackground = useMotionTemplate`radial-gradient(circle at ${percentX}% ${percentY}%, #FF9FB3 0%, #D0B3FF 50%, #FF9FB3 100%)`;

  const rotateX = useTransform(smoothY, [-1, 1], [5, -5]);
  const rotateY = useTransform(smoothX, [-1, 1], [-5, 5]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden font-sans text-unlCream perspective-1000">

      {/* --- BACKGROUND LAYERS --- */}
      <motion.div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale brightness-[0.6]"
        style={{ backgroundImage: `url(${advisingBg})` }} // Notice the backticks and dynamic variable!
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1A0033]/90 via-academicPurple/70 to-[#4A0000]/90 mix-blend-multiply"></div>

      {/* --- FOREGROUND CONTENT --- */}
      <motion.div 
        className="z-10 relative flex flex-col items-center justify-center max-w-4xl w-full"
        style={{ rotateX, rotateY }}
      >
        
        {/* Shimmering Glowing Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-6 flex items-center justify-center"
        >
          {/* Outer glow for title */}
          <motion.h1
            className="text-7xl md:text-9xl font-extrabold tracking-tighter absolute blur-[16px] opacity-40 select-none pointer-events-none"
            style={{
              backgroundImage: borderBackground,
              WebkitBackgroundClip: "text",
              WebkitTextStroke: "8px transparent",
              color: "transparent",
            }}
            aria-hidden="true"
          >
            AdviseU
          </motion.h1>

          {/* Inner glow for title */}
          <motion.h1
            className="text-7xl md:text-9xl font-extrabold tracking-tighter absolute blur-[4px] opacity-60 select-none pointer-events-none"
            style={{
              backgroundImage: borderBackground,
              WebkitBackgroundClip: "text",
              WebkitTextStroke: "2px transparent",
              color: "transparent",
            }}
            aria-hidden="true"
          >
            AdviseU
          </motion.h1>

          {/* Title */}
          <motion.h1
            className="text-7xl md:text-9xl font-extrabold tracking-tighter relative z-10"
            style={{
              backgroundImage: borderBackground,
              WebkitBackgroundClip: "text",
              WebkitTextStroke: "1px transparent", 
              color: "#FDFBF7", 
            }}
          >
            AdviseU
          </motion.h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="text-lg md:text-2xl font-light tracking-wide mx-auto mb-12 text-gray-200/90 drop-shadow-md text-center">
            Create a four-year plan with the <span className="font-semibold text-white">press of a button.</span>
          </p>
        </motion.div>

        {/* Button with animated shine */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[#FF9FB3] to-[#D0B3FF] rounded-full blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
          
          <button 
            onClick={() => navigate('/create')}
            className="relative bg-academicPurple/80 hover:bg-academicPurple border border-white/20 text-unlCream font-bold py-4 px-12 rounded-full text-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out flex items-center gap-3 backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
            
            <span className="relative z-10 tracking-wide">Get Started</span>
            <svg
              className="w-6 h-6 ml-1 relative z-10 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}