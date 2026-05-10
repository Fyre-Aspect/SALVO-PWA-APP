import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import TechSpecs from "@/components/landing/TechSpecs";
import ProductShowcase from "@/components/landing/ProductShowcase";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--color-ocean-dark)" }}>
      <Navbar />
      <Hero />
      <HowItWorks />
      <TechSpecs />
      <ProductShowcase />
      <Footer />
    </main>
  );
}
