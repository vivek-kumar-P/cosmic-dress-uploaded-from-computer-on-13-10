"use client"

import { useState, useRef, useEffect } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { gsap } from "gsap"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RotateCcw, Camera, Trash2, PenLine, ArrowRight, ArrowLeft } from "lucide-react"

// Mock outfit items (these would typically come from context or state)
const mockOutfitItems = [
  { id: 1, name: "Cosmic T-Shirt", category: "tops", price: 35, image: "/placeholder.svg?height=50&width=50" },
  { id: 3, name: "Stardust Jeans", category: "bottoms", price: 55, image: "/placeholder.svg?height=50&width=50" },
  { id: 5, name: "Orbit Belt", category: "accessories", price: 25, image: "/placeholder.svg?height=50&width=50" },
]

export default function OutfitPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState(mockOutfitItems)
  const [isLoading, setIsLoading] = useState(true)

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0)

  // Remove item handler
  const handleRemoveItem = (id: number) => {
    // GSAP animation
    gsap.to(`#item-${id}`, {
      opacity: 0,
      x: 20,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setItems(items.filter((item) => item.id !== id))
      },
    })
  }

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

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

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxDistance = 10
    controls.minDistance = 2

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00c4b4, 1)
    pointLight.position.set(2, 3, 4)
    scene.add(pointLight)

    const pointLight2 = new THREE.PointLight(0x007bff, 0.8)
    pointLight2.position.set(-2, -3, 4)
    scene.add(pointLight2)

    // Create mannequin group
    const mannequinGroup = new THREE.Group()
    scene.add(mannequinGroup)

    // Add basic mannequin geometry
    const geometry = new THREE.CylinderGeometry(0.5, 0.3, 2, 32)
    const material = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.3,
      roughness: 0.7,
    })
    const mannequin = new THREE.Mesh(geometry, material)
    mannequinGroup.add(mannequin)

    // Add head
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32)
    const head = new THREE.Mesh(headGeometry, material)
    head.position.y = 1.3
    mannequinGroup.add(head)

    // Add arms
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 16)

    const leftArm = new THREE.Mesh(armGeometry, material)
    leftArm.position.set(-0.7, 0.3, 0)
    leftArm.rotation.z = Math.PI / 2
    mannequinGroup.add(leftArm)

    const rightArm = new THREE.Mesh(armGeometry, material)
    rightArm.position.set(0.7, 0.3, 0)
    rightArm.rotation.z = -Math.PI / 2
    mannequinGroup.add(rightArm)

    // Add legs
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 16)

    const leftLeg = new THREE.Mesh(legGeometry, material)
    leftLeg.position.set(-0.3, -1, 0)
    mannequinGroup.add(leftLeg)

    const rightLeg = new THREE.Mesh(legGeometry, material)
    rightLeg.position.set(0.3, -1, 0)
    mannequinGroup.add(rightLeg)

    // Add clothing items based on the selected items
    items.forEach((item) => {
      // Create clothing item based on category
      let clothingGeometry, clothingMaterial, clothingMesh, position, rotation, scale

      // Define material with custom color based on item
      const itemColor =
        item.category === "tops"
          ? 0x00c4b4
          : item.category === "bottoms"
            ? 0x007bff
            : item.category === "accessories"
              ? 0xffcc00
              : 0xffffff

      clothingMaterial = new THREE.MeshStandardMaterial({
        color: itemColor,
        metalness: 0.2,
        roughness: 0.8,
      })

      switch (item.category) {
        case "tops":
          // Create a top (t-shirt/jacket)
          clothingGeometry = new THREE.CylinderGeometry(0.55, 0.45, 1.2, 32)
          clothingMesh = new THREE.Mesh(clothingGeometry, clothingMaterial)
          clothingMesh.position.set(0, 0.4, 0)

          // Add sleeves
          const leftSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 16), clothingMaterial)
          leftSleeve.position.set(-0.7, 0.3, 0)
          leftSleeve.rotation.z = Math.PI / 2
          clothingMesh.add(leftSleeve)

          const rightSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 16), clothingMaterial)
          rightSleeve.position.set(0.7, 0.3, 0)
          rightSleeve.rotation.z = -Math.PI / 2
          clothingMesh.add(rightSleeve)

          // Add collar
          const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 16, 32, Math.PI), clothingMaterial)
          collar.position.set(0, 1, 0)
          collar.rotation.x = Math.PI / 2
          clothingMesh.add(collar)

          break

        case "bottoms":
          // Create bottoms (pants/shorts)
          clothingGeometry = new THREE.CylinderGeometry(0.35, 0.3, 1.5, 32)
          clothingMesh = new THREE.Mesh(clothingGeometry, clothingMaterial)
          clothingMesh.position.set(0, -1, 0)

          // Add details to pants
          const belt = new THREE.Mesh(
            new THREE.TorusGeometry(0.35, 0.05, 16, 32),
            new THREE.MeshStandardMaterial({ color: 0x333333 }),
          )
          belt.position.set(0, 0.7, 0)
          belt.rotation.x = Math.PI / 2
          clothingMesh.add(belt)

          break

        case "accessories":
          // Create an accessory (hat, belt, etc)
          if (item.name.toLowerCase().includes("hat") || item.name.toLowerCase().includes("cap")) {
            // Create a hat
            clothingGeometry = new THREE.ConeGeometry(0.35, 0.4, 32)
            clothingMesh = new THREE.Mesh(clothingGeometry, clothingMaterial)
            clothingMesh.position.set(0, 1.7, 0)
          } else if (item.name.toLowerCase().includes("belt")) {
            // Create a belt
            clothingGeometry = new THREE.TorusGeometry(0.55, 0.05, 16, 32)
            clothingMesh = new THREE.Mesh(clothingGeometry, clothingMaterial)
            clothingMesh.position.set(0, 0, 0)
            clothingMesh.rotation.x = Math.PI / 2
          } else if (item.name.toLowerCase().includes("watch")) {
            // Create a watch on the wrist
            clothingGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16)
            clothingMesh = new THREE.Mesh(clothingGeometry, clothingMaterial)
            clothingMesh.position.set(0.9, 0.3, 0)
            clothingMesh.rotation.z = -Math.PI / 2
          } else {
            // Generic accessory (necklace)
            clothingGeometry = new THREE.TorusGeometry(0.2, 0.03, 16, 32)
            clothingMesh = new THREE.Mesh(clothingGeometry, clothingMaterial)
            clothingMesh.position.set(0, 1, 0)
            clothingMesh.rotation.x = Math.PI / 2
          }
          break

        default:
          // Create a generic item
          clothingGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
          clothingMesh = new THREE.Mesh(clothingGeometry, clothingMaterial)
          clothingMesh.position.set(0, 0, 1)
      }

      // Add item name as floating text
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      canvas.width = 256
      canvas.height = 64

      if (context) {
        context.fillStyle = "#000000"
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.font = "24px Arial"
        context.fillStyle = "#ffffff"
        context.textAlign = "center"
        context.fillText(item.name, canvas.width / 2, canvas.height / 2)
      }

      const texture = new THREE.CanvasTexture(canvas)
      const labelMaterial = new THREE.SpriteMaterial({ map: texture })
      const label = new THREE.Sprite(labelMaterial)

      // Position label based on item category
      if (item.category === "tops") {
        label.position.set(0, 1, 1)
      } else if (item.category === "bottoms") {
        label.position.set(0, -1, 1)
      } else if (item.category === "accessories") {
        label.position.set(0, 1.5, 1)
      } else {
        label.position.set(0, 0, 1)
      }

      label.scale.set(1, 0.25, 1)
      clothingMesh.add(label)

      // Add to mannequin group
      mannequinGroup.add(clothingMesh)
    })

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

    // Animation function
    const animate = () => {
      requestAnimationFrame(animate)

      // Subtle animations
      mannequinGroup.rotation.y += 0.003
      particlesMesh.rotation.y += 0.0005

      controls.update()
      renderer.render(scene, camera)
    }

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Simulating loading
    setTimeout(() => {
      setIsLoading(false)

      // GSAP animations when loaded
      gsap.from(mannequinGroup.position, {
        y: -5,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
      })
    }, 1000)

    animate()

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize)
      // Dispose resources
      geometry.dispose()
      material.dispose()
      headGeometry.dispose()
      armGeometry.dispose()
      legGeometry.dispose()
      particlesGeometry.dispose()
      particlesMaterial.dispose()
      renderer.dispose()
      controls.dispose()

      // Dispose clothing geometries
      items.forEach(() => {
        if (typeof clothingGeometry !== "undefined") clothingGeometry.dispose()
        if (typeof clothingMaterial !== "undefined") clothingMaterial.dispose()
      })
    }
  }, [items])

  // Handle reset view
  const handleResetView = () => {
    const camera = new THREE.PerspectiveCamera()
    gsap.to(camera.position, {
      x: 0,
      y: 0,
      z: 5,
      duration: 1,
      ease: "power3.out",
      onUpdate: () => {
        camera.updateProjectionMatrix()
      },
    })
  }

  // Handle screenshot
  const handleScreenshot = () => {
    if (!canvasRef.current) return

    // Convert canvas to image
    const image = canvasRef.current.toDataURL("image/png")

    // Create a download link
    const link = document.createElement("a")
    link.href = image
    link.download = "cosmic-outfit-preview.png"
    link.click()

    // GSAP animation for the screenshot button
    gsap.fromTo(".screenshot-button", { scale: 0.8 }, { scale: 1, duration: 0.3, ease: "back.out" })
  }

  useEffect(() => {
    // GSAP animations for item list when component mounts
    gsap.from(".item-list-container", {
      opacity: 0,
      x: 50,
      duration: 0.5,
      ease: "power3.out",
    })

    gsap.from(".item-entry", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.5,
      ease: "power3.out",
      delay: 0.2,
    })
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* 3D Preview */}
      <Card className="lg:col-span-3 bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg overflow-hidden h-[500px] md:h-[600px]">
        <CardContent className="p-0 h-full">
          <div ref={containerRef} className="relative w-full h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A1A] z-10">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[#00C4B4] border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                  <p className="text-[#00C4B4]">Loading Preview...</p>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="w-full h-full" />

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#1A1A1A]/90 backdrop-blur-md p-2 rounded-lg">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border-zinc-700 hover:bg-[#00C4B4]/20 hover:border-[#00C4B4]"
                  onClick={handleResetView}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="screenshot-button h-10 w-10 rounded-full border-zinc-700 hover:bg-[#00C4B4]/20 hover:border-[#00C4B4]"
                  onClick={handleScreenshot}
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Item List */}
      <Card className="lg:col-span-2 bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg item-list-container">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Your Selected Items</h2>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-400">No items selected</p>
                <Button asChild variant="outline" className="mt-4 border-zinc-700">
                  <Link href="/outfit-picker">Return to Outfit Picker</Link>
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  id={`item-${item.id}`}
                  className="item-entry flex items-center justify-between p-3 bg-[#0A0A1A] rounded-lg border border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-[#00C4B4]">${item.price}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      asChild
                    >
                      <Link href="/3d-playground">
                        <PenLine className="h-4 w-4" />
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-zinc-800"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <>
              <Separator className="my-4 bg-zinc-800" />

              <div className="flex justify-between items-center text-lg font-bold mb-6">
                <span>Total</span>
                <span className="text-[#00C4B4]">${totalPrice}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="outline" className="border-zinc-700 flex-1">
                  <Link href="/3d-playground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Edit Outfit
                  </Link>
                </Button>

                <Button
                  asChild
                  className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4] hover:opacity-90 border-0 flex-1"
                >
                  <Link href="/checkout">
                    Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
