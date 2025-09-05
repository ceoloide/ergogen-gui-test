import React, { useEffect, useRef } from 'react'

// De-facto dependency injection
// See public/index.html
declare const myjscad: any

interface JscadPreviewProps {
  jscad: string
}

const JscadPreview: React.FC<JscadPreviewProps> = ({ jscad }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const viewer = new myjscad.Viewer(containerRef.current, {
        name: 'jscad-preview',
        color: [0.2, 0.2, 0.2, 1],
      })
      viewer.add(jscad)
    }
  }, [jscad])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default JscadPreview
