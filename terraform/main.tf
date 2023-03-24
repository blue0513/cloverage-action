terraform {
  required_version = ">= 1.4.2"
}

provider "aws" {
  region = "ap-northeast-1"
}

resource "aws_s3_bucket" "coverage-report" {
  bucket = "blue-coverage-report"
}
