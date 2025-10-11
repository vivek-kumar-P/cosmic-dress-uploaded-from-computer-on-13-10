import LandingHero from "@/components/landing-hero"
import FeatureCards from "@/components/feature-cards"
import TestimonialSection from "@/components/testimonial-section"
import TrendingOutfits from "@/components/trending-outfits"
import HowItWorks from "@/components/how-it-works"
import NewsletterSection from "@/components/newsletter-section"
import Footer from "@/components/footer"
import ConfigCheck from "@/components/config-check"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <ConfigCheck />
      <LandingHero />
      <FeatureCards />
      <TrendingOutfits />
      <HowItWorks />
      <TestimonialSection />
      <NewsletterSection />
      <Footer />
    </div>
  )
}
