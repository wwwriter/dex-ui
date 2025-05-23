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
  source_object_link_property?: string | null;
  target_object_link_property?: string | null;
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
  description: string | null;
  author: string | null;
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
  description: string | null;
  mermaid: string | null;
  ontology_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  problem_bookmarks?: any[];
  isBookmarked?: boolean;
}

export type PropertyDataType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "timestamp";
export type PropertyDimensionType = "time" | "categorical";
export type PropertyEntityType = "primary" | "foreign" | "unique" | "natural";

export interface Property {
  id: number;
  name: string;

  description: string | null;
  data_type: PropertyDataType;
  dimension_type?: PropertyDimensionType | null;
  entity_type?: PropertyEntityType | null;

  object_type_id: number | null;
  ontology_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProblemMetric {
  id: number;
  metric_id: number;
  problem_id: number;
  ontology_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MetricObjectTypeRelation {
  id: number;
  object_type_id: number;
  metric_id: number;
  ontology_id: number;
  created_at: string;
  updated_at: string;
}

export interface MetricRelationship {
  id: number;
  ontology_id: number;
  source_metric_id: number;
  target_metric_id: number | null;
  deleted_at: string | null;
}
