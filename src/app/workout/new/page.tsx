import { getExerciseDefinitions } from "@/data/exercises";
import { CreateWorkoutForm } from "./create-workout-form";

export default async function CreateWorkoutPage() {
  const exerciseDefinitions = await getExerciseDefinitions();

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">New Workout</h1>
      <CreateWorkoutForm exerciseDefinitions={exerciseDefinitions} />
    </div>
  );
}
