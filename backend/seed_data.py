import json
from datetime import datetime, timedelta
from db import init_db, save_report
from dynamodb_service import save_critical_alert

def seed_10_patient_records():
    init_db()
    print("Seeding 10 realistic sample patient medical reports...")

    samples = [
        {
            "patient_name": "Ramesh Kumar",
            "report_type": "Blood Test",
            "s3_image_url": "https://medicare-reports-2026.s3.amazonaws.com/reports/blood_test_ramesh.pdf",
            "extracted_text": """COMPLETE BLOOD COUNT & METABOLIC PANEL
Patient: Ramesh Kumar | Age: 48 | Sex: Male
Date: 2026-09-28

TEST NAME               RESULT      REFERENCE RANGE    STATUS
Hemoglobin (Hb)         8.5 g/dL    13.0 - 17.0 g/dL   [CRITICAL LOW]
Fasting Blood Sugar    210 mg/dL   70 - 100 mg/dL     [HIGH]
Serum Cholesterol       265 mg/dL   120 - 200 mg/dL    [HIGH]
Platelet Count          220,000/uL  150,000 - 450,000  [NORMAL]
Serum Creatinine        1.1 mg/dL   0.7 - 1.3 mg/dL    [NORMAL]""",
            "ai_summary_en": [
                "Severe anemia detected with Hemoglobin level at 8.5 g/dL (Normal: 13.0 - 17.0).",
                "Uncontrolled diabetes with elevated fasting blood glucose of 210 mg/dL.",
                "High serum cholesterol (265 mg/dL) increasing cardiovascular risk."
            ],
            "ai_summary_ta": [
                "Hemoglobin 8.5 g/dL ah romba kammi ah irukku, ratha kuraivula severe tired aagalam.",
                "Fasting sugar 210 mg/dL irukku, diabetes control panna doctor-a udanadiyaga paarkavum.",
                "Cholesterol level 265 mg/dL adhigam ah irukku, oily items thavirkavum."
            ],
            "is_critical": True,
            "abnormal_values": [
                "Hemoglobin: 8.5 g/dL (Critical Low - Ref: 13.0-17.0)",
                "Fasting Glucose: 210 mg/dL (High - Ref: 70-100)",
                "Total Cholesterol: 265 mg/dL (High - Ref: 120-200)"
            ],
            "food_advice": "Eat iron-rich foods like spinach, beetroot, dates, and pomegranate. Strictly avoid refined sugar, fried snacks, and sweets. Drink 3L water daily."
        },
        {
            "patient_name": "Priya Sharma",
            "report_type": "Urine Test",
            "s3_image_url": "https://medicare-reports-2026.s3.amazonaws.com/reports/urine_priya.png",
            "extracted_text": """URINALYSIS REPORT
Patient: Priya Sharma | Age: 32 | Sex: Female
Date: 2026-09-29

Color: Pale Yellow
pH: 6.2
Specific Gravity: 1.018
Urine Glucose: Negative
Urine Protein: Negative
Pus Cells: 1-2 /hpf (Normal: 0-5)
RBCs: Nil""",
            "ai_summary_en": [
                "Urinalysis parameters are completely normal with no protein or glucose detected.",
                "Pus cell count is within healthy reference limits (1-2 /hpf).",
                "Hydration and kidney excretion levels appear optimal."
            ],
            "ai_summary_ta": [
                "Urine test purna saadharanam ah irukku, sugar matrum protein edhum illai.",
                "Pus cells count normal limit kulla irukku (1-2 /hpf).",
                "Kidney function matrum udambula rathathil neer sattu nallapadi irukku."
            ],
            "is_critical": False,
            "abnormal_values": ["No abnormalities detected"],
            "food_advice": "Maintain good hydration by drinking 2.5 - 3 liters of water daily. Continue balanced healthy diet."
        },
        {
            "patient_name": "Anbarasan M",
            "report_type": "X-Ray",
            "s3_image_url": "https://medicare-reports-2026.s3.amazonaws.com/reports/xray_anbarasan.jpg",
            "extracted_text": """CHEST RADIOGRAPH (PA VIEW)
Patient: Anbarasan M | Age: 55 | Sex: Male
Date: 2026-09-27

Findings:
- Lung fields are clear bilaterally without consolidation or pleural effusion.
- Cardiac silhouette is normal in size and contour.
- Both costophrenic angles are sharp.
- Bony thorax demonstrates no fractures.
Impression: Normal Chest X-Ray.""",
            "ai_summary_en": [
                "Chest Radiograph shows clear lung fields with no active infection or fluid accumulation.",
                "Heart size and cardiac shadow are within normal dimensions.",
                "No ribs or chest bone fractures identified."
            ],
            "ai_summary_ta": [
                "Nenju X-Ray thuyarama irukku, salli matrum thottru edhum illai.",
                "Idhayatin alavu matrum vadivam saadharanama irukku.",
                "Elumbugals il endha idaiyurukalum illai."
            ],
            "is_critical": False,
            "abnormal_values": ["Normal Chest Radiograph"],
            "food_advice": "Avoid cold beverages if prone to allergic bronchitis. Perform light breathing exercises daily."
        },
        {
            "patient_name": "Lakshmi Sundaram",
            "report_type": "Blood Test",
            "s3_image_url": "https://medicare-reports-2026.s3.amazonaws.com/reports/blood_lakshmi.pdf",
            "extracted_text": """THYROID PROFILE & LIPID PANEL
Patient: Lakshmi Sundaram | Age: 42 | Sex: Female
Date: 2026-09-26

TEST NAME               RESULT      REFERENCE RANGE
TSH                     14.2 uIU/mL (0.4 - 4.5 uIU/mL) [HIGH]
Free T4                 0.6 ng/dL   (0.8 - 1.8 ng/dL)  [LOW]
Triglycerides           310 mg/dL   (30 - 150 mg/dL)   [CRITICAL HIGH]
HDL Cholesterol         35 mg/dL    (40 - 60 mg/dL)    [LOW]""",
            "ai_summary_en": [
                "Significantly elevated TSH (14.2 uIU/mL) indicating Hypothyroidism.",
                "Critically high Triglycerides (310 mg/dL) posing acute pancreatitis risk.",
                "Low HDL ('good cholesterol') levels."
            ],
            "ai_summary_ta": [
                "Thyroid TSH level (14.2 uIU/mL) romba adhigama irukku, Hypothyroidism irukku.",
                "Triglycerides fat (310 mg/dL) romba adhigama irukku, fat items thavirkavum.",
                "Nalla cholesterol (HDL) kuraiva irukku."
            ],
            "is_critical": True,
            "abnormal_values": [
                "TSH: 14.2 uIU/mL (High - Ref: 0.4-4.5)",
                "Free T4: 0.6 ng/dL (Low - Ref: 0.8-1.8)",
                "Triglycerides: 310 mg/dL (Critical High - Ref: 30-150)"
            ],
            "food_advice": "Consult an Endocrinologist for Thyroxine dosage adjustment. Avoid fried items, fast foods, and trans-fats. Consume walnuts and flaxseeds."
        },
        {
            "patient_name": "Karthik Raja",
            "report_type": "Blood Test",
            "s3_image_url": "https://medicare-reports-2026.s3.amazonaws.com/reports/blood_karthik.pdf",
            "extracted_text": """LIVER FUNCTION TEST (LFT)
Patient: Karthik Raja | Age: 29 | Sex: Male
Date: 2026-09-25

SGOT (AST): 24 U/L (Normal: 15-40)
SGPT (ALT): 28 U/L (Normal: 10-49)
Total Bilirubin: 0.8 mg/dL (Normal: 0.2-1.2)
Serum Albumin: 4.2 g/dL (Normal: 3.5-5.0)""",
            "ai_summary_en": [
                "Liver enzyme levels (SGOT & SGPT) are within healthy standard ranges.",
                "Total Bilirubin level is normal with no signs of jaundice.",
                "Protein metabolism and liver synthetic capacity are optimal."
            ],
            "ai_summary_ta": [
                "Eral (Liver) enyzme alavugal SGOT, SGPT ellam nallapadi irukku.",
                "Jaundice arikurigal edhum illai (Bilirubin 0.8 mg/dL).",
                "Eral seyalpaadu saadharanama irukku."
            ],
            "is_critical": False,
            "abnormal_values": ["All Liver Enzymes Normal"],
            "food_advice": "Maintain liver health with antioxidant-rich green tea, fruits, and vegetables. Avoid excessive alcohol intake."
        },
        {
            "patient_name": "Meenakshi S",
            "report_type": "Urine Test",
            "s3_image_url": "https://medicare-reports-2026.s3.amazonaws.com/reports/urine_meenakshi.png",
            "extracted_text": """URINE CULTURE & MICROSCOPY
Patient: Meenakshi S | Age: 36 | Sex: Female
Date: 2026-09-28

Pus Cells: 45-50 /hpf (Normal: 0-5) [HIGH]
Epithelial Cells: 8-10 /hpf
RBCs: 4-6 /hpf (Normal: Nil) [PRESENT]
Culture: E. coli growth detected (>10^5 CFU/mL)""",
            "ai_summary_en": [
                "High pus cell count (45-50 /hpf) confirming active Urinary Tract Infection (UTI).",
                "Presence of E. coli bacterial growth (>10^5 CFU/mL).",
                "Traces of red blood cells in urine requiring antibiotic therapy."
            ],
            "ai_summary_ta": [
                "Urine-il Pus cells (45-50 /hpf) romba adhigama irukku, severe UTI thottru irukku.",
                "E. coli bakteeriya thottru kandupidikkapattu irukku.",
                "Doctor-idam kaatti udanadiyaga Antibiotics edukavum."
            ],
            "is_critical": True,
            "abnormal_values": [
                "Pus Cells: 45-50 /hpf (Critical High - Ref: 0-5)",
                "Urine RBCs: 4-6 /hpf (Abnormal)",
                "Urine Culture: E. coli >10^5 CFU/mL"
            ],
            "food_advice": "Drink 3.5 - 4 liters of water daily. Drink unsweetened cranberry juice and buttermilk. Avoid spicy and acidic foods."
        },
        {
            "patient_name": "Vijay Anand",
            "report_type": "X-Ray",
            "s3_image_url": "https://medicare-reports-2026.s3.amazonaws.com/reports/xray_vijay.jpg",
            "extracted_text": """LUMBAR SPINE RADIOGRAPH (AP & LATERAL)
Patient: Vijay Anand | Age: 50 | Sex: Male
Date: 2026-09-27

Findings:
- Loss of normal lumbar lordosis secondary to muscle spasm.
- L4-L5 intervertebral disc space narrowing with marginal osteophytes.
- Facet joint arthropathy noted at L5-S1.
Impression: Lumbar Spondylosis with L4-L5 disc degeneration.""",
            "ai_summary_en": [
                "Intervertebral disc space narrowing between L4-L5 vertebrae indicating disc degeneration.",
                "Spinal muscle spasm causing reduced lumbar curvature.",
                "Early bone spur (osteophyte) formation causing lower back stiffness."
            ],
            "ai_summary_ta": [
                "Mudhugu elumbu (L4-L5) edaiyil disc kuraivatu matrum spondylosis irukku.",
                "Mudhugu thasai pidippu matrum valigal yerpadalam.",
                "Physiotherapy matrum posture exercise panna vendum."
            ],
            "is_critical": True,
            "abnormal_values": [
                "L4-L5 Disc Space Narrowing",
                "Lumbar Lordosis Loss / Muscle Spasm",
                "L5-S1 Facet Joint Arthropathy"
            ],
            "food_advice": "Consume calcium & Vitamin D3 rich foods (milk, sesame seeds, eggs). Avoid heavy weight lifting and prolonged slouching."
        },
        {
            "patient_name": "Deepa Venkatesh",
            "report_type": "Blood Test",
            "s3_image_url": "https://medicare-reports-2026.s3.amazonaws.com/reports/blood_deepa.pdf",
            "extracted_text": """VITAMIN PROFILE REPORT
Patient: Deepa Venkatesh | Age: 34 | Sex: Female
Date: 2026-09-29

Vitamin D3 (25-OH): 38 ng/mL (Optimal: 30-100)
Vitamin B12: 480 pg/mL (Normal: 200-900)
Serum Iron: 95 ug/dL (Normal: 60-170)""",
            "ai_summary_en": [
                "Vitamin D3 level (38 ng/mL) is within optimal sufficient range.",
                "Vitamin B12 levels are healthy, supporting nerve and blood cell function.",
                "Serum iron levels are balanced with no deficiency."
            ],
            "ai_summary_ta": [
                "Vitamin D3 matrum Vitamin B12 alavugal nallapadi irukku.",
                "Ratha iron level saadharanama irukku.",
                "Sathu kuraipadu edhum illai."
            ],
            "is_critical": False,
            "abnormal_values": ["All Vitamin Levels Optimal"],
            "food_advice": "Continue exposing yourself to early morning sunlight for 15 mins. Eat dairy products, nuts, and leafy greens."
        },
        {
            "patient_name": "Selvam K",
            "report_type": "Blood Test",
            "s3_image_url": "https://medicare-reports-2026.s3.amazonaws.com/reports/blood_selvam.pdf",
            "extracted_text": """RENAL FUNCTION TEST (RFT)
Patient: Selvam K | Age: 61 | Sex: Male
Date: 2026-09-28

Serum Creatinine: 2.8 mg/dL (Normal: 0.7-1.3) [CRITICAL HIGH]
Blood Urea Nitrogen (BUN): 48 mg/dL (Normal: 7-20) [HIGH]
eGFR: 24 mL/min/1.73m2 (Stage 4 CKD indicator) [LOW]
Serum Potassium: 5.6 mEq/L (Normal: 3.5-5.0) [HIGH]""",
            "ai_summary_en": [
                "Critically elevated Serum Creatinine (2.8 mg/dL) and BUN (48 mg/dL) indicating impaired kidney function.",
                "Reduced eGFR (24 mL/min) corresponding to advanced renal insufficiency.",
                "High serum potassium (Hyperkalemia) requiring urgent medical monitoring."
            ],
            "ai_summary_ta": [
                "Serum Creatinine (2.8 mg/dL) matrum BUN (48 mg/dL) romba adhigama irukku, Kidney பாதிப்பு irukku.",
                "eGFR kuraivatu kidney seyalpaadu kuraivai kaattugirathu.",
                "Udanadiyaga Nephrologist (Kidney Specialist) doctor-a paarkavum."
            ],
            "is_critical": True,
            "abnormal_values": [
                "Serum Creatinine: 2.8 mg/dL (Critical High - Ref: 0.7-1.3)",
                "BUN: 48 mg/dL (High - Ref: 7-20)",
                "eGFR: 24 mL/min (Low - Stage 4 CKD)",
                "Potassium: 5.6 mEq/L (High)"
            ],
            "food_advice": "Strictly limit salt, potassium-rich fruits (bananas, oranges), and high-protein intake. Follow strict fluid restrictions as advised by nephrologist."
        },
        {
            "patient_name": "Kavitha N",
            "report_type": "Urine Test",
            "s3_image_url": "https://medicare-reports-2026.s3.amazonaws.com/reports/urine_kavitha.png",
            "extracted_text": """ROUTINE URINE SCREENING
Patient: Kavitha N | Age: 27 | Sex: Female
Date: 2026-09-29

Color: Clear Straw
pH: 6.0
Protein: Negative
Ketones: Negative
Bilirubin: Negative
Microscopy: Nil abnormal""",
            "ai_summary_en": [
                "Routine urine screening parameters show no abnormalities.",
                "No protein, glucose, or ketone bodies detected.",
                "Microscopic sediment is clean."
            ],
            "ai_summary_ta": [
                "Urine test saadharanama thuyarama irukku.",
                "Protein matrum sugar edhum kedaikkavillai.",
                "Kidney aarogyama irukku."
            ],
            "is_critical": False,
            "abnormal_values": ["Routine Screening Normal"],
            "food_advice": "Maintain healthy fluid intake and balanced lifestyle."
        }
    ]

    for item in samples:
        saved = save_report(
            patient_name=item["patient_name"],
            report_type=item["report_type"],
            s3_image_url=item["s3_image_url"],
            extracted_text=item["extracted_text"],
            ai_summary_en="\n".join(item["ai_summary_en"]),
            ai_summary_ta="\n".join(item["ai_summary_ta"]),
            is_critical=item["is_critical"],
            abnormal_values=item["abnormal_values"],
            food_advice=item["food_advice"]
        )
        
        report_id = saved.get("id")
        
        if item["is_critical"]:
            save_critical_alert(
                report_id=str(report_id),
                patient_name=item["patient_name"],
                alert_message=f"Critical medical parameters identified in {item['report_type']}",
                abnormal_params=item["abnormal_values"]
            )
            print(f" -> Added Critical Report & DynamoDB Alert for {item['patient_name']} (ID #{report_id})")
        else:
            print(f" -> Added Normal Report for {item['patient_name']} (ID #{report_id})")

    print("\nSuccessfully seeded 10 patient records!")

if __name__ == "__main__":
    seed_10_patient_records()
