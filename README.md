# Cloverage Action

This workflow is designed to help you understand the difference in test coverage between your main branch and your pull request visually.

## Requirements

- This workflow is compatible with Clojure-based repositories
- Your repository must contain [lein-cloverage](https://github.com/cloverage/cloverage) plugins in `project.clj`
- Your repository must have workflow permissions set to Read and write permissions. You can configure this at `Settings > Actions > General > Workflow permissions`.

## Usage

```yml
name: Use Cloverage Action

on:
  push:
  pull_request:

jobs:
  coverage:
    uses: blue0513/cloverage-action/.github/workflows/ci.yml@main
    secrets: inherit
```

Visit [the example repository](https://github.com/blue0513/use-cloverage-action) for more information.

## Advanced Usage

### Uploading Coverage to S3

This workflow allows you to upload a coverage report created by [lcov-viewer](https://www.npmjs.com/package/@lcov-viewer/cli).
By including the following secrets and variables, this workflow automatically uploads the coverage report:

- Secret: `AWS_ACCESS_KEY_ID`
- Secret: `AWS_SECRET_ACCESS_KEY`
- Variable: `S3_BUCKET_NAME`
