# Makefile

.PHONY: plan apply destroy lint report

plan:
	cd terraform && terraform plan

apply:
	cd terraform && terraform apply --auto-approve

destroy:
	cd terraform &&terraform destroy --auto-approve

lint:
	cd terraform && terraform validate
	cd terraform && terraform fmt -recursive

report:
	npx lcov-viewer lcov -o ./target/report-output-directory ./target/coverage/lcov.info
