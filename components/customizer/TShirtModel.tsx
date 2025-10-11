"use client"

import React, { useEffect, useMemo } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { Decal, useGLTF, useTexture } from "@react-three/drei"
import { useSnapshot } from "valtio"
import { easing } from "maath"
import { customizationState } from "./CustomizationStore"

const MODEL_URL = "/models/shirt_baked.glb"

function sanitizeImageUrl(src: string | undefined): string | undefined {
	if (!src) return undefined
	// Allow data URLs directly
	if (src.startsWith("data:")) return src
	// Try to extract direct image URL from Google imgres links
	try {
		const u = new URL(src)
		if (u.hostname.includes("google") && u.pathname.includes("imgres")) {
			const raw = u.searchParams.get("imgurl")
			if (raw) return decodeURIComponent(raw)
		}
	} catch {}
	// Only allow obvious image URLs to avoid loader errors
	if (/\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(src)) return src
	return undefined
}

export default function TShirtModel() {
	const snap = useSnapshot(customizationState)
	const gltf = useGLTF(MODEL_URL) as any
	const nodes: Record<string, any> = (gltf && (gltf as any).nodes) || {}
	const materials: Record<string, any> = (gltf && (gltf as any).materials) || {}

	const logoSrc = useMemo(() => sanitizeImageUrl(snap.logoDecal), [snap.logoDecal])
	const fullSrc = useMemo(() => sanitizeImageUrl(snap.fullDecal), [snap.fullDecal])

	// Always call hooks in the same order: provide transparent 1x1 fallback when URL is missing
	const TRANSPARENT_PNG =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="

	const logoUrlForHook = logoSrc ?? TRANSPARENT_PNG
	const fullUrlForHook = fullSrc ?? TRANSPARENT_PNG

	const logoTexture = useTexture(logoUrlForHook)
	const fullTexture = useTexture(fullUrlForHook)

	// Resolve a geometry and material robustly regardless of GLB node naming
	const shirtGeometry = useMemo(() => {
		const maybeNamed = (nodes as any)?.T_Shirt_male?.geometry
		if (maybeNamed) return maybeNamed
		const anyMesh = Object.values(nodes).find((n: any) => n && n.isMesh && n.geometry)
		return anyMesh ? (anyMesh as any).geometry : null
	}, [nodes])

	const shirtMaterial = useMemo(() => {
		return (materials as any)?.lambert1 ?? new THREE.MeshStandardMaterial({ color: snap.color, roughness: 1 })
		// color will be animated by dampC if material has .color
	}, [materials, snap.color])

	useEffect(() => {
		if (logoTexture) {
			// Some loaders may return undefined during suspense; guard length access
			try {
				;(logoTexture as any).anisotropy = 16
			} catch {}
		}
	}, [logoTexture])

	useFrame((_, delta) => {
		const mat = materials?.lambert1
		const color = mat?.color
		if (color) {
			easing.dampC(color, snap.color, 0.25, delta)
		}
	})

	const stateKey = JSON.stringify({
		color: snap.color,
		isLogoTexture: snap.isLogoTexture,
		isFullTexture: snap.isFullTexture,
		logoDecal: snap.logoDecal,
		fullDecal: snap.fullDecal,
	})

	return (
		<group key={stateKey}>
			{shirtGeometry ? (
				<mesh
				castShadow
				geometry={shirtGeometry}
				material={shirtMaterial}
				material-roughness={1}
				dispose={null}
			>
				{snap.isFullTexture && fullTexture && (
					<Decal position={[0, 0, 0]} rotation={[0, 0, 0]} scale={1} map={fullTexture} />
				)}
				{snap.isLogoTexture && logoTexture && (
					<Decal
						position={[0, 0.04, 0.15]}
						rotation={[0, 0, 0]}
						scale={0.15}
						map={logoTexture}
						depthTest={false}
					/>
				)}
			</mesh>
			) : null}
		</group>
	)
}

useGLTF.preload(MODEL_URL)


