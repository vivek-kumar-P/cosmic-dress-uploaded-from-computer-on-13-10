import OutfitPicker from "@/components/outfit-picker"

export default function OutfitPickerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A] text-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Choose Your Outfit</h1>
        <p className="text-center text-zinc-400 mb-8 max-w-2xl mx-auto">
          Select up to 5 items to create your cosmic ensemble
        </p>

        <OutfitPicker />
      </div>
    </main>
  )
}
