<div class="wrapper">
  <div class="profile">
    <img src="../../../assets/index/profile_pic.jpeg" alt="Profile Picture">
    <div class="profile-details">
      <span class="name">Kaiwen Bian</span>
      <span class="metadata">25 min read · Mar 16, 2026</span>
    </div>
  </div>
</div>

This article is adapted from [klöss (@kloss_xyz)](https://x.com/kloss_xyz/status/2018097344345223455)'s *"Why You Suck at Vibe Coding (and the Comprehensive Guide to Fix You)"*, rewritten for **research and ML development workflows** rather than full-stack software engineering pipelines. The original is a must-read — go read it. What follows is the subset that matters for research engineering, with additions for how these ideas apply when you're implementing papers, debugging training, and building on existing codebases.

---

## You Are the Problem

Vibe coding isn't the problem. You are.

You heard you could talk to an AI agent and ship software. You opened Claude Code, described your research idea in a sentence, and expected magic. Instead you got: hallucinated function signatures, training loops that silently compute the wrong loss, and code that "kinda works" until you look at the outputs.

The core insight from klöss: **AI hallucinates because you gave it nothing to hold onto. No structure, clarity, or foundation.**

This applies doubly to research code. In a web app, a hallucinated component is visible immediately. In a training pipeline, a wrong reduction axis or a flipped sign in the loss silently produces plausible-looking but meaningless results. You won't know for hours — or days.

---

## The Documentation System

klöss's system requires six canonical documents before writing any code. For research development, we adapt these into what matters for your project:

| klöss's Original | Research Adaptation |
|---|---|
| PRD.md | **RESEARCH_GOALS.md** — What hypothesis are you testing? What does success look like? What metrics matter? |
| APP_FLOW.md | **PIPELINE_FLOW.md** — Data loading → preprocessing → model → loss → optimization → evaluation → logging. Every step mapped. |
| TECH_STACK.md | **TECH_STACK.md** — Same idea. Lock your JAX/PyTorch version, CUDA version, key dependencies. No ambiguity. |
| FRONTEND_GUIDELINES.md | **EXPERIMENT_CONFIG.md** — Hyperparameters, sweep ranges, what's fixed vs tunable. All values copy-paste ready. |
| BACKEND_STRUCTURE.md | **ARCHITECTURE.md** — Model architecture, tensor shapes at every layer, data schemas, checkpoint format. |
| IMPLEMENTATION_PLAN.md | **IMPLEMENTATION_PLAN.md** — Same. Step-by-step build sequence, one component at a time. |

### The Persistence Layer

Two files that survive across sessions:

- **CLAUDE.md** — The AI's operating manual. Rules, patterns, project context. Claude reads this automatically at the start of every conversation.
- **progress.txt** (or a scratch README) — Tracks completed and pending work. AI has no session-to-session memory — this is its external memory. Update it after every feature.

### Project Structure

A messy project confuses AI. For research codebases, maintain a clear structure:

```
my-research-project/
├── src/                    → Model code, training loops, utilities
├── configs/                → Experiment configs (YAML/JSON)
├── scripts/                → Entry points (train.py, eval.py)
├── scratch/                → Investigation artifacts (gitignored)
├── data/                   → Data loading and preprocessing
├── tests/                  → Validation and sanity checks
├── .env                    → API keys, wandb tokens (never commit)
├── CLAUDE.md               → AI rules and project context
├── progress.txt            → Session tracking
├── RESEARCH_GOALS.md       → Hypotheses and success metrics
├── PIPELINE_FLOW.md        → Data-to-output pipeline map
├── TECH_STACK.md            → Locked dependencies
├── EXPERIMENT_CONFIG.md    → Hyperparameters and sweep ranges
├── ARCHITECTURE.md         → Model architecture and tensor shapes
└── IMPLEMENTATION_PLAN.md  → Step-by-step build sequence
```

When AI generates code, tell it where to put it. "Create the ResidualVectorQuantizer in `src/models/vq_intention_network.py`." If you don't specify, AI puts files wherever it wants and nothing connects.

### Using the Documents During Building

Markdown isn't optional. It's the language AI thinks in. Every `.md` file you write becomes a reference document AI can read, understand, and follow. You're not writing docs for humans — you're writing **constraints for AI**.

Here's how each document gets used during building:

- **RESEARCH_GOALS.md** is your scope's source of truth. When AI tries to add things you didn't ask for, point to it: "Only build what's in RESEARCH_GOALS.md."
- **PIPELINE_FLOW.md** is what you reference when building data loading and training loops: "Build the evaluation pipeline exactly as documented in PIPELINE_FLOW.md section 3."
- **TECH_STACK.md** prevents dependency hallucinations: "Only use packages listed in TECH_STACK.md. Don't add new dependencies without asking."
- **EXPERIMENT_CONFIG.md** locks your hyperparameters: "Use the learning rate and batch size from EXPERIMENT_CONFIG.md section 2."
- **ARCHITECTURE.md** defines your model: "Create the encoder following ARCHITECTURE.md section 1. Shapes must match exactly."
- **IMPLEMENTATION_PLAN.md** is your execution sequence: "We're on step 4.2 of IMPLEMENTATION_PLAN.md. Only build this step."

### CLAUDE.md as a Living Document

Here's the trick most people miss: **CLAUDE.md is a living document.** Every time AI makes a mistake and you correct it, end with "Edit CLAUDE.md so you don't make that mistake again." Claude is good at writing rules for itself. Over time, your CLAUDE.md becomes a self-improving rulebook. Error rates measurably drop because AI is literally coding its own corrections.

Take it further with a **lessons.md** file. After every correction, every debugging session, Claude updates lessons.md with the pattern that caused the problem and the rule that prevents it. Have your CLAUDE.md point to it: "Review lessons.md at session start for relevant items." Now AI learns from its own history on your project. This is the self-improvement loop that separates a good CLAUDE.md from a great one.

### progress.txt as Your Session Bridge

Update it after every feature:

```
Completed:
- ResidualVectorQuantizer forward pass (depth=2, K=64)
- Per-depth commitment loss with separate coefficients
- Regression test: depth=1 matches vanilla VQ output

In Progress:
- Rotation-augmented STE gradients
- Need to validate gradient flow through rotation matrix

Next:
- Update forward_temporal scan for per-depth stickiness bias
- Video rendering with stacked depth bars

Known Issues:
- Depth-2 codebook utilization drops after 10k steps
```

When you open a new terminal, start a new session, or come back a week later, AI reads this and knows exactly where you are.

---

## The Interrogation System

Before writing any code, force the AI to question your assumptions:

```
Before writing any code, endlessly interrogate my idea in Planning mode
only. Assume nothing. Ask questions until there's no assumptions left.
```

This is klöss's single most important prompt. For research, extend it:

```
Before writing any code, interrogate my proposed architecture against the
paper. Assume nothing about how the existing codebase works. Ask questions
about: (1) which equations map to which code paths, (2) what shapes flow
through each layer, (3) where the loss components are computed and how they
combine, (4) what the paper leaves ambiguous. Don't start until there are
no assumptions left. ultrathink
```

The interrogation surfaces misunderstandings before they become bugs. A wrong assumption in the plan propagates into wrong code that produces plausible but meaningless training curves.

---

## Break Big Ideas into Small Pieces

klöss's rule: never say "build me an e-commerce site." Decompose into granular steps.

For research, never say "implement RVQ from this paper." Instead:

1. Read the paper and extract architecture into structured notes
2. Investigate the existing codebase and map the code paths
3. Plan the integration points — what changes, what stays
4. Implement the quantizer module (just the forward pass)
5. Validate shapes and gradients with tests
6. Implement the loss computation
7. Validate loss values with known inputs
8. Integrate into the training loop
9. Run a minimal training config to verify
10. Add logging and visualization

Each step is a session. Each session ends with a commit and a `/clear`. The scratch README tracks what's done.

---

## Tools and Workflow

### Modes of Working

klöss identifies four modes of working with AI coding tools. Adapted for research with Claude Code:

**Ask Mode (Read-Only Consultation)** — Use when you need to understand existing code without modifying anything:

```
Read the training loop in train_vqvae.py and explain how the VQ loss is
integrated into the PPO loss. Don't make any changes.
```

**Plan Mode (Architecture Before Code)** — Use for designing how a new component fits into the existing system:

```
Read scratch/rvq-pilot/README.md. Based on the investigation, plan how to
implement the ResidualVectorQuantizer. Don't implement yet — review the
plan and tell me if the ordering is wrong. ultrathink
```

**Agent Mode (The Workhorse)** — Where code gets written. But always after interrogation and planning:

```
Implement the ResidualVectorQuantizer class in vq_intention_network.py.
Follow the architecture from the STAR paper as documented in
scratch/paper-notes/star-rvq.md. ultrathink
```

**Debug Mode (Systematic Error Hunting)** — When training breaks, provide full context:

```
/debug-training codebook utilization drops from 80% to 5% after 10k steps
with RVQ. Depth 1 uses all 64 codes but depth 2 collapses to 3 codes.
Loss is still decreasing overall.
```

### Multi-Model Workflows

klöss's approach: use different models for different phases.

- **Claude** for thinking, planning, and deep reasoning
- **Different models** for specialized tasks (visual design matching, quick code review)

For research, this translates to: use `ultrathink` for architectural decisions and debugging hypotheses, and regular mode for routine file edits and formatting.

### Version Control

klöss emphasizes committing early and often. For research code this is even more critical — you need to be able to revert to a state where training was working.

1. **Commit after every working component** — not at the end of the day, not after the whole feature. After each piece that runs correctly.
2. **Descriptive messages** — "Added per-depth commitment loss with separate coefficients" not "updated losses".
3. **Branch per experiment** — don't pollute main with experimental changes. Use `git worktree` for parallel experiments.
4. **Commit before `/clear`** — if you're about to clear Claude's context, commit first. The scratch README and git history are all that survives.

It is much better to commit often so you can revert to a safe state than to try and fix a hallucinating session.

### Advanced: Parallel Sessions

Git worktrees enable multiple Claude Code instances building different components simultaneously without file conflicts:

```bash
git worktree add ../experiment-rvq feature/rvq
git worktree add ../experiment-fsq feature/fsq
```

Each worktree gets its own Claude Code session. Compare the results.

### Advanced: Subagents

Delegate focused tasks to specialized sub-sessions. The main agent spawns them, they do focused work, and report back. For research, this means running Paper Alignment Auditor, Silent Bug Detector, and JAX Logic Auditor in parallel after each implementation step.

### Advanced: Custom Skills and Slash Commands

If you do something more than once a day, make it a reusable skill or slash command and commit it to git. Build a `/primer` command that scans the full codebase before implementation. Build a `/debug-training` command for structured diagnosis. Skills are how you teach Claude new capabilities specific to your workflow. They compound across every project you touch.

### Advanced: Autonomous Bug Fixing

Stop hand-holding debugging. When CI tests fail, say "Go fix the failing tests." When you get a bug, paste the logs and say "Fix." Point to error traces, failing tests, wandb logs — let Claude track the issue, find the root cause, and resolve it. Claude is surprisingly good at reading training logs, tracing data flow issues, and fixing things that would take you hours manually.

### Advanced: Learning Mode

When you want to understand what AI is doing, not just have it do it, ask Claude to explain its reasoning for every change. You can also ask Claude to generate visual HTML demos to explain unfamiliar code, draw ASCII diagrams of architectures, or build spaced-repetition flashcards from new concepts. The people who learn while building are the ones who eventually stop needing this guide.

### Advanced: Voice Dictation

klöss notes: *"You speak 3x faster than you type, leading to more detail."* More detail in prompts means better output. For research, this is especially valuable when describing complex architectural requirements — speaking forces you to explain the full picture rather than shortcutting with terse text.

---

## Working with AI

### Talking to AI With Precision

Now you have the vocabulary — use it.

Vague prompt:

```
Implement the paper's architecture in my codebase
```

Specific, document-backed prompt:

```
First read CLAUDE.md and progress.txt. Then build step 4.2 of
IMPLEMENTATION_PLAN.md. The quantizer architecture is defined in
ARCHITECTURE.md section 2. Use the hyperparameters from
EXPERIMENT_CONFIG.md. Tensor shapes must match PIPELINE_FLOW.md section 3.
ultrathink
```

Same idea. Completely different output quality.

Specificity isn't extra work — it **is** the work. The more you define upfront, the less you debug later.

### How to Read AI's Output

AI gives you code. Do you know what you're looking at?

You don't need to understand every line. But you need to understand the structure. What files were created? What do they do? How do they connect?

When AI generates code, ask:

```
Explain in plain English what you just built. What does each file do?
How do they connect? What shapes flow through each function?
```

Over time, you'll start recognizing patterns. You'll see an import and know it's pulling from another module. You'll see a `jax.lax.scan` and know it's a sequential operation. You'll see a loss computation and know to check the reduction axis.

This is how you go from vibe coder to someone who actually understands what they're building. Not by memorizing syntax, but by understanding patterns.

### How to Iterate

Everyone's first output is rarely right. That's fine.

The iteration system:

1. AI builds version 1
2. You test it — run training, check shapes, verify outputs
3. You describe specifically what's wrong (not "it's broken", but "the commitment loss is not decreasing — it stays at 0.5 for all steps, here's the wandb log")
4. AI fixes it
5. You test again
6. Repeat

Good iteration: "The per-depth codebook utilization metric shows depth-2 stuck at 3 active codes while depth-1 uses all 64. The commitment loss coefficients are equal at 0.5 for both depths. I suspect depth-2 residuals have near-zero variance."

Bad iteration: "Training doesn't look right, fix it."

Be specific. Always.

---

## When Things Break

### Errors Are Instructions, Not Insults

When something breaks, provide AI with three things:

1. **The complete error message** — not "it crashed", the full traceback
2. **The code at that line** — context around where it failed
3. **What you expected** — "expected shape (B, 64, 60) but got (B, 60)"

For research code, add a fourth:

4. **What the training metrics showed** — "loss was decreasing normally until step 10k, then codebook utilization collapsed"

The more context you provide, the less the AI hallucinates a fix.

### The Debugging Loop

When something breaks:

1. **Read the error.** Actually read it.
2. **Find the location.** What file, what line.
3. **Understand the claim.** What does the error say is wrong?
4. **Check the obvious.** Typos, missing imports, wrong variable names, shape mismatches.
5. **Give AI the context.** Error + code + what you expected + what the training metrics showed.

The loop: AI gives you code → you run it → it breaks → you paste the error → AI fixes → repeat until it works.

For stubborn bugs that survive two or three rounds, switch tools. Use subagents — spin up a Silent Bug Detector to check for broadcasting issues, or a Failure Mode Researcher to search the literature for similar training failures. For bugs that span multiple files or involve data flow issues, use a Data Flow Tracer to map the full pipeline.

This is normal. Vibe coding is not a one-shot approach. It's iterative. The skill is iterating fast and knowing when to switch tools, not avoiding iteration entirely.

---

## Knowing Your Limits

### When AI Is the Wrong Tool

Sometimes you just need to learn the thing.

**Use AI for:** generating boilerplate, writing repetitive logic, exploring approaches quickly, debugging with context, translating your intent into code, searching literature for similar problems.

**Learn yourself:** core concepts (how your framework works), how to read AI-generated code, how to spot when AI is wrong, how to debug when AI can't help, how your training pipeline fundamentally operates.

If you rely on AI for everything, you're building on quicksand. One weird bug and you're stuck. If AI explains something wrong and you believe it, you're in trouble.

Also: often the framework documentation is better than AI's information. JAX docs, PyTorch docs, library READMEs have authoritative information. AI is good at synthesis and generation, but when it fails, knowing how to search official docs is the fallback skill nobody talks about.

### Scope and Knowing When to Stop

An endless feature list kills more research projects than bad code.

**You're done when:** the core experiment runs, the metrics you need are logged, the results are reproducible, and the code is committed.

**You're NOT done when:** it's "perfect", every edge case is handled, it has every visualization you can imagine, or the code is fully refactored.

Run the experiment and get results. Then iterate based on what you actually learn. The best experiment you never run is worse than the mediocre one that gives you data.

### Maintaining What You Built

You built it. Now you need to change it — or someone else does.

Future you (or your lab mate, or AI in a new session) needs to understand the code. This is where your documentation system pays off.

When you come back to code after 3 months:

```
Read CLAUDE.md, progress.txt, and RESEARCH_GOALS.md. I'm returning to this
project after a break. Based on IMPLEMENTATION_PLAN.md, summarize where
things are and what needs attention.
```

Good documentation makes future sessions 10x faster. Bad documentation means starting from zero.

Keep dependencies updated, write comments on confusing parts, use consistent naming, and treat your codebase like an Airbnb someone else will visit and need to find things.

---

## The Closing

klöss's closing applies perfectly to research:

*"Vibe coding isn't witchcraft. It's meticulous planning."*

The AI doesn't need to be smarter. You need to be more structured. Write down what you want. Interrogate your assumptions. Plan before you code. Validate after you build. Track your progress. Capture your failures.

---

## References

- [klöss (@kloss_xyz) — Why You Suck at Vibe Coding](https://x.com/kloss_xyz/status/2018097344345223455) — the original article this piece is adapted from
- [Structured Vibe Coding with Claude Code Agents](structured_agentic_vibe_coding.md) — the agent architecture and workflow for implementing these ideas with Claude Code
