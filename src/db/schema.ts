import { pgTable, serial, varchar, integer, numeric, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const exerciseDefinitions = pgTable('exercise_definitions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const workoutExercises = pgTable('workout_exercises', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseDefinitionId: integer('exercise_definition_id').notNull().references(() => exerciseDefinitions.id),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const sets = pgTable('sets', {
  id: serial('id').primaryKey(),
  workoutExerciseId: integer('workout_exercise_id').notNull().references(() => workoutExercises.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(),
  reps: integer('reps'),
  weight: numeric('weight', { precision: 6, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
