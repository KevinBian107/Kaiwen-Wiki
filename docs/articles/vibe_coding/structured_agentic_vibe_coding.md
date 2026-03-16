<div class="wrapper">
  <div class="profile">
    <img src="../../../assets/index/profile_pic.jpeg" alt="Profile Picture">
    <div class="profile-details">
      <span class="name">Kaiwen Bian</span>
      <span class="metadata">20 min read · Mar 16, 2026</span>
    </div>
  </div>
</div>

AI tools are improving rapidly and we need to learn how to integrate them into our workflows — sharpen the saw, optimize the process. This is an instructional guide containing useful tips on creating structural coding agents for doing research and engineering.

The most important key towards using coding agents is how we can **regularize** them based on the experiences we had and the requirements we want them to fulfill. The [claude_resources](https://github.com/KevinBian107/Kaiwen-Wiki/tree/master/docs/articles/vibe_coding/claude_resources/) section can serve directly as a `.claude/` folder for AI/robotics research, including "regularizations" that I think are important for structured agentic vibe coding.

---

## Setting Up Claude Code

Claude Code is a CLI-based coding agent. Install it directly:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

For full autonomy (use in isolated environments like dev containers):

```bash
claude --dangerously-skip-permissions
```

If running on Linux with root access, create a non-root user first:

```bash
useradd -m devuser
su - devuser
exec bash
```

### The CLAUDE.md File

The first thing to set up is `CLAUDE.md` — a context file that Claude automatically reads at the start of every conversation. This is your system prompt for the project.

```
/init
```

Or create your own. A good `CLAUDE.md` includes: project awareness, code structure guidelines, testing requirements, style conventions, and task completion workflows. See [this example CLAUDE.md](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/CLAUDE.md) for a Python ML/robotics project template.

### File Placement

Claude reads `CLAUDE.md` files from multiple locations, which is powerful for monorepos:

```
./CLAUDE.md              # Root — shared with team
./CLAUDE.local.md        # Local only, gitignored
root/frontend/CLAUDE.md  # Frontend-specific context
root/backend/CLAUDE.md   # Backend-specific context
```

### Permission Management

Configure tool allowlists so Claude doesn't ask permission for every file read:

```json
{
  "allowedTools": [
    "Edit", "Read", "Write",
    "Bash(git add:*)",
    "Bash(git commit:*)",
    "Bash(python:*)",
    "Bash(pytest:*)"
  ]
}
```

Save this in `.claude/settings.local.json`. Never allow `Bash(rm -rf:*)` or similar destructive patterns.

### Prompting Techniques

A few keywords that change Claude's behavior:

- **`ultrathink`** — triggers deeper analysis. Use it for architectural decisions and complex reasoning.
- **`IMPORTANT`** — emphasizes critical instructions.
- **`Proactively`** — encourages Claude to take initiative.

Avoid prompting for "production-ready" code — it leads to over-engineering. Instead, prompt Claude to write validation scripts to check its own work.

---

## The Agent Architecture

The real power of Claude Code comes from its three customization layers: **commands**, **skills**, and **subagents**. Understanding the differences is critical.

| | Trigger | Context | Location |
|---|---|---|---|
| **Command** | Explicit — you type `/name` | Runs in your main conversation | `.claude/commands/` |
| **Skill** | Automatic — keyword match | Runs in your main conversation | `.claude/skills/` |
| **Subagent** | Automatic (proactive) or explicit | Separate, isolated context window | `.claude/agents/` |

### Commands: On-Demand Workflows

Commands are saved prompt templates you invoke manually. Examples:

- **`/primer`** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/commands/primer.md)) — Comprehensive repository analysis to prime Claude on your codebase before writing code.
- **`/read-paper`** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/commands/read-paper.md)) — Extracts structured implementation references from papers: architecture, equations, pseudocode, hyperparameters.
- **`/debug-training`** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/commands/debug-training.md)) — Diagnoses training issues (NaN loss, gradient explosion, mode collapse) with structured root cause analysis.
- **`/trace-shapes`** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/commands/trace-shapes.md)) — Annotates every intermediate tensor with shape, dtype, and semantic axis labels.
- **`/fix-github-issue`** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/commands/fix-github-issue.md)) — Fetches issue details, implements fix, runs tests, creates PR.

Create your own by adding a markdown file to `.claude/commands/`:

```markdown
# Command: analyze-performance

Analyze the performance of the file specified in $ARGUMENTS.

## Steps:
1. Read the file at path: $ARGUMENTS
2. Identify performance bottlenecks
3. Suggest optimizations
4. Create a benchmark script
```

Then invoke it: `/analyze-performance src/heavy-computation.js`

### Skills: Automatic Triggers

Skills activate when your language matches trigger conditions — no explicit invocation needed.

- **Investigation** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/skills/investigation/SKILL.md)) — Scaffolds a structured investigation in `scratch/` with a dated folder and living README. Triggers on "investigate", "trace from X to Y", "figure out why".
- **Retrospective** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/skills/retrospective/SKILL.md)) — Captures experiment learnings into a reusable registry. The **failed attempts table is the most valuable part** — it prevents repeating mistakes across `/clear` boundaries.
- **Think Deeply** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/skills/think-deeply/SKILL.md)) — Anti-sycophancy guard. Forces Claude to steel-man the opposite position instead of agreeing with you. Critical during investigation phases.
- **Deep Research** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/skills/deep-research/SKILL.md)) — Structured literature review with comparison tables, taxonomies, and gap analysis.
- **Paper Extraction** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/skills/paper-extraction/SKILL.md)) — Batch-processes multiple papers into a structured database with BibTeX metadata.

### Subagents: Specialized Isolated Workers

Subagents are separate Claude instances with their own context window and limited tools. The main agent spawns them, gives them a focused prompt, and they return results. They don't see your conversation history.

Key subagents for ML/research work:

- **Paper Alignment Auditor** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/agents/paper-alignment-auditor.md)) — Cross-references code against source paper equations. Catches wrong KL direction, mean vs sum reduction, missing temperature scaling.
- **JAX Logic Auditor** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/agents/jax-logic-auditor.md)) — Traces data flow through JAX transformations. Validates `scan` carry shapes, `vmap` axes, PRNG key usage.
- **Silent Bug Detector** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/agents/silent-bug-detector.md)) — Catches bugs that don't crash but produce wrong results. 11 silent failure categories from broadcasting bugs to mask inversions.
- **Regression Guard** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/agents/regression-guard.md)) — Ensures new code doesn't break existing pipelines. Detects displaced fixes and compensating hacks.
- **Data Flow Tracer** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/agents/data-flow-tracer.md)) — Builds complete annotated maps from raw input to final output with every intermediate step.
- **Validation Gates** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/agents/validation-gates.md)) — Scaffolds AI-specific tests: gradient flow, tensor shapes, overfit tests, loss sanity.
- **Failure Mode Researcher** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/agents/failure-mode-researcher.md)) — Searches the internet for similar training failures and delivers prioritized fixes with exact hyperparameter values.
- **Documentation Manager** ([source](https://github.com/KevinBian107/Kaiwen-Wiki/blob/master/docs/articles/vibe_coding/claude_resources/agents/documentation-manager.md)) — Maintains structured `docs/` with separated concerns.

**Proactive invocation**: If a subagent's description includes "Proactively", Claude invokes it automatically. For example, after you implement a component, the Paper Alignment Auditor and Silent Bug Detector should kick in without you asking.

**Parallel execution**: Read-only auditors are safe to run simultaneously:

```
Run these in parallel: Paper Alignment Auditor on the ResidualVectorQuantizer
against scratch/paper-notes/star-rvq.md, JAX Logic Auditor on the forward_temporal
scan in vq_intention_network.py, and Silent Bug Detector on the new per-depth loss
computation in vq_losses.py.
```

---

## The Structured Workflow

This is where everything comes together. The key insight is that **Claude Code can write code extremely well if it truly understands the request.** The bottleneck is never code generation — it's ensuring Claude has a correct, complete understanding of what to build.

The workflow has five phases:

### Phase 1: Investigation

Start by having Claude deeply understand the codebase and the task. The investigation skill scaffolds a `scratch/` folder as a living document.

```
I want to conduct an investigation and experiment with a different network
architecture for this system. Use subagents to scan the repo and trace the
code path from the training entrypoint, to model building, to training to
build an understanding of the code flow. Then, identify where and what we
need to change in order to modify the network architecture. Map out in a
scratch/vqvae-pilot/README.md all the code system architecture that's
relevant, and propose how to build in the changes. Don't run any code yet,
just do the static analysis of the code organization. ultrathink
```

What this does:

1. Claude's first pass is fully learning with subagents — collecting sources and exploring the codebase.
2. Creates a README with task description, background context, and a task checklist.
3. The README is a **living document across multiple interactions** — you record findings and `/clear` regularly.
4. `scratch/` is gitignored. You distill investigation findings into a PR that gets merged — you never modify the codebase until you're certain it will work.

### Phase 2: Critical Review

**This is the most critical step.** Read through what Claude found VERY carefully — this is the blueprint. If the investigation is correct, the code will be correct.

Ask Claude to compare its proposal against the paper. Question its decisions. The think-deeply skill prevents sycophancy:

```
You're proposing that we can keep the monkey-patching approach in vq_ppo.py
and just swap out VectorQuantizer for ResidualVectorQuantizer. But won't the
multi-depth commitment loss change how the total VQ loss scales? The current
loss has one commitment term — RVQ will have D=2. Won't this double the
effective VQ loss weight without adjusting the coefficient? Check this against
what the STAR paper says. ultrathink
```

If you need Claude to introspect on its reasoning:

```
I said that we were going to scaffold out the experiment framework *next*,
not now. You raced ahead to this step. Can you introspect and tell me why
you did this? Don't act on this or make any changes to the work you've done
so far. Don't tell me I'm right or defer to me out of sycophancy. Just help
me understand your internal reasoning chain and how I can structure my prompt
to prevent this from happening next time. ultrathink
```

### Phase 3: Clear Context and Plan

Claude degrades with long context history. Before implementation:

```
/clear
```

The README in `scratch/` preserves everything. Start a fresh session for implementation planning:

```
Read scratch/rvq-pilot/README.md and the RVQ design doc at
vqvae_jax/docs/rvq.md. Based on the investigation, I want to implement the
RVQ architecture. Here's the plan:

1. Create ResidualVectorQuantizer in vq_intention_network.py
2. Update VQIntentionNetwork to accept a quantizer_type config flag
3. Update vq_losses.py to handle per-depth commitment and codebook losses
4. Update the config with RVQ-specific parameters
5. Update forward_temporal scan to carry per-depth previous indices

Don't implement yet. First, review this plan against the investigation
README and tell me if I'm missing anything or if the ordering is wrong.
ultrathink
```

### Phase 4: Implementation with Validation

Implement one component at a time. After each component, subagents validate automatically:

```
Implement the ResidualVectorQuantizer class in vq_intention_network.py.
Follow the architecture from the STAR paper as documented in
scratch/paper-notes/star-rvq.md. Key requirements:

- D=2 depths, each with its own codebook (K=64, dim=60)
- Depth 1 quantizes z_e, depth 2 quantizes the residual (z_e - z_q_1)
- Rotation-augmented STE: gradient through each depth uses R_k @ (z_e - e_k)
- Support stickiness bias per depth
- The combined output is z_q_1 + z_q_2

ultrathink
```

After implementation, these subagents should fire automatically:

1. **Paper Alignment Auditor** — cross-references against STAR paper equations
2. **JAX Logic Auditor** — traces shapes through the new quantizer
3. **Silent Bug Detector** — scans for broadcasting bugs, wrong reduction axes
4. **Regression Guard** — verifies existing configs still work

If they don't activate, explicitly request them:

```
Run the paper alignment auditor on the ResidualVectorQuantizer comparing
against the equations in scratch/paper-notes/star-rvq.md
```

Then validate:

```
Run validation gates on the ResidualVectorQuantizer. Specifically test:
1. Shape test: encoder output (B, 60) → RVQ output (B, 60)
2. Gradient flow: loss.backward() produces non-zero gradients for both codebooks
3. Overfit test: 5 samples, 100 steps, loss should decrease
4. Regression: existing VQ config produces identical output before and after
```

**Clear context between components** — update the `scratch/` README checklist before clearing so the next session knows what's done.

### Phase 5: Debugging

When training goes wrong, use structured debugging. For example, codebook utilization drops:

```
/debug-training codebook utilization drops from 80% to 5% after 10k steps
with RVQ. Depth 1 uses all 64 codes but depth 2 collapses to 3 codes. Loss
is still decreasing overall.
```

Or call the Failure Mode Researcher for literature-backed solutions:

```
Use the failure mode researcher. My depth-2 codebook in RVQ is collapsing
to 3 active codes while depth-1 stays healthy. Commitment cost is 0.5 for
both depths. Loss is still decreasing. I've tried increasing depth-2
commitment cost to 1.0 but it didn't help.
```

The researcher searches arxiv, GitHub issues, and forums, then delivers prioritized fixes with **exact hyperparameter values** — not "adjust learning rate" but "reduce lr from 3e-4 to 1e-4 because [source] found VQ-VAE with commitment loss > 0.5 needs lr < 1e-4".

### Phase 6: Capture Learnings

After the implementation works:

```
Let's do a retrospective on this RVQ implementation. Capture what we learned.
```

The retrospective skill saves to `scratch/registry/` with: setup, what worked, failed attempts table (the most valuable part), exact hyperparameters, and next steps. This persists across `/clear` and across sessions.

---

## End-to-End Example

Minimal `.claude/` folder structure used for this project:

```
.claude/
├── CLAUDE.md
├── settings.local.json
├── commands/
│   ├── primer.md
│   ├── read-paper.md
│   ├── debug-training.md
│   ├── trace-shapes.md
│   └── fix-github-issue.md
├── skills/
│   ├── investigation/SKILL.md
│   ├── retrospective/SKILL.md
│   ├── think-deeply/SKILL.md
│   ├── deep-research/SKILL.md
│   └── paper-extraction/SKILL.md
└── agents/
    ├── paper-alignment-auditor.md
    ├── jax-logic-auditor.md
    ├── silent-bug-detector.md
    ├── regression-guard.md
    ├── data-flow-tracer.md
    ├── validation-gates.md
    ├── failure-mode-researcher.md
    └── documentation-manager.md
```

All of these files are available in the [claude_resources](https://github.com/KevinBian107/Kaiwen-Wiki/tree/master/docs/articles/vibe_coding/claude_resources/) folder and can be copied directly into your project's `.claude/` directory.

### The Prompt That Started It

```
Read this codebase very carefully with /primer and make sure that you
understand everything. I want to implement a great change in the codebase
and I want you to ask any questions regarding things you are not so clear
or if I didn't state it clearly. You must think /retrospective. I want you
to start an /investigation on thinking the integration of this paper's
architecture (https://arxiv.org/html/2506.03863v1). As of current, we
observe the following issue with our vanilla VQVAE setup:

- (1) Superposition does exist, meaning that one code may be encoding
different semantic meanings depending on the proprioceptive input that it
receive. When we fixiate the proprioceptive input and looking at the code
sequence that are similar and looking at their qpos, the qpos are quite
similar under w2 distance, think /retrospective about whether this
observation is valid for showing the superposition hypothesis.

- (2) Superposition is not the real issue, it is an expected behavior we
would see when we just try to use a handful of codes to control a fully
embodied agent. The real issue is this phenomenon where we call it
population coding. This is when multiple codes encode similar semantic
informations (kind of like redundancy). The real issue is that it's really
hard to quantify which code and which code is similar. We have tried to
use spectral clustering on the transition matrix to try to identify
population communities. However, this is quite difficult due to how these
transition matrix need to be conditioned on the proprioception.

- (3) Less codes does not improve interpretability, when trying to recreate
the skill space tsne/umap, we observe that 64 codes tsne seems to be making
much more sense and much more structured compared to the 16 or 32 codes.

- (4) The code seems to be representing at all granularity level, it is not
fixed that all codes may be representing subtle motor behavior or all just
the coarse behavior. Instead, some are related to smaller behaviors and some
are related to much more coarse grain behaviors.

The above is all the observations that we have made so far. Please first
understand them deeply and /think-deeply about how the setup in STAR may
resolve the issues we are seeing now. Present your thinkings in the
investigation logging. After you have done so, proceed to an implementation
planning document. Note that in your investigation should have two md files,
one regarding the thinking and planning and one regarding the
implementations.

Regarding the implementations, there are rules:

- (1) Use your subagents wisely, make sure you are constantly checking with
Paper Alignment Auditor, JAX Logic Auditor, Silent Bug Detector, Regression
Guard, and Data Flow Tracer.

- (2) Regarding regression, you DO NOT need to create a separate pipeline
for backward compatibility. The (depth=1, no rotation trick) version should
be exactly identical to the current vanilla VQVAE with bias. Each part of
STAR should be toggleable in the config. Activate rvq by setting depth > 1,
activate rotation tricks by true/false.

- (3) Regarding video logging and eval logging, there will be logic changes.
Remove the current conditioned transition matrix and the associated community
finding and video logging. Remove the vq/latent_pca. Remove the global
transition matrix. Propose what would be a good illustration to show that
codes at different depths are (1) meaningful and (2) capturing details at
different granularity. The rendering should be based on the residual
quantization at the lowest level, with quantized residuals from the same
parents in similar color scheme — a natural community separation.

- (4) Default depth to 2, but code should work with arbitrary depth.

- (5) Consider impact on analysis code. Ensure existing analysis still works
for level-1 codes. For depth-2 codes, propose what analysis makes sense.

This is a lot of requirement, so please take some time to understand them by
/think-deeply and /retrospective.
```

### The Implementation Prompt (After /clear)

```
Read this codebase very carefully with /primer and make sure that you
understand everything. I want to implement a great change in the codebase.
We have made proposition and implementation detailed plans in
/scratch/2026-02-08-star-rvq-integration and have actually carried out the
implementations. The code runs successfully, but there are definitely some
bugs in the system. We observe that reaching the 15th iteration of epoch,
we are only seeing one code being used for the entire rollout. In addition,
we did not have video rendering with the stacked bars (indicating codes at
different levels) like how we wanted before in the proposition. Start an
/investigation on this issue using /debug-training. Think /retrospective and
/think-deeply. Use agents that may be useful like Silent Bug Detector,
Failure Mode Researcher, Regression Guard, Data Flow Tracer, and JAX Logic
Auditor. Write a proposition in the /scratch logging first to tell me what
is the problem and the solution you propose to resolve it. You should also
check /vqvae_jax/outputs/wandb/latest-run to see the actual outputs logging.
```

### What Agents Did What

| Phase | What You Say | What Activates | Why |
|-------|-------------|----------------|-----|
| Paper reading | `/read-paper` | Command | Extract structured reference from STAR paper |
| Codebase analysis | "investigate..trace the code path" | Investigation skill | Scaffolds scratch/ with living README |
| Literature survey | "what alternatives exist" | Deep-research skill | Comparison table of RVQ vs FSQ vs LFQ |
| Critical review | "won't this double the loss weight?" | Think-deeply skill | Forces critical evaluation, not agreement |
| After implementation | *(automatic)* | Paper Alignment Auditor | Cross-references code against paper equations |
| After implementation | *(automatic)* | JAX Logic Auditor | Traces shapes through new quantizer + scan |
| After implementation | *(automatic)* | Silent Bug Detector | Checks for broadcasting, wrong axis, gradient flow |
| After implementation | *(automatic)* | Regression Guard | Verifies existing VQ configs still work |
| After implementation | *(explicit)* | Validation Gates | Scaffolds gradient/shape/overfit tests |
| After implementation | *(automatic)* | Documentation Manager | Updates ARCHITECTURE.md and MODELS.md |
| Training issues | `/debug-training` | Command | Structured diagnostic with scripts |
| Stuck on failure | "use the failure mode researcher" | Failure Mode Researcher | Searches internet, delegates to other agents |
| Session end | "retrospective" | Retrospective skill | Captures learnings for future sessions |

---

## Good Habits

1. **Always `/clear` before context gets too long** — Claude degrades with long history. Record findings in scratch READMEs first.
2. **Always use `ultrathink`** for important reasoning.
3. **Ask Claude to ask questions** — "ask any questions if things are unclear" starts a conversation that ensures understanding.
4. **Extract paper PDFs as PNGs** — Claude reads figures better from images.
5. **Don't let Claude race ahead** — if you say "next", mean "not now". Enforce this explicitly.
6. **Guard against sycophancy** — question Claude's proposals against the paper. If the investigation blueprint is correct, the code will be correct.
7. **Use subagents wisely** — read-only auditors can run in parallel. Don't parallelize agents that write to the same files.
8. **Capture retrospectives** — the failed attempts table prevents repeating mistakes across sessions.

---

## Next Steps

For a complete structured constraint framework that enforces verification gates, domain-specific auditors, and human-in-the-loop checkpoints throughout the research workflow, see [**Propel**](https://github.com/KevinBian107/propel) — a framework for guiding Claude Code through research workflows using structured constraints across three operational modes (Researcher, Engineer, Trainer).

## References

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code Subagents Documentation](https://docs.anthropic.com/en/docs/claude-code/sub-agents)
- [Claude Code Hooks Documentation](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [MCP Documentation](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [Talmo's sleap-io investigation skill](https://github.com/talmolab/sleap-io/blob/main/.claude/skills/investigation/SKILL.md?plain=1) — inspiration for the investigation workflow
- [Sionic AI's experiment registry pattern](https://huggingface.co/blog/sionic-ai/claude-code-skills-training) — inspiration for the retrospective skill
