"use client"

import React from "react"
import { SketchPicker } from "react-color"
import { useSnapshot } from "valtio"
import { customizationState } from "../../customizer/CustomizationStore"

export default function ColorPicker() {
	const snap = useSnapshot(customizationState)

	return (
		<div className="p-2 rounded-md border bg-background">
			<SketchPicker
				color={snap.color}
				disableAlpha
				onChange={(c) => (customizationState.color = c.hex)}
			/>
		</div>
	)
}


