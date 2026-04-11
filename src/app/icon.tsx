import { ImageResponse } from 'next/og'

// Android / modern browsers — 192x192 PWA icon
export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F0F0F',
          backgroundImage:
            'radial-gradient(circle at 50% 35%, rgba(212,168,83,0.3) 0%, transparent 60%)',
          borderRadius: 36,
          position: 'relative',
        }}
      >
        {/* Corner accents (L shapes in each corner) */}
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: 18,
            width: 22,
            height: 2,
            backgroundColor: '#D4A853',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: 18,
            width: 2,
            height: 22,
            backgroundColor: '#D4A853',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            width: 22,
            height: 2,
            backgroundColor: '#D4A853',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            width: 2,
            height: 22,
            backgroundColor: '#D4A853',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 18,
            left: 18,
            width: 22,
            height: 2,
            backgroundColor: '#D4A853',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 18,
            left: 18,
            width: 2,
            height: 22,
            backgroundColor: '#D4A853',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 18,
            right: 18,
            width: 22,
            height: 2,
            backgroundColor: '#D4A853',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 18,
            right: 18,
            width: 2,
            height: 22,
            backgroundColor: '#D4A853',
          }}
        />

        {/* Center glyph: 기 */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: '#D4A853',
            lineHeight: 1,
            fontFamily: 'sans-serif',
          }}
        >
          기
        </div>
      </div>
    ),
    { ...size },
  )
}
