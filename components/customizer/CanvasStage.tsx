"use client"

import React, { useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { Center, Environment, OrbitControls } from "@react-three/drei"
import TShirtModel from "./TShirtModel"

export default function CanvasStage() {
	const dpr = useMemo(() => {
		if (typeof window === "undefined") return 1
		const ratio = (window as any).devicePixelRatio ?? 1
		return Math.min(ratio, 2)
	}, [])
	return (
		<Canvas
			shadows
			gl={{ preserveDrawingBuffer: true }}
			dpr={dpr}
			camera={{ position: [0, 0, 2.8], fov: 27 }}
			className="h-full w-full"
		>
			<ambientLight intensity={0.5} />
			<Environment preset="studio" />
			<OrbitControls enablePan={false} minDistance={2} maxDistance={6} />
			<Center>
				<TShirtModel />
			</Center>
		</Canvas>
	)
}


