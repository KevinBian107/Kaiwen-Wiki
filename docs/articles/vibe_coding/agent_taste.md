---
hide:
  - navigation
---

<div class="wrapper">
  <div class="profile">
    <img src="../../../assets/index/profile.png" alt="Profile Picture">
    <div class="profile-details">
      <span class="name">Kaiwen Bian</span>
      <span class="metadata">13 min read · Jun 17, 2026</span>
    </div>
  </div>
</div>

There are two kinds of "is this right?" One has a compiler. The test passes or it doesn't, the shapes match or they don't, the loss goes down or it stays flat. You can hand that kind of question to a [harness](autonomous_agents.md) with a verification loop and walk away. The other kind has no compiler. *Is this good design? Does this read well? Is this the way I would have done it?* There is no unit test for taste, and that's the problem this article is about.

Ask an agent to build a feature and it will. Ask it to build a feature *the way you like* and you'll usually get the bland statistical average of how everyone builds that feature — competent, generic, faintly soulless. "AI slop" isn't the model failing at the task. It's the model succeeding at the *wrong* target: the center of the distribution, when what you wanted was your own particular corner of it.

---

## Preference Has No Compiler

The whole structured workflow — interrogate, plan, implement, verify — leans on one thing: that correctness is *checkable*. When the agent can run a test and read the result, it can correct itself, and you can let it run autonomously because the world tells it when it's wrong.

Taste breaks that loop, for a specific and well-documented reason: **agents consistently overrate their own work, and they overrate it most on exactly the subjective tasks where there's no binary verification.** Anthropic's harness team found this directly — self-evaluation bias is *"particularly [bad] on subjective tasks like design where no binary verification exists."*[^prithvi] An agent asked "is this design good?" will almost always say yes. It is not lying; it genuinely can't tell, because the only judge in the room is the same process that produced the work.

So you can't solve preference the way you solve correctness. There's nothing to compile. The agent will not catch its own bad taste, because bad taste doesn't throw an exception.

---

## Taste Is a Set of Examples

Here's the reframe that makes this tractable. A model already contains an enormous region of possible outputs — every design, every prose style, every way of structuring a module that appeared in its training. Your preference is a *small region* inside that space. The task is not to teach the model something it doesn't know. It's to **steer** it toward the corner you already like.

And the lever for steering is examples. Not adjectives — examples. "Make it clean and modern" steers nothing; it's a word that points at the whole distribution. Three screenshots of interfaces you love, one counter-example of the slop you hate, and a sentence about what separates them — that steers. The key, distilled to one line:

> **Provide enough examples to steer it toward the region you like most.**

This is in-context imprinting. You're not changing the model's weights; you're showing it enough of the target that the nearest, most-activated region of its output space becomes *yours* instead of the generic mean. Examples do the work that adjectives pretend to.

---

## Two Halves: Taste and Framework

Preference, built deliberately, has two parts that have to travel together:

<div class="duo">
  <div class="duo__card">
    <span class="duo__label">Taste</span>
    <span class="duo__sub">what "good" looks like</span>
    <span class="duo__items">the examples · the standard · the gallery</span>
  </div>
  <span class="duo__op">×</span>
  <div class="duo__card">
    <span class="duo__label">Framework</span>
    <span class="duo__sub">what makes it repeatable</span>
    <span class="duo__items">reference docs · skills · pitfall guides · the judge</span>
  </div>
</div>

**Taste** is the standard itself — the curated set of examples that defines the target region. **Framework** is the machinery that makes that standard *apply automatically* instead of living in your head and getting re-explained every session. One without the other fails: taste with no framework is a preference you retype every time and the agent forgets the moment you `/clear`; framework with no taste is elaborate scaffolding pointed at the generic average.

### Carry the standard in reference documents and skills

The same principle from the [documentation system](why_your_vibe_coding_sucks.md) applies, but pointed at *style* rather than *correctness*. A reference document is how you encode "a more human standard" — the conventions, the design tokens, the do's and don'ts, the annotated examples of good and bad. Turn the recurring ones into skills so they trigger automatically. The reference is what survives across sessions; it's the difference between an agent that has your taste and one you have to re-train every morning.

### The UI example: don't ask for a nice UI, hand it the textbook

Concretely: never prompt for "a beautiful, responsive interface." That's an adjective pointed at the mean. Instead, give the agent the actual reference — the design system, the responsive-layout patterns you want it to follow, and an *AI design pitfall guide*: the catalog of slop tells that scream machine-generated (the gradient-purple hero, the three identical feature cards, the emoji bullet list) and an explicit instruction to avoid them. You're imprinting taste by reference. The agent writes the responsive design from a standard it can see, not from the statistical ghost of every landing page ever made.

### Two skills worth building: `stop-slop` and `taste-skill`

Operationally, the framework half is worth packaging into two reusable, always-on skills — the two halves of preference made concrete:

- **[`stop-slop`](https://github.com/hardikpandya/stop-slop)** — the *negative* standard. A guard skill that carries the catalog of slop tells (the gradient-purple hero, the three identical feature cards, the emoji bullet list, the breathless adjectives) and a standing instruction to avoid them. Written once, applied to every generation, so you stop flagging the same machine-average patterns by hand.
- **[`taste-skill`](https://www.tasteskill.dev/)** — the *positive* standard, and the *imprintable* one. A skill that carries your curated gallery of good examples and the one sentence that says what separates them, so the agent imprints your taste automatically instead of you re-pasting references every session.

`stop-slop` fences the agent out of the bad region; `taste-skill` imprints the good one. The first is a list of what to move away from; the second is a set of examples to move toward — and together they are exactly the framework that makes taste survive a `/clear`.

---

## Inject a System of Judgment

The hardest piece, and the one that closes the loop: because the agent can't grade its own taste, **the judge has to be a different process than the maker.**

This is the same move human teams make — you don't merge your own code, someone else reviews it — and it's the same move Anthropic landed on for subjective work: *"separating the evaluator from the generator"* is more tractable than asking one agent to be self-critical, a structure they borrow explicitly from the generator/discriminator split in GANs.[^prithvi] So you stand up an independent critic with one job: hold the output against the standard and say where it falls short. The critic isn't asked "is this good?" — that invites the same yes. It's asked "where does this *diverge* from these reference examples?" — a question with concrete, checkable answers.

And here's the compounding part. Every output you bless becomes a new example. The reference gallery grows; the standard sharpens; the region the agent steers toward gets tighter and more *yours* over time. You're using the past to manufacture higher-level preference — bootstrapping a sense of "good" from accumulated examples of good, the same way taste develops in a person.

---

## Catching the Long-Term Patterns

The last thing a reference document buys you is the *mature* version of a decision — the convention you'd only arrive at after doing the thing wrong a few times. Budget the layout before generating it. Name things the way the rest of the codebase names them. Reach for the established pattern, not the novel one. These are the long-horizon habits that separate work that ages well from work that looks fine in the demo and embarrasses you in a month. They live in the same place: written down, in reference, where the agent reads them every time instead of rediscovering them never.

Left to itself, an agent regresses to the slop mean on every one of these. The reference document, the skill, the pitfall guide, the independent judge — that's the framework that keeps it pinned to your standard instead.

---

## The Closing

Correctness you can verify; taste you have to imprint. The agent will not find your preferences by trying harder, and it will not catch its own bad taste, because there's no exception to throw and it grades its own homework an A. So you build preference the only way it can be built: curate the examples that define the region you like, write them into reference documents and skills so the standard outlives the session, and stand up a separate judge that holds the work against that standard instead of trusting the maker to grade itself.

Taste plus framework. Provide enough examples, and steer it toward the region you like most. That's not prompting — it's imprinting, and it's the part of building agents that the verification loop can never do for you.

---

## References

- [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps) — Prithvi Rajasekaran, Anthropic Labs (Mar 24, 2026). Source for self-evaluation bias on subjective tasks and the GAN-inspired separation of generator from evaluator.
- [`stop-slop`](https://github.com/hardikpandya/stop-slop) — Hardik Pandya. A skill that catalogs the slop tells and instructs the agent to avoid them.
- [`taste-skill`](https://www.tasteskill.dev/) — an imprintable taste skill that carries curated examples to steer generation toward your preferred standard.

[^prithvi]: Prithvi Rajasekaran, [*Harness design for long-running application development*](https://www.anthropic.com/engineering/harness-design-long-running-apps), Anthropic Labs, Mar 24, 2026.
