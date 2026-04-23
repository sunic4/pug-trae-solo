# Agents Workflow

## Git Commit and Push Requirement

Every time you complete a task, you must:

1. **Check git status**: `git status`
2. **Add changes**: `git add .`
3. **Commit changes**: `git commit -m "<commit message>"`
4. **Push changes**: `git push`

## Commit Message Guidelines

Use clear and concise commit messages that describe what was changed:

- For bug fixes: `fix: <description>`
- For new features: `feat: <description>`
- For refactoring: `refactor: <description>`
- For documentation: `docs: <description>`
- For style changes: `style: <description>`
- For tests: `test: <description>`
- For build changes: `build: <description>`
- For ci changes: `ci: <description>`

## Workflow Example

1. Complete a task (e.g., refactor the demo app)
2. Check git status: `git status`
3. Add changes: `git add .`
4. Commit changes: `git commit -m "refactor: restructure demo app into modular components"`
5. Push changes: `git push`

## Best Practices

- Commit early and often
- Keep commits focused on a single task
- Use descriptive commit messages
- Push changes after each completed task
- Pull latest changes before starting a new task
