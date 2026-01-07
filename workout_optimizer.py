import random

workouts = {
  "push": ["Push-ups", "Pike push-ups"],
  "legs": ["Squats", "Wall sit"],
  "core": ["Plank", "Dead bug"]
}

plan = []
for k, v in workouts.items():
    plan.append(random.choice(v))

print("Today's optimized workout:")
for w in plan:
    print("-", w)
