import CheckoutForm from "@/components/checkout-form"
import ProtectedRoute from "@/components/auth/protected-route"

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A] text-white py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Checkout</h1>
          <p className="text-center text-zinc-400 mb-8 max-w-2xl mx-auto">Complete your cosmic fashion journey</p>

          <CheckoutForm />
        </div>
      </main>
    </ProtectedRoute>
  )
}
