import fs from "fs/promises";
import path from "path";
import type { Feedback } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "feedback.json");

// TODO: Implement getAllFeedback
// Read the JSON file at DATA_PATH and return the parsed array.
export async function getAllFeedback(): Promise<Feedback[]> {
  try {
    const data = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(data) as Feedback[];
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

// TODO: Implement getFeedbackById
// Find a single entry by its id, or return undefined.
export async function getFeedbackById(
  id: string
): Promise<Feedback | undefined> {
  const feedbacks = await getAllFeedback();
  return feedbacks.find((item) => item.id === id);
}

// TODO: Implement addFeedback
// Generate an id and createdAt, append the entry to the file, return it.
export async function addFeedback(
  entry: Omit<Feedback, "id" | "createdAt">
): Promise<Feedback> {
  const feedbacks = await getAllFeedback();

  // Find the next sequential ID suffix from existing IDs (e.g. fb-010 -> fb-011)
  let nextNum = 1;
  for (const fb of feedbacks) {
    if (fb.id && fb.id.startsWith("fb-")) {
      const numPart = fb.id.substring(3);
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed) && parsed >= nextNum) {
        nextNum = parsed + 1;
      }
    }
  }

  const id = `fb-${String(nextNum).padStart(3, "0")}`;
  const createdAt = new Date().toISOString();

  const newFeedback: Feedback = {
    id,
    courseSlug: entry.courseSlug,
    lessonSlug: entry.lessonSlug,
    rating: entry.rating,
    comment: entry.comment,
    author: entry.author,
    createdAt,
  };

  feedbacks.push(newFeedback);

  await fs.writeFile(DATA_PATH, JSON.stringify(feedbacks, null, 2), "utf-8");

  return newFeedback;
}
