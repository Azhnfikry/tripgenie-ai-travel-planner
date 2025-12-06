import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { MapView } from "./MapView";

interface TripViewProps {
  tripId: Id<"trips">;
  onBack: () => void;
}

export function TripView({ tripId, onBack }: TripViewProps) {
  const trip = useQuery(api.trips.getTrip, { tripId });
  const [activeView, setActiveView] = useState<"itinerary" | "map">("itinerary");

  if (trip === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (trip === null) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Trip not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to planner
        </button>
      </div>
    );
  }

  const allLocations = trip.dailyPlan.flatMap(day => 
    day.activities
      .filter(activity => activity.location)
      .map(activity => ({
        ...activity.location!,
        name: activity.name,
        day: day.day,
        timeOfDay: activity.timeOfDay,
      }))
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
          >
            ← Back to planner
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView("itinerary")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === "itinerary"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📋 Itinerary
            </button>
            <button
              onClick={() => setActiveView("map")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === "map"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🗺️ Map
            </button>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.destination}</h1>
          <div className="flex justify-center gap-6 text-gray-600">
            <span className="flex items-center gap-1">
              📅 {trip.days} days
            </span>
            <span className="flex items-center gap-1">
              💰 ${trip.totalEstimatedCost} {trip.currency}
            </span>
            <span className="flex items-center gap-1">
              📍 {allLocations.length} locations
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeView === "itinerary" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Itinerary */}
          <div className="lg:col-span-2 space-y-4">
            {trip.dailyPlan.map((day) => (
              <div key={day.day} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-indigo-600 text-white p-4">
                  <h2 className="text-xl font-bold">Day {day.day}</h2>
                  <p className="text-indigo-100">{day.title}</p>
                  <p className="text-sm text-indigo-200">Budget: ${day.estimatedCost}</p>
                </div>
                
                <div className="p-4 space-y-4">
                  {day.activities.map((activity, index) => (
                    <div key={index} className="border-l-4 border-indigo-200 pl-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                              {activity.timeOfDay}
                            </span>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {activity.category}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900">{activity.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                          {activity.location && (
                            <p className="text-xs text-gray-500 mt-1">📍 {activity.location.placeName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-green-600">${activity.estimatedCost}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Budget Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Budget:</span>
                  <span className="font-semibold">${trip.totalEstimatedCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Per Day:</span>
                  <span className="font-semibold">${Math.round(trip.totalEstimatedCost / trip.days)}</span>
                </div>
                <hr />
                {trip.dailyPlan.map((day) => (
                  <div key={day.day} className="flex justify-between text-sm">
                    <span className="text-gray-500">Day {day.day}:</span>
                    <span>${day.estimatedCost}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Packing Tips */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🎒 Packing Tips</h3>
              <ul className="space-y-2">
                {trip.packingTips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <MapView locations={allLocations} />
      )}
    </div>
  );
}
