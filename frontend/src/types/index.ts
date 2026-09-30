export interface MedicalReport {
  id: number;
  patient_name: string;
  report_type: 'Blood Test' | 'Urine Test' | 'X-Ray' | 'Other' | string;
  s3_image_url: string;
  extracted_text: string;
  ai_summary_en: string | string[];
  ai_summary_ta: string | string[];
  is_critical: boolean;
  abnormal_values?: string[];
  food_advice?: string;
  uploaded_at: string;
}

export interface CriticalAlert {
  report_id: string;
  patient_name: string;
  alert_message: string;
  abnormal_params: string[];
  timestamp: string;
}

export type TabType = 'dashboard' | 'reports' | 'alerts' | 'settings';
