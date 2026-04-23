# Agent Workflow

## Overview

This document outlines the workflow for agents to complete tasks efficiently and effectively.

## Task Execution

1. **Understand the task**: Read and understand the user's request
2. **Plan the approach**: Create a plan for completing the task
3. **Implement the solution**: Write code or make changes to meet the requirements
4. **Verify the solution**: Test the changes to ensure they work correctly
5. **Clean up**: Remove any temporary files or unnecessary changes

## Verification Steps

### For Rendering Tasks

1. **Run the server**: Execute `pnpm run server` to generate a screenshot
2. **Check the screenshot**: Verify the screenshot contains the expected content
3. **Test browser rendering**: Run `pnpm run dev` and check the browser output

### For Other Tasks

1. **Run tests**: Execute `pnpm test` to run unit tests
2. **Build the project**: Run `pnpm run build` to ensure no build errors
3. **Lint the code**: Run `pnpm run lint` to check code quality

## Task Completion

After finishing a task:

1. `git status` - Check changes
2. `git add .` - Stage changes
3. `git commit -m "<type>: <description>"` - Commit with clear message
4. `git push` - Push to remote

## Commit Types

- `fix`: Bug fixes
- `feat`: New features
- `refactor`: Code restructuring
- `docs`: Documentation changes
- `style`: Style changes
- `test`: Test changes
- `build`: Build system changes
- `ci`: CI/CD changes

## Example Workflow

```bash
# 1. Understand and plan the task
# 2. Implement the solution
# 3. Verify the solution
pnpm run server  # For rendering tasks
pnpm run build   # For all tasks

# 4. Complete the task
git status
git add .
git commit -m "feat: implement new feature"
git push
```

## Best Practices

- **Keep commits focused**: Each commit should address a single issue or feature
- **Use clear commit messages**: Describe what was changed and why
- **Push after each task**: Ensure changes are saved to the remote repository
- **Pull before starting new work**: Get the latest changes from the remote repository
- **Test thoroughly**: Verify changes work as expected before committing
- **Follow code style**: Adhere to the project's coding conventions
- **Document changes**: Update documentation as needed

