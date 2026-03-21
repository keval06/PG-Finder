import LandingPage from "./components/LandingPage";
//  React Server Component
// No "use client" → Server Component. It does nothing interactive — just renders LandingPage.import LandingPage from "./components/LandingPage";



export default function RootPage() {
  return <LandingPage />;
}