<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

<div class="wrapper">
  <div class="profile">
    <img src="../../../assets/index/profile_pic.jpeg" alt="Profile Picture">
    <div class="profile-details">
      <span class="name">Kaiwen Bian</span>
      <span class="metadata">25 min read · Mar 16, 2026</span>
    </div>
  </div>
</div>

Reinforcement learning is fundamentally about making sequential decisions under uncertainty. The narrative everyone tells focuses on policy gradients and deep RL --- the flashy stuff that makes headlines. But the mathematical foundation that makes it all work is much more elegant: the **Bellman equation** and its update rule. What's astonishing is that this simple recurrence --- "my value equals my immediate reward plus the discounted value of where I go next" --- when applied iteratively, is **guaranteed to converge to a unique fixed point**. My handwritten notes call this fixed point "the singularity" --- a single point in the space of all possible value assignments where every state has its true optimal value. Every path through the value space leads to the same destination. The initial guess doesn't matter. This article traces how we get there.

## The MDP Framework

A **Markov Decision Process (MDP)** is defined by:

- A set of states \(S\)
- A set of actions \(A\)
- A transition model \(P(s' \mid s, a)\) --- the probability of landing in state \(s'\) given you take action \(a\) in state \(s\)
- A reward function \(R(s)\) --- the immediate reward for being in state \(s\)
- A discount factor \(\gamma \in [0, 1)\)

A **policy** \(\pi: S \to A\) maps each state to an action. The agent chooses actions; the environment chooses outcomes stochastically. The environment is a "chance player" --- you pick what to do, and nature decides where you end up.

Consider a concrete example: you're skateboarding to class on a university campus. At each intersection, you choose whether to take the fast route (skateboard through a crowded plaza --- fast if it works, but risk of crashing) or the slow route (walk around). The states are intersections, the actions are route choices, the transitions encode the probability of crashing or arriving smoothly, and the rewards capture how much time you save or lose. Each decision point branches into a tree of possibilities.

The key insight: an MDP turns the world into an **expectimax tree** where you (the max player) alternate with the environment (the chance player). At your nodes, you choose the action that maximizes value. At nature's nodes, the outcome is a probability-weighted average over successor states. This alternating structure is the foundation for everything that follows.

## Value and Policy

The **value function** under a policy \(\pi\) measures the expected total discounted reward starting from state \(s\):

$$
V^\pi(s) = \mathbb{E}\left[\sum_{i=0}^{\infty} \gamma^i R(s_i) \;\Big|\; s_0 = s\right]
$$

where the expectation is taken over the stochastic transitions under policy \(\pi\).

There's a problem with infinite paths: without discounting, the sum of rewards can diverge to infinity. The discount factor \(\gamma \in [0, 1)\) solves this. Since the rewards are bounded by some \(R_{\max}\), the geometric series gives us:

$$
V^\pi(s) \leq \sum_{i=0}^{\infty} \gamma^i R_{\max} = \frac{R_{\max}}{1 - \gamma}
$$

Two justifications for discounting. **Conceptually**, future rewards are uncertain --- a dollar today is worth more than a dollar tomorrow because the world might change. **Mathematically**, convergence requires it --- without \(\gamma < 1\), the value function may not even be well-defined.

The **optimal policy** \(\pi^*\) maximizes \(V^\pi(s)\) for **all** states simultaneously. This is a remarkable fact --- there exists a single policy that is best everywhere at once. The optimal value function is:

$$
V^*(s) = \max_\pi V^\pi(s)
$$

## The Bellman Equation --- From Global to Local

This is the key insight. Start with the global definition of value:

$$
V^\pi(s_0) = \mathbb{E}\left[\sum_{i=0}^{\infty} \gamma^i R(s_i)\right]
$$

Now watch what happens when we split off the first term:

**Step 1.** Separate the immediate reward from the future:

$$
V^\pi(s_0) = R(s_0) + \mathbb{E}\left[\sum_{i=1}^{\infty} \gamma^i R(s_i)\right]
$$

**Step 2.** Factor out \(\gamma\) from the remaining sum:

$$
V^\pi(s_0) = R(s_0) + \gamma \cdot \mathbb{E}\left[\sum_{i=0}^{\infty} \gamma^i R(s_{i+1})\right]
$$

**Step 3.** Recognize that the inner sum is exactly \(V^\pi(s_1)\) --- the value starting from the next state:

$$
V^\pi(s) = R(s) + \gamma \sum_{s'} P(s' \mid s, \pi(s)) \cdot V^\pi(s')
$$

This is the **Bellman Expectation Equation**.

The astonishing thing --- and this cannot be overstated --- is what we've done here. We've turned a **global** estimate (an infinite sum over all future trajectories, requiring knowledge of the entire future) into a **local** recurrence (one step of reward plus the discounted value of the next state). The value of a state is fully characterized by its immediate neighborhood. This is deeply elegant. The infinite collapses into the local.

For the **optimal** value, we add a maximization over actions:

$$
V^*(s) = R(s) + \gamma \max_a \sum_{s'} P(s' \mid s, a) \cdot V^*(s')
$$

This is the **Bellman Optimality Equation** --- exactly generalized Expectimax. At each state, you pick the action that maximizes the expected discounted future, and nature resolves the stochastic transition.

## Walking in R^n --- The Contraction Mapping

This is the "singularity" concept from my notes, and it's the most beautiful part of the theory.

The value function \(V\) is a **vector in \(\mathbb{R}^n\)**, where \(n = |S|\) is the number of states. Each entry \(V(s)\) is the value assigned to state \(s\). Every possible assignment of values to states is a point in this \(n\)-dimensional space. The **Bellman update operator** \(B\) takes one vector \(V\) and produces a new vector \(B(V)\):

$$
B(V)(s) = R(s) + \gamma \max_a \sum_{s'} P(s' \mid s, a) \cdot V(s')
$$

Starting from **any** initial vector \(V_0 \in \mathbb{R}^n\) --- completely random values, all zeros, anything --- applying \(B\) repeatedly produces a sequence:

$$
V_0, \quad V_1 = B(V_0), \quad V_2 = B(V_1), \quad V_3 = B(V_2), \quad \ldots
$$

The **Contraction Mapping Theorem** says: \(B\) is a \(\gamma\)-contraction in the infinity norm:

$$
\|B(V) - B(V')\|_\infty \leq \gamma \cdot \|V - V'\|_\infty
$$

This means every application of \(B\) brings **any** two vectors closer together by a factor of \(\gamma\). Since \(0 \leq \gamma < 1\), the distance between successive iterates shrinks exponentially. The sequence \(V_0, V_1, V_2, \ldots\) converges to a **unique fixed point** \(V^*\), regardless of where you start.

From my notes: *"The vector \(V\) stores one possible reality of the MDP. The max update converges to a single reality, the SINGULARITY, that has all the best states."* This is the singularity --- the unique point in \(\mathbb{R}^n\) where the Bellman equation is satisfied exactly. Every path through the value space leads to the same destination. The initial guess doesn't matter. The map is a contraction. The singularity pulls everything toward itself.

### Sketch of the Proof

We use the **infinity norm**: \(\|V\|_\infty = \max_s |V(s)|\).

Consider two value vectors \(V\) and \(V'\). For any state \(s\):

$$
|B(V)(s) - B(V')(s)| = \gamma \left|\max_a \sum_{s'} P(s'|s,a) V(s') - \max_a \sum_{s'} P(s'|s,a) V'(s')\right|
$$

The key step uses the fact that \(\max\) is Lipschitz:

$$
\left|\max_a Q_a(V) - \max_a Q_a(V')\right| \leq \max_a |Q_a(V) - Q_a(V')|
$$

Then for any fixed action \(a\):

$$
\left|\sum_{s'} P(s'|s,a)(V(s') - V'(s'))\right| \leq \sum_{s'} P(s'|s,a)|V(s') - V'(s')| \leq \|V - V'\|_\infty \sum_{s'} P(s'|s,a) = \|V - V'\|_\infty
$$

where the last equality uses the fact that transition probabilities sum to 1. Combining:

$$
\|B(V) - B(V')\|_\infty \leq \gamma \|V - V'\|_\infty
$$

**Convergence rate:** After \(k\) iterations:

$$
\|V_k - V^*\|_\infty \leq \gamma^k \|V_0 - V^*\|_\infty
$$

This is **exponential convergence**. For \(\gamma = 0.9\), after 100 iterations the error is at most \(0.9^{100} \approx 2.66 \times 10^{-5}\) times the initial error. The singularity is inevitable.

## From Value Iteration to Temporal Difference

**Value iteration** --- repeatedly applying the Bellman update \(B\) --- requires knowing the full MDP: all transition probabilities \(P(s'|s,a)\) and all rewards \(R(s)\). This is called **model-based** RL. But what if you don't have the model? What if you can only interact with the environment, take actions, and observe what happens?

**Temporal Difference (TD) Learning** modifies the Bellman update with a sampling flavor --- it updates without perfect knowledge of the transition model. Instead of computing the exact expected value over all successor states, you observe a single transition \(s \to s'\) and update:

$$
V^{\text{new}}(s) = V^{\text{old}}(s) + \alpha \left(R(s) + \gamma V^{\text{old}}(s') - V^{\text{old}}(s)\right)
$$

The term \(R(s) + \gamma V^{\text{old}}(s')\) is the **TD target** --- one sample of what the Bellman equation says the value should be. The term \(V^{\text{old}}(s)\) is the current estimate. Their difference is the **TD error**. The learning rate \(\alpha\) controls how much to adjust.

This is the **incremental update formula** familiar from statistics:

$$
\mu_k = \mu_{k-1} + \alpha_k (x_k - \mu_{k-1})
$$

One new observation adjusts the old estimate toward the new sample. You don't need to store all past observations --- just the running estimate and the new data point.

From my notes: *"Walking on the \(\mathbb{R}^n\) space but just incrementally updating each entry by one instance learning, it is still a contraction mapping."* The magic is that even though we're using noisy, one-sample estimates instead of exact expectations, the contraction property still holds in expectation. The singularity still pulls us in --- just more slowly and with some noise along the way.

## Q-Learning --- The Full Picture

From my notes: *"Reinforcement learning is both Search and Optimization. Both search and optimization is already an abstraction on the real problem, one frames it in an infinite tree's scope, one frames it in a landscape's scope."*

Instead of learning \(V(s)\), we can learn **Q-values** \(Q(s, a)\) --- the value of taking action \(a\) in state \(s\) and then acting optimally:

$$
V(s) = \max_a Q(s, a)
$$

The Q-value captures something richer than the state value: it tells you the value of each specific action, not just the best one. The Bellman equation for Q-values is:

$$
Q(s, a) = \sum_{s'} P(s'|s,a) \left(R(s) + \gamma \max_{a'} Q(s', a')\right)
$$

The **Q-Learning update** is the TD version of this:

$$
Q(s, a) \leftarrow Q(s, a) + \alpha \left(R(s) + \gamma \max_{a'} Q(s', a') - Q(s, a)\right)
$$

Key insights from my notes:

1. **The max operator ensures we always update toward the BEST understanding**, not a random bad rollout. This is what makes Q-learning an *off-policy* method --- it learns about the optimal policy regardless of what exploration policy the agent actually follows.

2. **Random initialization works**: *"The global state is instantiated to be random, the conceptual global vector in vector space is randomly initiated. As learning goes on, because of the learning rate, the initial starting point doesn't really matter and correctness converges."* The contraction mapping doesn't care where you start.

3. **Repeated visits matter**: *"RL agents need to really visit one state multiple times to actually learn and understand the state."* A single visit gives you one noisy sample. Many visits average out the noise and bring the Q-value closer to the true value.

Here is a basic Q-learning implementation with epsilon-greedy exploration:

```python
import numpy as np

def q_learning(env, num_episodes, alpha=0.1, gamma=0.99, epsilon=0.1):
    """Q-Learning with epsilon-greedy exploration."""
    Q = np.zeros((env.num_states, env.num_actions))

    for episode in range(num_episodes):
        state = env.reset()
        done = False

        while not done:
            # Epsilon-greedy action selection
            if np.random.random() < epsilon:
                action = np.random.randint(env.num_actions)
            else:
                action = np.argmax(Q[state])

            # Take action, observe outcome
            next_state, reward, done = env.step(action)

            # Q-Learning update: use max over next actions (off-policy)
            td_target = reward + gamma * np.max(Q[next_state])
            td_error = td_target - Q[state, action]
            Q[state, action] += alpha * td_error

            state = next_state

    return Q
```

The structure is simple: explore with probability \(\varepsilon\), exploit with probability \(1 - \varepsilon\). Observe a transition. Compute the TD target using the max over next-state Q-values. Update toward the target. Repeat. The contraction mapping guarantees that \(Q\) converges to \(Q^*\).

## The Chain --- Bellman to TD to Q

The entire progression forms a clean hierarchy, each building on the previous:

**Bellman Expected Update** (model-based, evaluate a fixed policy):

$$
V^\pi(s) \leftarrow R(s) + \gamma \sum_{s'} P(s'|s, \pi(s)) \cdot V^\pi(s')
$$

**Bellman Max Update** (model-based, find optimal values --- value iteration):

$$
V(s) \leftarrow R(s) + \gamma \max_a \sum_{s'} P(s'|s,a) \cdot V(s')
$$

**TD Evaluation** (model-free, evaluate a fixed policy from samples):

$$
V^\pi(s) \leftarrow V^\pi(s) + \alpha \left(R(s) + \gamma V^\pi(s') - V^\pi(s)\right)
$$

**Q-Learning** (model-free, find optimal values from samples):

$$
Q(s,a) \leftarrow Q(s,a) + \alpha \left(R(s) + \gamma \max_{a'} Q(s',a') - Q(s,a)\right)
$$

Each step in this chain relaxes an assumption. The Bellman expected update needs the full model and a fixed policy. The Bellman max update needs the full model but finds the optimal policy. TD drops the model requirement but needs a fixed policy. Q-learning drops both --- it's model-free and off-policy.

But all four are rooted in the same contraction mapping principle. All four converge to the singularity --- the unique fixed point where every value is correct. The form changes; the mathematics doesn't. The singularity doesn't care how you walk toward it. It only cares that you keep walking.

## References

- Sicun Gao, CSE 257, UCSD --- MDP and Reinforcement Learning lecture slides
- [Bellman update contraction mapping proof notes](../../assets/math/mdp_bellman_update_proof.pdf)
- [Q-Learning algorithm derivation](../../assets/math/mdp_q_algorithm.pdf)

1. Bellman, R. **Dynamic Programming.** Princeton University Press, 1957.
2. Watkins, C.J.C.H. & Dayan, P. **Q-Learning.** *Machine Learning*, 1992.
3. Sutton, R.S. & Barto, A.G. **Reinforcement Learning: An Introduction.** MIT Press, 2018.
