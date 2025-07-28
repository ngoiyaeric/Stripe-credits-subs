import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Custom Landing Page
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                This is the new custom landing page.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <a
                  href="/sign-up"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg rounded-full"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
