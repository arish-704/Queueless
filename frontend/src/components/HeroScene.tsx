import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Torus } from '@react-three/drei'
import { useRef } from 'react'
import type { Mesh } from 'three'

function FloatingSculpture() {
  const torus = useRef<Mesh>(null)
  const sphere = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (torus.current) {
      torus.current.rotation.x += delta * 0.16
      torus.current.rotation.y += delta * 0.2
    }
    if (sphere.current) {
      sphere.current.rotation.y -= delta * 0.22
    }
  })

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 4, 4]} intensity={2} color="#6dffd5" />
      <Float speed={2.4} rotationIntensity={1.4} floatIntensity={1.8}>
        <Torus ref={torus} args={[1.55, 0.22, 32, 120]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ff9b74" metalness={0.4} roughness={0.1} />
        </Torus>
      </Float>
      <Float speed={2} rotationIntensity={1.2} floatIntensity={2.1}>
        <Sphere ref={sphere} args={[0.96, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial color="#27d9ac" distort={0.28} speed={2} roughness={0.08} />
        </Sphere>
      </Float>
    </>
  )
}

export function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4.8], fov: 50 }}>
      <FloatingSculpture />
    </Canvas>
  )
}
