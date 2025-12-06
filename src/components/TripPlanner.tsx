import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

const INTERESTS = [
  "Food & Dining",
  "Shopping",
  "Nature & Outdoors",
  "Culture & History",
  "Nightlife",
  "Museums",
  "Architecture",
  "Adventure Sports",
  "Beaches",
  "Local Markets"
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface TripPlannerProps {
  onTripGenerated: (tripId: Id<"trips">) => void;
}

export function TripPlanner({ onTripGenerated }: TripPlannerProps) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(1000);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelMonth, setTravelMonth] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTrip = useAction(api.trips.generateTrip);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination.trim()) {
      toast.error("Please enter a destination");
      return;
    }

    if (selectedInterests.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await generateTrip({
        destination: destination.trim(),
        days,
        budget,
        interests: selectedInterests,
        travelMonth: travelMonth || undefined,
      });

      toast.success("Trip generated successfully!");
      onTripGenerated(result.tripId);
    } catch (error) {
      console.error("Error generating trip:", error);
      toast.error("Failed to generate trip. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Tokyo, Japan"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            disabled={isGenerating}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Days
            </label>
            <input
              type="number"
              id="days"
              min="1"
              max="14"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              disabled={isGenerating}
            />
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
              Budget (USD)
            </label>
            <input
              type="number"
              id="budget"
              min="100"
              step="50"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value) || 100)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              disabled={isGenerating}
            />
          </div>
        </div>

        <div>
          <label htmlFor="travelMonth" className="block text-sm font-medium text-gray-700 mb-2">
            Travel Month (Optional)
          </label>
          <select
            id="travelMonth"
            value={travelMonth}
            onChange={(e) => setTravelMonth(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            disabled={isGenerating}
          >
            <option value="">Select a month</option>
            {MONTHS.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Interests (Select at least one)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {INTERESTS.map(interest => (
              <label
                key={interest}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedInterests.includes(interest)
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedInterests.includes(interest)}
                  onChange={() => handleInterestToggle(interest)}
                  className="sr-only"
                  disabled={isGenerating}
                />
                <span className="text-sm font-medium">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !destination.trim() || selectedInterests.length === 0}
          className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating Your Perfect Trip...
            </div>
          ) : (
            "✨ Generate My Trip"
          )}
        </button>
      </form>
    </div>
  );
}
