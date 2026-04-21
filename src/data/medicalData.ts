// src/data/medicalData.ts

export type HealthStatus = 'good' | 'average' | 'poor' | 'normal' | 'warning' | 'danger';

export interface HistoryRow {
  date: string;
  time: string;
  value: string;
  status: HealthStatus;
}

export const analyzeBPM = (bpm: number) => {
  if (bpm > 100) {
    return {
      status: 'poor' as HealthStatus,
      condition: 'Tachycardia / Hypertension',
      symptoms: ['Rapid heartbeat', 'Dizziness', 'Shortness of breath'],
      diet: ['Low sodium', 'Omega-3 (walnuts, flaxseed)', 'Hydration'],
    };
  } else if (bpm < 60) {
    return {
      status: 'poor' as HealthStatus,
      condition: 'Bradycardia',
      symptoms: ['Fatigue', 'Dizziness', 'Fainting'],
      diet: ['Balanced electrolytes', 'Iron-rich foods'],
    };
  } else {
    // Normal is 60-100. Let's say 60-90 is good, 91-100 is average (monitoring).
    if (bpm > 90) {
      return {
        status: 'average' as HealthStatus,
        condition: 'Elevated Heart Rate',
        symptoms: ['Mild palpitation risk', 'Stress response'],
        diet: ['Reduce caffeine', 'Magnesium-rich foods'],
      };
    }
    return {
      status: 'good' as HealthStatus,
      condition: 'Healthy Cardiovascular Rhythm',
      symptoms: ['None detected'],
      diet: ['Balanced potassium (bananas)', 'Magnesium', 'Regular cardio'],
    };
  }
};

export const analyzeTemp = (temp: number) => {
  if (temp > 100) { // 100 F ~ 37.8 C
    return {
      status: 'danger' as HealthStatus,
      condition: 'Fever / Hyperthermia',
      symptoms: ['Chills', 'Sweating', 'Headache', 'Muscle aches'],
      diet: ['Fluids (electrolytes)', 'Light soups', 'Vitamin C'],
    };
  } else if (temp < 97.5) {
    return {
      status: 'danger' as HealthStatus,
      condition: 'Hypothermia Risk',
      symptoms: ['Shivering', 'Fatigue', 'Confusion'],
      diet: ['Warm fluids', 'High-energy foods'],
    };
  } else if (temp > 99.0 && temp <= 100) {
    return {
      status: 'warning' as HealthStatus,
      condition: 'Elevated Core Temperature',
      symptoms: ['Mild warmth', 'Possible inflammation'],
      diet: ['Increased hydration', 'Rest'],
    };
  } else {
    return {
      status: 'normal' as HealthStatus,
      condition: 'Optimal Core Temperature',
      symptoms: ['None detected'],
      diet: ['Maintain hydration', 'Zinc-rich foods'],
    };
  }
};

