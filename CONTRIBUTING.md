# Contributing to DeskOps

Thanks for helping make life admin less overwhelming.

## Before you start

- Check existing issues before opening a new one.
- For substantial changes, open an issue first so we can agree on the shape of the work.
- Do not include real personal, client, or credential data in issues, commits, screenshots, or pull requests.

## Local workflow

1. Fork the repository and create a focused branch.
2. Follow the setup steps in the README.
3. Make the smallest coherent change and add or update tests where practical.
4. Run the quality gates before opening a pull request:

   ```bash
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   ```

## Pull requests

- Explain the user-facing problem and solution.
- Keep pull requests narrow and avoid unrelated formatting changes.
- Include before-and-after screenshots for visual changes.
- Update documentation when setup, behaviour, or architecture changes.

By contributing, you agree that your contributions are licensed under the MIT License.
