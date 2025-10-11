"use client"

import { useState, useRef, useEffect } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { gsap } from "gsap"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RotateCcw, ZoomIn, ZoomOut, Camera, ChevronRight, ChevronLeft, ArrowRight, Save } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

// Mock outfit items (these would typically come from context or state from the outfit picker)
const mockOutfitItems = [
  { id: 1, name: "Cosmic T-Shirt", category: "tops", price: 35, modelUrl: "/models/cosmic-tshirt.glb" },
  { id: 3, name: "Stardust Jeans", category: "bottoms", price: 55, modelUrl: "/models/stardust-jeans.glb" },
  { id: 5, name: "Orbit Belt", category: "accessories", price: 25, modelUrl: "/models/orbit-belt.glb" },
]

interface AvatarPlaygroundProps {
  initialAvatarData?: {
    gender?: "male" | "female" | "other"
    height?: number
    build?: "slim" | "average" | "athletic"
    skinTone?: string
  }
  selectedItems?: Array<{
    id: number
    name: string
    category: string
    price: number
    modelUrl: string
  }>
}

export default function AvatarPlayground({
  initialAvatarData,
  selectedItems = mockOutfitItems,
}: AvatarPlaygroundProps) {
  const { user } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [fpsCount, setFpsCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Avatar customization state
  const [gender, setGender] = useState<"male" | "female" | "other">(initialAvatarData?.gender || "other")
  const [avatarHeight, setAvatarHeight] = useState<number>(initialAvatarData?.height || 175) // in cm
  const [build, setBuild] = useState<"slim" | "average" | "athletic">(initialAvatarData?.build || "average")
  const [skinTone, setSkinTone] = useState<string>(initialAvatarData?.skinTone || "#E8C49D")
  const [avatarName, setAvatarName] = useState<string>("My Cosmic Avatar")

  // Outfit state
  const [appliedItems, setAppliedItems] = useState<{ [key: string]: boolean }>({})

  // Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const avatarRef = useRef<THREE.Group | null>(null)
  const outfitItemsRef = useRef<{ [key: string]: THREE.Group }>({})

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#0A0A1A")
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5
    camera.position.y = 1
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxDistance = 10
    controls.minDistance = 2
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 1, 1)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x00c4b4, 1)
    pointLight.position.set(2, 3, 4)
    scene.add(pointLight)

    const pointLight2 = new THREE.PointLight(0x007bff, 0.8)
    pointLight2.position.set(-2, -3, 4)
    scene.add(pointLight2)

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

    // Load avatar model based on gender
    loadAvatarModel()

    // Animation function
    let frame = 0
    const clock = new THREE.Clock()
    let fps = 0
    let frameCount = 0
    let lastTime = clock.getElapsedTime()

    const animate = () => {
      requestAnimationFrame(animate)

      // Particles animation
      if (particlesMesh) {
        particlesMesh.rotation.y += 0.0005
      }

      // Calculate FPS
      frameCount++
      const currentTime = clock.getElapsedTime()
      const delta = currentTime - lastTime

      if (delta >= 1) {
        fps = Math.round(frameCount / delta)
        setFpsCount(fps)
        frameCount = 0
        lastTime = currentTime
      }

      frame++
      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return

      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize)

      // Dispose resources
      renderer.dispose()
      controls.dispose()
      groundGeometry.dispose()
      groundMaterial.dispose()
      particlesGeometry.dispose()
      particlesMaterial.dispose()
    }
  }, []) // Empty dependency array to run only once

  // Load avatar model based on gender
  const loadAvatarModel = () => {
    if (!sceneRef.current) return

    // Remove existing avatar
    if (avatarRef.current) {
      sceneRef.current.remove(avatarRef.current)
    }

    // Clear outfit items
    Object.values(outfitItemsRef.current).forEach((item) => {
      if (sceneRef.current) sceneRef.current.remove(item)
    })
    outfitItemsRef.current = {}

    setIsLoading(true)

    // Load the appropriate model based on gender
    const modelPath =
      gender === "female"
        ? "/models/female-avatar.glb"
        : gender === "male"
          ? "/models/male-avatar.glb"
          : "/models/neutral-avatar.glb"

    const loader = new GLTFLoader()

    loader.load(
      modelPath,
      (gltf) => {
        if (!sceneRef.current) return

        const model = gltf.scene
        avatarRef.current = model

        // Apply skin tone to body parts
        model.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
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

            // Enable shadows
            if (child instanceof THREE.Mesh) {
              child.castShadow = true
              child.receiveShadow = true
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
        const scale = avatarHeight / baseHeight
        model.scale.set(scale, scale, scale)

        // Apply build adjustments
        if (build === "slim") {
          model.scale.x *= 0.9
        } else if (build === "athletic") {
          model.scale.x *= 1.1
        }

        sceneRef.current.add(model)

        // Animation when model is loaded
        gsap.from(model.position, {
          y: model.position.y - 2,
          duration: 1,
          ease: "elastic.out(1, 0.5)",
        })

        // Load outfit items
        loadOutfitItems()

        setIsLoading(false)
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error)
        setIsLoading(false)
      },
    )
  }

  // Load outfit items
  const loadOutfitItems = () => {
    if (!sceneRef.current || !avatarRef.current) return

    // Load each selected item that is applied
    selectedItems.forEach((item) => {
      if (appliedItems[item.id.toString()]) {
        loadOutfitItem(item)
      }
    })
  }

  // Load a single outfit item
  const loadOutfitItem = (item: { id: number; name: string; category: string; modelUrl: string }) => {
    if (!sceneRef.current || !avatarRef.current) return

    const loader = new GLTFLoader()

    loader.load(
      item.modelUrl,
      (gltf) => {
        if (!sceneRef.current || !avatarRef.current) return

        const model = gltf.scene
        outfitItemsRef.current[item.id.toString()] = model

        // Position the item on the avatar based on category
        if (item.category === "tops") {
          model.position.y = 0.5
        } else if (item.category === "bottoms") {
          model.position.y = -0.5
        } else if (item.category === "accessories") {
          model.position.y = 0.8
        }

        // Apply the same scale as the avatar
        model.scale.copy(avatarRef.current.scale)

        // Enable shadows
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        // Add to scene
        sceneRef.current.add(model)

        // Animation
        gsap.from(model.scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.5,
          ease: "back.out",
        })
      },
      undefined,
      (error) => {
        console.error(`Error loading outfit item ${item.name}:`, error)
      },
    )
  }

  // Update avatar when properties change
  useEffect(() => {
    if (!avatarRef.current) return

    // Update height
    const baseHeight = 175 // Base height in cm
    const scaleY = avatarHeight / baseHeight

    // Update build (affects width)
    let scaleX = scaleY
    if (build === "slim") {
      scaleX = scaleY * 0.9
    } else if (build === "athletic") {
      scaleX = scaleY * 1.1
    }

    // Apply scaling
    avatarRef.current.scale.set(scaleX, scaleY, scaleY)

    // Update outfit items with the same scale
    Object.values(outfitItemsRef.current).forEach((item) => {
      item.scale.set(scaleX, scaleY, scaleY)
    })

    // Update skin tone
    avatarRef.current.traverse((child) => {
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
  }, [avatarHeight, build, skinTone])

  // Reload avatar when gender changes
  useEffect(() => {
    if (sceneRef.current) {
      loadAvatarModel()
    }
  }, [gender])

  // Handle applying/removing outfit items
  const toggleOutfitItem = (itemId: number) => {
    const newAppliedItems = {
      ...appliedItems,
      [itemId.toString()]: !appliedItems[itemId.toString()],
    }

    setAppliedItems(newAppliedItems)

    const item = selectedItems.find((item) => item.id === itemId)
    if (!item) return

    if (newAppliedItems[itemId.toString()]) {
      // Apply item
      loadOutfitItem(item)
    } else {
      // Remove item
      if (outfitItemsRef.current[itemId.toString()] && sceneRef.current) {
        sceneRef.current.remove(outfitItemsRef.current[itemId.toString()])
        delete outfitItemsRef.current[itemId.toString()]
      }
    }
  }

  // Handle zooming
  const handleZoomIn = () => {
    if (!cameraRef.current) return

    gsap.to(cameraRef.current.position, {
      z: cameraRef.current.position.z - 1,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        cameraRef.current?.updateProjectionMatrix()
      },
    })
  }

  const handleZoomOut = () => {
    if (!cameraRef.current) return

    gsap.to(cameraRef.current.position, {
      z: cameraRef.current.position.z + 1,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        cameraRef.current?.updateProjectionMatrix()
      },
    })
  }

  // Handle reset view
  const handleResetView = () => {
    if (!cameraRef.current) return

    gsap.to(cameraRef.current.position, {
      x: 0,
      y: 1,
      z: 5,
      duration: 1,
      ease: "power3.out",
      onUpdate: () => {
        cameraRef.current?.updateProjectionMatrix()
      },
    })
  }

  // Handle screenshot
  const handleScreenshot = () => {
    if (!rendererRef.current) return

    // Convert canvas to image
    const image = rendererRef.current.domElement.toDataURL("image/png")

    // Create a download link
    const link = document.createElement("a")
    link.href = image
    link.download = "3d-avatar-screenshot.png"
    link.click()

    // GSAP animation for the screenshot button
    gsap.fromTo(".screenshot-button", { scale: 0.8 }, { scale: 1, duration: 0.3, ease: "back.out" })
  }

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)

    // GSAP animation
    gsap.to(".sidebar", {
      width: sidebarOpen ? "60px" : "300px",
      duration: 0.3,
      ease: "power2.out",
    })

    gsap.to(".sidebar-content", {
      opacity: sidebarOpen ? 0 : 1,
      duration: 0.2,
      display: sidebarOpen ? "none" : "block",
      delay: sidebarOpen ? 0 : 0.1,
    })
  }

  // Save avatar to database
  const saveAvatar = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your avatar",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Prepare avatar data
      const avatarData = {
        user_id: user.id,
        name: avatarName,
        gender,
        height: avatarHeight,
        build,
        skin_tone: skinTone,
        model_data: {
          appliedItems: Object.entries(appliedItems)
            .filter(([_, isApplied]) => isApplied)
            .map(([itemId]) => Number.parseInt(itemId)),
        },
        body_measurements: {
          chest: avatarHeight * 0.5, // Example calculation
          waist: avatarHeight * 0.4, // Example calculation
          hips: avatarHeight * 0.5, // Example calculation
        },
      }

      // Save avatar to database
      const { data: avatarResult, error: avatarError } = await supabase.from("avatars").insert(avatarData).select()

      if (avatarError) throw avatarError

      // Get the applied items
      const appliedProductIds = Object.entries(appliedItems)
        .filter(([_, isApplied]) => isApplied)
        .map(([itemId]) => {
          const item = selectedItems.find((item) => item.id.toString() === itemId)
          return item ? { product_id: item.id.toString() } : null
        })
        .filter(Boolean)

      // Save as an outfit if there are applied items
      if (appliedProductIds.length > 0 && avatarResult && avatarResult[0]) {
        const outfitData = {
          user_id: user.id,
          name: `${avatarName}'s Outfit`,
          avatar_id: avatarResult[0].id,
          is_favorite: true,
          items: appliedProductIds,
        }

        const { data: outfitResult, error: outfitError } = await supabase
          .from("saved_outfits")
          .insert({
            user_id: user.id,
            name: `${avatarName}'s Outfit`,
            avatar_id: avatarResult[0].id,
            is_favorite: true,
          })
          .select()

        if (outfitError) throw outfitError

        // Add outfit items
        if (outfitResult && outfitResult[0]) {
          const outfitItems = appliedProductIds.map((item) => ({
            outfit_id: outfitResult[0].id,
            product_id: item.product_id,
          }))

          const { error: itemsError } = await supabase.from("outfit_items").insert(outfitItems)

          if (itemsError) throw itemsError
        }
      }

      toast({
        title: "Avatar saved",
        description: "Your avatar and outfit have been saved successfully",
      })

      // Success animation
      gsap.fromTo(
        ".save-button",
        { scale: 1 },
        {
          scale: 1.2,
          duration: 0.3,
          ease: "back.out",
          onComplete: () => {
            gsap.to(".save-button", {
              scale: 1,
              duration: 0.2,
            })
          },
        },
      )
    } catch (error) {
      console.error("Error saving avatar:", error)
      toast({
        title: "Error saving avatar",
        description: "There was a problem saving your avatar",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative h-screen overflow-hidden flex">
      {/* 3D Canvas */}
      <div ref={containerRef} className={`relative flex-1 transition-all ${sidebarOpen ? "mr-[300px]" : "mr-[60px]"}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A1A] z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#00C4B4] border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
              <p className="text-[#00C4B4]">Loading 3D Environment...</p>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="w-full h-full" />

        {/* Controls Overlay */}
        <div className="absolute top-4 left-4 bg-[#1A1A1A]/80 backdrop-blur-md p-2 rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-zinc-400">FPS:</span>
            <span className={`font-mono ${fpsCount < 30 ? "text-red-400" : "text-[#00C4B4]"}`}>{fpsCount}</span>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#1A1A1A]/80 backdrop-blur-md p-2 rounded-lg">
          <div className="flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-zinc-700 hover:bg-[#00C4B4]/20 hover:border-[#00C4B4]"
                    onClick={handleResetView}
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1A1A1A] border-zinc-700">
                  <p>Reset View</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-zinc-700 hover:bg-[#00C4B4]/20 hover:border-[#00C4B4]"
                    onClick={handleZoomIn}
                  >
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1A1A1A] border-zinc-700">
                  <p>Zoom In</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-zinc-700 hover:bg-[#00C4B4]/20 hover:border-[#00C4B4]"
                    onClick={handleZoomOut}
                  >
                    <ZoomOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1A1A1A] border-zinc-700">
                  <p>Zoom Out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="screenshot-button h-10 w-10 rounded-full border-zinc-700 hover:bg-[#00C4B4]/20 hover:border-[#00C4B4]"
                    onClick={handleScreenshot}
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1A1A1A] border-zinc-700">
                  <p>Take Screenshot</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 flex">
          <Button asChild className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4] hover:opacity-90 border-0">
            <Link href="/preview">
              Preview Outfit <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar fixed right-0 top-0 bottom-0 w-[300px] bg-[#1A1A1A] border-l border-zinc-800 z-20 overflow-hidden transition-all">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-xl font-bold sidebar-content">Avatar Customization</h2>
            <Button variant="ghost" size="icon" onClick={handleToggleSidebar} className="h-8 w-8 hover:bg-zinc-800">
              {sidebarOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          <div className="sidebar-content flex-1 overflow-y-auto p-4">
            <Accordion type="single" collapsible defaultValue="avatar">
              <AccordionItem value="avatar" className="border-zinc-800">
                <AccordionTrigger className="hover:bg-zinc-800 rounded px-2">Avatar Settings</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Gender</label>
                      <div className="flex gap-2">
                        {[
                          { value: "male", label: "Male" },
                          { value: "female", label: "Female" },
                          { value: "other", label: "Other" },
                        ].map((option) => (
                          <Button
                            key={option.value}
                            variant="outline"
                            className={`flex-1 border-zinc-700 ${gender === option.value ? "bg-[#00C4B4]/20 border-[#00C4B4]" : ""}`}
                            size="sm"
                            onClick={() => setGender(option.value as "male" | "female" | "other")}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Skin Tone</label>
                      <div className="flex gap-2">
                        {["#F5E6D3", "#E8C49D", "#D4A06A", "#A67750", "#6F4A2F", "#3C2F2F"].map((color, index) => (
                          <button
                            key={index}
                            className={`w-8 h-8 rounded-full border-2 ${skinTone === color ? "border-white" : "border-transparent"} hover:border-white focus:border-[#00C4B4] transition-all`}
                            style={{ backgroundColor: color }}
                            aria-label={`Skin tone ${index + 1}`}
                            onClick={() => setSkinTone(color)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">
                        Height: {Math.floor(avatarHeight / 30.48)}'{Math.round((avatarHeight % 30.48) / 2.54)}"
                      </label>
                      <Slider
                        value={[avatarHeight]}
                        min={150}
                        max={200}
                        step={1}
                        className="w-full"
                        onValueChange={(value) => setAvatarHeight(value[0])}
                      />
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>4'11"</span>
                        <span>5'7"</span>
                        <span>6'7"</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Build</label>
                      <div className="flex gap-2">
                        {[
                          { value: "slim", label: "Slim" },
                          { value: "average", label: "Average" },
                          { value: "athletic", label: "Athletic" },
                        ].map((option) => (
                          <Button
                            key={option.value}
                            variant="outline"
                            className={`flex-1 border-zinc-700 ${build === option.value ? "bg-[#00C4B4]/20 border-[#00C4B4]" : ""}`}
                            size="sm"
                            onClick={() => setBuild(option.value as "slim" | "average" | "athletic")}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tops" className="border-zinc-800">
                <AccordionTrigger className="hover:bg-zinc-800 rounded px-2">Tops</AccordionTrigger>
                <AccordionContent>
                  {selectedItems
                    .filter((item) => item.category === "tops")
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 hover:bg-zinc-800 rounded mb-1"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-zinc-400">${item.price}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-8 ${
                            appliedItems[item.id.toString()]
                              ? "border-[#00C4B4] bg-[#00C4B4]/20"
                              : "border-zinc-700 hover:bg-zinc-700"
                          }`}
                          onClick={() => toggleOutfitItem(item.id)}
                        >
                          {appliedItems[item.id.toString()] ? "Remove" : "Apply"}
                        </Button>
                      </div>
                    ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="bottoms" className="border-zinc-800">
                <AccordionTrigger className="hover:bg-zinc-800 rounded px-2">Bottoms</AccordionTrigger>
                <AccordionContent>
                  {selectedItems
                    .filter((item) => item.category === "bottoms")
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 hover:bg-zinc-800 rounded mb-1"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-zinc-400">${item.price}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-8 ${
                            appliedItems[item.id.toString()]
                              ? "border-[#00C4B4] bg-[#00C4B4]/20"
                              : "border-zinc-700 hover:bg-zinc-700"
                          }`}
                          onClick={() => toggleOutfitItem(item.id)}
                        >
                          {appliedItems[item.id.toString()] ? "Remove" : "Apply"}
                        </Button>
                      </div>
                    ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="accessories" className="border-zinc-800">
                <AccordionTrigger className="hover:bg-zinc-800 rounded px-2">Accessories</AccordionTrigger>
                <AccordionContent>
                  {selectedItems
                    .filter((item) => item.category === "accessories")
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 hover:bg-zinc-800 rounded mb-1"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-zinc-400">${item.price}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-8 ${
                            appliedItems[item.id.toString()]
                              ? "border-[#00C4B4] bg-[#00C4B4]/20"
                              : "border-zinc-700 hover:bg-zinc-700"
                          }`}
                          onClick={() => toggleOutfitItem(item.id)}
                        >
                          {appliedItems[item.id.toString()] ? "Remove" : "Apply"}
                        </Button>
                      </div>
                    ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button
              className="save-button w-full mt-6 bg-[#00C4B4] hover:bg-[#00C4B4]/90 text-black"
              onClick={saveAvatar}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Avatar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
