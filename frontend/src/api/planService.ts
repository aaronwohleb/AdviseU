import type { PlanRequestPayload } from '../dtos/PlanRequest.dto';

export const generateSchedulePlan = async (payload: PlanRequestPayload) => {
  try {
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to generate plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting plan:', error);
    throw error;
  }
};