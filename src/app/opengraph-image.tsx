import { ImageResponse } from 'next/og'

export const alt = '기록유산 복원 아카이브'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0F0F0F',
          backgroundImage:
            'radial-gradient(ellipse at top, rgba(212,168,83,0.14) 0%, transparent 55%), radial-gradient(circle at 1px 1px, rgba(212,168,83,0.08) 1px, transparent 0)',
          backgroundSize: 'auto, 32px 32px',
          position: 'relative',
          padding: 80,
          color: '#F5F5F5',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top vertical gold rail */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: 1,
            height: 120,
            background: 'linear-gradient(to bottom, transparent, #D4A853)',
            opacity: 0.5,
          }}
        />

        {/* Corner accents */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 60,
            width: 40,
            height: 1,
            backgroundColor: '#D4A853',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 60,
            width: 1,
            height: 40,
            backgroundColor: '#D4A853',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 60,
            right: 60,
            width: 40,
            height: 1,
            backgroundColor: '#D4A853',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 60,
            right: 60,
            width: 1,
            height: 40,
            backgroundColor: '#D4A853',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 60,
            width: 40,
            height: 1,
            backgroundColor: '#D4A853',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 60,
            width: 1,
            height: 40,
            backgroundColor: '#D4A853',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 60,
            width: 40,
            height: 1,
            backgroundColor: '#D4A853',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 60,
            width: 1,
            height: 40,
            backgroundColor: '#D4A853',
            opacity: 0.5,
          }}
        />

        {/* Center content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
          }}
        >
          {/* Top eyebrow pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 24px',
              borderRadius: 999,
              border: '1px solid rgba(212,168,83,0.35)',
              backgroundColor: 'rgba(212,168,83,0.06)',
              color: '#D4A853',
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: 6,
              textTransform: 'uppercase',
            }}
          >
            National Archives of Korea
          </div>

          {/* Divider + tag line */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginTop: 6,
            }}
          >
            <div
              style={{
                height: 1,
                width: 80,
                backgroundColor: '#D4A853',
                opacity: 0.4,
              }}
            />
            <div
              style={{
                color: '#D4A853',
                fontSize: 22,
                letterSpacing: 8,
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              Restoration Archive
            </div>
            <div
              style={{
                height: 1,
                width: 80,
                backgroundColor: '#D4A853',
                opacity: 0.4,
              }}
            />
          </div>

          {/* Headline (Korean) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 14,
              fontSize: 104,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex' }}>
              <span style={{ color: '#D4A853' }}>기록유산</span>
              <span>의</span>
            </div>
            <div style={{ display: 'flex' }}>복원과 보존</div>
          </div>

          {/* Subtitle */}
          <div
            style={{
              color: '#A0A0A0',
              fontSize: 26,
              marginTop: 14,
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            시간이 훼손한 기록을, 기술로 되살립니다
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(212,168,83,0.2)',
            paddingTop: 22,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: '1px solid rgba(212,168,83,0.35)',
                backgroundColor: 'rgba(212,168,83,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D4A853',
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              기
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                lineHeight: 1,
              }}
            >
              <div
                style={{
                  color: '#D4A853',
                  fontSize: 12,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Archives KR
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                <span style={{ color: '#D4A853' }}>기록</span>유산 복원 아카이브
              </div>
            </div>
          </div>
          <div
            style={{
              color: '#6B6B6B',
              fontSize: 16,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            projectrestore.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
