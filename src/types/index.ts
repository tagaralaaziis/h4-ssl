// NOC Temperature and Humidity data structure
export interface TemperatureHumidityDataType {
  id: number;
  suhu: number;
  kelembapan: number;
  waktu: string;
}

// Fire and Smoke data structure
export interface FireSmokeDataType {
  id: number;
  api_value: number;
  asap_value: number;
  waktu: string;
}

// Electrical data structure
export interface ElectricalDataType {
  id: number;
  phase_r: number;
  phase_s: number;
  phase_t: number;
  current_r: number;
  current_s: number;
  current_t: number;
  power_r: number;
  power_s: number;
  power_t: number;
  energy_r: number;
  energy_s: number;
  energy_t: number;
  frequency_r: number;
  frequency_s: number;
  frequency_t: number;
  pf_r: number;
  pf_s: number;
  pf_t: number;
  va_r: number;
  va_s: number;
  va_t: number;
  var_r: number;
  var_s: number;
  var_t: number;
  voltage_3ph: number;
  current_3ph: number;
  power_3ph: number;
  energy_3ph: number;
  frequency_3ph: number;
  pf_3ph: number;
  va_3ph: number;
  var_3ph: number;
  waktu: string;
}

// Historical data structure
export interface HistoricalDataType {
  temperature?: {
    noc: Array<{ timestamp: string; value: number }>;
    ups: Array<{ timestamp: string; value: number }>;
    datacenter: Array<{ timestamp: string; value: number }>;
  };
  humidity?: {
    noc: Array<{ timestamp: string; value: number }>;
    ups: Array<{ timestamp: string; value: number }>;
    datacenter: Array<{ timestamp: string; value: number }>;
  };
  electrical?: Array<{
    timestamp: string;
    phase_r: number;
    phase_s: number;
    phase_t: number;
  }>;
}

// Main data structure for the application
export interface DataType {
  nocTemperature: TemperatureHumidityDataType;
  upsTemperature: TemperatureHumidityDataType;
  datacenterTemperature: TemperatureHumidityDataType;
  nocHumidity: TemperatureHumidityDataType;
  upsHumidity: TemperatureHumidityDataType;
  datacenterHumidity: TemperatureHumidityDataType;
  fireSmoke: FireSmokeDataType;
  electrical: ElectricalDataType;
  historical: HistoricalDataType;
}