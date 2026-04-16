<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

<div class="wrapper">
  <div class="profile">
    <img src="../../../assets/index/profile_pic.jpeg" alt="Profile Picture">
    <div class="profile-details">
      <span class="name">Kaiwen Bian</span>
      <span class="metadata">10 min read · Apr 15, 2026</span>
    </div>
  </div>
</div>

We live in a strange moment where answers have become cheap. You can ask a model to write you a proof, a paper, an essay, a function, a policy --- and an answer will come back, fluent and confident, in seconds. The surprising consequence is that the bottleneck of doing good work has moved. ***The scarce resource is no longer the answer. It is the question, and the verification of the answer we found.*** If I want to sum up what this article is trying to say, it would be:

1. Optimization has been "solved" in a meaningful sense --- given a well-defined objective, we have machinery (gradient descent and its variants) that will get us to a minimum with strong theoretical guarantees.
2. But the objective function itself is never given. ***We always choose it.*** And in theory there are infinitely many objective functions we could have chosen, each defining a different "answer."
3. Even after we solve the optimization, we have to verify the answer --- to know that the \(x^*\) we found is actually the thing we were looking for, not just a stationary point of the proxy we happened to write down.
4. Framed abstractly, this is a ***functional optimization problem***: we are searching over the space of objective functions, not just over the space of points.

The shape I keep coming back to is this compact form:

$$
\min_{x \in X} F(x) \quad \text{subject to} \quad C
$$

A lot of what we do --- writing a loss, picking a reward, framing a research question --- fits this shape. Gradient descent sits inside this framing and solves for \(x\) efficiently. But the interesting variables are the ones we don't usually touch --- \(X, F, C\). ***Those are the variables where the question lives.***

## Optimization Has Been Solved, Mostly

What does "solved" mean here? Hand someone a well-defined objective --- a loss, a reward, a cost --- with some mild regularity, and the machinery of gradient descent and its variants will terminate somewhere optimal. A century of theory and a decade of compute line up behind the statement ***"it will stop, and it will be at the optimal position."*** We have both the proof to back it and the GPUs to cash it in. Given an objective, optimization is no longer the hard part.

Any deep learning practitioner has lived this. Hand me a clean loss, reasonable initialization, and enough compute, and I will train your model. The loss will go down. The network will learn *something*. The part that took a PhD in 2012 is now a Colab notebook in 2026. The interesting question is not *how* to minimize --- it is ***what we are minimizing in the first place***.

## But What Are We Optimizing, Exactly?

Here is where the framing gets interesting. Gradient descent optimizes over \(x\), given \(f\). But \(f\) did not fall from the sky. ***Someone wrote it down.*** And the choice of \(f\) completely determines what "optimal" means. Change the loss and you change the answer.

Consider how much is packed into the loss function in modern deep learning:

$$
\min_{w \in \mathbb{R}^p} \frac{1}{N} \sum_{i=1}^{N} \ell(\sigma(x_i; w), y_i) + \lambda R(w)
$$

This one line hides an enormous number of decisions: what is \(\ell\)? Cross-entropy? MSE? Contrastive? Triplet? Wasserstein? What is \(R\)? \(L_2\)? \(L_1\)? Elastic net? Some learned regularizer? What is the architecture \(\sigma\) --- transformer, CNN, SSM, hybrid? What is the data \(\{x_i, y_i\}\) --- scraped web, curated, synthetic, RLHF preferences? Every one of these choices is a choice of ***objective function***, and each one defines a different \(x^*\). The minimum of the loss is not a single universal destination --- it is an answer to the specific question you wrote down.

## The Haystack Framing

This is where the haystack framing comes in. Every problem, at the most general level, looks like:

$$
\min_{x \in X} F(x) \quad \text{subject to} \quad C
$$

with three ingredients:

- \(X\) --- the ***design space***. The set of things we can do, say, the action space in RL, the weight space in supervised learning, the hypothesis space in classical ML.
- \(F\) --- the ***objective metric***. A scalar-valued functional that measures how good a candidate \(x \in X\) is.
- \(C\) --- the ***constraints***. What is even allowed, what is feasible, what is true of the world.

Gradient descent is a very particular stance inside this picture. It fixes \(X = \mathbb{R}^p\), fixes \(F\) to be whatever loss you wrote, treats \(C\) as implicit or handled by projection/Lagrangian terms, and then solves for \(x^*\). It is a beautiful and mature corner of the picture. But it is only one corner.

The unsettling thing is that all three of \(X\), \(F\), and \(C\) are ***choices***. They are the question. And there are infinitely many questions compatible with any given piece of reality.

> If the universe is the answer, what is the question?

Everything we call science or research is an attempt to reverse-engineer \(F\) from observations. Physics writes down a Lagrangian \(\mathcal{L}\) such that Nature's actual trajectory is the one that minimizes \(\int \mathcal{L}\,dt\). That is a guess at \(F\). It survives because it predicts. Biology writes down fitness, chemistry writes down free energy, economics writes down utility --- ***each is a guess at the objective that reality appears to be optimizing***. The math of "how do I minimize this once I know it" is the easy direction. The hard direction is: given the data, given what I see, what was the question?

## Functional Optimization --- A Second Layer

Here is the step I want to take seriously. Instead of treating \(F\) as given, let's treat it as a variable. Define some space of candidate objectives \(\mathcal{F}\) --- loss functions, reward models, physical Lagrangians, scientific hypotheses, whatever is appropriate for the domain --- and now pose a second-layer problem:

$$
\min_{F \in \mathcal{F}} \; \mathcal{J}(F) \quad \text{subject to} \quad F \text{ is consistent with observations } \mathcal{O}
$$

where \(\mathcal{J}(F)\) is something like "how badly does \(F\) fail to explain what we see" or "how much does the optimum \(x^*_F\) disagree with reality." This is a ***functional optimization problem***. The variable is a function, not a point.

The painful part is that we do not have gradients in \(\mathcal{F}\). There is no "gradient descent on the space of loss functions" in anything like the clean sense we have at the inner level. We cannot take the partial derivative of \(\mathcal{J}\) with respect to "which reward model" and update. We have to search \(\mathcal{F}\) by other means --- taste, intuition, analogy to problems we already solved, symmetry principles, falsifiable predictions. That is what doing research is. ***The outer loop is functional. The inner loop is numerical. We have automated the inner loop and we have not automated the outer loop, and arguably we can't.***

A useful way to see this hierarchy: what we call "modern machine learning" is a systematic, industrial answer to the inner loop. Given any reasonable \(F\), we can find \(x^*_F\) quickly. What we call "science" or "research" or, frankly, "thinking hard" is the outer loop. It is slower, messier, and harder to teach, because we have no closed-form descent direction in \(\mathcal{F}\).

This is also why AI tools feel so powerful and so unsatisfying at the same time. They have enormously accelerated the inner loop --- they will happily compute \(x^*_F\) for you, for any \(F\) you specify --- but they do not, on their own, choose \(F\). If you hand them a bad \(F\), you will get a brilliantly optimized bad answer. Garbage in, perfectly-minimized garbage out.

## The Verification Problem

Suppose we have chosen \(F\). Suppose we have run gradient descent and reached some \(x^*\). Are we done? Not quite. We still have to answer: ***how do we know \(x^*\) is the thing we were actually looking for?***

This is the verification problem, and it has at least three layers:

**Layer 1 --- the numerical layer.** Did we actually converge? Are we at a stationary point? Is this a local minimum, a global minimum, or a saddle point dressed up to look like one? This is the layer where the classical optimization guarantees live, and in most modern settings it is the *easiest* layer to check. The harder layers come next.

**Layer 2 --- the specification layer.** Even assuming we reached a true \(x^*\) of \(F\), does \(F(x^*)\) mean what we wanted it to mean? The cross-entropy on a validation set is not the same as "the model understands the world." A low training loss is not the same as "low prediction error on tomorrow's data" (this is what generalization bounds try to control, and they are always conditional on assumptions about the data-generating distribution). A high benchmark score is not the same as "the benchmark measures what we care about." Every proxy is itself an \(F\), and we are always optimizing proxies of proxies.

**Layer 3 --- the reality layer.** Even if the specification holds up, does it predict reality? Can we take \(x^*\) out of the math and watch it do the thing? This is what empirical science *is*. A Lagrangian is verified by experiment. A medical claim is verified by trial. A self-driving policy is verified by miles. Reality is the ultimate referee, and ***reality does not care what you wrote down***.

LLM hallucination is a perfect example of the verification problem. The inner loop worked: the model minimized next-token cross-entropy on a huge corpus with enviable efficiency. The outer loop is where it breaks --- the objective ("predict the next token a human would write") is a plausibility proxy, not a truth proxy, and reality is the one that decides when the two come apart. When the model confidently states that Lincoln invented the lightbulb, it has not failed optimization. It has nailed optimization. It has failed verification. And critically, ***the model cannot tell, from inside the loss, that it has failed verification***, because verification is not in the loss. It is external. It is the outer loop.

This is where human judgment, reference to reality, and the willingness to say "wait, does this actually make sense?" become load-bearing. ***You cannot outsource verification to the same process that produced the answer, because that process was optimizing the proxy, not truth.*** You need an independent check.

## Why the AI Era Amplifies This

So what changes in the AI era? Two things, I think.

**The inner loop becomes nearly free.** Finding \(x^*\) given \(F\) has always been the expensive part, and it is what AI has automated most aggressively. Write a loss, grab a foundation model, finetune, run evaluation. What used to take six months takes six days. The shift is dramatic, and it is a shift in *kind*, not just speed.

**The outer loop becomes the entire game.** Once anyone can cheaply compute \(x^*_F\), the differentiator is no longer "can you optimize." It is ***which \(F\) did you choose to optimize***, and ***how did you verify \(x^*_F\) once you got it***. The people who benefit most from cheap inner loops are the people with the best outer loops --- the best taste in questions, the most rigor in verification, the deepest sense of when a proxy has diverged from the thing it was supposed to measure.

This is not a pessimistic reading of AI. It is just a re-statement of where the hard work moved. If you have good taste, cheap inner loops amplify your taste. If you have poor taste, cheap inner loops amplify your mistakes. ***The multiplier is the same in both directions.***

## Conclusion

Research is not about finding answers to questions someone else wrote down. It is about finding the right question to ask in the first place, and then having the discipline to verify your answer against something external. The inner loop --- compute, experiment, train, simulate --- is the part everyone can see. The outer loop --- ***which objective function describes what I actually care about, and how would I know if it didn't*** --- is the part that decides whether the work matters.

The universe, in this sense, really is the answer. It is there. It gives us data. It responds when we push on it. It is fluent and consistent and relentless. What it does not do is tell us what question it is answering. That is our job. Every field of science is, at its core, a centuries-long attempt to guess \(F\) such that \(x^*_F\) matches the universe, and every generation of scientists revises the guess.

Abstractly this is a functional optimization problem with no gradient, no closed form, no guarantee of convergence, and no oracle for verification except reality itself. Concretely it is what we call thinking.

I think the same thing is true of life, honestly. We are not optimizing a loss function that was handed to us. We are picking one. ***The first half of any serious project --- in science, in work, in how we choose to spend a decade --- is figuring out what the objective even is.*** The second half is easy: once you know what you want, the universe is pretty helpful about telling you whether you are getting closer.

The AI era has not made this easier. It has made the inner loop cheaper and the outer loop more important. ***The question was always the hard part. Now it is obvious that the question was always the hard part.*** That is the shift.

## References

The knowledge in this article really comes from conversations with and courses taught by ***Vikash Kumar*** and ***Sicun Gao*** --- thanks to both of them for the framings that shaped how I think about this.
