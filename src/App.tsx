import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { About } from "./components/About";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";
import { Calculator } from "./components/Calculator";

export default function App() {
  return (
    <>
      <Hero />
      <Calculator />
      <Services />
      <About />
      <CTA />
    </>
     
  );
}