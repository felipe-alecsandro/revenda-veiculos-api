variable "aws_region" {
  description = "AWS region for API resources."
  type        = string
  default     = "us-east-1"
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
