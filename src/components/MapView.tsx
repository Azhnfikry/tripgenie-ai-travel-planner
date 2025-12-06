interface Location {
  placeName: string;
  lat: number;
  lng: number;
  name: string;
  day: number;
  timeOfDay: string;
}

interface MapViewProps {
  locations: Location[];
}

export function MapView({ locations }: MapViewProps) {
  // For now, we'll show a simple list of locations
  // In a real app, you'd integrate with Google Maps or similar
  
  const groupedByDay = locations.reduce((acc, location) => {
    if (!acc[location.day]) {
      acc[location.day] = [];
    }
    acc[location.day].push(location);
    return acc;
  }, {} as Record<number, Location[]>);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🗺️ Trip Locations</h2>
        <p className="text-gray-600">
          Your itinerary includes {locations.length} locations across {Object.keys(groupedByDay).length} days
        </p>
      </div>

      {/* Map Placeholder */}
      <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center mb-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-gray-600 font-medium">Interactive Map</p>
          <p className="text-sm text-gray-500">
            In a full implementation, this would show an interactive map with all your trip locations
          </p>
        </div>
      </div>

      {/* Location List */}
      <div className="space-y-4">
        {Object.entries(groupedByDay).map(([day, dayLocations]) => (
          <div key={day} className="border rounded-lg p-4">
            <h3 className="font-bold text-lg text-indigo-600 mb-3">Day {day}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dayLocations.map((location, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{location.name}</h4>
                      <p className="text-sm text-gray-600">{location.placeName}</p>
                      <p className="text-xs text-indigo-600 mt-1">{location.timeOfDay}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Pro tip:</strong> You can use these coordinates with your favorite maps app to navigate between locations!
        </p>
      </div>
    </div>
  );
}
