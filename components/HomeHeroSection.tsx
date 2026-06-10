import { getVisiblePromoCampSeason } from "@/app/services/actions";
import CampPromoBanner from "./CampPromoBanner";
import Hero from "./Hero";

export default async function HomeHeroSection() {
  const activeSeason = await getVisiblePromoCampSeason();

  return (
    <div className="relative">
      <CampPromoBanner activeSeason={activeSeason} />
      <Hero />
    </div>
  );
}
