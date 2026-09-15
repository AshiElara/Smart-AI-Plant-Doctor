export interface OtherPossibility {
  problem: string;
  reason: string;
  additionalInfoNeeded: string;
}

export interface Recommendation {
  id: number;
  title: string;
  description: string;
  actionType: string;
}

export interface CareTip {
  category: "Watering" | "Sunlight" | "Soil" | "Air circulation" | "General care" | string;
  tip: string;
}

export interface DiagnosisResult {
  isLeafOrPlant: boolean;
  isSufficient: boolean;
  insufficientReason?: string;
  plantIdentified: string;
  problem: string;
  isHealthy: boolean;
  diagnosisStatus: "Healthy" | "Needs Attention" | "Treatment Recommended";
  confidenceLevel: "High" | "Medium" | "Low";
  confidencePercentage: number;
  severity: "Mild" | "Moderate" | "Severe";
  severityReason: string;
  hasOtherPossibility?: boolean;
  otherPossibility?: OtherPossibility | null;
  visualObservations: string[];
  immediateAction: string;
  treatment: string[];
  treatmentDuration: string;
  expectedImprovement: string;
  threeRecommendations: Recommendation[];
  careTips: CareTip[];
  whatToAvoid: string[];
  disclaimer: string;
}

export interface SampleLeaf {
  id: string;
  name: string;
  plant: string;
  condition: string;
  description: string;
  imageUrl: string;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  imageDataUrl: string;
  diagnosis: DiagnosisResult;
}
