import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title =
    searchParams.get('title') ||
    'Prolific News Network — 24/7 Global Broadcast & Market Intelligence';
  const category = (searchParams.get('category') || 'BREAKING DISPATCH').toUpperCase();
  const author = searchParams.get('author') || 'Prolific Global News Desk';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#001526',
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(204, 0, 0, 0.28), transparent 45%), linear-gradient(135deg, #002B49 0%, #000F1C 100%)',
          padding: '56px 64px',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
          borderBottom: '14px solid #CC0000',
        }}
      >
        {/* Top Bar: Pure Typographic PROLIFIC + NEWS NETWORK Lockup + Category Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '38px',
                fontWeight: 900,
                letterSpacing: '4px',
                color: '#FFFFFF',
                lineHeight: 1.05,
              }}
            >
              PROLIFIC
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#CC0000',
                borderTop: '3px solid #FFCC00',
                padding: '4px 12px',
                marginTop: '4px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 900,
                  letterSpacing: '5px',
                  color: '#FFFFFF',
                }}
              >
                NEWS NETWORK
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(204, 0, 0, 0.9)',
              padding: '10px 22px',
              borderRadius: '6px',
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            {category}
          </div>
        </div>

        {/* Center Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginTop: '24px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '96px',
              height: '6px',
              backgroundColor: '#FFCC00',
            }}
          />
          <div
            style={{
              fontSize: title.length > 90 ? '44px' : '54px',
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#FFFFFF',
              letterSpacing: '-0.5px',
              display: 'flex',
            }}
          >
            {title.slice(0, 140)}
          </div>
        </div>

        {/* Footer Lower-Third Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.18)',
            paddingTop: '22px',
            fontSize: '18px',
            color: '#CBD5E1',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#FFCC00', fontWeight: 700 }}>{author}</span>
            <span>•</span>
            <span>Verified Global Dispatch</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '1.5px',
            }}
          >
            <span style={{ color: '#FFCC00' }}>@prolificnews</span>
            <span>PROLIFIC.NEWS</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
