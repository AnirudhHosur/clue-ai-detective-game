import { useState, useEffect } from "react";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { useUser } from "@clerk/nextjs";
import { HeartFilledIcon, SearchIcon } from "@/components/icons";
import { useUserContext } from "@/contexts/UserContext";

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
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <HeartFilledIcon className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Your Credits</h2>
                <p className="opacity-90">Create amazing AI detective games</p>
              </div>
            </div>
            <div className="bg-white/20 px-6 py-3 rounded-xl">
              <p className="text-3xl font-bold">{dbUser?.credits || 0} Credits</p>
              <p className="text-sm opacity-90">1 credit = 1 game</p>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-3">
            <Button 
              color="secondary" 
              variant="flat" 
              as={Link}
              href="/play/create"
            >
              Create New Game
            </Button>
            <Button 
              color="secondary" 
              variant="flat"
              as={Link}
              href="/pricing"
            >
              Buy More Credits
            </Button>
          </div>
        </div>

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
              <Button 
                color="primary" 
                size="lg"
                as={Link}
                href="/play/create"
              >
                Create Your First Game
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <div 
                  key={game.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {game.generatedImageUrl ? (
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                      <img 
                        src={game.generatedImageUrl} 
                        alt={game.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                        {game.status}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center relative">
                      <div className="text-5xl font-bold text-primary/20">
                        {game.title.charAt(0)}
                      </div>
                      <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                        {game.status}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {game.title}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        {game.genre}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                        {game.tone}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
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
                      <Button 
                        color="primary" 
                        size="sm"
                        as={Link}
                        href={`/view-game/${game.id}`}
                      >
                        View Game
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </DefaultLayout>
  );
}