## Commit rules

This application following commits styling as described [here](https://github.com/conventional-changelog/commitlint/#what-is-commitlint).

Some examples:

```bash
  git commit -m "feat: add specific module"
  git commit -m "test(some-service): coverage"
  git commit -m "fix: incorrect redirection"
```

## Branch naming

The first branch naming part should contain specific subject of what you are going to do in general and the second part should contain a small description, what you are exactly going to do there. For instance:

```bash
  git checkout -b "feat/add-specific-module"
  git checkout -b "test/specific-service-coverage"
  git checkout -b "fix/incorrect-behaviour-of-smth"
```
