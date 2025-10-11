"use client"

import React from "react"

export default function ScreenshotButton() {
	const capture = () => {
		const canvas = document.querySelector("canvas") as HTMLCanvasElement | null
		if (!canvas) return
		const url = canvas.toDataURL("image/png")
		const a = document.createElement("a")
		a.href = url
		a.download = "tshirt.png"
		a.click()
	}
	return (
		<button className="btn btn-sm" onClick={capture}>
			Screenshot
		</button>
	)
}


