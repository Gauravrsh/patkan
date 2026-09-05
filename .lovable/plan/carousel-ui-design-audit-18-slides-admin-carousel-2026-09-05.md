# Carousel UI Design Audit — 18 slides (/admin/carousel)

Audit done on live renders of all 18 slides at 1080×1350. Edit inline; each item is numbered so you can reply "A3 yes / B7 no".

---

## A. The Good (keep these)

- **A1. Palette discipline.** Cream `#F3EFE4` + ink `#1C1917` + a single orange accent. No slide breaks it (one exception, see C4). This is the deck's biggest strength and reads as a real brand, not a template.
- **A2. Type pairing.** Fraunces display over Inter support is distinctive and anti-generic. Editorial, not "AI startup deck".
- **A3. One idea per slide.** Pacing is genuinely good — slides 9, 11, 12 land as punchlines because they are alone on the page.
- **A4. Margins.** ~6% side margins are generous and safe against LinkedIn's mobile crop.
- **A5. Restraint.** No gradients, no stock imagery, no icon soup. Correct instinct for this format.

---

## B. The Bad (inconsistencies — fix before publishing)

- **B1. Capitalisation is not a system.** Slides mix sentence case ("Is that you…", "Intelligent!", "Itna type kaun karega!!") with all-lowercase ("writing a good…", "it gives right context…", "so, what's the problem?"). Right now it reads as inconsistent rather than intentional. Pick one rule: all-lowercase for narration, sentence case only for spoken/quoted lines — and apply it to all 18.-------Go ahead with implementing your recommendation.
- **B2. Headline size is decided by character count, not by importance.** The code buckets font size by string length. Result: "This AI sucks!" is huge, and the actual thesis (slide 5, 6, 13) is the smallest type in the deck. The most important slides are visually the weakest. Size should follow narrative weight — hook / beat / payoff — not word count.------what is the actual actionable recommendation here? 
- **B3. Vertical anchor jumps.** The text block is vertically centred, so the headline baseline lands at a different height on almost every slide (compare 1, 3, 10, 16). On swipe this makes the text visibly "hop". Global benchmark for carousels: pin text to a fixed top or optical baseline so the eye never has to re-find it.--------Fix it to optical baseline.
- **B4. Bottom third is dead on most slides.** Content is centred but the header sits at top, so mass collects mid-upper-left and ~35–40% of the page is empty with nothing to justify it. Empty space should be a deliberate frame, not leftover.--------so whats the actionable? I dont see any gap as such and this recommendation seems forced.
- **B5. Double numbering.** "01" top-left and "01 / 18" bottom-right say the same thing twice. Keep one (bottom-right is the LinkedIn convention).--------Let it be.
- **B6. Orphan header rule.** The top hairline exists to separate a number from a section label — but the label is blank on all 18 slides, so the rule runs to the right edge and terminates in nothing. It currently reads as a rendering bug.-----------its fine. I dont need a slide label.
- **B7. Orphan footer-left.** The footer's left slot is blank, leaving the page counter floating alone against a full-width rule. Same problem as B6, mirrored.-------its fine, for now. 
- **B8. Swipe hint sits on top of the footer rule.** The orange-dot / swipe / arrow group is vertically crowded against the hairline below it — it looks stuck to the line rather than placed. Needs clear and more breathing room above the line-----------------Go ahead with implementing your recommendation.
- **B9. Punctuation inconsistency.** `sigh!!` / `sucks!` / `karega!!` / `it..` / `be..` — single vs double bang, two-dot vs three-dot ellipsis. Standardise.-------double bang at all places and 3 dots at all places
- **B10. Ad-hoc spacing inside text.** Slide 3 creates the gap before `#IFKYK` with literal blank lines, and slide 3 uses a hyphen as a fake bullet. Spacing should come from layout, not typed line breaks — it will break at different render sizes.-------Sure. Fix it as per UI best practices.
- **B11. Bullets have no hierarchy.** Bullet text is the same size as body text, so slides 8, 15, 16 read as a flat grey block under a big headline. Bullets should step down clearly or step up to become the content.-----so, what's the actionable here?

---

## C. The Ugly (would get called out by a designer)

- **C1. Slide 2 ("OR").** A whole 1080×1350 page holding two characters set at a size smaller than the headline on slide 3. It reads as an accident, not a beat. Either make it a full-bleed typographic moment (huge, centred, orange) or fold it into slide 3.-----full bleed typographic moment. centred and orange, but not huge. retain the same size.
- **C2. Bold weight jump on slide 5 and 16.** Fraunces 500 → 900 inside the same line is such a jump that it looks like a different typeface pasted in, and on slide 16 the bold runs mid-sentence make the paragraph look patchy. Use 600–700, or use the orange accent for emphasis instead of weight.-------use orange accent for emphasis. remove weight. 
- **C3. Line length on slides 6, 7, 13, 15.** Three-to-four line headlines at ~50–60 characters per line. For a thumb-scrolled carousel the benchmark is ≤ 6–7 words per line and ≤ 3 lines. Slide 13 is currently the hardest slide in the deck to read.-------fix all of them, to be consistent with all other slides from font size, line spacing and overall visual consistency POV.
- **C4. Slide 18 breaks every rule the other 17 set.** It is the only centre-aligned slide, the only one with an image, the only one introducing a near-black tile (a fourth colour), and the logo tile now sits small and marooned in the middle of the page with a full-width empty band under it. It does not read as the same deck. The closing slide should be the most controlled, not the most improvised.--------so whats your recommendation on the placement of logo and [patkan.in](http://patkan.in) on this slide which closes the deck in absolute UI consistency with rest of the slides?
- **C5. Low-contrast micro type.** Footer counter and header label are ~19px at 1080 wide, at 55% ink on cream. On a phone that is effectively invisible and fails accessible-contrast guidance for small text.-------fix it using best practice recommended specs.
- **C6. Slide 16 (dictionary) uses a bullet marker for a definition.** A dictionary entry is not a list. The triangle marker fights the pronunciation line above it, and the definition is set smaller than the word's own subtitle.-------so, what should be dont so that it looks impactful and delivers the punch it is intended to?
- **C7. No cover treatment.** Slide 1 is styled identically to slide 7. In-feed, slide 1 is the only slide most people see — it currently carries no extra hierarchy, no visual hook, no distinct framing.-------let it be. It literally says kya chutiya hai AI. You dont be one!!
- **C8. No progress affordance beyond a number.** 18 slides is long. A hairline progress bar (a benchmark on high-performing LinkedIn decks) tells people how much is left; a "13 / 18" in 19px grey does not.----so what is the best way of indicating progress? what does global best practice on Linkedin say?

---

## D. Priority order if you fix only some

1. C4 (last slide), C7 (cover), B2 (size follows meaning)
2. B3 (fixed vertical anchor), B4 (dead space), C3 (line length)
3. B1 / B9 (case + punctuation system), C2 (bold weight)
4. B5, B6, B7, B8 (header/footer furniture), C5 (contrast)
5. C1, C6, B10, B11, C8

---

## E. Questions before I change anything

- **E1.** Do you want lowercase-everything, or sentence case everything, or the split rule in B1?
- **E2.** Should I keep the top-left number + rule at all, or strip the header entirely and leave only the footer counter?
- **E3.** For the last slide: big centred logo lockup as its own poster, or match the left-aligned system of the other 17?
- **E4.** Fix-in-place, or should I rebuild the layout engine so slide size is set per-slide by intent instead of by character count?

*No code changes made. Nothing regenerated. No PDF touched.*