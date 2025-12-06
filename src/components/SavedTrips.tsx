import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface SavedTripsProps {
  onViewTrip: (tripId: Id<"trips">) => void;
}

export function SavedTrips({ onViewTrip }: SavedTripsProps) {
  const trips = useQuery(api.trips.getAllTrips);

  if (trips === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✈️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No trips yet</h2>
        <p className="text-gray-600">Start planning your first adventure!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Saved Trips</h1>
        <p className="text-gray-600">Click on any trip to view the full itinerary</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <div
            key={trip._id}
            onClick={() => onViewTrip(trip._id)}
            className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
              <h3 className="text-lg font-bold">{trip.destination}</h3>
              <p className="text-indigo-100 text-sm">
                {new Date(trip.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">📅 {trip.days} days</span>
                <span className="text-sm font-semibold text-green-600">
                  ${trip.totalEstimatedCost}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <strong>Highlights:</strong>
                </div>
                <ul className="text-xs text-gray-500 space-y-1">
                  {trip.dailyPlan.slice(0, 2).map((day, index) => (
                    <li key={index} className="truncate">
                      • Day {day.day}: {day.title}
                    </li>
                  ))}
                  {trip.dailyPlan.length > 2 && (
                    <li className="text-indigo-600">
                      + {trip.dailyPlan.length - 2} more days...
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
