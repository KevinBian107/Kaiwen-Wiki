---
hide:
  - navigation
---

<div class="wrapper">
  <div class="profile">
    <img src="../../../assets/index/profile.png" alt="Profile Picture">
    <div class="profile-details">
      <span class="name">Kaiwen Bian</span>
      <span class="metadata">15 min read · Jun 17, 2026</span>
    </div>
  </div>
</div>

The thing a model is uniquely good at is not what most people use it for. We ask it to answer a question, write a function, summarize a page — all things a human could do in a few minutes. The real asymmetry is somewhere else: an agent can run for hours, across the night, while you sleep, without getting bored, without losing focus, without going home at 5pm. The strong point of an AI agent is that it can run 24/7 when you need it to — and that is exactly the regime where a raw model in a loop falls apart.

So the question isn't "can the model do the task?" It's "**how do you build something that stays on the rails long enough to actually finish?**" That question is what this article is about, and most of the answer has nothing to do with the model.

---

## An Agent Is a Model Plus a Harness

There's a clean way to factor what an agent actually is:

> **Agent = Model + Harness**

<div class="eqn">
  <div class="eqn__chip eqn__chip--model"><b>Model</b><small>the part that thinks — sets the <em>ceiling</em></small></div>
  <span class="eqn__op">+</span>
  <div class="eqn__chip eqn__chip--harness"><b>Harness</b><small>tools · memory · loop · checks · sandbox — sets the <em>reach</em></small></div>
  <span class="eqn__op">=</span>
  <div class="eqn__chip eqn__chip--agent"><b>Agent</b></div>
</div>

The model is the part that thinks. The harness is *everything else* — every piece of code, configuration, and execution logic that isn't the model itself. The loop that calls the model, the tools it can reach, the files it reads and writes, the checks that run after it acts, the way state survives from one step to the next. Without tools and a harness, a model is nothing — it's a very good next-token predictor with no hands and no memory.

This factoring matters because the two halves play completely different roles:

- **The model sets the ceiling.** It determines how strong the agent *could* be — the upper bound on the quality of any single decision.
- **The harness sets the reach.** It determines how far you can actually get before the whole thing drifts, stalls, or quietly declares victory on a job it didn't finish.

A frontier model with a bad harness gives up at hour two. A slightly weaker model with a great harness runs all night and hands you something that works in the morning. Anthropic's engineering team makes this concrete: out of the box, *"even a frontier coding model like Opus 4.5 running on the Claude Agent SDK in a loop across multiple context windows will fall short"* without the right harness around it.[^young] The model is not the bottleneck. The harness is.

---

## Three Rings of Engineering

Once you accept that the harness is where the work is, it's worth being precise about *what kind* of work. There are three nested disciplines, and people conflate them constantly:

<div class="rings">
  <div class="ring ring--outer"><span class="ring__label">Harness Engineering</span></div>
  <div class="ring ring--mid"><span class="ring__label">Context Engineering</span></div>
  <div class="ring ring--inner"><span class="ring__label">Prompt Engineering</span></div>
</div>

- **Prompt engineering** is the innermost ring: getting the wording of a single request right. This is where everyone starts, and it's the smallest lever.
- **Context engineering** wraps it: deciding *what the model sees* on any given turn — which files, which prior results, which instructions, what gets dropped when the window fills up. The prompt is one thing inside the context.
- **Harness engineering** wraps everything: the machinery that decides what happens *across* turns and *across* context windows — when to call a tool, when to verify, when to reset, when to spin up another agent, what to persist so the next step isn't starting from zero.

Prompt engineering is a subset of context engineering, which is a subset of harness engineering. When you're building something autonomous, you spend most of your time in the outermost ring. A perfect prompt inside a bad harness still drifts off the rails by hour three.

---

## What Goes in a Harness

A harness isn't one thing; it's a small kit of mechanisms, each of which exists to cover a specific way the model fails when left alone. At its heart they form a loop the model runs *inside* — decide, act, verify, persist, repeat — with the harness deciding what happens at every arrow:

<div class="loop">
  <div class="loop__row">
    <span class="loop__io loop__io--task">Task</span>
    <span class="loop__arrow">↓</span>
    <div class="loop__box">
      <span class="loop__box-label">The harness — a loop wrapped around the model</span>
      <div class="loop__nodes">
        <span class="loop__node">Persist state<small>progress log</small></span>
        <span class="loop__arrow">→</span>
        <span class="loop__node loop__node--model">Model<small>decide next step</small></span>
        <span class="loop__arrow">→</span>
        <span class="loop__node">Tools<small>act on the world</small></span>
        <span class="loop__arrow">→</span>
        <span class="loop__node loop__node--check">Verify<small>against reality</small></span>
      </div>
      <div class="loop__back">↺ <b>not yet</b> → verify sends the work back to “decide”; on <b>feature passes</b> it persists and moves on.</div>
    </div>
    <span class="loop__arrow">↓</span>
    <span class="loop__io loop__io--done">Finished, verified work</span>
  </div>
  <div class="loop__branch">⤷ the loop can <b>spin up subagents</b> — an auditor, a tester, an evaluator — each in its own context.</div>
</div>

Here are the load-bearing pieces.

**Tool orchestration.** The model can only affect the world through tools — reading files, running code, hitting a browser, querying a database. Orchestration is deciding which tools exist, how they're described, and how their outputs flow back in. Anthropic's long-running coding agent, for instance, drives a real browser through Puppeteer to test its own work end-to-end rather than trusting that the code "looks right."[^young]

**State and context persistence.** A model has no memory between context windows. If your task is longer than one window — and any genuinely autonomous task is — you need an external memory the agent writes to and reads back. The simplest version that works astonishingly well is a plain progress log: Anthropic's harness keeps a `claude-progress.txt` file recording what's been done so the next session knows where to pick up.[^young] This is the same idea as the `progress.txt` and scratch READMEs from the [structured workflow](why_your_vibe_coding_sucks.md) — external memory is external memory whether a human or an agent is the one resuming.

**Task decomposition.** Don't ask for the whole thing at once. Ask for one feature, finished and verified, then the next. Anthropic's agent works *"one feature at a time,"* and the design-focused harness breaks work into sprints where each sprint negotiates *"what done looks like"* before any code is written.[^prithvi] Decomposition is what keeps scope from quietly ballooning.

**Verification loops.** This is the difference between an agent that *claims* it's done and one that *is* done. The harness forces the agent to check its own work against something concrete before moving on — Anthropic's instruction is blunt: *"Self-verify all features. Only mark features as 'passing' after careful testing."*[^young] The verification has to bite, which is exactly why the next piece matters.

**Subagents.** Not every job should be done by the same agent in the same context. A read-only auditor, a testing agent, a cleanup agent, a separate evaluator — each gets a clean window and a narrow mandate. Anthropic's design harness uses a three-agent split — a planner, a generator, and an evaluator — precisely because *"separating the evaluator from the generator"* is more tractable than asking one agent to both produce work and judge it honestly.[^prithvi]

**Permission sandboxing.** Autonomy without guardrails is just a faster way to do damage. The harness defines what the agent is allowed to touch — which commands run without asking, which never run at all — so it can move fast inside a fenced yard. Never hand an unsupervised loop a blanket `rm -rf`.

**A review / check-back mechanism.** Something — a gate, a test suite, a human at a checkpoint, another agent — has to be able to say "no, not yet" and send the work back. An agent with no path back to its own output just accumulates plausible-looking mistakes.

Each of these exists for a reason, and the reason is always the same: *every component in a harness encodes an assumption about what the model can't do on its own.*[^prithvi] That sentence is the whole design philosophy in one line, and it has a sharp corollary we'll come back to at the end.

---

## The Long-Horizon Problem

Why is any of this necessary? Because the failure modes of a model running by itself for a long time are specific, repeatable, and not the ones you'd guess. The whole game is what happens as the task stretches across context windows:

<div class="timeline">
  <div class="timeline__axis">time · context windows →</div>
  <div class="timeline__row timeline__row--bad">
    <span class="timeline__tag">raw model in a loop</span>
    <div>
      <div class="timeline__steps"><span class="step">start</span><span class="seq-arrow">→</span><span class="step">work</span><span class="seq-arrow">→</span><span class="step">work</span><span class="seq-arrow">→</span><span class="step step--ghost">“done!”</span><span class="outcome outcome--bad">✗ drifts · declares victory early · out of context</span></div>
      <div class="timeline__note">nothing survives the context-window boundary</div>
    </div>
  </div>
  <div class="timeline__row timeline__row--good">
    <span class="timeline__tag">model with a harness</span>
    <div>
      <div class="timeline__steps"><span class="step">start</span><span class="seq-arrow">→</span><span class="step">work</span><span class="seq-arrow">→</span><span class="step">verify</span><span class="seq-arrow">↺</span><span class="step">persist</span><span class="seq-arrow">→</span><span class="step">reset</span><span class="seq-arrow">→</span><span class="step">work</span><span class="seq-arrow">→</span><span class="step">verify</span><span class="outcome outcome--good">✓ done</span></div>
      <div class="timeline__note">the handoff artifact crosses the boundary; “not yet” loops verify back to work</div>
    </div>
  </div>
</div>


- **Objective drift.** Over a long enough horizon, the agent slowly forgets what it was actually for. It starts polishing the wrong thing, or — more insidiously — it *"declare[s] the job done"* prematurely because finishing feels like progress.[^young] You set it loose for a day and come back to something confidently complete and subtly wrong.
- **Context anxiety.** As the window fills up, some models get visibly nervous about running out of room and start wrapping up early, cutting corners to "make it fit."[^prithvi] The work degrades not because the task got harder but because the agent can see the edge of its own memory approaching.
- **Running out of context mid-task.** Without persistence, hitting the window limit halfway through an implementation leaves you with something *"half-implemented and undocumented"* — worse than not starting.[^young]
- **Self-evaluation bias.** Agents consistently overrate their own output, especially on anything subjective where there's no binary pass/fail.[^prithvi] An agent asked "is this good?" will almost always say yes. This is why verification has to come from outside the agent doing the work.

None of these are model-quality problems. A smarter model drifts more eloquently. They are *harness* problems, and they're solved with harness machinery: persistence to survive the window boundary, decomposition to keep the objective in view, an external evaluator to break the self-grading loop.

---

## Borrowing From Human Engineers

The most useful framing in Anthropic's work on this is that they didn't invent new tricks — they *"looked to human engineers for inspiration in creating a more effective agent harness."*[^x] Think about how a human team actually ships something across days and weeks:

- They keep a log of what's done and what's next, so anyone can pick up the thread (state persistence).
- They write a handoff when they leave for the day, so tomorrow-them isn't reconstructing context from scratch (context resets with structured handoffs, which Anthropic argues beats blindly summarizing the old conversation in place[^prithvi]).
- They break a quarter into sprints with an agreed definition of done (task decomposition).
- They don't merge their own code — someone else reviews it (separating generator from evaluator).

A harness is, in a real sense, the *organizational structure* of a one-person team that happens to be made of model calls. The reason the human analogy works is that humans have always faced the long-horizon problem — bounded memory, drift, the temptation to call it done — and the practices that solve it for people solve it for agents too.

---

## The Dynamic Harness: What "Ultracode" Mode Does

There's a step between a human-built harness and a fully self-built one, and it's already shipping. Notice the tension in everything above: the harness is hand-built, but the tasks are open-ended. No human can hand-write a single 24/7, general-purpose harness that fits every job — **the shape of the harness has to conform to the shape of the task**, and the tasks keep changing. The way out is to stop writing the harness ahead of time and start *generating it at runtime*.

That's the mechanism behind what Claude Code surfaces as **ultracode mode**. Instead of running one fixed loop, the agent *authors an orchestration workflow* for the specific task in front of it and then runs that — a harness generated on the spot. Three moves do the work:

- **Turn the plan into verifiable code.** The plan isn't prose the agent hopes to follow; it's compiled into checks — gates, tests, schemas — so that "done" has a concrete definition the work can be measured against. The plan *becomes* the verification.
- **Fan out into sub-processes.** The work is decomposed into many subagents running in parallel — finders, builders, auditors — each in its own context, rather than one agent grinding through everything linearly.
- **Verify adversarially.** Outputs aren't trusted because the maker is confident; independent verifiers are spun up to *refute* them, and only what survives is kept. It's the generator/evaluator split from earlier, applied at scale.

The principle underneath is that the *ideal* harness isn't a script written once — it's a scheduling logic generated in real time, sized to the task. So the human stops hand-coding the orchestration and instead invests in the things that make dynamic orchestration possible: a way to turn plans into checks, a stable interface for fanning out, and an adversarial verification pass to filter the results. The harness becomes something the agent *assembles for the job* rather than something you built in advance — which is the last step before it starts assembling harnesses for *itself*.

---

## The Ultimate: Agents That Build Their Own Harness

Here's the corollary I promised. If *every component in a harness encodes an assumption about what the model can't do on its own*, then **every harness has an expiration date.** The progress file exists because the model can't hold the whole task in its head — until the window is large enough that it can. The verification loop exists because the model overrates its own work — until it doesn't. As models improve, scaffolding that was essential becomes dead weight; Anthropic notes that components needed for one model version *"became unnecessary"* on the next.[^prithvi] The right discipline is to *stress-test* each assumption and delete the ones that no longer hold.

Follow that to its end and you get the interesting destination. Today, a human builds the harness — chooses the tools, writes the progress-file convention, defines what verification means. The ultimate version is one where the human no longer has to: the agent inspects its own failures, notices where it keeps drifting, and writes the missing piece of harness itself — its own progress convention, its own checks, its own rules for when to spin up a subagent. The harness stops being something we build *for* the agent and becomes something the agent builds *for itself*, then uses to govern its own behavior.

That's the recursive loop worth pointing at: a model good enough to engineer the harness that makes a model that strong actually reliable. We're not there. But you can see the gradient from here, and it explains why "how should an autonomous agent be built?" is, in the long run, a question the agent will increasingly answer on its own.

---

## The Closing

The instinct is to obsess over the model — which one, how big, how smart. But the model only sets the ceiling. Whether you ever reach that ceiling, and whether the agent can hold it for eight hours instead of eight minutes, is decided by the harness: the tools, the persistence, the decomposition, the verification, the subagents, the sandbox, the path back. Build those well and a modest model runs all night. Build them badly and the best model in the world quits before lunch.

An agent is a model plus a harness. The model you mostly just *pick*. The harness you *build* — and that's where the engineering actually is.

---

## References

- [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) — Justin Young, Anthropic Engineering (Nov 26, 2025). The primary source for this article's framing of harnesses, progress files, self-verification, and objective drift.
- [Anthropic on X](https://x.com/AnthropicAI/status/1993733817849303409) — *"Long-running AI agents still face challenges working across many context windows. We looked to human engineers for inspiration in creating a more effective agent harness."*
- [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps) — Prithvi Rajasekaran, Anthropic Labs (Mar 24, 2026). Source for context anxiety, self-evaluation bias, context resets vs. compaction, the planner/generator/evaluator split, and the "every component encodes an assumption" principle.
- [Scaling managed agents: decoupling the brain from the hands](https://www.anthropic.com/engineering/managed-agents) — Lance Martin, Gabe Cemaj, Michael Cohen, Anthropic (Apr 08, 2026). On virtualizing the agent into brain, hands, and session for reliability and scale.

[^young]: Justin Young, [*Effective harnesses for long-running agents*](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), Anthropic Engineering, Nov 26, 2025.
[^prithvi]: Prithvi Rajasekaran, [*Harness design for long-running application development*](https://www.anthropic.com/engineering/harness-design-long-running-apps), Anthropic Labs, Mar 24, 2026.
[^x]: Anthropic, [announcement post on X](https://x.com/AnthropicAI/status/1993733817849303409).
