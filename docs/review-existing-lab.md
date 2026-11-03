# Review the existing React lab foundation

The owner approved keeping PRs #12 and #13, with a separate cap change for the existing foundation. This does not change the default review limits.

The helper admits only `khallil/react-interview-lab` in `KhallilB/stepwise`, including fixes through `3e20304`. It allows at most 13,000 production lines and 60 production files. It refuses a dirty checkout, further app changes, changed policy files, other branches and other repositories. It expires as soon as the foundation commit reaches `origin/main`.

Merge this policy PR first, then merge current `main` into the lab branch without rewriting its signed fixes. Resolve `vitest.config.ts` to the reviewed main version, which includes both app and policy tests. The application files must remain identical to the approved fix snapshot.

From that clean lab checkout:

```sh
bun scripts/review-existing-lab.ts --check
bun scripts/review-existing-lab.ts probes=16 \
  "artifact=bun run test" "coupled=bun run build"
```

Record actual source-specific probes in the existing review ledger before running the gate. Set `probes` to that recorded count; the runner checks the evidence.

The first command checks eligibility. The second runs the existing full review gate with only its size and file limits changed. Required probes, confidence evidence, finding disposition, tests, signatures and pre-push checks still apply. A green size check alone does not permit a push.

After #12 merges, the helper refuses further use. New work uses the normal review limits. PR #13 remains the briefs/examples follow-up and must inherit the reviewed lab.

The pinned snapshot includes the three-file rename rollback fix and valid wrapped React component exports found during local review. Updating this pin does not change the cap, expiry or other review requirements.
