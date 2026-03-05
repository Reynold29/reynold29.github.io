import RoseCursor from '@/components/RoseCursor';
import FloatingPetals from '@/components/FloatingPetals';
import BackgroundMusic from '@/components/BackgroundMusic';
import HeroSection from '@/components/HeroSection';
import ForHerSection from '@/components/ForHerSection';
import RoseMessage from '@/components/RoseMessage';
import RoseGarden from '@/components/RoseGarden';
import PhotoLockSection from '@/components/PhotoLockSection';
import Footer from '@/components/Footer';
import { ScrollProvider } from '@/contexts/ScrollContext';

const Index = () => {
  return (
    <ScrollProvider>
      <div className="min-h-screen w-full max-w-full bg-background cursor-none overflow-x-hidden">
        {/* Custom Rose Cursor */}
        <RoseCursor />

        {/* Background music + mute/unmute */}
        <BackgroundMusic />
        
        {/* Floating Petals Background */}
        <FloatingPetals count={25} />
        
        {/* Main Content */}
        <main className="w-full max-w-full">
          {/* Hero Section with 3D Rose */}
          <HeroSection />
          
          {/* For Her section */}
          <ForHerSection />
          
          {/* Romantic Message with Typewriter */}
          <RoseMessage />
          
          {/* Interactive Rose Garden */}
          <RoseGarden />
          
          {/* Our Moments - photo lock */}
          <PhotoLockSection />
          
          {/* Footer */}
          <Footer />
        </main>
      </div>
    </ScrollProvider>
  );
};

export default Index;
