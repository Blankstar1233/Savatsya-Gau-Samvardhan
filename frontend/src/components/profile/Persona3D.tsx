import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const Persona3D: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="w-full h-96 bg-gradient-to-br from-sawatsya-cream to-sawatsya-sand rounded-lg overflow-hidden flex items-center justify-center relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-2 h-2 bg-sawatsya-amber rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* User Avatar */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.2 
        }}
      >
        <motion.div 
          className="w-32 h-32 bg-gradient-to-br from-sawatsya-earth to-sawatsya-wood text-white rounded-full flex items-center justify-center text-6xl font-bold mx-auto mb-6 shadow-2xl"
          animate={{
            y: [0, -10, 0],
            boxShadow: [
              '0 10px 30px rgba(0,0,0,0.1)',
              '0 20px 40px rgba(0,0,0,0.2)',
              '0 10px 30px rgba(0,0,0,0.1)',
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </motion.div>
        
        <motion.h3 
          className="text-2xl font-serif text-sawatsya-wood mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {user.name}
        </motion.h3>
        
        <motion.p 
          className="text-sawatsya-earth/70"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Welcome to your profile!
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Persona3D;
