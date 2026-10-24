const { readFileSync } = require('node:fs');
module.exports = async function dispatch({ github, context, core }) {
  if (context.ref !== 'refs/heads/main' || !['push','workflow_dispatch'].includes(context.eventName)) throw new Error('Only main pushes or manual main runs can dispatch');
  if (!/^[a-f0-9]{40}$/.test(context.sha)) throw new Error('Invalid commit SHA');
  const repo = context.repo;
  const current = await github.rest.repos.getBranch({ ...repo, branch: 'main' });
  if (current.data.commit.sha !== context.sha) {
    core.info('A newer main commit exists; skipping this obsolete request.');
    return 'obsolete';
  }
  const associated = await github.rest.repos.listPullRequestsAssociatedWithCommit({ ...repo, commit_sha: context.sha });
  let pr = associated.data.find(pr => pr.base.ref === 'main' && pr.merged_at);
  if (!pr) {
    // Direct pushes have no PR. Reuse a merged PR as the Cloud task context;
    // the task prompt explicitly selects the new main SHA, not the old PR branch.
    const recent = await github.rest.pulls.list({ ...repo, state: 'closed', base: 'main', sort: 'updated', direction: 'desc', per_page: 100 });
    pr = recent.data.find(pr => pr.merged_at);
  }
  if (!pr) throw new Error('No merged main PR exists to receive the Codex task request');
  const marker = `<!-- codex-main-task:${context.sha} -->`;
  const comments = await github.paginate(github.rest.issues.listComments, { ...repo, issue_number: pr.number, per_page: 100 });
  if (comments.some(comment => comment.body?.includes(marker))) {
    core.info('This main commit already has a task request.');
    return 'already-requested';
  }
  const prompt = readFileSync('.github/codex-main-task.md','utf8').replaceAll('{{MAIN_COMMIT}}',context.sha);
  const created = await github.rest.issues.createComment({ ...repo, issue_number: pr.number, body: `${prompt.trim()}\n\n${marker}` });
  await core.summary.addHeading('Codex Cloud task requested')
    .addRaw(`Main commit: ${context.sha}\n\n[Task request](${created.data.html_url})\n\nA posted comment is not confirmation that Codex accepted the task. Check for the connector response; bot-authored requests require live verification.`)
    .write();
  return 'requested';
};
