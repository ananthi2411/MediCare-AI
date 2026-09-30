import axios from 'axios';
import { MedicalReport, CriticalAlert } from '../types';

const API_BASE_URL = 'http://localhost:8000';

export const uploadReportApi = async (
  file: File,
  patientName: string,
  reportType: string
): Promise<{ success: boolean; data: MedicalReport }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('patient_name', patientName);
  formData.append('report_type', reportType);

  const response = await axios.post(`${API_BASE_URL}/upload-report`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const fetchReportsApi = async (): Promise<MedicalReport[]> => {
  const response = await axios.get(`${API_BASE_URL}/reports`);
  return response.data.data || [];
};

export const fetchCriticalAlertsApi = async (): Promise<CriticalAlert[]> => {
  const response = await axios.get(`${API_BASE_URL}/critical-alerts`);
  return response.data.data || [];
};

export const fetchReportDetailsApi = async (id: number): Promise<MedicalReport> => {
  const response = await axios.get(`${API_BASE_URL}/report/${id}`);
  return response.data.data;
};
