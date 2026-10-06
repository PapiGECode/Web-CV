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
