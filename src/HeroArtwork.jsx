import { useEffect, useRef, useState } from 'react'
import { image } from './catalog'

const source = image('rail-studio')

export default function HeroArtwork() {
  const host = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = host.current
    if (!element || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let dispose = () => {}
    let cancelled = false

    import('three').then((THREE) => {
      if (cancelled) return
      let renderer
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
      } catch {
        return
      }
      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
      camera.position.z = 2
      const geometry = new THREE.PlaneGeometry(2, 2)
      const material = new THREE.MeshBasicMaterial({ toneMapped: false })
      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6))
      element.append(renderer.domElement)

      const target = new THREE.Vector2()
      const drift = new THREE.Vector2()
      let frame = 0
      let texture
      let visible = true
      let cropOffset = 0
      const zoom = 1.045

      function draw() {
        frame = 0
        if (!texture || !visible) return
        drift.lerp(target, 0.095)
        mesh.position.set(cropOffset + drift.x, drift.y, 0)
        mesh.rotation.z = drift.x * 0.15
        renderer.render(scene, camera)
        if (drift.distanceTo(target) > 0.0004) schedule()
      }
      function schedule() {
        if (!frame) frame = requestAnimationFrame(draw)
      }
      function resize() {
        const { clientWidth: width, clientHeight: height } = element
        if (!width || !height) return
        const ratio = width / height
        const imageRatio = 1.5
        mesh.scale.set(Math.max(1, imageRatio / ratio) * zoom, Math.max(1, ratio / imageRatio) * zoom, 1)
        cropOffset = -0.16 * Math.max(0, mesh.scale.x - zoom)
        renderer.setSize(width, height)
        schedule()
      }
      function move(event) {
        if (!visible || event.pointerType === 'touch') return
        const { left, top, width, height } = element.getBoundingClientRect()
        target.set(
          THREE.MathUtils.clamp((event.clientX - left) / width - 0.5, -0.5, 0.5) * 0.055,
          THREE.MathUtils.clamp(0.5 - (event.clientY - top) / height, -0.5, 0.5) * 0.055,
        )
        schedule()
      }
      function reset() {
        target.set(0, 0)
        schedule()
      }

      const area = element.closest('.hero')
      const observer = new ResizeObserver(resize)
      observer.observe(element)
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        if (visible) schedule()
      })
      intersection.observe(element)
      area.addEventListener('pointermove', move)
      area.addEventListener('pointerleave', reset)
      const lost = () => setReady(false)
      const restored = () => {
        if (texture) {
          schedule()
          setReady(true)
        }
      }
      renderer.domElement.addEventListener('webglcontextlost', lost)
      renderer.domElement.addEventListener('webglcontextrestored', restored)

      const loadingTexture = new THREE.TextureLoader().load(source, (loaded) => {
        if (cancelled) {
          loaded.dispose()
          return
        }
        loaded.colorSpace = THREE.SRGBColorSpace
        texture = loaded
        material.map = loaded
        material.needsUpdate = true
        resize()
        draw()
        setReady(true)
      }, undefined, () => setReady(false))

      dispose = () => {
        observer.disconnect()
        intersection.disconnect()
        area.removeEventListener('pointermove', move)
        area.removeEventListener('pointerleave', reset)
        renderer.domElement.removeEventListener('webglcontextlost', lost)
        renderer.domElement.removeEventListener('webglcontextrestored', restored)
        cancelAnimationFrame(frame)
        loadingTexture.dispose()
        material.dispose()
        geometry.dispose()
        renderer.dispose()
        renderer.domElement.remove()
      }
    }).catch(() => setReady(false))

    return () => {
      cancelled = true
      dispose()
    }
  }, [])

  return <div className="hero-art" aria-hidden="true">
    <img src={source} alt="" fetchPriority="high" />
    <div className={`hero-canvas${ready ? ' is-ready' : ''}`} ref={host} />
  </div>
}
