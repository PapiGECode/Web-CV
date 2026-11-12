import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('verified membership metadata matches the static accessible community links', async () => {
  const organizations = JSON.parse(await fs.readFile('content/community-logos.json', 'utf8'));
  const html = await fs.readFile('index.html', 'utf8');
  const list = html.match(/<ul class="community-links">([\s\S]*?)<\/ul>/)[1];
  const entries = [...list.matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.equal(entries.length, organizations.length);
  assert.equal(new Set(organizations.map(org => org.login)).size, organizations.length);
  for (const organization of organizations) {
    const entry = entries.find(([_, url]) => url === organization.html_url);
    assert.ok(entry, organization.login);
    assert.ok(entry[2].includes('class="community-name">' + organization.name + '</span>'));
    assert.match(organization.verified_on, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(['github-public-api', 'user-confirmed'].includes(organization.membership_source));
    assert.equal(organization.api_url, 'https://api.github.com/orgs/' + organization.login);
  }
});
