terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_ecr_repository" "api" {
  name = var.ecr_repository_name
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${var.service_name}"
  retention_in_days = 14
}

resource "aws_ecs_cluster" "api" {
  name = var.cluster_name
}
