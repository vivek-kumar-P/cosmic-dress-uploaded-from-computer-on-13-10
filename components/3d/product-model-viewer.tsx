"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { gsap } from "gsap"
import { Loader } from "lucide-react"

interface ProductModelViewerProps {
  modelUrl: string
  height?: string
  width?: string
  autoRotate?: boolean
  backgroundColor?: string
  interactive?: boolean
  className?: string
  rotationSpeed?: number
  modelColor?: string
}

export default function ProductModelViewer({
  modelUrl,
  height = "300px",
  width = "100%",
  autoRotate = true,
  backgroundColor = "#0A0A1A",
  interactive = true,
  className = "",
  rotationSpeed = 0.005,
  modelColor,
}: ProductModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rotationSpeedRef = useRef(rotationSpeed)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Update rotation speed ref when prop changes
  useEffect(() => {
    rotationSpeedRef.current = rotationSpeed
  }, [rotationSpeed])

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(backgroundColor)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // Updated for newer three.js versions
    // @ts-ignore - present at runtime on modern three builds
    renderer.outputColorSpace = (THREE as any).SRGBColorSpace ?? (THREE as any).sRGBEncoding
    containerRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x00c4b4, 1)
    pointLight.position.set(2, 3, 4)
    scene.add(pointLight)

    // Controls
    const controls = interactive ? new OrbitControls(camera, renderer.domElement) : null
    if (controls) {
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.maxDistance = 10
      controls.minDistance = 2
    }

    // Load 3D model
    const loader = new GLTFLoader()
    let model: THREE.Group

    // Use a default model if modelUrl is not provided
    const modelToLoad = modelUrl || "/models/placeholder-cube.glb"

    loader.load(
      modelToLoad,
      (gltf) => {
        model = gltf.scene

        // Apply custom color if provided
        if (modelColor) {
          model.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              // Create a new material with the custom color
              if (Array.isArray(child.material)) {
                child.material.forEach((mat, index) => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    child.material[index] = mat.clone()
                    child.material[index].color.set(modelColor)
                  }
                })
              } else if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material = child.material.clone()
                child.material.color.set(modelColor)
              }
            }
          })
        }

        // Center the model
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)

        // Scale the model to fit the view
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2 / maxDim
        model.scale.set(scale, scale, scale)

        scene.add(model)

        // Animation when model is loaded
        gsap.from(model.position, {
          y: -2,
          duration: 1,
          ease: "elastic.out(1, 0.5)",
        })

        setIsLoading(false)
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error)
        setError("Failed to load 3D model")
        setIsLoading(false)

        // Make any fallback content visible
        const fallbackElements = containerRef.current?.querySelectorAll(".fallback-content")
        if (fallbackElements) {
          fallbackElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.opacity = "1"
              el.style.zIndex = "10"
            }
          })
        }
      },
    )

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      if (model && autoRotate) {
        // Use the current rotation speed from the ref
        model.rotation.y += rotationSpeedRef.current
      }

      if (controls) controls.update()

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }

      window.removeEventListener("resize", handleResize)

      // Dispose resources
      renderer.dispose()
      if (controls) controls.dispose()
    }
  }, [modelUrl, autoRotate, backgroundColor, interactive, modelColor])

  return (
    <div ref={containerRef} style={{ height, width, position: "relative" }} className={className}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A1A]/80 z-10">
          <Loader className="h-8 w-8 animate-spin text-[#00C4B4]" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A1A]/80 z-10">
          <div className="text-red-400 text-center p-4">
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
