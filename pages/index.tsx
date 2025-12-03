import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

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
          <div className="inline-flex items-center justify-center gap-3">
            <h1 className={title()}>ClueAI</h1>
            <SearchIcon className="text-2xl text-primary" />
          </div>

          <h2 className={title({ color: "violet" })}>AI Detective — Solo Case</h2>

          <p className={subtitle({ class: "mt-4 text-muted-foreground" })}>
            Play as a lone detective. Investigate one case at a time, interrogate
            AI-generated suspects, collect evidence, and solve the mystery at your
            own pace.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <SignedIn>
              <Link
                className={buttonStyles({ color: "primary", radius: "full", variant: "shadow" })}
                href="/play/create"
              >
                Create Game
              </Link>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="redirect">
                <button className={buttonStyles({ color: "primary", radius: "full", variant: "shadow" })}>
                  Create Game
                </button>
              </SignInButton>
            </SignedOut>
          </div>
          
          {!userLoading && dbUser && (
            <div className="mt-4 text-sm text-default-500">
              Welcome back! You have <span className="font-bold">{dbUser.credits}</span> credits remaining.
            </div>
          )}
        </section>

        {/* Features / How it works */}
        <section className="mt-12 max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold text-center">How it works</h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg text-center">
              <div className="font-medium">Start a Case</div>
              <p className="text-sm text-muted-foreground mt-2">Pick a mystery and begin your solo investigation.</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="font-medium">Interrogate</div>
              <p className="text-sm text-muted-foreground mt-2">Ask suspects questions and follow the clues.</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="font-medium">Solve</div>
              <p className="text-sm text-muted-foreground mt-2">Vote on the suspect and reveal the mystery.</p>
            </div>
          </div>
        </section>
      </main>
    </DefaultLayout>
  );
}