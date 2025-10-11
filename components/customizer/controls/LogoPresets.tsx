"use client"

import React from "react"
import { customizationState } from "../../customizer/CustomizationStore"

const presets = [
	{ name: "Three.js", url: "/textures/threejs.png" },
]

export default function LogoPresets() {
	return (
		<div className="flex flex-wrap gap-2">
			{presets.map((p) => (
				<button
					key={p.name}
					className="btn btn-sm"
					onClick={() => {
						customizationState.logoDecal = p.url
						customizationState.isLogoTexture = true
					}}
				>
					{p.name}
				</button>
			))}
			<button
				className="btn btn-sm btn-outline"
				onClick={() => {
					customizationState.logoDecal = ""
					customizationState.isLogoTexture = false
				}}
			>
				Clear Logo
			</button>
		</div>
	)
}


