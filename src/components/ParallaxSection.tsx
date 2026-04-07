'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ParallaxSectionProps {
  imageUrl?: string
  children: React.ReactNode
  overlay?: boolean
  className?: string
  id?: string
}

export default function ParallaxSection({
  imageUrl,
  children,
  overlay = true,
  className = '',
  id,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  return (
    <section ref={ref} id={id} className={`relative overflow-hidden ${className}`}>
      {imageUrl && (
        <motion.div
          className="absolute inset-0 w-full h-[120%] -top-[10%]"
          style={{ y }}
        >
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
        </motion.div>
      )}

      {overlay && imageUrl && (
        <div className="absolute inset-0 bg-black/60" />
      )}

      <div className="relative z-10">{children}</div>
    </section>
  )
}
