<div class="wrapper">
  <div class="profile">
    <img src="../../../assets/index/profile_pic.jpeg" alt="Profile Picture">
    <div class="profile-details">
      <span class="name">Kaiwen Bian</span>
      <span class="metadata">30 min read · Mar 28, 2026</span>
    </div>
  </div>
</div>

Research has always been a serial pipeline. You read, you think, you formulate a hypothesis, you implement, you run experiments, you analyze, you write. Each stage feeds into the next. Each stage takes weeks. The entire loop --- from "I have an idea" to "here's what I learned" --- can take months for a single iteration in foundation model research, where a single training run might burn through thousands of GPU hours before you know if your architectural intuition was right.

AI doesn't change *what* research is. It changes *how fast* the loop turns, *how many* loops you can run in parallel, and --- most importantly --- *where you spend your time*. The bottleneck shifts from execution to taste. The pipeline shifts from serial to parallel. The feedback loop between hypothesis and evidence compresses from months to days. This article maps the traditional and AI-driven research workflows side by side, showing where the compression happens and what it means for how we build foundation neural models.

---

## The Traditional Research Pipeline

Let's trace the full lifecycle of a foundation model research project the way it's been done for the past decade. You're a researcher who wants to build a new architecture --- say, a vision transformer variant with a novel attention mechanism for video understanding.

### Phase 1: Literature Review

You start by reading. A lot. You search ArXiv, Google Scholar, Semantic Scholar. You pull 30--50 papers. You skim abstracts, read introductions, deep-dive into the 5--10 that are most relevant. You build a mental model of the landscape: what's been tried, what worked, what failed, what gaps exist. You track citations in a spreadsheet or Zotero. You miss papers because your search terms weren't quite right. You rediscover a paper three weeks in that you should have read on day one.

**Time: 2--4 weeks.**

### Phase 2: Hypothesis Formation

From your literature review, you form a hypothesis. "If I replace the quadratic attention with a linear recurrence *and* add a learned gating mechanism at each layer, I can get the temporal modeling of a state-space model with the representational capacity of a transformer." This hypothesis is shaped by your reading, your advisor's intuition, your lab's prior work, and --- honestly --- what's fashionable at the current conference cycle.

You discuss it in lab meetings. You get feedback. You refine. You sketch architectures on a whiteboard. You derive equations by hand.

**Time: 1--2 weeks.**

### Phase 3: Architecture Design

You formalize the architecture. You work through the math: what are the input/output shapes at each layer? How does the gating mechanism interact with the recurrence? What's the computational complexity? You derive the backward pass to make sure gradients will flow. You check that your parameter count is reasonable.

This is done on paper, on whiteboards, in LaTeX. You catch some errors. You miss others --- they'll surface later as silent bugs.

**Time: 1--2 weeks.**

### Phase 4: Implementation

You open your editor and start writing PyTorch. Line by line. You implement the custom attention module, the gating mechanism, the positional encoding. You write the training loop, the data pipeline, the evaluation script. You debug shape mismatches for hours. You find a subtle broadcasting bug where a `(B, T, 1)` tensor silently broadcasts against a `(B, 1, D)` tensor in a way that produces the wrong output but no error.

You write unit tests --- maybe. If you're disciplined. Most researchers aren't. The code "works" in that it runs without crashing, but you're not sure every component is doing what you think it's doing.

**Time: 2--4 weeks.**

### Phase 5: Experiment Iteration

You launch your first training run. It diverges. You lower the learning rate. It trains but the loss plateaus. You try a different optimizer. You try warmup. You try gradient clipping. Each run takes 8--48 hours on your GPU allocation. You wait, check wandb, adjust, resubmit. The feedback loop between "I changed something" and "I know if it helped" is measured in days.

After two weeks of tuning, you get a training curve that looks reasonable. You run the full evaluation. Your model underperforms the baseline on 2 of 5 benchmarks. You're not sure if it's the architecture, the hyperparameters, or a bug. You go back to Phase 4.

**Time: 4--8 weeks.**

### Phase 6: Analysis and Writing

Your model finally works. You generate tables, figures, ablation studies. You write the paper in LaTeX. You format citations. You redo figures when a reviewer will inevitably ask for a different visualization. You proofread.

**Time: 2--4 weeks.**

### Total: 3--6 months for a single idea.

And if the idea doesn't work, you go back to Phase 2 and start a new loop. Most ideas don't work.

---

## The AI-Driven Research Pipeline

Now let's trace the same project with AI as a research partner. Same researcher, same goal: a novel video transformer architecture. But the workflow is fundamentally different.

### Phase 1: Literature Review (Compressed)

You don't start by manually searching ArXiv. You open [Perplexity](https://www.perplexity.ai/) and ask "what are the current approaches to efficient attention in video transformers?" --- in seconds you get a synthesized, citation-backed answer covering papers, blog posts, and GitHub repos that traditional academic search would miss. From there, you take the key papers into [Connected Papers](https://connectedpapers.com/) to build a visual citation graph, mapping the entire subfield in minutes instead of days. You save everything into [Zotero](https://www.zotero.org/), whose AI plugins let you semantically search across hundreds of saved PDFs later.

Then you go deeper. You upload the 10--20 most relevant papers into [NotebookLM](https://notebooklm.google.com/) and interrogate them as a grounded corpus --- "what contradictions exist across these approaches? What limitations are shared? What combinations haven't been tried?" The answers are anchored in your specific sources, not hallucinated from general training data. Meanwhile, you give your coding agent a structured prompt:

```
Read these 5 seed papers on video transformers and state-space models.
Extract: (1) the core architectural innovation in each, (2) what problem
it solves, (3) what limitations the authors acknowledge, (4) what
evaluation benchmarks they use. Then identify gaps --- what combinations
haven't been tried? What limitations are shared across all approaches?
Format as a comparison table. ultrathink
```

You still read the key papers yourself --- AI doesn't replace your understanding --- but the *triage* phase collapses. You spend your reading time on the papers that matter, not on the 40 that don't.

**Time: 2--3 days.**

### Phase 2: Hypothesis Formation (Sharpened)

You have your idea. Before you commit to it, you use AI as an adversary. Perplexity gives you a quick reality-check --- "what are the failure modes of linear attention in video transformers?" --- with a sourced overview in seconds. NotebookLM lets you go deeper against your specific corpus: "what combinations of techniques from these papers haven't been tried? What would be the theoretical challenges of combining the linear recurrence from Paper A with the gating from Paper B?" The grounding means you get substantive answers, not generic suggestions.

Then you bring in your coding agent for the stress-test:

```
I want to replace quadratic attention in a video transformer with a
linear recurrence plus learned gating. Steel-man the counterarguments.
What has been tried that's similar? What are the theoretical limitations
of this approach? What would a skeptical reviewer say? ultrathink
```

The AI doesn't generate your hypothesis --- *you* do. But it stress-tests the hypothesis before you spend months on it. It might surface a 2024 paper that tried something similar and failed for a specific reason. It might identify a theoretical issue with gradient flow through the gating mechanism that you'd otherwise discover empirically in Phase 5, weeks later.

This is the **feedback loop compression**. The distance between "I have an idea" and "I know this idea has a problem" shrinks from weeks to hours.

**Time: 2--3 days.**

### Phase 3: Architecture Design (Validated)

Instead of deriving shapes on a whiteboard and hoping you got them right, you work with AI interactively:

```
Here's my architecture. Trace the tensor shapes through every layer for
an input of (B=4, T=16, H=224, W=224, C=3). Flag any dimension mismatch.
Cross-reference the gating mechanism against Equation 7 in the seed paper.
Are they equivalent? If not, where do they diverge? ultrathink
```

The AI catches the shape errors *before* they become silent bugs in code. It validates your math against the paper. It asks clarifying questions: "Your gating mechanism uses sigmoid, but the paper uses tanh --- is this intentional?" These are the questions that, in the traditional pipeline, you'd answer empirically after a failed training run in Phase 5.

**Time: 2--3 days.**

### Phase 4: Implementation (Structured)

This is where [Claude Code](https://claude.ai/code) and the [structured agentic workflow](structured_agentic_vibe_coding.md) kick in. You don't write every line yourself. You decompose the implementation into components, each with clear specifications:

```
Implement the GatedLinearRecurrence module in src/models/recurrence.py.
Input shape: (B, T, D). Output shape: (B, T, D). The recurrence follows
Equation 7 from ARCHITECTURE.md. Write a test that verifies the output
shape and that gradients flow through the gating parameters. ultrathink
```

Each component is implemented, tested, and validated before moving on. Claude Code generates the code; you review the logic. [Cursor](https://cursor.com/) complements this as a VS Code fork with deep AI integration --- its "chat with codebase" feature is excellent for understanding large framework internals, and tab-complete handles boilerplate fast. Silent bugs are caught by the validation gates you set up --- shape checks, gradient flow tests, known-input-known-output sanity checks. The [documentation system](why_your_vibe_coding_sucks.md) ensures the AI knows exactly what it's building and why.

**Time: 3--5 days.**

### Phase 5: Experiment Iteration (Parallelized)

Here's where the paradigm shift is most dramatic. In the traditional pipeline, you run one experiment at a time, wait for results, adjust, repeat. With AI and git worktrees, you can run **multiple hypotheses in parallel**:

```bash
# Three parallel experiments, each in its own worktree
git worktree add ../exp-gated-linear feature/gated-linear
git worktree add ../exp-gated-ssm feature/gated-ssm
git worktree add ../exp-hybrid-attention feature/hybrid-attention
```

Each worktree gets its own Claude Code session. Each session runs a different architectural variant. While one is training, you're debugging another. When results come in, AI helps with analysis:

```
Here are the wandb logs for three runs. Compare training curves, final
metrics, and compute efficiency. Which variant shows the best
loss-vs-compute tradeoff? Are there signs of training instability in
any variant? ultrathink
```

When something breaks --- codebook collapse, gradient explosion, loss plateau --- you don't debug alone:

```
Training run "gated-linear" shows loss plateau at step 15k. Here's the
wandb dashboard and the gradient norm plot. The gate values are saturating
to 1.0 after step 10k. Diagnose the root cause and propose fixes.
```

The feedback loop between "something went wrong" and "I understand why" compresses from days to hours.

**Time: 1--2 weeks.**

### Phase 6: Analysis and Writing (Accelerated)

AI helps generate comparison tables, format results, and draft sections. But the narrative --- what the results *mean*, why they matter, what the field should take away --- remains entirely yours. AI is a capable research assistant; it is not a researcher.

**Time: 1 week.**

### Total: 4--6 weeks for a single idea.

And because you can run multiple hypotheses in parallel, the throughput isn't just one idea per cycle --- it's two or three.

---

## The Flow, Side by Side

```
TRADITIONAL                          AI-DRIVEN
──────────                           ─────────

┌─────────────────┐                  ┌─────────────────┐
│ Literature Review│                  │ Literature Review│
│   2-4 weeks      │                  │   2-3 days       │
│   Manual search  │                  │   AI-assisted    │
│   Miss papers    │                  │   triage + gaps  │
└────────┬────────┘                  └────────┬────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│ Hypothesis       │                  │ Hypothesis       │
│   1-2 weeks      │                  │   2-3 days       │
│   Lab meetings   │                  │   AI stress-test │
│   Whiteboard     │                  │   Steel-manning  │
└────────┬────────┘                  └────────┬────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│ Architecture     │                  │ Architecture     │
│   1-2 weeks      │                  │   2-3 days       │
│   Hand-derived   │                  │   AI-validated   │
│   Errors linger  │                  │   Shapes checked │
└────────┬────────┘                  └────────┬────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│ Implementation   │                  │ Implementation   │
│   2-4 weeks      │                  │   3-5 days       │
│   Line by line   │                  │   Agentic build  │
│   Silent bugs    │                  │   Validated gates│
└────────┬────────┘                  └────────┬────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌──────────────────────┐
│ Experiments      │                  │ Experiments          │
│   4-8 weeks      │                  │   1-2 weeks          │
│   Serial runs    │◄── BOTTLENECK   │   PARALLEL runs      │
│   Days per loop  │                  │   Hours per loop     │
└────────┬────────┘                  └──────────┬───────────┘
         │                                      │
         ▼                                      ▼
┌─────────────────┐                  ┌─────────────────┐
│ Analysis/Writing │                  │ Analysis/Writing │
│   2-4 weeks      │                  │   1 week         │
└─────────────────┘                  └─────────────────┘

TOTAL: 3-6 months                    TOTAL: 4-6 weeks
  for ONE idea                         for MULTIPLE ideas
```

---

## Three Shifts

### Shift 1: The Feedback Loop Compresses

The most important change isn't speed --- it's **when you learn that you're wrong**.

In the traditional pipeline, the distance between a flawed assumption and its discovery is enormous. You assume your gating mechanism will let gradients flow. You implement it over two weeks. You train for another two weeks. Then you discover the gates are saturating and gradients are vanishing. A month of work to learn something you could have caught in an hour with a targeted question.

AI compresses this feedback loop at every stage. During hypothesis formation, it surfaces counterarguments and prior work you missed. During architecture design, it validates shapes and cross-references equations. During implementation, it catches bugs before they become training failures. During experimentation, it diagnoses failures in hours instead of days.

The feedback loop compression is multiplicative. If each stage catches errors 3x faster, the full pipeline is an order of magnitude faster --- not because each stage is trivially faster, but because errors caught early don't propagate into expensive later stages.

### Shift 2: The Bottleneck Moves from Execution to Taste

When implementation takes two months, the limiting factor is engineering effort. You spend most of your time writing code, debugging shapes, tuning hyperparameters. The "thinking" part --- choosing what to build --- is a small fraction of the total time. So researchers naturally optimize for safety: build things similar to what's worked before, make incremental changes, avoid risky ideas that might waste months of implementation time.

When implementation takes a week, the calculus changes entirely. The cost of trying a risky idea drops dramatically. You can afford to explore the "what if?" questions that traditional pipelines discourage. What if the gating mechanism uses a learnable temperature? What if you replace the recurrence with a parallel scan? What if you try a completely different approach to temporal modeling?

The bottleneck shifts from "can I build this?" to "should I build this?" From execution to **taste** --- the ability to choose *which* ideas are worth exploring. Taste has always mattered in research, but in the AI age it becomes the dominant skill. The researcher who can identify the most promising directions, who has the deepest intuition for what will work, who asks the best questions --- that researcher benefits disproportionately from AI tools. The tools amplify taste. They don't replace it.

This is the uncomfortable truth: AI makes the gap between good and great researchers *wider*, not narrower. A researcher with great taste and AI tools explores ten promising directions in the time it used to take to explore one. A researcher with poor taste and AI tools explores ten bad directions faster --- which is arguably worse than exploring one bad direction slowly, because you burn more compute and generate more noise.

### Shift 3: Serial Becomes Parallel

The traditional pipeline is inherently serial. You can't implement before you design. You can't experiment before you implement. You can't analyze before you experiment. Each stage blocks on the previous one.

AI breaks this seriality in two ways.

**Within a project**, git worktrees and parallel agent sessions let you explore multiple architectural variants simultaneously. While variant A is training, you're implementing variant B and designing variant C. The experiment phase --- traditionally the longest and most serial part of the pipeline --- becomes embarrassingly parallel.

**Across projects**, the compressed timeline means you can run multiple research threads concurrently. Instead of committing to one idea for six months, you can run three ideas for six weeks each and compare. The portfolio approach to research --- diversify your bets, compare results, double down on what works --- becomes practical in a way it never was before.

This parallels (no pun intended) the UCB insight from the [bandit problem](../mathamatics/ucb.md): the optimal strategy is to explore uncertain options precisely because you don't know enough about them yet. When exploration is cheap, you should explore more. AI makes exploration cheap.

---

## What Doesn't Change

AI changes the *how* of research. It doesn't change the *what*.

**The hypothesis is still yours.** AI can stress-test ideas, surface prior work, and catch errors. But the creative leap --- the moment where you see a connection nobody else has seen, where you ask a question nobody else has asked --- that's still entirely human. AI is a mirror, not a muse. It reflects your thinking back at you with higher fidelity. It doesn't think for you.

**Understanding is still required.** If you use AI to implement an architecture you don't understand, you've built a black box on top of a black box. When it fails --- and it will fail --- you won't know why. The researchers who thrive in the AI age are the ones who use AI to implement faster while maintaining deep understanding of what they're building. The [vibe coding principles](why_your_vibe_coding_sucks.md) apply here: you need to understand the structure even if you didn't write every line.

**The science is still hard.** Faster iteration doesn't mean easier science. The hard problems in foundation model research --- generalization, efficiency, emergent capabilities, alignment --- don't get easier because you can run experiments faster. If anything, faster iteration surfaces the *real* bottlenecks sooner: the conceptual challenges that no amount of engineering speed can solve. This is a good thing. The sooner you hit the hard problem, the sooner you can start actually thinking about it instead of being stuck in implementation purgatory.

**Peer review, reproducibility, and rigor still matter.** AI-assisted research needs to meet the same standards as traditional research. The code needs to be correct. The experiments need to be reproducible. The claims need to be supported by evidence. AI helps you get there faster, but "faster" is not a substitute for "right."

---

## The Closing

The traditional research pipeline was designed for a world where implementation was the bottleneck. Every stage was optimized to reduce the risk of wasting expensive engineering time: careful literature reviews to avoid duplicating work, thorough architecture design to avoid implementation dead-ends, conservative hypothesis selection to avoid risky experiments.

AI inverts this. When implementation is cheap and fast, the optimal strategy shifts toward exploration. Try more ideas. Fail faster. Explore the uncertain path --- because, as UCB tells us, the less you know about something, the more reason you have to try it. The cost of exploring drops; the cost of *not* exploring --- of sitting on an untested hypothesis because implementation is too expensive --- becomes the real regret.

The researchers who will define the next generation of foundation models aren't the ones who can write the most PyTorch. They're the ones who can ask the best questions, choose the most promising directions, and iterate on ideas with the speed and rigor that AI tools now make possible. The tools don't make you a better researcher. But if you're already a good researcher, they let you be the researcher you always could have been --- unconstrained by the serial, slow, expensive pipeline that used to be the only option.

The pipeline has changed. The science hasn't. That's the point.

---

## References

- [Structured Vibe Coding with Claude Code Agents](structured_agentic_vibe_coding.md) --- the agent architecture for AI-driven implementation
- [Why You Suck at Vibe Coding (Adapted)](why_your_vibe_coding_sucks.md) --- the documentation system and structured workflow

