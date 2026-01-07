import json
from collections import defaultdict

with open("export.json") as f:
    data = json.load(f)

habits = defaultdict(int)
days = 0

for day, entry in data["entries"].items():
    days += 1
    for h, done in entry["done"].items():
        if done:
            habits[h] += 1

print("=== DISCIPLINE REPORT ===")
for h, count in habits.items():
    print(f"{h}: {round((count/days)*100, 1)}% consistency")
