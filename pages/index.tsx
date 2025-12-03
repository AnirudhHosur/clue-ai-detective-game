import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import { motion } from "framer-motion";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { GithubIcon, SearchIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import { useUserContext } from "@/contexts/UserContext";

export default function IndexPage() {
  const { user: dbUser, isLoading: userLoading } = useUserContext();

  return (
    <DefaultLayout>
      <main className="container mx-auto px-6 py-12">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto">
          <motion.div 
            className="inline-flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={title()}>ClueAI</h1>
            <SearchIcon className="text-2xl text-primary" />
          </motion.div>

          <motion.h2 
            className={title({ color: "violet" })}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            AI Detective — Solo Case
          </motion.h2>

          <motion.p 
            className={subtitle({ class: "mt-4 text-muted-foreground" })}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Play as a lone detective. Investigate one case at a time, interrogate
            AI-generated suspects, collect evidence, and solve the mystery at your
            own pace.
          </motion.p>

          <motion.div 
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SignedIn>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  className={buttonStyles({ color: "secondary", radius: "full", variant: "shadow", size: "lg" })}
                  href="/play/create"
                >
                  Create Game
                </Link>
              </motion.div>
            </SignedIn>

            <SignedOut>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <SignInButton mode="redirect">
                  <button className={buttonStyles({ color: "secondary", radius: "full", variant: "shadow", size: "lg" })}>
                    Create Game
                  </button>
                </SignInButton>
              </motion.div>
            </SignedOut>
          </motion.div>
          
          {!userLoading && dbUser && (
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-sm text-default-500">
                Welcome back! You have <span className="font-bold text-purple-600 dark:text-purple-400">{dbUser.credits}</span> credits remaining.
              </div>
              {dbUser.credits <= 0 && (
                <motion.div 
                  className="mt-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link 
                    href="/pricing" 
                    className={buttonStyles({ color: "success", radius: "full", variant: "shadow", size: "sm" })}
                  >
                    Buy More Credits
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </section>

        {/* Features / How it works */}
        <motion.section 
          className="mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-semibold text-center">How it works</h3>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="p-6 border rounded-xl text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-xl">1</span>
              </div>
              <div className="font-medium">Start a Case</div>
              <p className="text-sm text-muted-foreground mt-2">Pick a mystery and begin your solo investigation.</p>
            </motion.div>
            
            <motion.div 
              className="p-6 border rounded-xl text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-xl">2</span>
              </div>
              <div className="font-medium">Interrogate</div>
              <p className="text-sm text-muted-foreground mt-2">Ask suspects questions and follow the clues.</p>
            </motion.div>
            
            <motion.div 
              className="p-6 border rounded-xl text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-xl">3</span>
              </div>
              <div className="font-medium">Solve</div>
              <p className="text-sm text-muted-foreground mt-2">Vote on the suspect and reveal the mystery.</p>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </DefaultLayout>
  );
}