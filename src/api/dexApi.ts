import {
  ObjectType,
  Metric,
  LinkType,
  Ontology,
  Knowledge,
  AuthResponse,
  Problem,
  Property,
  ProblemMetric,
  MetricRelationship,
} from "../types";
import axiosInstance from "./axios";
import { BASE_URL } from "./config";

export interface DetailApiRequest {
  fields?: string;
  relations?: string;
}
export interface ApiRequest extends DetailApiRequest {
  limit?: number;
  offset?: number;
  page?: number;
  sort?: string;
  filters?: Record<string, any>;
}

// API 응답 형식을 정의하는 타입
interface ApiResponse<T> {
  limit: number;
  offset: number;
  total: number;
  pagination: {
    total: number;
    page: {
      current: string;
      prev: string | null;
      next: string | null;
      first: string;
      last: string;
    };
  };
  data: T[];
  _x_request_id: string;
}

// MetricRelation 인터페이스 정의
interface MetricObjectTypeRelation {
  id?: number;
  metric_id: number;
  object_type_id: number;
  ontology_id: number;
  deleted_at?: string | null;
}

// 쿼리 파라미터 생성을 위한 유틸리티 함수 추가
const buildQueryParams = (params?: ApiRequest): string => {
  if (!params) return "";

  const queryParams = new URLSearchParams();

  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.offset) queryParams.append("offset", params.offset.toString());
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.sort) queryParams.append("sort", params.sort);
  if (params.fields) queryParams.append("fields", params.fields);
  if (params.relations) queryParams.append("relations", params.relations);

  // filters 처리
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      queryParams.append(`${key}`, value.toString());
    });
  }

  const queryString = queryParams.toString();
  return queryString ? `${queryString}` : "";
};

// ObjectType API 함수
export const objectTypeApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<ObjectType[]> => {
    let url = `/object_types/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  getById: async (id: number): Promise<ObjectType> => {
    const response = await axiosInstance.get(`/object_types/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<ObjectType, "id" | "created_at" | "updated_at">
  ): Promise<ObjectType> => {
    const response = await axiosInstance.post(`/object_types/`, data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<Omit<ObjectType, "id" | "created_at" | "updated_at">>
  ): Promise<ObjectType> => {
    const response = await axiosInstance.put(`/object_types/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/object_types/${id}`);
  },
};

// Metric API 함수
export const metricApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<Metric[]> => {
    let url = `/metrics/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  getById: async (id: number): Promise<Metric> => {
    const response = await axiosInstance.get(`/metrics/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<Metric, "id" | "created_at" | "updated_at">
  ): Promise<Metric> => {
    const response = await axiosInstance.post(`/metrics/`, data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<Omit<Metric, "id" | "created_at" | "updated_at">>
  ): Promise<Metric> => {
    const response = await axiosInstance.put(`/metrics/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/metrics/${id}`);
  },
};

// LinkType API 함수
export const linkTypeApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<LinkType[]> => {
    let url = `/link_types/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  getById: async (id: number): Promise<LinkType> => {
    const response = await axiosInstance.get(`/link_types/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<LinkType, "id" | "created_at" | "updated_at">
  ): Promise<LinkType> => {
    const response = await axiosInstance.post(`/link_types/`, data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<Omit<LinkType, "id" | "created_at" | "updated_at">>
  ): Promise<LinkType> => {
    const response = await axiosInstance.put(`/link_types/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/link_types/${id}`);
  },
};

// Ontology API 함수
export const ontologyApi = {
  getAll: async (params?: ApiRequest): Promise<Ontology[]> => {
    const url = `/ontologies/${buildQueryParams(params)}`;
    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  getById: async (id: number): Promise<Ontology> => {
    const response = await axiosInstance.get(`/ontologies/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<Ontology, "id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<Ontology> => {
    const response = await axiosInstance.post(`/ontologies/`, data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<
      Omit<Ontology, "id" | "created_at" | "updated_at" | "deleted_at">
    >
  ): Promise<Ontology> => {
    const response = await axiosInstance.put(`/ontologies/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/ontologies/${id}`);
  },
};

// MetricRelation API 함수
export const metricObjectTypeRelationApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<MetricObjectTypeRelation[]> => {
    let url = `/metric_object_type_relation/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  getById: async (id: number): Promise<MetricObjectTypeRelation> => {
    const response = await axiosInstance.get(
      `/metric_object_type_relation/${id}`
    );
    return response.data;
  },

  create: async (
    data: Omit<MetricObjectTypeRelation, "id" | "created_at" | "updated_at">
  ): Promise<MetricObjectTypeRelation> => {
    const response = await axiosInstance.post(
      `/metric_object_type_relation/`,
      data
    );
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<
      Omit<MetricObjectTypeRelation, "id" | "created_at" | "updated_at">
    >
  ): Promise<MetricObjectTypeRelation> => {
    const response = await axiosInstance.put(
      `/metric_object_type_relation/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/metric_object_type_relation/${id}`);
  },
};

// Authentication API 함수
export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post(`/auth/login`, {
      username,
      password,
    });
    return response.data;
  },
};

// Knowledge API 함수
export const knowledgeApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<Knowledge[]> => {
    let url = `/knowledge/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  getById: async (id: number): Promise<Knowledge> => {
    const response = await axiosInstance.get(`/knowledge/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<Knowledge, "id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<Knowledge> => {
    const response = await axiosInstance.post(`/knowledge/`, data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<
      Omit<Knowledge, "id" | "created_at" | "updated_at" | "deleted_at">
    >
  ): Promise<Knowledge> => {
    const response = await axiosInstance.put(`/knowledge/${id}`, data);
    return response.data;
  },
  patch: async (id: number, data: Partial<Knowledge>): Promise<Knowledge> => {
    const response = await axiosInstance.patch(`/knowledge/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/knowledge/${id}`);
  },
};

// Problem API 함수
export const problemApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<Problem[]> => {
    let url = `/problems/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  getById: async (id: number): Promise<Problem> => {
    const response = await axiosInstance.get(`/problems/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<Problem, "id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<Problem> => {
    const response = await axiosInstance.post(`/problems/`, data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<
      Omit<Problem, "id" | "created_at" | "updated_at" | "deleted_at">
    >
  ): Promise<Problem> => {
    const response = await axiosInstance.put(`/problems/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/problems/${id}`);
  },
};

// Property API 함수
export const propertyApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<Property[]> => {
    let url = `/properties/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  getById: async (id: number): Promise<Property> => {
    const response = await axiosInstance.get(`/properties/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<Property, "id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<Property> => {
    const response = await axiosInstance.post(`/properties/`, data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<
      Omit<Property, "id" | "created_at" | "updated_at" | "deleted_at">
    >
  ): Promise<Property> => {
    const response = await axiosInstance.put(`/properties/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/properties/${id}?hard=true`);
  },
};

// ProblemMetric API 함수
export const problemMetricApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<ProblemMetric[]> => {
    let url = `/problem_metrics/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  getById: async (id: number): Promise<ProblemMetric> => {
    const response = await axiosInstance.get(`/problem_metrics/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<ProblemMetric, "id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<ProblemMetric> => {
    const response = await axiosInstance.post(`/problem_metrics/`, data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<
      Omit<ProblemMetric, "id" | "created_at" | "updated_at" | "deleted_at">
    >
  ): Promise<ProblemMetric> => {
    const response = await axiosInstance.put(`/problem_metrics/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/problem_metrics/${id}`);
  },
};

// ProblemBookmark API 함수
export const problemBookmarkApi = {
  getAll: async (params?: ApiRequest): Promise<any[]> => {
    let url = `/problem_bookmarks/`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `?${queryParams}`;
    }

    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  create: async (data: {
    problem_id: number;
    user_id: number;
  }): Promise<any> => {
    const response = await axiosInstance.post(`/problem_bookmarks/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/problem_bookmarks/${id}?hard=true`);
  },
};

// KnowledgeBookmark API 함수
export const knowledgeBookmarkApi = {
  getAll: async (params?: ApiRequest): Promise<any[]> => {
    let url = `/knowledge_bookmarks/`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `?${queryParams}`;
    }

    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  create: async (data: {
    knowledge_id: number;
    user_id: number;
  }): Promise<any> => {
    const response = await axiosInstance.post(`/knowledge_bookmarks/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/knowledge_bookmarks/${id}?hard=true`);
  },
};

// MetricRelationship API 함수
export const metricRelationshipApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<MetricRelationship[]> => {
    let url = `/metric_relationship/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  getById: async (id: number): Promise<MetricRelationship> => {
    const response = await axiosInstance.get(`/metric_relationship/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<MetricRelationship, "id" | "deleted_at">
  ): Promise<MetricRelationship> => {
    const response = await axiosInstance.post(`/metric_relationship/`, data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<Omit<MetricRelationship, "id" | "deleted_at">>
  ): Promise<MetricRelationship> => {
    const response = await axiosInstance.put(
      `/metric_relationship/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/metric_relationship/${id}?hard=true`);
  },
};
