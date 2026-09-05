# Patkan homepage — forensic copy vs. code audit

Scope: every visible word on `/` (the live homepage), checked against the shipped
extension package, the transform service, the daily-limit logic, the storage layer
and the logging layer.

Diagnosis only. No copy has been changed and none is proposed. Add your comments
inline under each finding.

Severity key:
- **S1 — Brand/legal danger.** A stated promise the product breaks today.
- **S2 — Materially misleading.** Not a lie in spirit, wrong in fact.
- **S3 — Gap.** Something promised, implied or expected that is simply not there.
- **S4 — Polish.** An inconsistency a careful visitor would notice.

Facts established from the code, used as the yardstick throughout:
- Shipped extension is version 1.0.0 and asks for access to **18 addresses**, not three.
- Free allowance is 10 a day; signing in raises it to 50 a day.
- The service stores **the rough input and the finished prompt** in a reuse cache.
- The service also writes one record per transform (no prompt text): site, persona, format, timings, outcome.
- No public code repository and no licence file exist today.

---

## 1. Claims that are false as written

### 1.1 "Zero memory. Zero retention." / "No prompt logs, no chat databases"
**S1.** The rough input and the finished prompt are stored so an identical request
can be replayed free, and every transform writes a record. Two of the three
sentences in that block are contradicted by the running system. This is the
highest-risk statement on the page: an absolute privacy promise, published, untrue.

> Your notes:

### 1.2 "compiles in RAM for 200ms and immediately replaces your text"
**S1.** Nothing takes 200 ms and nothing stays in memory only. The instant piece is
a local skeleton; the real prompt returns from a third-party model roughly two
seconds later. The number is invented and the location is wrong.

> Your notes:

### 1.3 "Patkan is open-source" / "Our contribution to the FOSS community"
**S1.** No public repository, no licence, nothing to click. Today this asserts a
specific legal status the product does not have.

> Your notes:

### 1.4 "strictly confines it to `chatgpt.com`, `claude.ai`, and `gemini.google.com`"
**S1.** The shipped extension requests 18 addresses, including Notion, Perplexity,
Copilot, Grok, DeepSeek, Meta AI, Mistral, Poe, Kimi, Qwen, AI Studio and the Patkan
site itself. A user who reads this line, installs, then sees the browser's own
permission list will conclude the page understated what they agreed to.

> Your notes:

### 1.5 The "these approved URLs" panel — three entries, each marked VERIFIED
**S1.** Three addresses shown with a lock icon and a green VERIFIED tick, presented
as the audited complete list. Presenting an incomplete list as verified is the most
legally exposed element on the page.

> Your notes:

### 1.6 "No credit limits" (pillar 03)
**S1.** There is a hard credit limit — 10 a day, enforced by the service, after
which the product refuses. The same page states that limit three times.

> Your notes:

### 1.7 "Works across all major desktop browsers"
**S2.** Chrome only, by your own decision. The steps are Chrome-only, Safari cannot
load this package at all, and Firefox uses a different, temporary-only route.

> Your notes:

### 1.8 "No keyloggers ... completely inert in memory until you type `//`"
**S2.** Defensible in intent, loose in fact. The extension loads on every permitted
page, attaches to the text box, watches typing to spot the `//`, and paints a
floating status pill. "Completely inert" describes an ideal, not the mechanism, and
a technical reviewer will take it apart.

> Your notes:

### 1.9 "watch it sharpen ... in the blink of an eye"
**S2.** What appears instantly is a locally built skeleton, not the expert prompt.
The expert prompt lands about two seconds later. The page never separates the two,
so the first run feels like a downgrade from the promise.

> Your notes:

---

## 2. Internal contradictions

### 2.1 Supported apps — four different answers on one page
**S1.** Hero says "ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity, and
more". Install step 5 says "ChatGPT, Claude, or Gemini". The extension card in the
mockup says the same three. Privacy and the URL panel say three. The product
supports fourteen. Whichever is true, three are wrong.

> Your notes:

### 2.2 Free forever vs. a daily ration
**S1.** "No pricing tiers. No credit limits. No monthly subscriptions ... absolutely
free" sits between "10 transforms per day, free" in the hero and "10 free transforms
a day" in the footer.

> Your notes:

### 2.3 The 50-a-day signed-in allowance is invisible
**S3.** Signing in raises the allowance from 10 to 50 and the page never says so.
Hero and footer keep saying 10 even to a signed-in visitor, so those two lines are
wrong for every signed-in user, and the "Sign in to keep going" prompt never states
what signing in buys.

> Your notes:

### 2.4 "Zero interest in your data" beside accounts and a Library
**S2.** The page offers email and Google sign-in and links to a Library, while
claiming zero interest in data, and never says what an account holds.

> Your notes:

---

## 3. Promised, implied or expected — and absent

### 3.1 No privacy policy, no terms, no contact, no owner identity
**S1.** Four hard privacy claims under a "Privacy & Security" heading, plus email
and Google sign-in, with no privacy policy, no terms, no identifiable owner and no
contact route. Google's sign-in terms and store rules require a policy; consumer
rules in the EU, UK and India require an identifiable owner. Pure absence, and the
biggest launch blocker on the page.

> Your notes:

### 3.2 No licence and no repository link
**S2.** Pillar 03 makes an open-source claim with nothing to click.

> Your notes:

### 3.3 "100% open and auditable ... verify every network call before you click load"
**S2.** You can inspect the extension folder. You cannot inspect the prompt-building
logic, the model choice, the cache or the logging — all of which live on the server
and are closed. And nothing can be observed "before you click load".

> Your notes:

### 3.4 The Library is never explained — and pillar 01 dismisses it
**S3.** A "Library" link appears for signed-in users, unexplained, while pillar 01
opens with "No prompt libraries." as a selling point. The product ships the thing
the headline copy rejects.

> Your notes:

### 3.5 No wording for failure
**S3.** When the model fails, the page shows the local skeleton labelled "Ready —
offline draft". The user is not offline, and nothing tells them the result is a
downgrade.

> Your notes:

### 3.6 It is never disclosed that the text leaves the browser
**S1.** Nowhere does the page say the rough input is sent to a third-party model
provider. Against the loudness of the privacy section, this omission reads as
deliberate once discovered.

> Your notes:

---

## 4. Functionality — completeness and correctness

### 4.1 The five browser tabs are decorative
**S2.** Chrome, Edge, Firefox, Safari, Opera look selectable and do nothing; Chrome
is permanently active. A dead control inside the install guide costs installs.

> Your notes:

### 4.2 The remaining count is a guess until the first transform
**S2.** On load it always reads "10 left today", whatever the visitor used earlier.
The true figure only arrives after a transform. Someone who used their ten this
morning is told they have ten, types, and is refused. A usage lookup exists in the
product; the homepage never calls it.

> Your notes:

### 4.3 Hitting the limit wipes the typed text
**S2.** The whole text box is replaced by the limit message; whatever was typed is
gone from the screen with no way to copy it out.

> Your notes:

### 4.4 The limit prompt sells nothing and preserves nothing
**S3.** "Sign in to keep going" omits the payoff (50 a day) and drops the draft; the
user lands elsewhere and starts over.

> Your notes:

### 4.5 The persona explanation prints twice
**S4.** The same sentence renders beside the PERSONA label and again under the
chips, in the showpiece section of the page.

> Your notes:

### 4.6 The "Other" persona is a dead end
**S2.** It reads "Custom persona active". Nothing becomes active, there is no field,
and it behaves exactly like Auto.

> Your notes:

### 4.7 Navigation vanishes below large screens
**S3.** Playground, Install Guide and Sign in / Library are hidden under roughly
1024 px. On a tablet, a small laptop window and every phone there is no way to reach
the install guide except scrolling, and no way to sign in at all short of hitting
the daily limit. Your current window (850 px) has no navigation.

> Your notes:

### 4.8 "Listen" teaches the wrong pronunciation
**S4.** The browser's default English voice reads "pat-kan", while the card shows
/ˈpʌʈ.kən/ and पट्कन. The one control whose job is pronunciation gets it wrong.

> Your notes:

### 4.9 Grammarly appears inside the mockup
**S2.** A trademarked competitor's name and description are rendered in your
marketing illustration. No upside, some risk.

> Your notes:

### 4.10 "60 sec Installation Guide"
**S2.** The real flow is download, unzip, open a settings page, flip developer mode,
load unpacked, locate the folder. That is not 60 seconds for a consumer, and "Load
unpacked" is exactly where consumers abandon. The page also never warns that Chrome
nags about developer-mode extensions on every restart.

> Your notes:

### 4.11 Version naming
**S4.** The button says v1.0, the package says 1.0.0, and the page carries no date
or changelog, so nobody can tell how fresh the build is.

> Your notes:

### 4.12 Sharing preview is incomplete
**S3.** The page declares a large-image social card and supplies no image, so every
share on WhatsApp, LinkedIn, X or Slack renders as a bare text link.

> Your notes:

### 4.13 Canonical address points away from your brand domain
**S2.** The page declares the Lovable address as its canonical home while patkan.in
is being connected. If both go live, search engines keep crediting the Lovable
address and the brand domain inherits nothing.

> Your notes:

### 4.14 The free limit resets by clearing site data
**S3.** For signed-out visitors the count is tied to a browser-stored identifier.
Previously accepted as a deliberate trade-off; restated only because the page
presents "10 per day" as a firm rule.

> Your notes:

---

## 5. Ranked by damage, if nothing else gets fixed

1. No privacy policy, terms or identifiable owner (3.1)
2. "Zero memory. Zero retention. No prompt logs" while text is stored (1.1)
3. The VERIFIED three-address panel and the "strictly confined" claim (1.4, 1.5)
4. "No credit limits" beside a 10-a-day cap (1.6, 2.2)
5. Open-source claim with no repository or licence (1.3)
6. Never disclosing that text is sent to a third-party model (3.6)
7. Four different answers about which apps are supported (2.1)
8. Dead browser tabs and the wrong remaining count (4.1, 4.2)

> Your notes:
