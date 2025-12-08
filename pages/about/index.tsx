import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Link } from "@heroui/link";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import { SearchIcon } from "@/components/icons";

export default function AboutPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-8 py-8 md:py-10">
        <div className="text-center max-w-3xl">
          <motion.div 
            className="inline-flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={title()}>About&nbsp;</h1>
            <SearchIcon className="text-2xl text-primary" />
          </motion.div>
          <motion.h1 
            className={title({ color: "violet" })}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Clue AI Detective Game
          </motion.h1>
          
          <motion.p 
            className="mt-6 text-lg text-default-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            An innovative platform where you can create and play custom detective mysteries powered by artificial intelligence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </CardHeader>
              <CardBody className="py-4">
                <p className="text-default-500">
                  We believe that everyone has a detective story inside them. Our platform empowers users to bring their mystery ideas to life using cutting-edge AI technology. Whether you're a seasoned mystery writer or someone who enjoys solving puzzles, Clue AI provides the tools to create engaging detective experiences.
                </p>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h2 className="text-2xl font-bold">How It Works</h2>
              </CardHeader>
              <CardBody className="py-4">
                <p className="text-default-500">
                  Our platform combines Google Gemini's advanced language models with Replicate's image generation capabilities to create immersive detective games. Users can craft their own mysteries by defining suspects, motives, alibis, and plot twists, all enhanced with AI-generated visuals.
                </p>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h2 className="text-2xl font-bold">Community Features</h2>
              </CardHeader>
              <CardBody className="py-4">
                <p className="text-default-500">
                  Beyond creating your own games, you can explore mysteries crafted by other users in our community. Play, share, and rate games to discover new adventures and showcase your creations.
                </p>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h2 className="text-2xl font-bold">Technology Stack</h2>
              </CardHeader>
              <CardBody className="py-4">
                <p className="text-default-500">
                  Built with Next.js, HeroUI, TypeScript, and powered by Google Gemini and Replicate APIs, our platform delivers a seamless and modern user experience.
                </p>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        <motion.div 
          className="max-w-3xl w-full mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardBody className="text-center py-8">
              <h3 className="text-xl font-bold mb-4">Made with ❤️ by Anirudh Hosur</h3>
              <div className="flex justify-center gap-4">
                <Button 
                  as={Link}
                  isExternal 
                  href="https://www.linkedin.com/in/anirudh-hosur-8b924315b/"
                  color="primary"
                  variant="bordered"
                >
                  LinkedIn
                </Button>
                <Button 
                  as={Link}
                  isExternal 
                  href="https://www.youtube.com/channel/UCfSbPJredtPkBFaWcXifDXw"
                  color="primary"
                  variant="bordered"
                >
                  YouTube
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </section>
    </DefaultLayout>
  );
}