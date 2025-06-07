import { DataType } from '../types';
import { addHours, subHours, subDays, format } from 'date-fns';

// Generate historical data points
const generateHistoricalPoints = (
  days: number,
  baseValue: number,
  variance: number
) => {
  const points = [];
  const now = new Date();
  const interval = days === 1 ? 1 : days === 7 ? 4 : 24; // Hours per interval
  const totalPoints = (24 * days) / interval;

  for (let i = 0; i < totalPoints; i++) {
    const timestamp = format(
      subHours(now, i * interval),
      "yyyy-MM-dd'T'HH:mm:ss'Z'"
    );
    const randomVariance = Math.random() * variance * 2 - variance;
    points.push({
      timestamp,
      value: baseValue + randomVariance,
    });
  }

  return points.reverse(); // Chronological order
};

// Generate electrical historical data
const generateElectricalHistory = (days: number) => {
  const points = [];
  const now = new Date();
  const interval = days === 1 ? 1 : days === 7 ? 4 : 24; // Hours per interval
  const totalPoints = (24 * days) / interval;

  for (let i = 0; i < totalPoints; i++) {
    const timestamp = format(
      subHours(now, i * interval),
      "yyyy-MM-dd'T'HH:mm:ss'Z'"
    );
    points.push({
      timestamp,
      phase_r: 220 + Math.random() * 20 - 10,
      phase_s: 220 + Math.random() * 20 - 10,
      phase_t: 220 + Math.random() * 20 - 10,
    });
  }

  return points.reverse(); // Chronological order
};

// Create mock data
export const mockedData: DataType = {
  nocTemperature: {
    id: 1,
    suhu: 24.5,
    kelembapan: 55.2,
    waktu: new Date().toISOString(),
  },
  upsTemperature: {
    id: 1,
    suhu: 26.8,
    kelembapan: 58.5,
    waktu: new Date().toISOString(),
  },
  datacenterTemperature: {
    id: 1,
    suhu: 22.3,
    kelembapan: 52.1,
    waktu: new Date().toISOString(),
  },
  nocHumidity: {
    id: 1,
    suhu: 24.5,
    kelembapan: 55.2,
    waktu: new Date().toISOString(),
  },
  upsHumidity: {
    id: 1,
    suhu: 26.8,
    kelembapan: 58.5,
    waktu: new Date().toISOString(),
  },
  datacenterHumidity: {
    id: 1,
    suhu: 22.3,
    kelembapan: 52.1,
    waktu: new Date().toISOString(),
  },
  fireSmoke: {
    id: 1,
    api_value: 0,
    asap_value: 0,
    waktu: new Date().toISOString(),
  },
  electrical: {
    id: 1,
    phase_r: 220.5,
    phase_s: 219.8,
    phase_t: 221.2,
    current_r: 10.2,
    current_s: 11.5,
    current_t: 9.8,
    power_r: 2244.1,
    power_s: 2527.7,
    power_t: 2167.8,
    energy_r: 150.5,
    energy_s: 165.2,
    energy_t: 142.8,
    frequency_r: 50.1,
    frequency_s: 50.0,
    frequency_t: 50.2,
    pf_r: 0.95,
    pf_s: 0.94,
    pf_t: 0.96,
    va_r: 2362.2,
    va_s: 2689.0,
    va_t: 2258.1,
    var_r: 742.5,
    var_s: 921.6,
    var_t: 638.4,
    voltage_3ph: 220.5,
    current_3ph: 31.5,
    power_3ph: 6939.6,
    energy_3ph: 458.5,
    frequency_3ph: 50.1,
    pf_3ph: 0.95,
    va_3ph: 7309.3,
    var_3ph: 2302.5,
    waktu: new Date().toISOString(),
  },
  historical: {
    temperature: {
      noc: generateHistoricalPoints(1, 24.5, 2),
      ups: generateHistoricalPoints(1, 26.8, 3),
      datacenter: generateHistoricalPoints(1, 22.3, 2.5),
    },
    humidity: {
      noc: generateHistoricalPoints(1, 55.2, 5),
      ups: generateHistoricalPoints(1, 58.5, 6),
      datacenter: generateHistoricalPoints(1, 52.1, 4),
    },
    electrical: generateElectricalHistory(1),
  },
};