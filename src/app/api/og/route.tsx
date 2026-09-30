import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'RentRig Equipment'
  const category = searchParams.get('category') || 'HARDWARE'
  const price = searchParams.get('price') || '0'

  const categoryColors: Record<string, string> = {
    GPU_SERVER: '#6366f1',
    DRONE: '#06b6d4',
    LAB_INSTRUMENT: '#10b981',
    VR_AR_HEADSET: '#8b5cf6',
    CAMERA_GEAR: '#f59e0b',
    ROBOTICS_KIT: '#ef4444',
  }

  const color = categoryColors[category] || '#6366f1'

  const categoryLabels: Record<string, string> = {
    GPU_SERVER: 'GPU Server',
    DRONE: 'Drone',
    LAB_INSTRUMENT: 'Lab Instrument',
    VR_AR_HEADSET: 'VR / AR Headset',
    CAMERA_GEAR: 'Camera Gear',
    ROBOTICS_KIT: 'Robotics Kit',
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#0a0a0a',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '60px',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: color,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            ⚡
          </div>
          <span style={{ fontSize: '28px', fontWeight: 700 }}>RentRig</span>
        </div>

        <div>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: color + '33',
              border: `1px solid ${color}`,
              borderRadius: '999px',
              padding: '6px 16px',
              fontSize: '14px',
              color: color,
              marginBottom: '16px',
            }}
          >
            {categoryLabels[category] || category}
          </div>
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 800,
              lineHeight: 1.1,
              margin: '0 0 16px',
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: '28px', color: color, fontWeight: 600 }}>
            ₹{parseFloat(price).toLocaleString('en-IN')} / day
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #333',
            paddingTop: '24px',
            fontSize: '16px',
            color: '#888',
          }}
        >
          <span>rentrig.dev</span>
          <span>Premium Hardware Rental</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
