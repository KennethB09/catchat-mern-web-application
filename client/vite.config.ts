import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";

const manifestForPlugin: Partial<VitePWAOptions> = {
  registerType: "prompt",
  includeAssets: ["favicon.png", "icon.png", "adaptive-icon.png"],
  manifest: {
    name: "Catchat: chat app",
    short_name: "Catchat",
    description: "A web base chat application.",
    icons: [
      {
				src: "/adaptive-icon.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/splash-image.png",
				sizes: "512x512",
				type: "image/png",
			},
			{
				src: "/icon.png",
				sizes: "180x180",
				type: "image/png",
				purpose: "apple touch icon",
			},
			{
				src: "/icon.png",
				sizes: "225x225",
				type: "image/png",
				purpose: "any maskable",
			},
		],
		theme_color: "#FF9944",
		background_color: "#ffffff",
		display: "standalone",
		scope: "/",
		start_url: "/",
		orientation: "portrait",
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(manifestForPlugin)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})