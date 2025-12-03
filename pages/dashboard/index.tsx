import { useState, useEffect } from "react";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { useUser } from "@clerk/nextjs";
import { HeartFilledIcon, SearchIcon } from "@/components/icons";
import { useUserContext } from "@/contexts/UserContext";
import { motion } from "framer-motion";

// Define the Game type based on our schema
interface Game {
  id: number;
  userId: string;
  title: string;
  genre: string;
  tone: string;
  mainCharacters: Array<{ name: string; role: string; traits: string }>;
  plotSeed: string;
  difficulty: string;
  status: string;
  createdAt: string;
  premise?: string;
  setting?: any;
  chapters?: Array<any>;
  possibleEndings?: Array<any>;
  generatedImageUrl?: string;
}

export default function Dashboard() {
  const { user: clerkUser, isLoaded } = useUser();
  const { user: dbUser, isLoading: userLoading } = useUserContext();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's games
  useEffect(() => {
    if (!isLoaded || userLoading) return;

    const fetchGames = async () => {
      try {
        const response = await fetch("/api/getUserGames");
        if (response.ok) {
          const data = await response.json();
          setGames(data.games || []);
        } else {
          console.error("Failed to fetch games");
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [isLoaded, userLoading]);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-8 py-8 md:py-10">
        {/* Credits Banner */}
        <motion.div 
          className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full">
                <HeartFilledIcon className="text-3xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Your Credits</h2>
                <p className="opacity-90">Create amazing AI detective games</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/20 px-8 py-4 rounded-xl mb-2">
                <p className="text-4xl font-bold">{dbUser?.credits || 0}</p>
              </div>
              <p className="text-sm opacity-90">credits available</p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                color="secondary" 
                variant="shadow" 
                size="lg"
                as={Link}
                href="/play/create"
                isDisabled={!dbUser || dbUser.credits <= 0}
                className="font-bold px-6"
              >
                Create New Game
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                color="success" 
                variant="shadow"
                size="lg"
                as={Link}
                href="/pricing"
                className="font-bold px-6 bg-gradient-to-r from-green-500 to-emerald-600"
              >
                Buy More Credits
              </Button>
            </motion.div>
          </div>
          
          {(!dbUser || dbUser.credits <= 0) && (
            <motion.div 
              className="mt-4 text-yellow-200 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p>You don't have enough credits to create a new game. Please purchase more credits.</p>
            </motion.div>
          )}
        </motion.div>

        {/* Games Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className={title()}>Your Detective Games</h1>
            <p className="text-default-500">{games.length} games</p>
          </div>

          {loading || userLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="mx-auto text-4xl text-default-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No games yet</h3>
              <p className="text-default-500 mb-6">Create your first AI detective game to get started</p>
              
              {(!dbUser || dbUser.credits <= 0) ? (
                <div className="flex flex-col items-center gap-4">
                  <Button 
                    color="primary" 
                    size="lg"
                    as={Link}
                    href="/play/create"
                    isDisabled
                    className="font-bold"
                  >
                    Create Your First Game
                  </Button>
                  <Button 
                    color="success" 
                    variant="shadow"
                    as={Link}
                    href="/pricing"
                    className="font-bold bg-gradient-to-r from-green-500 to-emerald-600"
                  >
                    Buy More Credits
                  </Button>
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    color="primary" 
                    size="lg"
                    as={Link}
                    href="/play/create"
                    className="font-bold px-8 py-6 text-lg"
                  >
                    Create Your First Game
                  </Button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <motion.div
                  key={game.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {game.generatedImageUrl ? (
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                      <img 
                        src={game.generatedImageUrl} 
                        alt={game.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {game.status}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 flex items-center justify-center relative">
                      <div className="text-6xl font-bold text-purple-300 dark:text-purple-700">
                        {game.title.charAt(0)}
                      </div>
                      <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {game.status}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                        {game.title}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                        {game.genre}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
                        {game.tone}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        {game.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-default-500 text-sm mb-4 line-clamp-2">
                      {game.premise || game.plotSeed}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-default-400">
                        {new Date(game.createdAt).toLocaleDateString()}
                      </span>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          color="primary" 
                          size="sm"
                          as={Link}
                          href={`/view-game/${game.id}`}
                          className="font-medium"
                        >
                          View Game
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </DefaultLayout>
  );
}