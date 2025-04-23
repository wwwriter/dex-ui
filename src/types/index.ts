export interface ObjectType {
  id: number;
  name: string;
  label: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  ontology_id: number | null;
}

export interface Metric {
  id: number;
  name: string;
  description: string | null;
  is_main_metric: 0 | 1;
  type: "simple" | "derived" | "cumulative" | "ratio" | "conversion";
  created_at: string;
  updated_at: string;
  ontology_id: number | null;
}

export interface LinkType {
  id: number;
  name: string;
  label: string | null;
  description: string | null;
  relationship_type: "foreign-key" | "dataset";
  source_object_link_property: string;
  target_object_link_property: string;
  semantic_label: string;
  created_at: string;
  updated_at: string;
  ontology_id: number | null;
  source_object_type_id: number | null;
  target_object_type_id: number | null;
}

export interface Ontology {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Knowledge {
  id: number;
  name: string;
  label: string | null;
  description: string | null;
  summary: string | null;
  mermaid: string | null;
  link: string | null;
  ontology_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  knowledge_bookmarks?: any[];
  isBookmarked?: boolean;
}

export interface AuthResponse {
  access_token: string;
  id: string;
}

export interface Problem {
  id: number;
  name: string;
  label: string | null;
  description: string | null;
  summary: string | null;
  mermaid: string | null;
  link: string | null;
  ontology_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  problem_bookmarks?: any[];
  isBookmarked?: boolean;
}

export interface Property {
  id: number;
  name: string;
  label: string | null;
  description: string | null;
  property_type: string;
  config: any | null;
  object_type_id: number | null;
  ontology_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProblemMetric {
  id: number;
  problem_id: number;
  metric_id: number;
  ontology_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
