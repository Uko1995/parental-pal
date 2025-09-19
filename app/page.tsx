import Hero from "./components/Hero";
import MiniBlog from "./components/MiniBlog";
import Statistics from "./components/Statistics";
import Testimonials from "./components/Testimonials";
import Vision from "./components/Vision";
import Contact from "./components/Contact";
import MiniServices from "./components/MiniServices";

export default function Page() {
  return (
    <>
      <Hero />
      <Vision />
      <MiniServices />
      <MiniBlog />
      <Statistics />
      <Testimonials />
      <Contact />
    </>
  );
}
