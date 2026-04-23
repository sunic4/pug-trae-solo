# Agent Workflow

## Task Completion

After finishing a task:

1. `git status` - Check changes
2. `git add .` - Stage changes
3. `git commit -m "<type>: <description>"` - Commit
4. `git push` - Push to remote

## Commit Types

- `fix`: Bug fixes
- `feat`: New features
- `refactor`: Code restructuring
- `docs`: Documentation
- `style`: Style changes
- `test`: Tests
- `build`: Build system
- `ci`: CI/CD

## Example

```bash
git status
git add .
git commit -m "feat: implement new feature"
git push
```

## Best Practices

- Keep commits focused
- Use clear commit messages
- Push after each task
- Pull before starting new work
