CREATE TABLE `ontologies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_820391284421792f7d822cad16` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `object_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `ontology_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_b1d0d7cd6a8c80284b435bb8a9` (`ontology_id`,`name`),
  CONSTRAINT `FK_45a32ff005462aa17d47e4bac5d` FOREIGN KEY (`ontology_id`) REFERENCES `ontologies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `link_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `relationship_type` enum('foreign-key','dataset') COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_object_link_property` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_object_link_property` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `semantic_label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `ontology_id` int DEFAULT NULL,
  `source_object_type_id` int DEFAULT NULL,
  `target_object_type_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_ddad82d61776bce7609bf0c237` (`ontology_id`,`name`),
  KEY `FK_6a3b24409c4bf8151254c52997c` (`source_object_type_id`),
  KEY `FK_a0574a2514eaf02476b5e2778f0` (`target_object_type_id`),
  CONSTRAINT `FK_6a3b24409c4bf8151254c52997c` FOREIGN KEY (`source_object_type_id`) REFERENCES `object_types` (`id`),
  CONSTRAINT `FK_a0574a2514eaf02476b5e2778f0` FOREIGN KEY (`target_object_type_id`) REFERENCES `object_types` (`id`),
  CONSTRAINT `FK_fa3b76c188aae57c06794fba5f9` FOREIGN KEY (`ontology_id`) REFERENCES `ontologies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci


CREATE TABLE `measure_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `measure_type` enum('count','sum','average','min','max','count_distinct','custom') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'count',
  `measure_type_params` json DEFAULT NULL,
  `ontology_id` int DEFAULT NULL,
  `object_type_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_ff336e06bfb11902f689c4a678` (`object_type_id`,`ontology_id`,`name`),
  KEY `FK_46ab9b0176d9995d7986eacff8a` (`ontology_id`),
  CONSTRAINT `FK_46ab9b0176d9995d7986eacff8a` FOREIGN KEY (`ontology_id`) REFERENCES `ontologies` (`id`),
  CONSTRAINT `FK_a3a820d9ad75d69fa11929ad9e8` FOREIGN KEY (`object_type_id`) REFERENCES `object_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `metrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `object_type_id` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_main_metric` tinyint NOT NULL DEFAULT '0',
  `type` enum('simple','derived','cumulative','ratio','conversion') COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_params` json NOT NULL,
  `filter` text COLLATE utf8mb4_unicode_ci,
  `dimension` json DEFAULT NULL,
  `children` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `ontology_id` int DEFAULT NULL,
  `measure_type_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_038f0d046486ebc2b8904f40ce` (`ontology_id`,`name`),
  KEY `FK_1aac95054f011cc00db17116b46` (`object_type_id`),
  KEY `FK_999e161c7f1b52d340fb81e1f96` (`measure_type_id`),
  CONSTRAINT `FK_1aac95054f011cc00db17116b46` FOREIGN KEY (`object_type_id`) REFERENCES `object_types` (`id`),
  CONSTRAINT `FK_63e917ae21ddcd11855b4e70d73` FOREIGN KEY (`ontology_id`) REFERENCES `ontologies` (`id`),
  CONSTRAINT `FK_999e161c7f1b52d340fb81e1f96` FOREIGN KEY (`measure_type_id`) REFERENCES `measure_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci



CREATE TABLE `properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `data_type` enum('string','number','boolean','date','timestamp') COLLATE utf8mb4_unicode_ci NOT NULL,
  `dimension_type` enum('time','categorical') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dimension_type_params` json DEFAULT NULL,
  `dimension_context` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_type` enum('primary','foreign','unique','natural') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_required` tinyint NOT NULL DEFAULT '0',
  `ontology_id` int DEFAULT NULL,
  `object_type_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_1d2ba38bf95416d378dda720e6` (`object_type_id`,`ontology_id`,`name`),
  KEY `FK_c39023fec3785ed19919466b9af` (`ontology_id`),
  CONSTRAINT `FK_6455f2f6eaaf344783dd9509f0f` FOREIGN KEY (`object_type_id`) REFERENCES `object_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_c39023fec3785ed19919466b9af` FOREIGN KEY (`ontology_id`) REFERENCES `ontologies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `metric_relation` (
  `metric_id` int NOT NULL,
  `object_type_id` int DEFAULT NULL,
  PRIMARY KEY (`metric_id`),
  KEY `FK_34c7674b56d9c9e1643c8236a5f` (`object_type_id`),
  CONSTRAINT `FK_34c7674b56d9c9e1643c8236a5f` FOREIGN KEY (`object_type_id`) REFERENCES `object_types` (`id`),
  CONSTRAINT `FK_f1ac645baf1483be75dc4056c3d` FOREIGN KEY (`metric_id`) REFERENCES `metrics` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `metric_references` (
  `metric_id` int NOT NULL,
  `reference_metric_id` int NOT NULL,
  PRIMARY KEY (`metric_id`,`reference_metric_id`),
  KEY `IDX_d35419ce61c54b9bd0f854f66b` (`metric_id`),
  KEY `IDX_70438c087e48f2a54f2138b0c4` (`reference_metric_id`),
  CONSTRAINT `FK_70438c087e48f2a54f2138b0c48` FOREIGN KEY (`reference_metric_id`) REFERENCES `metrics` (`id`),
  CONSTRAINT `FK_d35419ce61c54b9bd0f854f66b1` FOREIGN KEY (`metric_id`) REFERENCES `metrics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci


CREATE TABLE `problems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('occurred','exploratory','reframing') COLLATE utf8mb4_unicode_ci NOT NULL,
  `hypotheses` json NOT NULL,
  `ontology_id` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_problems_ontology` (`ontology_id`),
  CONSTRAINT `FK_problems_ontology` FOREIGN KEY (`ontology_id`) REFERENCES `ontologies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `problem_metrics` (
  `problem_id` int NOT NULL,
  `metric_id` int NOT NULL,
  PRIMARY KEY (`problem_id`, `metric_id`),
  CONSTRAINT `FK_problem_metrics_problem` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_problem_metrics_metric` FOREIGN KEY (`metric_id`) REFERENCES `metrics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


이 테이블들 간의 관계도를 mermaid 로 그려줘