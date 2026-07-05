import { NextRequest, NextResponse } from "next/server";
import { getAllFeedback, addFeedback } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const courseSlug = searchParams.get("courseSlug");
  const lessonSlug = searchParams.get("lessonSlug");
  const minRatingStr = searchParams.get("minRating");

  let feedbacks = await getAllFeedback();

  if (courseSlug) {
    feedbacks = feedbacks.filter((fb) => fb.courseSlug === courseSlug);
  }
  if (lessonSlug) {
    feedbacks = feedbacks.filter((fb) => fb.lessonSlug === lessonSlug);
  }
  if (minRatingStr) {
    const minRating = parseInt(minRatingStr, 10);
    if (!isNaN(minRating)) {
      feedbacks = feedbacks.filter((fb) => fb.rating >= minRating);
    }
  }

  return NextResponse.json(feedbacks);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseSlug, lessonSlug, rating, comment, author } = body;

    if (typeof courseSlug !== "string" || courseSlug.trim() === "") {
      return NextResponse.json(
        { error: "Field 'courseSlug' is required and must be a non-empty string" },
        { status: 400 }
      );
    }
    if (typeof lessonSlug !== "string" || lessonSlug.trim() === "") {
      return NextResponse.json(
        { error: "Field 'lessonSlug' is required and must be a non-empty string" },
        { status: 400 }
      );
    }
    if (typeof author !== "string" || author.trim() === "") {
      return NextResponse.json(
        { error: "Field 'author' is required and must be a non-empty string" },
        { status: 400 }
      );
    }
    if (typeof comment !== "string" || comment.trim() === "") {
      return NextResponse.json(
        { error: "Field 'comment' is required and must be a non-empty string" },
        { status: 400 }
      );
    }
    if (typeof rating !== "number") {
      return NextResponse.json(
        { error: "Field 'rating' is required and must be a number" },
        { status: 400 }
      );
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Field 'rating' must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    const newFeedback = await addFeedback({
      courseSlug,
      lessonSlug,
      rating,
      comment,
      author,
    });

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid JSON format in request body" },
      { status: 400 }
    );
  }
}
