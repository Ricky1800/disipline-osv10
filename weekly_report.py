def grade(score):
    if score >= 0.85: return "A"
    if score >= 0.7: return "B"
    if score >= 0.55: return "C"
    return "D"

scores = [0.6, 0.7, 0.8, 0.9, 0.65]  # example

avg = sum(scores)/len(scores)
print("Weekly Grade:", grade(avg))
