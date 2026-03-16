<div class="wrapper">
  <div class="profile">
    <img src="../../../assets/index/profile_pic.jpeg" alt="Profile Picture">
    <div class="profile-details">
      <span class="name">Kaiwen Bian</span>
      <span class="metadata">10 min read · Mar 16, 2026</span>
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

## Documentation First, Code Second

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

## Version Control as a Safety Net

klöss emphasizes committing early and often. For research code this is even more critical — you need to be able to revert to a state where training was working.

**Rules:**

1. **Commit after every working component** — not at the end of the day, not after the whole feature. After each piece that runs correctly.
2. **Descriptive messages** — "Added per-depth commitment loss with separate coefficients" not "updated losses".
3. **Branch per experiment** — don't pollute main with experimental changes. Use `git worktree` for parallel experiments.
4. **Commit before `/clear`** — if you're about to clear Claude's context, commit first. The scratch README and git history are all that survives.

It is much better to commit often so you can revert to a safe state than to try and fix a hallucinating session.

---

## Tools and Their Modes

klöss identifies four modes of working with AI coding tools. Adapted for research with Claude Code:

### Ask Mode (Read-Only Consultation)

Use this when you need to understand existing code without modifying anything:

```
Read the training loop in train_vqvae.py and explain how the VQ loss is
integrated into the PPO loss. Don't make any changes.
```

### Plan Mode (Architecture Before Code)

Use this for designing how a new component fits into the existing system:

```
Read scratch/rvq-pilot/README.md. Based on the investigation, plan how to
implement the ResidualVectorQuantizer. Don't implement yet — review the
plan and tell me if the ordering is wrong. ultrathink
```

### Agent Mode (The Workhorse)

This is where code gets written. But always after interrogation and planning:

```
Implement the ResidualVectorQuantizer class in vq_intention_network.py.
Follow the architecture from the STAR paper as documented in
scratch/paper-notes/star-rvq.md. ultrathink
```

### Debug Mode (Systematic Error Hunting)

When training breaks, provide the full context — not just "it doesn't work":

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

---

## Advanced Workflow

### Parallel Sessions

Git worktrees enable multiple Claude Code instances building different components simultaneously without file conflicts:

```bash
git worktree add ../experiment-rvq feature/rvq
git worktree add ../experiment-fsq feature/fsq
```

Each worktree gets its own Claude Code session. Compare the results.

### Subagents

Delegate focused tasks to specialized sub-sessions. The main agent spawns them, they do focused work, and report back. For research, this means running Paper Alignment Auditor, Silent Bug Detector, and JAX Logic Auditor in parallel after each implementation step.

### Voice Dictation

klöss notes: *"You speak 3x faster than you type, leading to more detail."* More detail in prompts means better output. For research, this is especially valuable when describing complex architectural requirements — speaking forces you to explain the full picture rather than shortcutting with terse text.

---

## Errors Are Instructions, Not Insults

When something breaks, provide AI with three things:

1. **The complete error message** — not "it crashed", the full traceback
2. **The code at that line** — context around where it failed
3. **What you expected** — "expected shape (B, 64, 60) but got (B, 60)"

For research code, add a fourth:

4. **What the training metrics showed** — "loss was decreasing normally until step 10k, then codebook utilization collapsed"

The more context you provide, the less the AI hallucinates a fix.

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

## The Closing

klöss's closing applies perfectly to research:

*"Vibe coding isn't witchcraft. It's meticulous planning."*

The AI doesn't need to be smarter. You need to be more structured. Write down what you want. Interrogate your assumptions. Plan before you code. Validate after you build. Track your progress. Capture your failures.

---

## References

- [klöss (@kloss_xyz) — Why You Suck at Vibe Coding](https://x.com/kloss_xyz/status/2018097344345223455) — the original article this piece is adapted from
- [Structured Vibe Coding with Claude Code Agents](structured_agentic_vibe_coding.md) — the agent architecture and workflow for implementing these ideas with Claude Code
