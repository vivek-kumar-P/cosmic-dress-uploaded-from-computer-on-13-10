"use client"

import React, { useState } from "react"
import { customizationState } from "./CustomizationStore"

function applyLocalCommand(cmd: string) {
	const tokens = cmd.trim().split(/\s+/)
	if (!tokens.length) return

	const head = tokens[0].toLowerCase()
	const arg = tokens.slice(1).join(" ")

	if (head === "color" && arg) {
		customizationState.color = arg
		return "Changed color"
	}
	if (head === "logo" && arg) {
		customizationState.logoDecal = arg
		customizationState.isLogoTexture = true
		return "Applied logo"
	}
	if (head === "full" && arg) {
		customizationState.fullDecal = arg
		customizationState.isFullTexture = true
		return "Applied full texture"
	}
	if (head === "toggle" && arg) {
		if (arg === "logo") customizationState.isLogoTexture = !customizationState.isLogoTexture
		if (arg === "full") customizationState.isFullTexture = !customizationState.isFullTexture
		return "Toggled"
	}
	if (head === "reset") {
		customizationState.color = "#EFBD48"
		customizationState.logoDecal = "/textures/threejs.png"
		customizationState.fullDecal = "/textures/threejs.png"
		customizationState.isLogoTexture = true
		customizationState.isFullTexture = false
		return "Reset to defaults"
	}
	if (head === "screenshot") {
		const canvas = document.querySelector("canvas") as HTMLCanvasElement | null
		if (!canvas) return "Canvas not found"
		const url = canvas.toDataURL("image/png")
		const a = document.createElement("a")
		a.href = url
		a.download = "tshirt.png"
		a.click()
		return "Screenshot downloaded"
	}
	return "Unknown command"
}

export default function ChatBot() {
	const [input, setInput] = useState("")
	const [messages, setMessages] = useState<string[]>([])

	const send = async () => {
		const text = input.trim()
		if (!text) return
		setMessages((m) => [...m, `You: ${text}`])

		const result = applyLocalCommand(text)
		setMessages((m) => [...m, `Bot: ${result}`])
		setInput("")
	}

	return (
		<div className="flex flex-col gap-2 h-full">
			<div className="flex-1 overflow-auto rounded border p-2 text-sm space-y-1">
				{messages.map((m, i) => (
					<div key={i}>{m}</div>
				))}
			</div>
			<div className="flex gap-2">
				<input
					className="input input-sm w-full"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder='Try: "color #ff0000", "logo https://...", "screenshot"'
				/>
				<button className="btn btn-sm" onClick={send}>
					Send
				</button>
			</div>
		</div>
	)
}


