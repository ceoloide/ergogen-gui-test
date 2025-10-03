import React, { useEffect, useRef } from 'react'

// De-facto dependency injection
// See public/index.html
declare const myjscad: any

/**
 * Props for the JscadPreview component.
 * @interface JscadPreviewProps
 * @property {string} jscad - The JSCAD script to be rendered.
 */
interface JscadPreviewProps {
  jscad: string
}

/**
 * A React component that renders a 3D preview of a JSCAD script.
 * It uses the `myjscad` library, which is expected to be available globally.
 * The component creates a viewer instance and attaches it to a div element.
 *
 * @param {JscadPreviewProps} props - The props for the component.
 * @returns {JSX.Element} A div element that will contain the JSCAD viewer.
 */
const JscadPreview: React.FC<JscadPreviewProps> = ({ jscad }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log('JscadPreview: useEffect called')
    if (containerRef.current) {
      console.log('JscadPreview: containerRef.current is not null')
      // Clear the container before creating a new viewer
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild)
      }
      try {
        const viewer = new myjscad.Viewer(containerRef.current, {
          name: 'jscad-preview',
          color: [0.2, 0.2, 0.2, 1],
        })
        console.log('JscadPreview: viewer created')
        viewer.add(jscad)
        console.log('JscadPreview: jscad added to viewer')
      } catch (e) {
        console.error('JscadPreview: error creating viewer', e)
      }
    }
  }, [jscad])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default JscadPreview
