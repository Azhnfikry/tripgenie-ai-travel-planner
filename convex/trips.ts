import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import OpenAI from "openai";

export const generateTrip = action({
  args: {
    destination: v.string(),
    days: v.number(),
    budget: v.number(),
    interests: v.array(v.string()),
    travelMonth: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ tripId: any; tripData: any }> => {
    const { destination, days, budget, interests, travelMonth } = args;
    
    // Create a structured prompt for the AI
    const prompt = `You are a professional travel planner. Create a detailed ${days}-day itinerary for ${destination} with a budget of approximately $${budget} USD.

Travel preferences: ${interests.join(", ")}
${travelMonth ? `Travel month: ${travelMonth}` : ""}

Please respond with a valid JSON object in this exact format:
{
  "destination": "${destination}",
  "days": ${days},
  "total_estimated_cost": number,
  "currency": "USD",
  "daily_plan": [
    {
      "day": 1,
      "title": "Day title",
      "estimated_cost": number,
      "activities": [
        {
          "time_of_day": "morning|afternoon|evening",
          "name": "Activity name",
          "description": "Brief description",
          "category": "food|sightseeing|shopping|culture|nature|nightlife",
          "estimated_cost": number,
          "location": {
            "place_name": "Specific place name",
            "lat": latitude_number,
            "lng": longitude_number
          }
        }
      ]
    }
  ],
  "packing_tips": ["tip1", "tip2", "tip3"]
}

Important:
- Include 3-5 activities per day
- Provide realistic cost estimates in USD
- Include accurate coordinates for major attractions
- Keep total cost within 20% of the budget
- Include diverse activities based on interests
- Provide practical packing tips for the destination and season`;

    try {
      // Use the bundled OpenAI API
      const openai = new OpenAI({
        baseURL: process.env.CONVEX_OPENAI_BASE_URL,
        apiKey: process.env.CONVEX_OPENAI_API_KEY,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional travel planner. Always respond with valid JSON only, no additional text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      });

      if (!response.choices[0]?.message?.content) {
        throw new Error("No content in OpenAI response");
      }

      const content = response.choices[0].message.content;
      
      // Parse the JSON response
      let tripData;
      try {
        tripData = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse AI response:", content);
        throw new Error("Invalid response format from AI");
      }

      // Save the trip to the database
      const userId = await getAuthUserId(ctx);
      const tripId: any = await ctx.runMutation(api.trips.saveTrip, {
        destination: tripData.destination,
        days: tripData.days,
        currency: tripData.currency,
        totalEstimatedCost: tripData.total_estimated_cost,
        dailyPlan: tripData.daily_plan.map((day: any) => ({
          day: day.day,
          title: day.title,
          estimatedCost: day.estimated_cost,
          activities: day.activities.map((activity: any) => ({
            timeOfDay: activity.time_of_day,
            name: activity.name,
            description: activity.description,
            category: activity.category,
            estimatedCost: activity.estimated_cost,
            location: activity.location ? {
              placeName: activity.location.place_name,
              lat: activity.location.lat,
              lng: activity.location.lng,
            } : undefined,
          })),
        })),
        packingTips: tripData.packing_tips || [],
        userId: userId || undefined,
        createdAt: Date.now(),
      });

      return { tripId, tripData };
    } catch (error) {
      console.error("Error generating trip:", error);
      throw new Error("Failed to generate trip. Please try again.");
    }
  },
});

export const saveTrip = mutation({
  args: {
    destination: v.string(),
    days: v.number(),
    totalEstimatedCost: v.number(),
    currency: v.string(),
    dailyPlan: v.array(v.object({
      day: v.number(),
      title: v.string(),
      estimatedCost: v.number(),
      activities: v.array(v.object({
        timeOfDay: v.string(),
        name: v.string(),
        description: v.string(),
        category: v.string(),
        estimatedCost: v.number(),
        location: v.optional(v.object({
          placeName: v.string(),
          lat: v.number(),
          lng: v.number(),
        })),
      })),
    })),
    packingTips: v.array(v.string()),
    userId: v.optional(v.id("users")),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("trips", {
      destination: args.destination,
      days: args.days,
      budget: 0, // We'll calculate this from totalEstimatedCost
      currency: args.currency,
      interests: [], // We'll add this later if needed
      totalEstimatedCost: args.totalEstimatedCost,
      dailyPlan: args.dailyPlan.map(day => ({
        day: day.day,
        title: day.title,
        estimatedCost: day.estimatedCost,
        activities: day.activities.map(activity => ({
          timeOfDay: activity.timeOfDay,
          name: activity.name,
          description: activity.description,
          category: activity.category,
          estimatedCost: activity.estimatedCost,
          location: activity.location ? {
            placeName: activity.location.placeName,
            lat: activity.location.lat,
            lng: activity.location.lng,
          } : undefined,
        })),
      })),
      packingTips: args.packingTips,
      userId: args.userId,
      createdAt: args.createdAt,
    });
  },
});

export const getTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tripId);
  },
});

export const getUserTrips = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    
    return await ctx.db
      .query("trips")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getAllTrips = query({
  args: {},
  handler: async (ctx) => {
    // For demo purposes, show all trips if user is not logged in
    const userId = await getAuthUserId(ctx);
    if (userId) {
      return await ctx.db
        .query("trips")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
    } else {
      // Show recent trips for demo
      return await ctx.db
        .query("trips")
        .order("desc")
        .take(10);
    }
  },
});
