# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

track-mjx is a package for training neural network control policies through motion imitation using deep reinforcement learning. Part of [MIMIC-MJX](https://mimic-mjx.talmolab.org/), along with [stac-mjx](https://github.com/talmolab/stac-mjx) (inverse kinematics) and [vnl-playground](https://github.com/talmolab/vnl-playground) (environments).

The package provides:
- PPO-based training of neural controllers for biomechanical body models
- Encoder-decoder policy architecture with regularized "motor intention" latent space
- Motion imitation from reference trajectories (from stac-mjx inverse kinematics)
- Support for multiple animal models (rodent, fly, mouse arm)
- GPU-accelerated training via JAX/MuJoCo MJX

**Note:** track-mjx v1+ relies on vnl-playground for environment and task logic.

## Code Style Requirements

1. **Formatting**: Use `ruff format` with max line length of 88
2. **Docstrings**: Google style, document "Attributes" section in class-level docstring
3. **Type hints**: Always include for function arguments and return types
4. **Import order**: Standard library, third-party, local (enforced by ruff)
5. **JAX conventions**: Use functional patterns, explicit PRNG key threading, prefer `jax.numpy` over `numpy` in JIT-compiled code

## Development Workflow

1. Never work in `main`, always create a scoped feature branch (e.g., `feature/x` or `fix/y` if not specified explicitly).
2. After creating the branch, make sure to plan for the tasks you will be doing.
3. When experimenting and introspecting, feel free to create a directory in `tmp/{BRANCH_NAME}` for prototyping, exploration, and note-taking. This will not be checked into the git history.
4. When committing, never commit all changes. Always carefully analyze the files and hunks that changed and create specific and multiple PRs to avoid committing unintended work, or bundling changes together that would make it hard to revert them.
5. After making your changes, be sure to lint and maximize coverage.
6. If there are enhancements or API changes, be sure to update the `docs/` appropriately.
7. Create a PR using the `gh` CLI when the changes are close to ready.
8. When finishing up, use `gh` to check the CI every 30 seconds until it finishes running and check the logs if CI failed.
9. When the user says to go ahead and merge, then squash merge with `gh pr merge --delete-branch`.

## Testing Rules

1. Use existing fixtures from `tests/fixtures/` when possible. Read the modules there to learn about relevant fixtures.
2. Create minimal synthetic data for new tests rather than files when there is no appropriate existing fixture.
3. Use `tmp_path` for any I/O operations in tests.
4. Write multiple focused tests rather than one complex test.
5. Place tests in corresponding module under `tests/` (e.g., `track_mjx/train.py` → `tests/test_train.py`)
6. Never create new test modules unless a new package module was created.
7. When adding tests, use global imports at the module-level rather than importing locally within a test function unless strictly needed (e.g., for import checking). Analyze current imports to find the best place to add the import statement and do not duplicate existing imports.
8. Use `pytest` function-style testing rather than `unittest`-style tests.
9. **NEVER** use mocking or monkey patching as a quick fix for increasing coverage. If the condition or execution branch can't be reproduced (e.g., defensive coding, rare edge cases), re-evaluate whether that condition should exist. Code branches that are difficult to test are an anti-pattern.