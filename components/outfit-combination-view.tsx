"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { gsap } from "gsap"

interface OutfitItem {
  id: number
  name: string
  category: string
  price: number
  modelUrl: string
  color: string
  description?: string
}

interface OutfitCombinationViewProps {
  items: OutfitItem[]
}

export default function OutfitCombinationView({ items }: OutfitCombinationViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

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
    camera.position.z = 10

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // Use SRGBColorSpace for modern Three.js versions
    renderer.outputColorSpace = THREE.SRGBColorSpace
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
    controls.maxDistance = 20
    controls.minDistance = 5

    // Create mannequin
    const mannequinGroup = new THREE.Group()
    scene.add(mannequinGroup)

    // Create basic mannequin body
    const bodyGeometry = new THREE.CylinderGeometry(0.7, 0.5, 3, 32)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.1,
      roughness: 0.8,
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    mannequinGroup.add(body)

    // Create head
    const headGeometry = new THREE.SphereGeometry(0.5, 32, 32)
    const head = new THREE.Mesh(headGeometry, bodyMaterial)
    head.position.y = 2
    mannequinGroup.add(head)

    // Create arms
    const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 16)

    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial)
    leftArm.position.set(-1, 0.5, 0)
    leftArm.rotation.z = Math.PI / 3
    mannequinGroup.add(leftArm)

    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial)
    rightArm.position.set(1, 0.5, 0)
    rightArm.rotation.z = -Math.PI / 3
    mannequinGroup.add(rightArm)

    // Create legs
    const legGeometry = new THREE.CylinderGeometry(0.25, 0.25, 2, 16)

    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial)
    leftLeg.position.set(-0.4, -2, 0)
    mannequinGroup.add(leftLeg)

    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial)
    rightLeg.position.set(0.4, -2, 0)
    mannequinGroup.add(rightLeg)

    // Load item models
    const loader = new GLTFLoader()
    const loadedModels: THREE.Group[] = []

    // Position offsets based on category
    const categoryPositions = {
      tops: new THREE.Vector3(0, 0.5, 0),
      bottoms: new THREE.Vector3(0, -1, 0),
      shoes: new THREE.Vector3(0, -3, 0),
      accessories: new THREE.Vector3(0, 1.5, 0),
    }

    // Scale factors based on category
    const categoryScales = {
      tops: 0.8,
      bottoms: 0.7,
      shoes: 0.5,
      accessories: 0.4,
    }

    // Load each item model
    items.forEach((item, index) => {
      loader.load(
        item.modelUrl,
        (gltf) => {
          const model = gltf.scene

          // Apply custom color
          model.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat, i) => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    child.material[i] = mat.clone()
                    child.material[i].color.set(item.color)
                  }
                })
              } else if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material = child.material.clone()
                child.material.color.set(item.color)
              }
            }
          })

          // Position based on category
          const position =
            categoryPositions[item.category as keyof typeof categoryPositions] || new THREE.Vector3(0, 0, 0)
          const scaleFactor = categoryScales[item.category as keyof typeof categoryScales] || 0.5

          // Add some randomization to prevent exact overlaps
          const offsetX = index % 2 === 0 ? 0.2 : -0.2
          const offsetZ = index % 3 === 0 ? 0.2 : -0.2

          model.position.set(position.x + offsetX, position.y, position.z + offsetZ)

          // Scale the model
          model.scale.set(scaleFactor, scaleFactor, scaleFactor)

          // Add to scene
          mannequinGroup.add(model)
          loadedModels.push(model)

          // Animate model entry
          gsap.from(model.position, {
            y: model.position.y - 2,
            opacity: 0,
            duration: 1,
            ease: "elastic.out(1, 0.5)",
            delay: index * 0.2,
          })
        },
        undefined,
        (error) => {
          console.error("Error loading model:", error)
        },
      )
    })

    // Add some ambient particles
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

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Rotate mannequin slowly
      mannequinGroup.rotation.y += 0.002

      // Rotate particles
      particlesMesh.rotation.y += 0.0005

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
      bodyGeometry.dispose()
      bodyMaterial.dispose()
      headGeometry.dispose()
      armGeometry.dispose()
      legGeometry.dispose()
      particlesGeometry.dispose()
      particlesMaterial.dispose()
    }
  }, [items])

  return (
    <div className="mt-4">
      <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden"></div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {items.map((item) => (
          <div key={item.id} className="bg-[#0A0A1A] p-2 rounded-lg border border-zinc-800 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-zinc-400 truncate">{item.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
