import { redirect } from "next/navigation";

export type ParamsType = {
  courseId: string;
};

export default function CreateCourseRedirectPage({
  params,
}: {
  params: ParamsType;
}) {
  redirect(`/course/${params.courseId}`);
}
