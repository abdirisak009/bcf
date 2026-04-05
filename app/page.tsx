import Navigation from '@/components/navigation';
import Hero from '@/components/hero';
import HomeExploreStrip from '@/components/home-explore-strip';
import Services from '@/components/services';
import StrategicPartners from '@/components/strategic-partners';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <HomeExploreStrip />
      <Services />
      <StrategicPartners />
      <Footer />
    </main>
  );
}
