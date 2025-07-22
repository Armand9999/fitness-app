export function calculateTDE(weight: number, height: number, age: number, gender: string, activity: string): number {
  // Input validation
  if (weight <= 0 || height <= 0 || age <= 0) {
    throw new Error('Weight, height, and age must be positive numbers');
  }
  if (gender !== 'male' && gender !== 'female') {
    throw new Error('Gender must be either "male" or "female"');
  }
  if (!['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'].includes(activity)) {
    throw new Error('Invalid activity level');
  }

  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161


  const activityMultiplier: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  }

  return Math.round(bmr * (activityMultiplier[activity] || 1.2))
}
