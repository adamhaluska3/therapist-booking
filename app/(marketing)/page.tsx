import { ServicesSection } from "@/components/marketing/services-section";
import { OutdoorTherapySection } from "@/components/marketing/outdoor-therapy-section";
import { AboutSection } from "@/components/marketing/about-section";
import { ContactSection } from "@/components/marketing/contact-section";
import { homeContent } from "./_content/home";

const { services, outdoorTherapy, about, contact } = homeContent;

export default function HomePage() {
  return (
    <>
      <ServicesSection content={services} />
      <OutdoorTherapySection content={outdoorTherapy} />
      <AboutSection content={about} />
      <ContactSection content={contact} />
    </>
  );
}
