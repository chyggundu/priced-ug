import { Audiences } from "@/components/Audiences";
import { Contact } from "@/components/Contact";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Screenshots } from "@/components/Screenshots";
import { Team } from "@/components/Team";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Audiences />
        <Features />
        <Screenshots />
        <Team />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
