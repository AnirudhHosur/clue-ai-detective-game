import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import { motion } from "framer-motion";
import { 
  Card, 
  CardBody, 
  CardFooter, 
  CardHeader
} from "@heroui/card";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { HeartFilledIcon } from "@/components/icons";

interface Game {
  id: number;
  title: string;
  genre: string;
  tone: string;
  difficulty: string;
  imageUrl: string | null; // This will now be the Firebase URL
  createdAt: Date;
  username: string | null;
  userEmail: string;
}

const ITEMS_PER_PAGE = 8;

export default function ExplorePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/getAllGames");
      
      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }
      
      const data = await response.json();
      setGames(data.games || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching games:", err);
      setError("Failed to load games. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(games.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGames = games.slice(startIndex, endIndex);

  const handlePlayGame = (gameId: number) => {
    router.push(`/view-game/${gameId}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-8 py-8 md:py-10">
        <div className="text-center max-w-3xl">
          <motion.h1 
            className={title()}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Explore&nbsp;
          </motion.h1>
          <motion.h1 
            className={title({ color: "violet" })}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Community Games
          </motion.h1>
          <motion.p 
            className="mt-4 text-lg text-default-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Discover and play amazing detective games created by our community
          </motion.p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <Card className="max-w-2xl w-full">
            <CardBody className="text-center">
              <p className="text-danger">{error}</p>
              <Button 
                className="mt-4" 
                color="primary" 
                onClick={fetchGames}
              >
                Try Again
              </Button>
            </CardBody>
          </Card>
        ) : games.length === 0 ? (
          <Card className="max-w-2xl w-full">
            <CardBody className="text-center">
              <p className="text-default-500">No games available yet. Be the first to create one!</p>
              <Button 
                className="mt-4" 
                color="primary" 
                onClick={() => router.push("/play/create")}
              >
                Create Your First Game
              </Button>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl">
              {currentGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                      <div className="flex justify-between w-full items-start">
                        <div>
                          <h4 className="font-bold text-large line-clamp-1">{game.title}</h4>
                          <small className="text-default-500">
                            by {game.username || game.userEmail.split('@')[0]}
                          </small>
                        </div>
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="light"
                          aria-label="Favorite"
                        >
                          <HeartFilledIcon className="text-danger" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                      <div className="relative">
                        {game.imageUrl ? (
                          <div className="object-cover rounded-xl w-full h-48 overflow-hidden">
                            <Image
                              alt={game.title}
                              className="object-cover rounded-xl w-full h-48"
                              src={game.imageUrl}
                              width={300}
                              height={200}
                              unoptimized={true}
                            />
                          </div>
                        ) : (
                          <div className="bg-default-100 rounded-xl w-full h-48 flex items-center justify-center">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                          </div>
                        )}

                        <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full capitalize ${getDifficultyColor(game.difficulty)}`}>
                          {game.difficulty}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 mt-4 flex-wrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                          {game.genre}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
                          {game.tone}
                        </span>
                      </div>
                      
                      <p className="text-tiny text-default-500 mt-2">
                        Created {formatDate(game.createdAt.toString())}
                      </p>
                    </CardBody>
                    <CardFooter className="justify-between">
                      <Button 
                        color="primary" 
                        onClick={() => handlePlayGame(game.id)}
                        size="sm"
                      >
                        Play Game
                      </Button>
                      <div className="flex gap-1">
                        <Button size="sm" variant="light">
                          <HeartFilledIcon className="text-danger" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? "solid" : "light"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </DefaultLayout>
  );
}