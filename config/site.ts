export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "ClueAI AI Detective Game",
  description: "Multiplayer web game where you team up with friends to solve mysteries by interrogating AI suspects.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Create Game",
      href: "/play/create",
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
