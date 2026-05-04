'use client'

import React from 'react'

interface SectionHeaderProps {
  title: string
  linkText?: string
  onLinkPress?: () => void
}

export default function SectionHeader({ title, linkText, onLinkPress }: SectionHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px',
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 800,
        color: '#0F172A', // Slate 900
        fontFamily: 'var(--font-nunito)',
      }}>
        {title}
      </h2>
      {linkText && onLinkPress && (
        <button
          onClick={onLinkPress}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px 0',
            fontSize: '14px',
            fontWeight: 700,
            color: '#4F46E5', // Indigo 600
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {linkText}
        </button>
      )}
    </div>
  )
}
