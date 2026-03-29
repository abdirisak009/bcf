import Navigation from '@/components/navigation';
import Hero from '@/components/hero';
import ChairpersonMessage from '@/components/chairperson-message';
import WhoWeAre from '@/components/who-we-are';
import Services from '@/components/services';
import Leadership from '@/components/leadership';
import Sectors from '@/components/sectors';
import NewsEvents from '@/components/news-events';
import StrategicPartners from '@/components/strategic-partners';
import Contact from '@/components/contact';
import Footer from '@/components/footer';
import { fetchNewsFromApi, fetchPublicationsFromApi } from '@/lib/fetch-content-api';
import { mapNewsRowToCard } from '@/lib/map-news-to-cards';
import { mapPublicationRowToCard } from '@/lib/map-publications-to-cards';

export default async function Home() {
  const [newsRows, publicationRows] = await Promise.all([
    fetchNewsFromApi(3),
    fetchPublicationsFromApi(3),
  ]);
  const newsCards = newsRows.map(mapNewsRowToCard);
  const publicationCards = publicationRows.map(mapPublicationRowToCard);

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <ChairpersonMessage />
      <WhoWeAre />
      <Leadership />
      <Services />
      <Sectors />
      <NewsEvents publications={publicationCards} news={newsCards} />
      <StrategicPartners />
      <Contact />
      <Footer />
    </main>
  );
}
