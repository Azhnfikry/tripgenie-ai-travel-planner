import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { TripPlanner } from "./components/TripPlanner";
import { useState } from "react";
import { TripView } from "./components/TripView";
import { SavedTrips } from "./components/SavedTrips";
import { Id } from "../convex/_generated/dataModel";

type View = "planner" | "trip" | "saved";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("planner");
  const [currentTripId, setCurrentTripId] = useState<Id<"trips"> | null>(null);

  const handleTripGenerated = (tripId: Id<"trips">) => {
    setCurrentTripId(tripId);
    setCurrentView("trip");
  };

  const handleViewTrip = (tripId: Id<"trips">) => {
    setCurrentTripId(tripId);
    setCurrentView("trip");
  };

  return (
    <>
      <Unauthenticated>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
          <AuthPage />
        </div>
      </Unauthenticated>
      <Authenticated>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-indigo-600">🧞‍♂️ TripGenie</h2>
              <nav className="flex gap-2">
                <button
                  onClick={() => setCurrentView("planner")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentView === "planner"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:text-indigo-600"
                  }`}
                >
                  Plan Trip
                </button>
                <button
                  onClick={() => setCurrentView("saved")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentView === "saved"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:text-indigo-600"
                  }`}
                >
                  Saved Trips
                </button>
              </nav>
            </div>
            <SignOutButton />
          </header>
          
          <main className="flex-1 p-4">
            <Content 
              currentView={currentView}
              currentTripId={currentTripId}
              onTripGenerated={handleTripGenerated}
              onViewTrip={handleViewTrip}
              onBackToPlanner={() => setCurrentView("planner")}
            />
          </main>
          <Toaster />
        </div>
      </Authenticated>
    </>
  );
}

function AuthPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2">🧞‍♂️</h1>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">TripGenie</h2>
          <p className="text-gray-600 text-lg">Your AI Travel Planning Assistant</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <p className="text-center text-gray-700 mb-6 font-medium">
            Sign in or create an account to get started
          </p>
          <SignInForm />
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Plan amazing trips with personalized AI itineraries
        </p>
      </div>
    </div>
  );
}

function Content({ 
  currentView, 
  currentTripId, 
  onTripGenerated, 
  onViewTrip, 
  onBackToPlanner 
}: {
  currentView: View;
  currentTripId: Id<"trips"> | null;
  onTripGenerated: (tripId: Id<"trips">) => void;
  onViewTrip: (tripId: Id<"trips">) => void;
  onBackToPlanner: () => void;
}) {
  if (currentView === "trip" && currentTripId) {
    return <TripView tripId={currentTripId} onBack={onBackToPlanner} />;
  }

  if (currentView === "saved") {
    return <SavedTrips onViewTrip={onViewTrip} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI-Powered Travel Planning
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Tell us your dream destination and let our AI create the perfect itinerary for you
        </p>
      </div>

      <TripPlanner onTripGenerated={onTripGenerated} />
    </div>
  );
}
