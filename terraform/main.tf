terraform {
  required_version = ">= 1.4.2"
}

locals {
  bucket_name = "blue-coverage-report"
}

provider "aws" {
  region = "ap-northeast-1"
}

resource "aws_s3_bucket" "coverage-report" {
  bucket = local.bucket_name

  force_destroy = true
}

resource "aws_s3_bucket_policy" "s3_bucket_policy" {
  bucket = aws_s3_bucket.coverage-report.id
  policy = data.aws_iam_policy_document.allow_access.json
}

data "aws_iam_policy_document" "allow_access" {
  statement {
    sid    = ""
    effect = "Allow"

    principals {
      identifiers = ["*"]
      type        = "*"
    }

    actions = ["s3:GetObject"]

    resources = [
      aws_s3_bucket.coverage-report.arn,
      "${aws_s3_bucket.coverage-report.arn}/*",
    ]
  }
}
