"use client"

import React from "react"
import Image from "next/image"
import { customizationState } from "../../customizer/CustomizationStore"

type LogoItem = {
	name: string
	url: string
}

const defaultLogos: LogoItem[] = [
	{ name: "Three.js", url: "/textures/threejs.png" },
	{ name: "Demo 2", url: "/textures/demo-2.png" },
	{ name: "Demo 3", url: "/textures/demo-3.png" },
	{ name: "Demo 4", url: "/textures/demo-4.png" },
	{ name: "Download", url: "/textures/demo-download.png" },
]

export default function LogoGrid({ logos = defaultLogos }: { logos?: LogoItem[] }) {
	return (
		<div className="grid grid-cols-3 gap-2">
			{logos.map((logo) => (
				<button
					key={logo.name}
					className="aspect-square rounded-lg border border-white/10 overflow-hidden hover:border-[#00c4b4]/50"
					onClick={() => {
						customizationState.logoDecal = logo.url
						customizationState.isLogoTexture = true
					}}
					title={logo.name}
				>
					<div className="relative w-full h-full">
						<Image src={logo.url} alt={logo.name} fill className="object-cover" />
					</div>
				</button>
			))}
			<button
				className="aspect-square rounded-lg border border-white/10 text-xs text-gray-300 hover:border-red-400"
				onClick={() => {
					customizationState.logoDecal = ""
					customizationState.isLogoTexture = false
				}}
			>
				Clear
			</button>
		</div>
	)
}


