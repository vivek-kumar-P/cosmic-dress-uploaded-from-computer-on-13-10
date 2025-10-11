"use client"

import React, { useRef, useState } from "react"
import { customizationState } from "../../customizer/CustomizationStore"

function readFileAsDataURL(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(String(reader.result))
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}

export default function FilePicker() {
	const fileInputRef = useRef<HTMLInputElement | null>(null)
	const [logoUrl, setLogoUrl] = useState("")
	const [fullUrl, setFullUrl] = useState("")

	const onPickFile = async (type: "logo" | "full") => {
		const file = fileInputRef.current?.files?.[0]
		if (!file) return
		const dataUrl = await readFileAsDataURL(file)
		if (type === "logo") {
			customizationState.logoDecal = dataUrl
			customizationState.isLogoTexture = true
		} else {
			customizationState.fullDecal = dataUrl
			customizationState.isFullTexture = true
		}
	}

	return (
		<div className="flex flex-col gap-3">
			<input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
			<div className="flex items-center gap-2">
				<button
					className="btn btn-sm"
					onClick={() => fileInputRef.current?.click()}
				>
					Choose Image
				</button>
				<button className="btn btn-sm" onClick={() => onPickFile("logo")}>
					Apply as Logo
				</button>
				<button className="btn btn-sm" onClick={() => onPickFile("full")}>
					Apply as Full
				</button>
			</div>

			<div className="flex items-center gap-2">
				<input
					value={logoUrl}
					onChange={(e) => setLogoUrl(e.target.value)}
					placeholder="Logo URL or data URL"
					className="input input-sm w-full"
				/>
				<button
					className="btn btn-sm"
					onClick={() => {
						if (!logoUrl) return
						customizationState.logoDecal = logoUrl
						customizationState.isLogoTexture = true
					}}
				>
					Set Logo
				</button>
			</div>

			<div className="flex items-center gap-2">
				<input
					value={fullUrl}
					onChange={(e) => setFullUrl(e.target.value)}
					placeholder="Full texture URL or data URL"
					className="input input-sm w-full"
				/>
				<button
					className="btn btn-sm"
					onClick={() => {
						if (!fullUrl) return
						customizationState.fullDecal = fullUrl
						customizationState.isFullTexture = true
					}}
				>
					Set Full
				</button>
			</div>
		</div>
	)
}


