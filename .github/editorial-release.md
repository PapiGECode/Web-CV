# Editorial release chain

- Repository: PapiGECode/Web-CV; production branch: master.
- Existing Vercel project: web-cv; existing public domains are unchanged.
- Strategy: feature-branch-chain with 18 focused child pull requests.
- The tracker remains draft/no-merge until child checks and preview verification pass.
- Each child targets its immediate predecessor; only the tracker merges to master.
- Source checkpoint: 7ebe1ee; source work units retain their original order and messages.
- Each child must pass Portfolio quality through workflow_dispatch.
- Production is confirmed only after READY and an exact domain build-revision match.
- Detailed task and verification evidence: odd/tasks/editorial-portfolio-refinement.md.

## CI synchronization correction
The modal traversal regression waits for the remote fixture navigation link before Tab. CI traced the previous failure to entering about:blank before its response arrived; the loaded-frame focus assertion remains unchanged. Local check/unit/build and five repeated lifecycle runs (25/25) passed.
