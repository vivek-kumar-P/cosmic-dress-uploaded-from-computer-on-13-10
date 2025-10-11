import { proxy } from "valtio"

export type CustomizationState = {
	color: string
	isLogoTexture: boolean
	isFullTexture: boolean
	logoDecal: string
	fullDecal: string
}

export const customizationState = proxy<CustomizationState>({
	color: "#EFBD48",
	isLogoTexture: true,
	isFullTexture: false,
	logoDecal: "/textures/threejs.png",
	fullDecal: "/textures/threejs.png",
})


