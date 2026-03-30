import Navigation from '@/components/navigation';
import Hero from '@/components/hero';
import HomeExploreStrip from '@/components/home-explore-strip';
import Services from '@/components/services';
import NewsEvents from '@/components/news-events';
import HomeFacebookNews from '@/components/home-facebook-news';
import StrategicPartners from '@/components/strategic-partners';
import Footer from '@/components/footer';
import { fetchNewsFromApi, fetchPublicationsFromApi } from '@/lib/fetch-content-api';
import { mapNewsRowToCard } from '@/lib/map-news-to-cards';
import { mapPublicationRowToCard } from '@/lib/map-publications-to-cards';

export default async function Home() {
  const [newsRows, publicationRows] = await Promise.all([
    fetchNewsFromApi(12),
    fetchPublicationsFromApi(12),
  ]);
  const newsCards = newsRows.map(mapNewsRowToCard);
  const publicationCards = publicationRows.map(mapPublicationRowToCard);

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <HomeExploreStrip />
      <Services />
      <HomeFacebookNews />
      <NewsEvents publications={publicationCards} news={newsCards} />
      <StrategicPartners />
      <Footer />
    </main>
  );
}
