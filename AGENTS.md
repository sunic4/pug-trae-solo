# Git Workflow

## Commit and Push

Every time you complete a task, run these commands:

1. `git status` - Check changes
2. `git add .` - Stage changes
3. `git commit -m "<type>: <description>"` - Commit with message
4. `git push` - Push to remote

## Commit Message Types

- `fix`: Bug fixes
- `feat`: New features
- `refactor`: Code restructuring
- `docs`: Documentation changes
- `style`: Style changes
- `test`: Test changes
- `build`: Build system changes
- `ci`: CI/CD changes

## Example

```bash
# After completing a task
git status
git add .
git commit -m "refactor: restructure demo app"
git push
```
