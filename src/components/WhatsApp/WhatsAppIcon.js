// [file name]: components/WhatsAppIconSimpleAnimated.js
// [file content begin]
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppIconSimpleAnimated = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const whatsappNumber = "966534561679";

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    const defaultMessage = "السلام عليكم، حاب أستفسر عن طلب وايت موية. ممكن تفاصيل الخدمة؟";
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank');
  };

  // متغيرات لأنيميشن متنوعة
  const pulseVariants = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: {
      scale: [0.8, 1.3, 0.8],
      opacity: [0.5, 0.2, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const iconVariants = {
    initial: { rotate: 0 },
    hover: {
      rotate: [0, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 }
    },
    tap: { scale: 0.9 }
  };

  return (
    <div className="fixed bottom-13 left-4 md:left-6 z-50">


      <div className="relative">
        {/* موجات النبض */}
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-green-400 rounded-full"
        />

        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.5 }}
          className="absolute inset-0 bg-green-300 rounded-full"
        />

        {/* الأيقونة */}
        <motion.button
          onClick={handleWhatsAppClick}
          variants={iconVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          className="relative bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-xl cursor-pointer"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaWhatsapp size={24} />
          </motion.div>


        </motion.button>


      </div>

      {/* نص متحرك يظهر عند النقر */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-1/2 -translate-y-1/2 left-16 bg-gray-800 text-white px-3 py-2 rounded-lg whitespace-nowrap"
          >
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              جاري فتح المحادثة...
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatsAppIconSimpleAnimated;
// [file content end]
