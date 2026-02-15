output "ecr_repository_url" {
  value       = aws_ecr_repository.api.repository_url
  description = "ECR repository URL."
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.api.name
  description = "ECS cluster name."
}
