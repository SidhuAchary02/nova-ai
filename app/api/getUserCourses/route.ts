import { NextResponse } from "next/server";
import { getUserCoursesServer } from "@/app/actions/getUserCourses";

export async function POST(req: Request) {
  const { email } = await req.json();
  const courses = await getUserCoursesServer(email);
  return NextResponse.json(courses);
}
