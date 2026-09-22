"use client"

import React, { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"

interface Pen3DCanvasProps {
  modelUrl?: string
  autoRotate?: boolean
  className?: string
  resetTrigger?: number
}

export function Pen3DCanvas({
  modelUrl = "/models/peptech_pen.glb",
  autoRotate = true,
  className = "",
  resetTrigger = 0,
}: Pen3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const penMeshRef = useRef<THREE.Group | null>(null)
  const autoRotateRef = useRef(autoRotate)

  // Keep autoRotate ref updated without rebuilding scene
  useEffect(() => {
    autoRotateRef.current = autoRotate
  }, [autoRotate])

  // Handle reset camera view and pen rotation
  useEffect(() => {
    if (controlsRef.current && cameraRef.current && containerRef.current) {
      controlsRef.current.reset()
      if (penMeshRef.current) {
        penMeshRef.current.rotation.set(0, 0, 0)
      }
      const w = containerRef.current.clientWidth || 600
      const h = containerRef.current.clientHeight || 200
      const aspect = w / h
      const fovRad = THREE.MathUtils.degToRad(cameraRef.current.fov)
      const penLength = 0.165
      const isMobile = w < 768
      
      // Studio Distance & Lens Framing:
      // Pen occupies ~94% width on mobile (bold & prominent), ~68% on wide desktop
      const targetWidthPercent = isMobile ? 0.94 : (aspect > 2.0 ? 0.68 : 0.78)
      const visibleWidth = penLength / targetWidthPercent
      const halfFovRad = fovRad / 2
      const distWidth = (visibleWidth / 2) / (aspect * Math.tan(halfFovRad))
      const distHeight = (0.020 / (isMobile ? 0.50 : 0.28)) / (2 * Math.tan(halfFovRad))
      const dist = Math.max(distWidth, distHeight, 0.08)

      cameraRef.current.position.set(0, 0.001, dist)
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.minDistance = dist * 0.65
      controlsRef.current.maxDistance = dist * 1.75
    }
  }, [resetTrigger])

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const container = containerRef.current
    const canvas = canvasRef.current

    let animationFrameId: number
    let isMounted = true

    // 1. Scene Setup
    const scene = new THREE.Scene()

    // 2. Camera Setup - Studio Portrait Lens (22° FOV) for undistorted, clinical product perspective
    const width = container.clientWidth || 600
    const height = container.clientHeight || 200
    const camera = new THREE.PerspectiveCamera(22, width / height, 0.01, 100)
    cameraRef.current = camera

    // 3. WebGL Renderer with High-Performance Settings
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08

    // Photorealistic PBR metallic environment map with balanced reflection intensity
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTexture
    if ('environmentIntensity' in scene) {
      ;(scene as any).environmentIntensity = 0.28
    }

    // 4. Soft Studio Lighting Rig (Accentuates Anodized Blue, Black Metal, and Mirror Chrome)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85)
    scene.add(ambientLight)

    // Key Light for crisp metallic specular definition
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.25)
    keyLight.position.set(1.5, 3.0, 2.5)
    scene.add(keyLight)

    // Gentle Fill Light from lower front-left
    const fillLight = new THREE.DirectionalLight(0xdce6f2, 0.55)
    fillLight.position.set(-2.0, -1.5, 1.8)
    scene.add(fillLight)

    // Soft Rim Light to accent the top edge profile
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.85)
    rimLight.position.set(0, 2.2, -2.5)
    scene.add(rimLight)

    // Direct Front Soft Light for crisp logo and black knurl definition
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.35)
    frontLight.position.set(0, 0.4, 3.0)
    scene.add(frontLight)

    // 5. OrbitControls for Interactive Mouse & Touch Dragging
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.enableZoom = true
    controls.enablePan = false
    // We handle autoRotate on the pen mesh itself along its X-axis so it stays horizontal!
    controls.autoRotate = false
    controls.minPolarAngle = Math.PI / 2.7
    controls.maxPolarAngle = Math.PI / 1.5
    controlsRef.current = controls

    let isUserInteracting = false
    controls.addEventListener("start", () => {
      isUserInteracting = true
    })
    controls.addEventListener("end", () => {
      isUserInteracting = false
    })

    // 6. Load GLTF/GLB Model
    const loader = new GLTFLoader()
    let penMesh: THREE.Group | null = null

    // Adaptive camera fitting calculation
    const updateCameraFit = () => {
      if (!container || !camera || !renderer) return
      const w = container.clientWidth || 600
      const h = container.clientHeight || 200
      const aspect = w / h
      camera.aspect = aspect
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)

      const fovRad = THREE.MathUtils.degToRad(camera.fov)
      const penLength = 0.165
      const isMobile = w < 768
      // Studio Distance & Lens Framing:
      // Pen occupies ~94% width on mobile (bold & prominent), ~68% on wide desktop
      const targetWidthPercent = isMobile ? 0.94 : (aspect > 2.0 ? 0.68 : 0.78)
      const visibleWidth = penLength / targetWidthPercent
      const halfFovRad = fovRad / 2
      const distWidth = (visibleWidth / 2) / (aspect * Math.tan(halfFovRad))
      const distHeight = (0.020 / (isMobile ? 0.50 : 0.28)) / (2 * Math.tan(halfFovRad))
      const dist = Math.max(distWidth, distHeight, 0.08)

      camera.position.set(0, 0.001, dist)
      controls.target.set(0, 0, 0)
      controls.minDistance = dist * 0.65
      controls.maxDistance = dist * 1.75
    }

    loader.load(
      modelUrl,
      (gltf) => {
        if (!isMounted) return
        penMesh = gltf.scene
        penMeshRef.current = penMesh

        // Center the geometry
        const box = new THREE.Box3().setFromObject(penMesh)
        const center = box.getCenter(new THREE.Vector3())
        penMesh.position.sub(center)

        // Perfect horizontal alignment so PEPTECH logo faces front immediately
        penMesh.rotation.z = 0
        penMesh.rotation.y = 0
        penMesh.rotation.x = 0

        scene.add(penMesh)
        if (typeof window !== "undefined") {
          ;(window as any).__penMesh = penMesh
          ;(window as any).__penScene = scene
        }
        updateCameraFit()
        setLoading(false)
      },
      undefined,
      (err) => {
        console.error("Failed to load 3D pen model:", err)
        if (isMounted) {
          setError("Failed to load 3D object")
          setLoading(false)
        }
      }
    )

    // 7. Render Loop with Smooth Axial Rotation
    const startTime = performance.now()
    let lastTime = performance.now()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const now = performance.now()
      const delta = (now - lastTime) * 0.001
      lastTime = now

      controls.update()

      // Smooth luxury axial spin along pen cylinder length
      if (penMesh && !isUserInteracting && autoRotateRef.current) {
        penMesh.rotation.x += delta * 0.35
      }

      // Subtle floating bobbing effect
      if (penMesh && !isUserInteracting) {
        const elapsed = (now - startTime) * 0.001
        penMesh.position.y = Math.sin(elapsed * 1.5) * 0.0015
      }

      renderer.render(scene, camera)
    }

    animate()

    // 8. Resize Handler
    const resizeObserver = new ResizeObserver(() => {
      updateCameraFit()
    })
    resizeObserver.observe(container)

    // Cleanup on unmount
    return () => {
      isMounted = false
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      pmremGenerator.dispose()
      envTexture.dispose()
    }
  }, [modelUrl])

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex items-center justify-center overflow-hidden ${className || "h-[130px] sm:h-[150px]"}`}
    >
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Loading Skeleton */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-[#D2DFED] text-xs font-medium text-[#0B1F3A] shadow-sm">
            <svg
              className="w-3.5 h-3.5 text-[#16A6A3] animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10" />
            </svg>
            <span>Rendering 3D Mesh...</span>
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-500">
          {error}
        </div>
      )}
    </div>
  )
}
