"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { UserAddress } from "@/types/app"

interface AddressModalProps {
  address?: UserAddress | null
  isOpen: boolean
  onClose: () => void
  onSave: (addressData: UserAddress) => Promise<void>
}

export default function AddressModal({
  address,
  isOpen,
  onClose,
  onSave,
}: AddressModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UserAddress>({
    full_name: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    is_default: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (address) {
      setFormData({
        id: address.id,
        user_id: address.user_id,
        full_name: address.full_name || "",
        phone: address.phone || "",
        address_line_1: address.address_line_1 || "",
        address_line_2: address.address_line_2 || "",
        city: address.city || "",
        state: address.state || "",
        country: address.country || "",
        postal_code: address.postal_code || "",
        is_default: !!address.is_default,
      })
    } else {
      setFormData({
        full_name: "",
        phone: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
        is_default: false,
      })
    }
    setErrors({})
  }, [address, isOpen])

  const handleInputChange = (field: keyof UserAddress, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.full_name?.trim()) {
      newErrors.full_name = "Full Name is required"
    }
    if (!formData.address_line_1?.trim()) {
      newErrors.address_line_1 = "Street Address is required"
    }
    if (!formData.city?.trim()) {
      newErrors.city = "City is required"
    }
    if (!formData.country?.trim()) {
      newErrors.country = "Country is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await onSave({
        ...formData,
        full_name: formData.full_name.trim(),
        address_line_1: formData.address_line_1.trim(),
        address_line_2: formData.address_line_2?.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state?.trim() || undefined,
        country: formData.country.trim(),
        postal_code: formData.postal_code?.trim() || undefined,
      })
      onClose()
    } catch (err) {
      console.error("Error saving address:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#121225]/95 border-[#00C4B4]/30 text-white max-w-lg backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#00C4B4] to-[#007BFF] bg-clip-text text-transparent">
            {address ? "Edit Shipping Address" : "Add Shipping Address"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-zinc-300">Recipient Full Name *</Label>
            <Input
              id="full_name"
              placeholder="e.g. Leo Stardust"
              value={formData.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              className={`bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4] ${errors.full_name ? "border-red-500" : ""}`}
            />
            {errors.full_name && <p className="text-xs text-red-400">{errors.full_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-zinc-300">Phone Number (Optional)</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="postal_code" className="text-zinc-300">ZIP / Postal Code</Label>
              <Input
                id="postal_code"
                placeholder="12345"
                value={formData.postal_code}
                onChange={(e) => handleInputChange("postal_code", e.target.value)}
                className="bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address_line_1" className="text-zinc-300">Street Address *</Label>
            <Input
              id="address_line_1"
              placeholder="123 Nebula Boulevard"
              value={formData.address_line_1}
              onChange={(e) => handleInputChange("address_line_1", e.target.value)}
              className={`bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4] ${errors.address_line_1 ? "border-red-500" : ""}`}
            />
            {errors.address_line_1 && <p className="text-xs text-red-400">{errors.address_line_1}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address_line_2" className="text-zinc-300">Apartment, Suite, Unit, etc. (Optional)</Label>
            <Input
              id="address_line_2"
              placeholder="Apt 42-B"
              value={formData.address_line_2}
              onChange={(e) => handleInputChange("address_line_2", e.target.value)}
              className="bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4]"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5 col-span-1">
              <Label htmlFor="city" className="text-zinc-300">City *</Label>
              <Input
                id="city"
                placeholder="Neo City"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className={`bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4] ${errors.city ? "border-red-500" : ""}`}
              />
              {errors.city && <p className="text-xs text-red-400">{errors.city}</p>}
            </div>

            <div className="space-y-1.5 col-span-1">
              <Label htmlFor="state" className="text-zinc-300">State / Prov</Label>
              <Input
                id="state"
                placeholder="Space Coast"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4]"
              />
            </div>

            <div className="space-y-1.5 col-span-1">
              <Label htmlFor="country" className="text-zinc-300">Country *</Label>
              <Input
                id="country"
                placeholder="Earth"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className={`bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4] ${errors.country ? "border-red-500" : ""}`}
              />
              {errors.country && <p className="text-xs text-red-400">{errors.country}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => handleInputChange("is_default", e.target.checked)}
              className="w-4 h-4 rounded bg-[#0A0A1A] border-zinc-800 text-[#00C4B4] focus:ring-[#00C4B4] cursor-pointer"
            />
            <Label htmlFor="is_default" className="text-zinc-300 select-none cursor-pointer">
              Set as my default shipping address
            </Label>
          </div>

          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-zinc-800 text-zinc-400 bg-transparent hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4] text-white hover:opacity-90 border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                </>
              ) : (
                "Save Address"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
