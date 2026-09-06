# Security policy

## Reporting a vulnerability

Please do **not** open a public GitHub issue for a security problem.

Email **gaurav.rsh@gmail.com** with:

- what the issue is and where (URL, endpoint, or file),
- the steps to reproduce it,
- what an attacker could do with it.

You'll get an acknowledgement within a few days. Please give a reasonable window for a fix before
disclosing publicly.

## What's in scope

- patkan.in and its `/api/public/*` endpoints
- the published browser extension
- this repository's code

## What's out of scope

- Reports from automated scanners with no working proof
- Missing hardening headers with no demonstrated impact
- Denial of service by volume
- Anything on a self-hosted fork

## A note on keys

No API key, service key or AI credential is stored in this repository. They live in the hosting
platform's secret store and are read at request time on the server. If you believe you've found a
credential in the code or in the git history, treat it as a vulnerability and email immediately.
