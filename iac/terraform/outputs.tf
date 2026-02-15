output "ecr_repository_url" {
  value       = aws_ecr_repository.api.repository_url
  description = "ECR repository URL."
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.api.name
  description = "ECS cluster name."
}

output "ecs_service_name" {
  value       = aws_ecs_service.api.name
  description = "ECS service name."
}

output "ecs_task_definition_family" {
  value       = aws_ecs_task_definition.api.family
  description = "ECS task definition family."
}

output "alb_dns_name" {
  value       = aws_lb.api.dns_name
  description = "Public DNS of the API load balancer."
}

output "api_base_url" {
  value       = "http://${aws_lb.api.dns_name}/v1"
  description = "Base URL for the deployed API."
}

output "db_endpoint" {
  value       = aws_db_instance.api.address
  description = "RDS PostgreSQL endpoint address."
}
