"use client"

import React from "react"
import { useSnapshot } from "valtio"
import { customizationState } from "../../customizer/CustomizationStore"

type Props = {
	active: "color" | "file" | null
	onChange: (tab: "color" | "file") => void
}

export default function Tabs({ active, onChange }: Props) {
	const snap = useSnapshot(customizationState)
	return (
		<div className="flex items-center gap-2">
			<button
				className={`btn btn-sm ${active === "color" ? "btn-primary" : ""}`}
				onClick={() => onChange("color")}
			>
				Color
			</button>
			<button
				className={`btn btn-sm ${active === "file" ? "btn-primary" : ""}`}
				onClick={() => onChange("file")}
			>
				Images
			</button>
			<div className="ml-2 flex items-center gap-2">
				<label className="flex items-center gap-1">
					<input
						type="checkbox"
						checked={snap.isLogoTexture}
						onChange={() => (customizationState.isLogoTexture = !snap.isLogoTexture)}
					/>
					<span>Logo</span>
				</label>
				<label className="flex items-center gap-1">
					<input
						type="checkbox"
						checked={snap.isFullTexture}
						onChange={() => (customizationState.isFullTexture = !snap.isFullTexture)}
					/>
					<span>Full</span>
				</label>
			</div>
		</div>
	)
}


