import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Link } from "@heroui/link";

export default function AboutPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>About&nbsp;</h1>
          <h1 className={title({ color: "violet" })}>Clue AI Detective Game</h1>
          
          <div className="mt-8 text-left">
            <p className="text-lg text-default-500 mb-6">
              Welcome to Clue AI Detective Game, an innovative platform where you can create and play custom detective mysteries powered by artificial intelligence.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Our Vision</h2>
            <p className="text-default-500 mb-6">
              We believe that everyone has a detective story inside them. Our platform empowers users to bring their mystery ideas to life using cutting-edge AI technology. Whether you're a seasoned mystery writer or someone who enjoys solving puzzles, Clue AI provides the tools to create engaging detective experiences.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">How It Works</h2>
            <p className="text-default-500 mb-6">
              Our platform combines Google Gemini's advanced language models with Replicate's image generation capabilities to create immersive detective games. Users can craft their own mysteries by defining suspects, motives, alibis, and plot twists, all enhanced with AI-generated visuals.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Community Features</h2>
            <p className="text-default-500 mb-6">
              Beyond creating your own games, you can explore mysteries crafted by other users in our community. Play, share, and rate games to discover new adventures and showcase your creations.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Technology Stack</h2>
            <p className="text-default-500 mb-6">
              Built with Next.js, HeroUI, TypeScript, and powered by Google Gemini and Replicate APIs, our platform delivers a seamless and modern user experience.
            </p>
            
            <div className="mt-12 pt-6 border-t border-default-200">
              <p className="text-xl font-semibold">
                Made with love by Anirudh Hosur
              </p>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}