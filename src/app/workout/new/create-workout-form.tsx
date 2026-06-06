"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { createWorkout, type ExerciseInput } from "./actions";

type ExerciseDefinition = {
  id: number;
  name: string;
};

type SetRow = { reps: string; weight: string };
type ExerciseRow = { exerciseDefinitionId: string; sets: SetRow[] };

function emptySet(): SetRow {
  return { reps: "", weight: "" };
}

function emptyExercise(): ExerciseRow {
  return { exerciseDefinitionId: "", sets: [emptySet()] };
}

export function CreateWorkoutForm({
  exerciseDefinitions,
}: {
  exerciseDefinitions: ExerciseDefinition[];
}) {
  const [exercises, setExercises] = useState<ExerciseRow[]>([emptyExercise()]);
  const [pending, setPending] = useState(false);

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(i: number) {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addSet(exIdx: number) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: [...ex.sets, emptySet()] } : ex
      )
    );
  }

  function removeSet(exIdx: number, setIdx: number) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) }
          : ex
      )
    );
  }

  function updateExerciseId(exIdx: number, value: string) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, exerciseDefinitionId: value } : ex
      )
    );
  }

  function updateSet(exIdx: number, setIdx: number, field: keyof SetRow, value: string) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si === setIdx ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const payload: ExerciseInput[] = exercises
      .filter((ex) => ex.exerciseDefinitionId !== "")
      .map((ex) => ({
        exerciseDefinitionId: parseInt(ex.exerciseDefinitionId),
        sets: ex.sets.map((s) => ({
          reps: parseInt(s.reps) || 0,
          weight: s.weight,
        })),
      }));

    await createWorkout(new Date(), payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {exercises.map((ex, exIdx) => (
        <Card key={exIdx}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Exercise {exIdx + 1}</CardTitle>
              {exercises.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExercise(exIdx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Exercise</Label>
              <Select
                value={ex.exerciseDefinitionId}
                onValueChange={(v) => updateExerciseId(exIdx, v ?? "")}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseDefinitions.map((def) => (
                    <SelectItem key={def.id} value={String(def.id)}>
                      {def.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-sm text-muted-foreground font-medium">
                <span>Reps</span>
                <span>Weight (kg)</span>
                <span />
              </div>

              {ex.sets.map((s, setIdx) => (
                <div key={setIdx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={s.reps}
                    onChange={(e) => updateSet(exIdx, setIdx, "reps", e.target.value)}
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.25"
                    placeholder="0"
                    value={s.weight}
                    onChange={(e) => updateSet(exIdx, setIdx, "weight", e.target.value)}
                  />
                  {ex.sets.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSet(exIdx, setIdx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="w-9" />
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => addSet(exIdx)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Set
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={addExercise}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Exercise
      </Button>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save Workout"}
      </Button>
    </form>
  );
}
