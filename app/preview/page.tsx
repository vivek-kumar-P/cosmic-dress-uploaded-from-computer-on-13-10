import OutfitPreview from "@/components/outfit-preview"

export default function PreviewPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A] text-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Preview Your Cosmic Outfit</h1>
        <p className="text-center text-zinc-400 mb-8 max-w-2xl mx-auto">
          Review your selections before proceeding to checkout
        </p>

        <OutfitPreview />
      </div>
    </main>
  )
}
