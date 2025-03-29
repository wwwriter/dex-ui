아래 정보를 바탕으로 curl 을 통해서 요청을 전달해줘.

BASE_URL = https://llana.soneuro-handmade.com

[openapi 포맷](./../../doc/openapi.json)

**API 예시**

```shell
curl --location --request GET 'https://llana.soneuro-handmade.com/ontologies/' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data '{
  "fields": [
    "<string>",
    "<string>"
  ],
  "relations": [
    "<string>",
    "<string>"
  ],
  "page": "<string>",
  "limit": "<number>",
  "offset": "<number>",
  "sort": "<string>",
  "id": "<number>",
  "name": "<string>",
  "description": "<string>",
  "created_at": "<unknown>",
  "updated_at": "<unknown>"
}'
```

### ER Diagram

```mermaid
erDiagram
  ontologies ||--o{ object_types : "has"
  ontologies ||--o{ link_types : "has"
  ontologies ||--o{ measure_types : "has"
  ontologies ||--o{ metrics : "has"
  ontologies ||--o{ properties : "has"
  ontologies ||--o{ problems : "has"

  object_types ||--o{ link_types : "source_object"
  object_types ||--o{ link_types : "target_object"
  object_types ||--o{ measure_types : "related"
  object_types ||--o{ metrics : "related"
  object_types ||--o{ properties : "related"
  object_types ||--o{ metric_relation : "related"

  measure_types ||--o{ metrics : "used_in"

  metrics ||--o{ metric_relation : "has_relation"
  metrics ||--o{ problem_metrics : "associated_with"

  problems ||--o{ problem_metrics : "associated_with"

  ontologies {
    int id
    varchar name
    text description
    datetime created_at
    datetime updated_at
  }

  object_types {
    int id
    varchar name
    varchar label
    text description
    datetime created_at
    datetime updated_at
  }

  link_types {
    int id
    varchar name
    varchar label
    text description
    enum relationship_type
    varchar source_object_link_property
    varchar target_object_link_property
    varchar semantic_label
    datetime created_at
    datetime updated_at
  }

  measure_types {
    int id
    varchar name
    varchar description
    enum measure_type
    json measure_type_params
  }

  metrics {
    int id
    varchar name
    varchar label
    text description
    tinyint is_main_metric
    enum type
    json type_params
    text filter
    json dimension
    json children
    datetime created_at
    datetime updated_at
  }

  properties {
    int id
    varchar name
    text description
    enum data_type
    enum dimension_type
    json dimension_type_params
    varchar dimension_context
    enum entity_type
    tinyint is_required
  }

  metric_relation {
    int metric_id
    int object_type_id
  }

  

  problems {
    int id
    varchar name
    varchar label
    text description
    enum type
    json hypotheses
    datetime created_at
    datetime updated_at
  }

  problem_metrics {
    int problem_id
    int metric_id
  }
```
