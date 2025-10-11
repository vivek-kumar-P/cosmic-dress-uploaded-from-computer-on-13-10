"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { saveOutfit } from "@/app/actions/outfit-actions"
import {
  RotateCcw,
  Save,
  Share2,
  Download,
  User,
  Shirt,
  Zap,
  Eye,
  Heart,
  Settings,
  Smartphone,
  Monitor,
  ZoomIn,
  ZoomOut,
  Camera,
  Play,
  Pause,
} from "lucide-react"
import * as THREE from "three"

interface AvatarCustomization {
  height: number
  build: "slim" | "average" | "athletic"
  skinTone: string
  hairColor: string
  eyeColor: string
}

interface ClothingItem {
  id: string
  type: "shirt" | "pants" | "shoes" | "accessories"
  color: string
  material: string
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
}

export default function ThreeDPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const avatarRef = useRef<THREE.Group>()
  const animationIdRef = useRef<number>()
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())

  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("avatar")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [outfitName, setOutfitName] = useState("")
  const [outfitDescription, setOutfitDescription] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [fps, setFps] = useState(60)
  const [isAnimating, setIsAnimating] = useState(true)
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 1.6, z: 3 })
  const [lightIntensity, setLightIntensity] = useState(1)

  // Avatar customization state
  const [avatarCustomization, setAvatarCustomization] = useState<AvatarCustomization>({
    height: 1.75,
    build: "average",
    skinTone: "#FDBCB4",
    hairColor: "#8B4513",
    eyeColor: "#4A90E2",
  })

  // Clothing items state
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])

  // Touch/mouse interaction state
  const [isDragging, setIsDragging] = useState(false)
  const [lastPointer, setLastPointer] = useState({ x: 0, y: 0 })
  const [cameraControls, setCameraControls] = useState({
    rotation: { x: 0, y: 0 },
    zoom: 1,
    position: { x: 0, y: 1.6, z: 3 },
  })

  // Initialize Three.js scene
  const initScene = useCallback(() => {
    if (!canvasRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a1a)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    })
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    rendererRef.current = renderer

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, lightIntensity)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const fillLight = new THREE.DirectionalLight(0x00c4b4, 0.3)
    fillLight.position.set(-5, 5, -5)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0x007bff, 0.2)
    rimLight.position.set(0, 5, -10)
    scene.add(rimLight)

    // Create avatar
    createAvatar()

    // Add particle background
    createParticleBackground()

    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20)
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0x1a1a3a,
      transparent: true,
      opacity: 0.3,
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    setIsLoading(false)
  }, [cameraPosition, lightIntensity])

  // Create realistic human avatar
  const createAvatar = useCallback(() => {
    if (!sceneRef.current) return

    const avatar = new THREE.Group()
    avatarRef.current = avatar

    // Scale based on height
    const scale = avatarCustomization.height / 1.75
    avatar.scale.setScalar(scale)

    // Body proportions based on build
    const buildMultipliers = {
      slim: { width: 0.8, depth: 0.8 },
      average: { width: 1.0, depth: 1.0 },
      athletic: { width: 1.2, depth: 1.1 },
    }
    const buildMult = buildMultipliers[avatarCustomization.build]

    // Skin material
    const skinMaterial = new THREE.MeshLambertMaterial({
      color: avatarCustomization.skinTone,
      transparent: true,
      opacity: 0.95,
    })

    // Head
    const headGeometry = new THREE.SphereGeometry(0.12, 32, 32)
    const head = new THREE.Mesh(headGeometry, skinMaterial)
    head.position.y = 1.65
    head.castShadow = true
    avatar.add(head)

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.015, 16, 16)
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: avatarCustomization.eyeColor })

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    leftEye.position.set(-0.04, 1.67, 0.1)
    avatar.add(leftEye)

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    rightEye.position.set(0.04, 1.67, 0.1)
    avatar.add(rightEye)

    // Hair
    const hairGeometry = new THREE.SphereGeometry(0.13, 32, 32)
    const hairMaterial = new THREE.MeshLambertMaterial({ color: avatarCustomization.hairColor })
    const hair = new THREE.Mesh(hairGeometry, hairMaterial)
    hair.position.y = 1.7
    hair.scale.set(1, 0.8, 1)
    avatar.add(hair)

    // Torso
    const torsoGeometry = new THREE.CylinderGeometry(0.15 * buildMult.width, 0.18 * buildMult.width, 0.6, 16)
    const torso = new THREE.Mesh(torsoGeometry, skinMaterial)
    torso.position.y = 1.2
    torso.castShadow = true
    avatar.add(torso)

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.5, 12)

    const leftArm = new THREE.Mesh(armGeometry, skinMaterial)
    leftArm.position.set(-0.25 * buildMult.width, 1.3, 0)
    leftArm.rotation.z = 0.2
    leftArm.castShadow = true
    avatar.add(leftArm)

    const rightArm = new THREE.Mesh(armGeometry, skinMaterial)
    rightArm.position.set(0.25 * buildMult.width, 1.3, 0)
    rightArm.rotation.z = -0.2
    rightArm.castShadow = true
    avatar.add(rightArm)

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.8, 12)

    const leftLeg = new THREE.Mesh(legGeometry, skinMaterial)
    leftLeg.position.set(-0.1, 0.5, 0)
    leftLeg.castShadow = true
    avatar.add(leftLeg)

    const rightLeg = new THREE.Mesh(legGeometry, skinMaterial)
    rightLeg.position.set(0.1, 0.5, 0)
    rightLeg.castShadow = true
    avatar.add(rightLeg)

    // Add clothing items
    clothingItems.forEach((item) => {
      addClothingToAvatar(item, avatar, buildMult)
    })

    sceneRef.current.add(avatar)
  }, [avatarCustomization, clothingItems])

  // Add clothing to avatar
  const addClothingToAvatar = (item: ClothingItem, avatar: THREE.Group, buildMult: any) => {
    let geometry: THREE.BufferGeometry
    let material: THREE.Material

    const clothingMaterial = new THREE.MeshLambertMaterial({
      color: item.color,
      transparent: true,
      opacity: 0.9,
    })

    switch (item.type) {
      case "shirt":
        geometry = new THREE.CylinderGeometry(0.16 * buildMult.width, 0.19 * buildMult.width, 0.65, 16)
        material = clothingMaterial
        break
      case "pants":
        geometry = new THREE.CylinderGeometry(0.09, 0.11, 0.85, 12)
        material = clothingMaterial
        break
      case "shoes":
        geometry = new THREE.BoxGeometry(0.12, 0.06, 0.25)
        material = clothingMaterial
        break
      default:
        return
    }

    const clothingMesh = new THREE.Mesh(geometry, material)
    clothingMesh.position.copy(item.position)
    clothingMesh.rotation.copy(item.rotation)
    clothingMesh.scale.copy(item.scale)
    clothingMesh.castShadow = true
    clothingMesh.userData = { type: item.type, id: item.id }

    avatar.add(clothingMesh)
  }

  // Create particle background
  const createParticleBackground = () => {
    if (!sceneRef.current) return

    const particleCount = 100
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = Math.random() * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20

      const color = new THREE.Color()
      color.setHSL(Math.random() * 0.1 + 0.5, 0.7, 0.5)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particles.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    })

    const particleSystem = new THREE.Points(particles, particleMaterial)
    sceneRef.current.add(particleSystem)
  }

  // Animation loop
  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !avatarRef.current) return

    const delta = clockRef.current.getDelta()
    const elapsed = clockRef.current.getElapsedTime()

    // Avatar breathing animation
    if (isAnimating) {
      const breathingScale = 1 + Math.sin(elapsed * 2) * 0.02
      avatarRef.current.scale.y = breathingScale * (avatarCustomization.height / 1.75)

      // Subtle swaying
      avatarRef.current.rotation.y = Math.sin(elapsed * 0.5) * 0.05
      avatarRef.current.position.x = Math.sin(elapsed * 0.3) * 0.02
    }

    // Update camera based on controls
    cameraRef.current.position.x =
      cameraControls.position.x + Math.sin(cameraControls.rotation.y) * cameraControls.position.z
    cameraRef.current.position.z =
      cameraControls.position.z + Math.cos(cameraControls.rotation.y) * cameraControls.position.z
    cameraRef.current.position.y = cameraControls.position.y
    cameraRef.current.lookAt(0, 1.2, 0)

    // Render
    rendererRef.current.render(sceneRef.current, cameraRef.current)

    // FPS calculation
    const currentFps = Math.round(1 / delta)
    setFps(currentFps)

    animationIdRef.current = requestAnimationFrame(animate)
  }, [isAnimating, avatarCustomization.height, cameraControls])

  // Handle pointer events for camera control
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    setLastPointer({ x: e.clientX, y: e.clientY })
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - lastPointer.x
    const deltaY = e.clientY - lastPointer.y

    setCameraControls((prev) => ({
      ...prev,
      rotation: {
        x: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.rotation.x - deltaY * 0.01)),
        y: prev.rotation.y - deltaX * 0.01,
      },
    }))

    setLastPointer({ x: e.clientX, y: e.clientY })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  // Handle wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomSpeed = 0.1
    const newZoom = Math.max(0.5, Math.min(3, cameraControls.zoom + e.deltaY * zoomSpeed * 0.01))

    setCameraControls((prev) => ({
      ...prev,
      zoom: newZoom,
      position: {
        ...prev.position,
        z: 3 / newZoom,
      },
    }))
  }

  // Add clothing item
  const addClothingItem = (type: ClothingItem["type"], color: string) => {
    const newItem: ClothingItem = {
      id: `${type}-${Date.now()}`,
      type,
      color,
      material: "cotton",
      position: new THREE.Vector3(0, type === "shirt" ? 1.2 : type === "pants" ? 0.5 : 0.1, 0),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1),
    }

    setClothingItems((prev) => {
      // Remove existing item of same type
      const filtered = prev.filter((item) => item.type !== type)
      return [...filtered, newItem]
    })

    toast({
      title: "Item Added",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} added to avatar`,
    })
  }

  // Save outfit
  const handleSaveOutfit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save outfits",
        variant: "destructive",
      })
      return
    }

    if (!outfitName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your outfit",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const outfitData = {
        name: outfitName,
        description: outfitDescription,
        is_favorite: isFavorite,
        items: clothingItems.map((item) => ({
          product_id: item.id,
          customization_data: {
            color: item.color,
            position: item.position,
            rotation: item.rotation,
            scale: item.scale,
          },
        })),
      }

      const result = await saveOutfit(user.id, outfitData)

      if (result.success) {
        toast({
          title: "Outfit Saved!",
          description: "Your cosmic creation has been saved successfully",
        })
        setOutfitName("")
        setOutfitDescription("")
        setIsFavorite(false)
      } else {
        throw new Error("Failed to save outfit")
      }
    } catch (error) {
      console.error("Error saving outfit:", error)
      toast({
        title: "Save Failed",
        description: "Could not save your outfit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Initialize scene
  useEffect(() => {
    initScene()
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [initScene])

  // Start animation loop
  useEffect(() => {
    animate()
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [animate])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return

      const width = canvasRef.current.clientWidth
      const height = canvasRef.current.clientHeight

      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Update avatar when customization changes
  useEffect(() => {
    if (avatarRef.current && sceneRef.current) {
      sceneRef.current.remove(avatarRef.current)
      createAvatar()
    }
  }, [avatarCustomization, createAvatar])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1A] via-[#1A1A3A] to-[#2A1A4A] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-2rem)]">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-[#00C4B4]" />
                  Avatar Customization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Height: {avatarCustomization.height}m</Label>
                  <Slider
                    value={[avatarCustomization.height]}
                    onValueChange={([value]) => setAvatarCustomization((prev) => ({ ...prev, height: value }))}
                    min={1.5}
                    max={2.0}
                    step={0.05}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Build</Label>
                  <Select
                    value={avatarCustomization.build}
                    onValueChange={(value: "slim" | "average" | "athletic") =>
                      setAvatarCustomization((prev) => ({ ...prev, build: value }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slim">Slim</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="athletic">Athletic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Skin Tone</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {["#FDBCB4", "#F1C27D", "#E0AC69", "#C68642", "#8D5524", "#654321"].map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          avatarCustomization.skinTone === color ? "border-[#00C4B4]" : "border-zinc-600"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setAvatarCustomization((prev) => ({ ...prev, skinTone: color }))}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shirt className="h-5 w-5 mr-2 text-[#00C4B4]" />
                  Clothing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Add Shirt</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border-2 border-zinc-600 hover:border-[#00C4B4] transition-colors"
                        style={{ backgroundColor: color }}
                        onClick={() => addClothingItem("shirt", color)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Add Pants</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {["#2C3E50", "#34495E", "#7F8C8D", "#8B4513", "#000080", "#800080"].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border-2 border-zinc-600 hover:border-[#00C4B4] transition-colors"
                        style={{ backgroundColor: color }}
                        onClick={() => addClothingItem("pants", color)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Add Shoes</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {["#000000", "#8B4513", "#FFFFFF", "#FF0000", "#0000FF", "#008000"].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border-2 border-zinc-600 hover:border-[#00C4B4] transition-colors"
                        style={{ backgroundColor: color }}
                        onClick={() => addClothingItem("shoes", color)}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - 3D Canvas */}
          <div className="lg:col-span-2 relative">
            <Card className="h-full bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg overflow-hidden">
              <CardContent className="p-0 h-full relative">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A1A]/90 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-[#00C4B4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-white text-lg">Loading 3D Avatar...</p>
                    </div>
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  className="w-full h-full cursor-grab active:cursor-grabbing"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onWheel={handleWheel}
                />

                {/* Controls Overlay */}
                <div className="absolute top-4 left-4 bg-[#1A1A1A]/80 backdrop-blur-md p-2 rounded-lg">
                  <div className="flex items-center space-x-2 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full ${fps > 45 ? "bg-green-500" : fps > 30 ? "bg-yellow-500" : "bg-red-500"}`}
                    ></div>
                    <span className="text-white">{fps} FPS</span>
                  </div>
                </div>

                {/* Mobile Instructions */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#1A1A1A]/80 backdrop-blur-md p-3 rounded-lg md:hidden">
                  <p className="text-white text-sm text-center">
                    <Smartphone className="h-4 w-4 inline mr-1" />
                    Drag to rotate • Pinch to zoom • Tap clothing colors to dress avatar
                  </p>
                </div>

                {/* Desktop Instructions */}
                <div className="absolute bottom-4 left-4 bg-[#1A1A1A]/80 backdrop-blur-md p-3 rounded-lg hidden md:block">
                  <p className="text-white text-sm">
                    <Monitor className="h-4 w-4 inline mr-1" />
                    Click & drag to rotate • Scroll to zoom • Select colors to customize
                  </p>
                </div>

                {/* Camera Controls */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-[#1A1A1A]/80 border-[#00C4B4]/50 text-[#00C4B4] hover:bg-[#00C4B4]/10"
                    onClick={() => setCameraControls((prev) => ({ ...prev, zoom: Math.min(3, prev.zoom + 0.2) }))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-[#1A1A1A]/80 border-[#00C4B4]/50 text-[#00C4B4] hover:bg-[#00C4B4]/10"
                    onClick={() => setCameraControls((prev) => ({ ...prev, zoom: Math.max(0.5, prev.zoom - 0.2) }))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-[#1A1A1A]/80 border-[#00C4B4]/50 text-[#00C4B4] hover:bg-[#00C4B4]/10"
                    onClick={() =>
                      setCameraControls({
                        rotation: { x: 0, y: 0 },
                        zoom: 1,
                        position: { x: 0, y: 1.6, z: 3 },
                      })
                    }
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`bg-[#1A1A1A]/80 border-[#00C4B4]/50 hover:bg-[#00C4B4]/10 ${
                      isAnimating ? "text-[#00C4B4]" : "text-zinc-400"
                    }`}
                    onClick={() => setIsAnimating(!isAnimating)}
                  >
                    {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Save & Export */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Save className="h-5 w-5 mr-2 text-[#00C4B4]" />
                  Save Outfit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="outfit-name">Outfit Name</Label>
                  <Input
                    id="outfit-name"
                    value={outfitName}
                    onChange={(e) => setOutfitName(e.target.value)}
                    placeholder="My Cosmic Look"
                    className="mt-2 bg-[#0A0A1A]/50 border-zinc-700"
                  />
                </div>

                <div>
                  <Label htmlFor="outfit-description">Description</Label>
                  <Textarea
                    id="outfit-description"
                    value={outfitDescription}
                    onChange={(e) => setOutfitDescription(e.target.value)}
                    placeholder="Describe your style..."
                    className="mt-2 bg-[#0A0A1A]/50 border-zinc-700"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="favorite" checked={isFavorite} onCheckedChange={setIsFavorite} />
                  <Label htmlFor="favorite" className="flex items-center">
                    <Heart className="h-4 w-4 mr-1 text-[#FF6B6B]" />
                    Add to Favorites
                  </Label>
                </div>

                <Button
                  onClick={handleSaveOutfit}
                  disabled={isSaving || !outfitName.trim()}
                  className="w-full bg-gradient-to-r from-[#007BFF] to-[#00C4B4] hover:from-[#0056b3] hover:to-[#009688]"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Outfit
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-[#00C4B4]" />
                  Scene Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Light Intensity: {lightIntensity}</Label>
                  <Slider
                    value={[lightIntensity]}
                    onValueChange={([value]) => setLightIntensity(value)}
                    min={0.1}
                    max={2}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#007BFF]/50 text-[#007BFF] hover:bg-[#007BFF]/10 bg-transparent"
                    onClick={() => {
                      // Reset avatar to default pose
                      if (avatarRef.current) {
                        avatarRef.current.rotation.set(0, 0, 0)
                        avatarRef.current.position.set(0, 0, 0)
                      }
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#4ECDC4]/50 text-[#4ECDC4] hover:bg-[#4ECDC4]/10 bg-transparent"
                    onClick={() => {
                      // Clear all clothing
                      setClothingItems([])
                      toast({
                        title: "Clothing Cleared",
                        description: "All clothing items removed from avatar",
                      })
                    }}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="h-5 w-5 mr-2 text-[#00C4B4]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#FF6B6B]/50 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 bg-transparent"
                  onClick={() => {
                    // Take screenshot functionality would go here
                    toast({
                      title: "Screenshot Taken",
                      description: "Your avatar has been captured!",
                    })
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Screenshot
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#4ECDC4]/50 text-[#4ECDC4] hover:bg-[#4ECDC4]/10 bg-transparent"
                  onClick={() => {
                    // Share functionality would go here
                    toast({
                      title: "Share Link Copied",
                      description: "Share your creation with friends!",
                    })
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Creation
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-[#45B7D1]/50 text-[#45B7D1] hover:bg-[#45B7D1]/10 bg-transparent"
                  onClick={() => {
                    // Export functionality would go here
                    toast({
                      title: "Export Started",
                      description: "Preparing your 3D model for download...",
                    })
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Model
                </Button>
              </CardContent>
            </Card>

            {/* Current Outfit Items */}
            {clothingItems.length > 0 && (
              <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-[#00C4B4]" />
                    Current Outfit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {clothingItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-[#0A0A1A]/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full border border-zinc-600"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-white text-sm capitalize">{item.type}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={() => {
                          setClothingItems((prev) => prev.filter((i) => i.id !== item.id))
                          toast({
                            title: "Item Removed",
                            description: `${item.type} removed from avatar`,
                          })
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
