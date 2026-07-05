import { NextRequest, NextResponse } from "next/server";
import { getAllFeedback } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const courseSlugFilter = searchParams.get("courseSlug");

  let feedbacks = await getAllFeedback();

  if (courseSlugFilter) {
    feedbacks = feedbacks.filter((fb) => fb.courseSlug === courseSlugFilter);
  }

  const totalEntries = feedbacks.length;
  const sumRatings = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
  const averageRating = totalEntries > 0 ? Math.round((sumRatings / totalEntries) * 10) / 10 : 0;

  const ratingDistribution = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };

  for (const fb of feedbacks) {
    const ratingKey = String(fb.rating) as keyof typeof ratingDistribution;
    if (ratingKey in ratingDistribution) {
      ratingDistribution[ratingKey]++;
    }
  }

  const courseMap = new Map<string, { total: number; sum: number }>();
  for (const fb of feedbacks) {
    const current = courseMap.get(fb.courseSlug) || { total: 0, sum: 0 };
    current.total += 1;
    current.sum += fb.rating;
    courseMap.set(fb.courseSlug, current);
  }

  const courses = Array.from(courseMap.entries()).map(([courseSlug, data]) => ({
    courseSlug,
    totalEntries: data.total,
    averageRating: Math.round((data.sum / data.total) * 10) / 10,
  }));

  return NextResponse.json({
    totalEntries,
    averageRating,
    ratingDistribution,
    courses,
  });
}
