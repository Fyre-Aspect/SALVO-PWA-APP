import Navbar from "@/components/landing/Navbar";
import ScrollLanding from "@/components/landing/ScrollLanding";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#050a12" }}
    >
      <Navbar />
      <ScrollLanding />
      {/* Footer sits below the 700vh scroll journey in normal flow */}
      <div
        className="relative"
        style={{
          zIndex: 20,
          background: "#050a12",
          borderTop: "1px solid rgba(0,61,102,0.3)",
        }}
      >
        <Footer />
      </div>
    </main>
  );
}
