variable "aws_region" {
  description = "AWS region for API resources."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project identifier for naming resources."
  type        = string
  default     = "revenda-veiculos-api"
}

variable "ecr_repository_name" {
  description = "ECR repository name for API images."
  type        = string
  default     = "revenda-veiculos-api"
}

variable "cluster_name" {
  description = "ECS cluster name."
  type        = string
  default     = "revenda-veiculos-cluster"
}

variable "service_name" {
  description = "ECS service name."
  type        = string
  default     = "revenda-veiculos-api-service"
}

variable "task_definition_family" {
  description = "ECS task definition family name."
  type        = string
  default     = "revenda-veiculos-api-task"
}

variable "container_name" {
  description = "API container name in the task definition."
  type        = string
  default     = "revenda-veiculos-api"
}

variable "container_port" {
  description = "Port exposed by the API container."
  type        = number
  default     = 3000
}

variable "task_cpu" {
  description = "Fargate task CPU units."
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Fargate task memory in MiB."
  type        = number
  default     = 512
}

variable "service_desired_count" {
  description = "Number of API tasks running in ECS service."
  type        = number
  default     = 1
}

variable "image_tag" {
  description = "Initial Docker image tag for the ECS task."
  type        = string
  default     = "latest"
}

variable "alb_name" {
  description = "Application Load Balancer name."
  type        = string
  default     = "revenda-veiculos-api-alb"
}

variable "target_group_name" {
  description = "ALB target group name."
  type        = string
  default     = "revenda-veiculos-api-tg"
}

variable "health_check_path" {
  description = "Health check path used by ALB target group."
  type        = string
  default     = "/v1/health"
}

variable "db_instance_identifier" {
  description = "RDS instance identifier."
  type        = string
  default     = "revenda-veiculos-db"
}

variable "db_engine_version" {
  description = "PostgreSQL engine version."
  type        = string
  default     = "16.3"
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB for RDS."
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum autoscaled storage in GB for RDS."
  type        = number
  default     = 40
}

variable "db_name" {
  description = "Initial PostgreSQL database name."
  type        = string
  default     = "revenda_veiculos"
}

variable "db_username" {
  description = "RDS master username."
  type        = string
  default     = "revenda_admin"
}

variable "db_password" {
  description = "RDS master password."
  type        = string
  sensitive   = true
}

variable "cors_origin" {
  description = "CORS origin allowed by the API."
  type        = string
}

variable "cognito_region" {
  description = "AWS Cognito region."
  type        = string
}

variable "cognito_user_pool_id" {
  description = "AWS Cognito user pool ID."
  type        = string
}

variable "cognito_client_id" {
  description = "AWS Cognito app client ID."
  type        = string
}
