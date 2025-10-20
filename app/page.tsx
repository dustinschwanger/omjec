import Hero from '@/components/Hero'
import Mission from '@/components/Mission'
import JobSeekersSection from '@/components/JobSeekersSection'
import EmployersSection from '@/components/EmployersSection'
import YouthProgramSection from '@/components/YouthProgramSection'
import QuickLinksSection from '@/components/QuickLinksSection'
import TestimonialSection from '@/components/TestimonialSection'
import ContactSection from '@/components/ContactSection'

export default function Home() {
  return (
    <>
      <Hero />
      <Mission />
      <JobSeekersSection />
      <EmployersSection />
      <YouthProgramSection />
      <QuickLinksSection />
      <TestimonialSection />
      <ContactSection />
    </>
  )
}
