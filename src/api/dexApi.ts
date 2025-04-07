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
} from "../types";

const BASE_URL = "https://llana.soneuro-handmade.com";

interface ApiRequest {
  limit?: number;
  offset?: number;
  page?: number;
  sort?: string;
  fields?: string;
  relations?: string;
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
    let url = `${BASE_URL}/object_types/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await fetch(url);
    const result: ApiResponse<ObjectType> = await response.json();
    return result.data;
  },

  getById: async (id: number): Promise<ObjectType> => {
    const response = await fetch(`${BASE_URL}/object_types/${id}`);
    return response.json();
  },

  create: async (
    data: Omit<ObjectType, "id" | "created_at" | "updated_at">
  ): Promise<ObjectType> => {
    const response = await fetch(`${BASE_URL}/object_types/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (
    id: number,
    data: Partial<Omit<ObjectType, "id" | "created_at" | "updated_at">>
  ): Promise<ObjectType> => {
    const response = await fetch(`${BASE_URL}/object_types/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    await fetch(`${BASE_URL}/object_types/${id}`, {
      method: "DELETE",
    });
  },
};

// Metric API 함수
export const metricApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<Metric[]> => {
    let url = `${BASE_URL}/metrics/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await fetch(url);
    const result: ApiResponse<Metric> = await response.json();
    return result.data;
  },

  getById: async (id: number): Promise<Metric> => {
    const response = await fetch(`${BASE_URL}/metrics/${id}`);
    return response.json();
  },

  create: async (
    data: Omit<Metric, "id" | "created_at" | "updated_at">
  ): Promise<Metric> => {
    const response = await fetch(`${BASE_URL}/metrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (
    id: number,
    data: Partial<Omit<Metric, "id" | "created_at" | "updated_at">>
  ): Promise<Metric> => {
    const response = await fetch(`${BASE_URL}/metrics/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    await fetch(`${BASE_URL}/metrics/${id}`, {
      method: "DELETE",
    });
  },
};

// LinkType API 함수
export const linkTypeApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<LinkType[]> => {
    let url = `${BASE_URL}/link_types/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await fetch(url);
    const result: ApiResponse<LinkType> = await response.json();
    return result.data;
  },

  getById: async (id: number): Promise<LinkType> => {
    const response = await fetch(`${BASE_URL}/link_types/${id}`);
    return response.json();
  },

  create: async (
    data: Omit<LinkType, "id" | "created_at" | "updated_at">
  ): Promise<LinkType> => {
    const response = await fetch(`${BASE_URL}/link_types/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (
    id: number,
    data: Partial<Omit<LinkType, "id" | "created_at" | "updated_at">>
  ): Promise<LinkType> => {
    const response = await fetch(`${BASE_URL}/link_types/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    await fetch(`${BASE_URL}/link_types/${id}`, {
      method: "DELETE",
    });
  },
};

// Ontology API 함수
export const ontologyApi = {
  getAll: async (params?: ApiRequest): Promise<Ontology[]> => {
    const url = `${BASE_URL}/ontologies/${buildQueryParams(params)}`;
    const response = await fetch(url);
    const result: ApiResponse<Ontology> = await response.json();
    return result.data;
  },

  getById: async (id: number): Promise<Ontology> => {
    const response = await fetch(`${BASE_URL}/ontologies/${id}`);
    return response.json();
  },

  create: async (
    data: Omit<Ontology, "id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<Ontology> => {
    const response = await fetch(`${BASE_URL}/ontologies/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (
    id: number,
    data: Partial<
      Omit<Ontology, "id" | "created_at" | "updated_at" | "deleted_at">
    >
  ): Promise<Ontology> => {
    const response = await fetch(`${BASE_URL}/ontologies/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    await fetch(`${BASE_URL}/ontologies/${id}`, {
      method: "DELETE",
    });
  },
};

// MetricRelation API 함수
export const metricObjectTypeRelationApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<MetricObjectTypeRelation[]> => {
    let url = `${BASE_URL}/metric_object_type_relation/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await fetch(url);
    const result: ApiResponse<MetricObjectTypeRelation> = await response.json();
    return result.data;
  },

  getById: async (id: number): Promise<MetricObjectTypeRelation> => {
    const response = await fetch(
      `${BASE_URL}/metric_object_type_relation/${id}`
    );
    return response.json();
  },

  create: async (
    data: Omit<MetricObjectTypeRelation, "id" | "created_at" | "updated_at">
  ): Promise<MetricObjectTypeRelation> => {
    const response = await fetch(`${BASE_URL}/metric_object_type_relation/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (
    id: number,
    data: Partial<
      Omit<MetricObjectTypeRelation, "id" | "created_at" | "updated_at">
    >
  ): Promise<MetricObjectTypeRelation> => {
    const response = await fetch(
      `${BASE_URL}/metric_object_type_relation/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    await fetch(`${BASE_URL}/metric_object_type_relation/${id}`, {
      method: "DELETE",
    });
  },
};

// Authentication API 함수
export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },
};

// Knowledge API 함수
export const knowledgeApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<Knowledge[]> => {
    let url = `${BASE_URL}/knowledge/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);
    console.log(queryParams);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await fetch(url);
    const result: ApiResponse<Knowledge> = await response.json();
    return result.data;
  },

  getById: async (id: number): Promise<Knowledge> => {
    const response = await fetch(`${BASE_URL}/knowledge/${id}`);
    return response.json();
  },

  create: async (
    data: Omit<Knowledge, "id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<Knowledge> => {
    const response = await fetch(`${BASE_URL}/knowledge/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (
    id: number,
    data: Partial<
      Omit<Knowledge, "id" | "created_at" | "updated_at" | "deleted_at">
    >
  ): Promise<Knowledge> => {
    const response = await fetch(`${BASE_URL}/knowledge/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    await fetch(`${BASE_URL}/knowledge/${id}`, {
      method: "DELETE",
    });
  },
};

// Problem API 함수
export const problemApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<Problem[]> => {
    let url = `${BASE_URL}/problems/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await fetch(url);
    const result: ApiResponse<Problem> = await response.json();
    return result.data;
  },

  getById: async (id: number): Promise<Problem> => {
    const response = await fetch(`${BASE_URL}/problems/${id}`);
    return response.json();
  },

  create: async (
    data: Omit<Problem, "id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<Problem> => {
    const response = await fetch(`${BASE_URL}/problems/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (
    id: number,
    data: Partial<
      Omit<Problem, "id" | "created_at" | "updated_at" | "deleted_at">
    >
  ): Promise<Problem> => {
    const response = await fetch(`${BASE_URL}/problems/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    await fetch(`${BASE_URL}/problems/${id}`, {
      method: "DELETE",
    });
  },
};

// Property API 함수
export const propertyApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<Property[]> => {
    let url = `${BASE_URL}/properties/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await fetch(url);
    const result: ApiResponse<Property> = await response.json();
    return result.data;
  },

  getById: async (id: number): Promise<Property> => {
    const response = await fetch(`${BASE_URL}/properties/${id}`);
    return response.json();
  },

  create: async (
    data: Omit<Property, "id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<Property> => {
    const response = await fetch(`${BASE_URL}/properties/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (
    id: number,
    data: Partial<
      Omit<Property, "id" | "created_at" | "updated_at" | "deleted_at">
    >
  ): Promise<Property> => {
    const response = await fetch(`${BASE_URL}/properties/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    await fetch(`${BASE_URL}/properties/${id}`, {
      method: "DELETE",
    });
  },
};

// ProblemMetric API 함수
export const problemMetricApi = {
  getAll: async (
    ontology_id?: number,
    params?: ApiRequest
  ): Promise<ProblemMetric[]> => {
    let url = `${BASE_URL}/problem_metrics/?ontology_id=${ontology_id}`;
    const queryParams = buildQueryParams(params);

    if (queryParams) {
      url += `&${queryParams}`;
    }

    const response = await fetch(url);
    const result: ApiResponse<ProblemMetric> = await response.json();
    return result.data;
  },

  getById: async (id: number): Promise<ProblemMetric> => {
    const response = await fetch(`${BASE_URL}/problem_metrics/${id}`);
    return response.json();
  },

  create: async (
    data: Omit<ProblemMetric, "id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<ProblemMetric> => {
    const response = await fetch(`${BASE_URL}/problem_metrics/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (
    id: number,
    data: Partial<
      Omit<ProblemMetric, "id" | "created_at" | "updated_at" | "deleted_at">
    >
  ): Promise<ProblemMetric> => {
    const response = await fetch(`${BASE_URL}/problem_metrics/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    await fetch(`${BASE_URL}/problem_metrics/${id}`, {
      method: "DELETE",
    });
  },
};
