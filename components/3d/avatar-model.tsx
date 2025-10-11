"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { gsap } from "gsap"
import { Loader } from "lucide-react"

interface AvatarModelProps {
  gender?: "male" | "female" | "other"
  height?: number // in cm
  build?: "slim" | "average" | "athletic"
  skinTone?: string
  className?: string
  containerHeight?: string
  onModelLoaded?: () => void
}

export default function AvatarModel({
  gender = "other",
  height = 175, // Default height in cm
  build = "average",
  skinTone = "#E8C49D",
  className = "",
  containerHeight = "500px",
  onModelLoaded,
}: AvatarModelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Store references to the model and its parts for manipulation
  const modelRef = useRef<THREE.Group | null>(null)
  const materialsRef = useRef<{ [key: string]: THREE.Material }>({})

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#0A0A1A")

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5
    camera.position.y = 1

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputEncoding = THREE.sRGBEncoding
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
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxDistance = 10
    controls.minDistance = 2

    // Add a ground plane
    const groundGeometry = new THREE.PlaneGeometry(10, 10)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x111122,
      roughness: 0.8,
      metalness: 0.2,
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -2
    ground.receiveShadow = true
    scene.add(ground)

    // Add starry background particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 200
    const posArray = new Float32Array(particlesCount * 3)
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20
    }
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3))
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xffffff,
    })
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    // Load the appropriate model based on gender
    const modelPath =
      gender === "female"
        ? "/models/female-avatar.glb"
        : gender === "male"
          ? "/models/male-avatar.glb"
          : "/models/neutral-avatar.glb"

    // For demo purposes, we'll use a placeholder model
    // In a real app, you'd have actual gender-specific models
    const loader = new GLTFLoader()

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene
        modelRef.current = model

        // Store materials for later manipulation
        model.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            // Store original materials by mesh name for later reference
            if (Array.isArray(child.material)) {
              child.material.forEach((mat, index) => {
                materialsRef.current[`${child.name}_${index}`] = mat
              })
            } else {
              materialsRef.current[child.name] = child.material
            }

            // Apply skin tone to body parts
            if (child.name.includes("body") || child.name.includes("skin") || child.name.includes("head")) {
              if (Array.isArray(child.material)) {
                child.material = child.material.map((mat) => {
                  const newMat = mat.clone()
                  newMat.color.set(skinTone)
                  return newMat
                })
              } else {
                const newMaterial = child.material.clone()
                newMaterial.color.set(skinTone)
                child.material = newMaterial
              }
            }
          }
        })

        // Center the model
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.x = -center.x
        model.position.z = -center.z

        // Position the model's feet on the ground
        model.position.y = -box.min.y - 2

        // Apply height scaling
        const baseHeight = 175 // Base height in cm
        const scale = height / baseHeight
        model.scale.set(scale, scale, scale)

        // Apply build adjustments
        if (build === "slim") {
          model.scale.x *= 0.9
        } else if (build === "athletic") {
          model.scale.x *= 1.1
        }

        scene.add(model)

        // Animation when model is loaded
        gsap.from(model.position, {
          y: model.position.y - 2,
          duration: 1,
          ease: "elastic.out(1, 0.5)",
        })

        setIsLoading(false)
        if (onModelLoaded) onModelLoaded()
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error)
        setError("Failed to load avatar model")
        setIsLoading(false)
      },
    )

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      if (particlesMesh) {
        particlesMesh.rotation.y += 0.0005
      }

      controls.update()
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
      controls.dispose()
      particlesGeometry.dispose()
      particlesMaterial.dispose()
      groundGeometry.dispose()
      groundMaterial.dispose()
    }
  }, [gender, onModelLoaded]) // Only recreate scene when gender changes

  // Update model when properties change
  useEffect(() => {
    if (!modelRef.current) return

    // Update height
    const baseHeight = 175 // Base height in cm
    const scaleY = height / baseHeight

    // Update build (affects width)
    let scaleX = scaleY
    if (build === "slim") {
      scaleX = scaleY * 0.9
    } else if (build === "athletic") {
      scaleX = scaleY * 1.1
    }

    // Apply scaling
    modelRef.current.scale.set(scaleX, scaleY, scaleY)

    // Update skin tone
    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (child.name.includes("body") || child.name.includes("skin") || child.name.includes("head")) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.color.set(skinTone)
            })
          } else {
            child.material.color.set(skinTone)
          }
        }
      }
    })
  }, [height, build, skinTone])

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, width: "100%", position: "relative" }}
      className={className}
    >
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
