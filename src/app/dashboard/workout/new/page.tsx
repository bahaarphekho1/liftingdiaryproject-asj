import { parseISO, startOfDay } from "date-fns";
import NewWorkoutForm from "./form";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const initialDate = dateParam ? startOfDay(parseISO(dateParam)) : startOfDay(new Date());

  return <NewWorkoutForm initialDate={initialDate} />;
}
