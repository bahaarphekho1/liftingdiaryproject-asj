import { notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import EditWorkoutForm from "./form";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  const id = parseInt(workoutId, 10);
  if (isNaN(id)) notFound();

  const workout = await getWorkoutById(id);
  if (!workout) notFound();

  return <EditWorkoutForm workoutId={id} initialDate={workout.startedAt} />;
}
