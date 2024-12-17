<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

<div class="wrapper">
  <div class="profile">
    <img src="../../../assets/index/profile_pic.jpeg" alt="Profile Picture">
    <div class="profile-details">
      <span class="name">Kaiwen Bian</span>
      <span class="metadata">20 min read · Dec 11, 2024</span>
    </div>
  </div>
</div>

The beauty with convex optimization is that we can use a theoritical perspective to discuss the properties of the algorithm: ***"It will stop and it will be the optimal"***. More importantly, when we make "a little twitch" on the formulation of the problem or how we view the problem, we see a completely different algorithm with a different perspective. ***There is a consistent stream of thought in convex optiization that derives everything from Taylor's theory***. If I want t sum up what I know about convex optimization, it would be:

1. Taylor's theorem
2. Try to do incremental/dynamic update
3. We just need to think and make twitches from a different perspective.
    - We will see that GD local convex perspective $\rightarrow$ Newton's method $\rightarrow$ CGD.
    - We will also seee that GD $\rightarrow$ GD + M (with twitch from GD) $\rightarrow$ GD + N.A.
4. Anything cna be framed into a optimization scheme question, just with different constraint that needs to be satisfied.

$$
\min_{w \in \mathbb{R}^p} \frac{1}{N} \sum_{i=1}^N \ell(\sigma(x_i; w), y_i) + \lambda R(w)
$$

It may all sound very vague, but this article will make it more clear. This article is not intended for a detailed proof (proof are attached as pdf files in each section), but more of a intuition of how convex optimization leads from one to another.

## Gradient Descent In Different Lenses
Gradient descent is an extremely popular algorithm that is highly used in modern machine learning (particularly variants of it like the ADAM optimizor used commonly in deep learning context). This is not only because it has good practical performances but also because it comes with strong theoritical guarantees. In this section, we will use differnt perspective to look at gradient descent first.

### Taylor's Theorem
Taylor's theory is an extremely core concept in convex optimization as many of convex optimization is about ***"how to satisfy taylor theory such that we have certain part less than some other part"***. Essentially, Taylor's theorem talks about how we can estimate an point in the function $f(y)$ from using another point on the function $f(x) with the curvature at $x$ scaled by the distance between $x$ and $y$. The most known form wpuld be written like:

$$
f(y) \approx f(x) + f'(x)(y-x) + \frac{1}{2}f''(x)(y-x)^2 + \cdots
$$

However, we can make things a little bit more fancy by using a recursive definition in $R^n$:

$$
f(\vec y) = f(\vec x) + \nabla f(\vec z)^T (y - \vec x)
$$

This is the recursion definition of Taylor's theoy, it recursively unfold th whole expression again using $\vec z \in (\vec x, \vec y)$ (imagine choosing another point between $x$ and $y$ to help estimate $y$, just like picking $y$ in the first place). One tric here is that the previous expansion is an approximation, but this recursion definition can have equality in it. The magic of gradient decent comes when we assume this $\vec y$ is our next point $\vec y = \vec x + \mu \vec v$ where we are moving along the direction of $\vec v$.

$$
f(\vec x + \mu \vec v) = f(\vec x) + \nabla f(\vec z)^T (\mu \vec v)
$$

Ideally, if we  are doing gradient descent, we want to have the next point taking a lower function value than the previous one, meaning that we want:

$$
f(\vec x + \mu \vec v) \leq f(\vec x)
$$

or teh equivalence $f(\vec x + \mu \vec v) - f(\vec x) \leq 0$. For a small enough $\tilde{\mu}$ and a continuous function $f$s, the descent direction of $\vec v$ when $\vec v \cdot \nabla f(\vec x) \leq 0$ is also the descent direction for $f(\vec x + \mu \vec v)$. To create $\vec v \cdot \nabla f(\vec x) \leq 0$, we need $\vec  v = \nabla f(\vec x)$, which is why the gd equation is in the form:

$$
x^{(t+1)} = x^{(t)} - \mu^{(t)} \nabla f(x^{(t)})
$$

To recap, we derived our descent direction $\vec v$ based on what we wnat to satisfy taylor theory such that $f(\vec x + \mu \vec v) - f(\vec x) \leq 0$. We have shown that there is a intuitive, but theoritical reason behind each step of why we are doing gradient descent.

### Local Convexity $\rightarrow$ Calculus Optimization
From a different perspective, we can look at GD as doing a local descent. To be more specific, we assume that at each step, the **Armijo condition** (did not cover in this article, but the idea is essentially creating sort of a checker to gurantee local convexity before making the moves) is hold, then we have a local convex shape. In full Taylor expansion to the second degree, it cna be expressed as:

$$
f(z) = f(x^{(t)}) + \nabla f(x^{(t)})^T (z - x^{(t)}) + \frac{1}{2} (z - x^{(t)}) \nabla^2 f(z)^T (z - x^{(t)})
$$

This second $\frac{1}{2} (z - x^{(t)}) \nabla^2 f(z)^T (z - x^{(t)})$ is super annoying as we have a recursive hessian term $\nabla^2 f(z)$ in it. However, what if we don't care about the curvature of the curvature? We make a simplified assumption that:

$$
\nabla^2 f(z) \leftarrow \frac{1}{\mu}I
$$

This makes our expression much more simple, giving just

$$
g(z) = f(x^{(t)}) + \nabla f(x^{(t)})^T (z - x^{(t)}) + \frac{1}{\mu} || (z - x^{(t)}) ||^2
$$

Notice that this is a quadratic-ish function in multi-dimension and then the shape we have is ***locally convex***. We say that this $g(z)$ looks very much like $f(z)$ from a local perspective and more importnatly, this $g(z)$ function is convex and we can use the traditional calculus method of:

$$
\nabla_z g(z) = 0
$$

And we can retrieve the same result that

$$
z^* = x^{(t)} - \mu \nabla f(x^{(t)})
$$

Again, by assuming our function is locally convex (locally L-smooth to be specific, hessian bounded), we can ***hide away much complexity*** into approximations.

## Optimality Guaranteed
We never really formally define what it means to be concvex here, but for now let's just say that convexity means that we have a ***Positive Semi-Deminite (PSD)*** hessian (this is not a definition but a result of teh definition). With gradient descnet + convexity + some tricks (teloscoping theory, series of convex functions, ...), we can have many powerful optimality guaranteed, namely: ***"It will stop, it will converge, and we will be at the optimal position"***. We will name a few in the following section, but first we can define some notion of convexity.

### Convex Functions
The real definition of convexity is given by the following. Intuitively it is when we draw a line from any two points on this curve and this line will always stay above our function curve.

$$
f(\alpha x + (1-\alpha)y) \leq \alpha f(x) + (1-\alpha) f(y)
$$

From this notion of convexity, we can proof that it leads to many others, we will name the important ones here:

1. $f(y) \geq f(x) + \nabla f(x)^T (y-x)$
2. $\nabla^2 f(x) \succeq 0, \quad \text{PSD}$ or all eigenvalue above zero
3. $\nabla f(x) \text{ is monotone, } \langle \nabla f(x) - \nabla f(y), x-y \rangle \geq 0$

Both 1 and 2 can be derived from convexity definition + Taylor theory.

Notice that these 4 notions of convexity all come with different assumptions where the definition makes no assumption, 2 and 3 need twice differentiable functions and 3 need once differentiable function. Importantly, ***for convex function, local minimum $\rightarrow$ global minimum and when $\nabla f(x) = 0$, we can find such minimum.***

### L-Lipschitz
L-Lipschitz means that the gradient is bounded where $|| \nabla f(x) || \leq L$ and equivalently we have:

$$
||f(x) - f(y)|| \leq L ||x - y||
$$

With a convex function $f$, initial guess in range $||x^{(0)} - x^*|| \leq R$, total $T$ iterations, and the learning rate $\mu = \frac{R}{L\sqrt{T}}$, we can guarantee that the average distance/error to the optimal coordinate $x^*$ under function being bounded by:

$$
f(\frac{1}{T} \sum^{T-1}_{s=0}x^{(s)}) - f(x^*) \leq \frac{RL}{\sqrt{T}}
$$

This is the first proof we introduced such that we can say confidently: gradient descent will stop.

<a href="../../../assets/math/optimization_notes2.pdf" target="_blank">
    <p><span class="link-icon">&#9881;</span> Proof of L-Lipschitz + gradient descent convergence</p>
    </a>


### L-Smooth
L-smooth means that the hessian is bounded where $0 \leq v^T \nabla^2 f(x) v \leq L$ (since we are looking at the hessian, we need to bound by matrix norm (not formally defined here, but we will use this definition for now)).

$$
||\nabla f(x) - \nabla f(y)|| \leq L ||x - y||
$$

We can ***guarantee that at each step, the function value decreases***:

$$
f(x^{(t+1)}) \leq f(x^{(t)}) - \frac{\mu}{2} ||\nabla f(x^{(t)})||^2
$$

And more importantly, we should have at least one $x^{(t)}$ satisfying the following cndition (this root boost convergence speed hugely):

$$
\|\nabla f(x^{(t)})\| \leq \sqrt{\frac{2(f(x^{(0)}) - f(x^*))}{\mu T}}
$$

This is an incredably strong condition since ***non of the L-smooth proof used the fact that the function need to be convex***, only that they are second degree differentiable and L-smooth, signifying that with just gradient descent: ***"we will stop at some point and this would be optimal, no matter convexity or not"***. For more information, reference to this note:

<a href="../../../assets/math/optimization_notes3.pdf" target="_blank">
    <p><span class="link-icon">&#9881;</span> Proof of L-Smooth + gradient descent convergence</p>
    </a>

## All Families Comes From Twitch
Now after convexity and basic formulation of gradient descent, this is where we get to the interesting part, turns out that all the variants and instances of gradient descent (Coordinate descent, Uniform descent, Newton's method (i.e. ADAM), GD with Momentum, Nestrov Acceleration, Conjugate GD, ...) is all somewhat like GD but a little twitch on the theoritical formulation.

### "Norm" in Gradient Descent
Turns out that there is actually a norm hidden in the gradient descent algorithm. When we use GD, we are saying that:

$$
x^{(t+1)} - x^{(t)} = -\mu \nabla f(x)
$$

When swapping into Taylor's theorem

$$
f(x^{(t+1)}) + \nabla f(x^{(t)})^T (x^{(t+1)} - x^{(t)}) \approx f(x^{(t)}) - \mu \nabla f(x^{(t)})^T \nabla f(x^{(t)})
$$

$$
\approx f(x^{(t)}) - \mu ||\nabla f(x^{(t)})||^2
$$

Normally speaking, this norm is a Eucledian norm or norm 2. However, in the same fashion, we can switch to norm-1 or norm-infinity$. This is essentially framing gradient descent as a ***constraint optimization*** problem. How do we optimize in the set of this sphere, or this dimond, or this pyramid? With different constraints, GD comes with different property, namely ***coordinate descent*** or ***uniform descent***. They can be expressed out analytically:

$$
L_1 \rightarrow \text{Sparse Coordinate Descent}: \quad \tilde{p}(x) = \text{sgn}(\nabla f(x)) \cdot \frac{|\nabla f(x)|_i}{|\nabla f(x)|_{\max}}
$$

$$
L_{\infty} \rightarrow \text{Uniform Descent}: \quad \tilde{p}(x) = \frac{\text{sgn}(\nabla f(x))}{||\text{sgn}(\nabla f(x))||_{\infty}}
$$

### Local Convex Perspective $\rightarrow$ Newton's Method
Now forget everything we just discussed about gradient descent and we will look at it from  brand new perspective. We used $f(x) \approx f(x^{(t)}) + \nabla f(x^{(t)})^T (x - x^{(t)})$ to derive gradient descent before, now let's use the second degree expansion like we did in ***GD's perspective from local convexity***. However, instead of making a simplified assumption of $\frac{1}{\mu}$ as the hessian, let's set the gradient directly to $0$.

$$
f(x) \approx f(x^{(t)}) + \nabla f(x^{(t)})^T (x - x^{(t)}) + \frac{1}{2} (x - x^{(t)}) \nabla^2 f(x)^T (x - x^{(t)})
$$

Setting gradient $\nabla_x f(x)$ to zero:

$$
\nabla_x f(x) = \nabla f(x^{(t)}) + \nabla^2 f(x) (x - x^{(t)}) = 0 
$$

$$
\nabla f(x^{(t)}) + \nabla^2 f(x) (x - x^{(t)}) = 0 
$$

$$
\nabla^2 f(x^{(t)}) (x - x^{(t)}) = -\nabla f(x^{(t)})
$$

Notice that $\nabla^2 f(x^{(t)})$ is a matrix (A), $(x - x^{(t)})$ is a vector (x), and $-\nabla f(x^{(t)})$ is a vector (b), so essentially we are actually solving the famous problem in linear algebra: how to find $Ax + b = 0$. Alternatively, by changing $Ax = -b$ into $x = - A^{-1}b$:

$$
x^{(t+1)} - x^{(t)} = - [\nabla^2 f(x^{(t)})]^{-1} \nabla f(x^{(t)})
$$

Or we can write in the update form of Newton's method (fun fact, this is called Newton's mthod because the first algorithm os setting to zero is invented by Newton in 1D, is just taht we are doing in $R^n$) as:

$$
x^{(t+1)} = x^{(t)} - [\nabla^2 f(x^{(t)})]^{-1} \nabla f(x^{(t)})
$$

However, inverting this "A" matrix comes with insanly high computation cost and numerical instability. This is where our familier friend ADAM optimizor comes in, which is essetntially a ***Quasi-Newton*** method, or a family of algorithm that estimates/creates condition for this inverse to be easily calculated. So the whole field of Newton's method can be intuitively summarized as ***how do you do the inverse of A?***

Using Newton's method come with very interesting convergence property such that ***if we converge, we converge exponentially fast***. Notice that this is not a ***contrastice mapping***. The value of $\frac{2h}{3L}$ may be greater than $1$, causing unconverged GD.

$$
(1) \quad ||x^{(t)} - x^*|| \leq \frac{2h}{3L}
$$

$$
(2) \quad ||x^{(t)} - x^*||^2 \leq \frac{3L}{2h} ||x^{(t-1)} - x^*||^2
$$

However, if we start at a good point in the right function where $\frac{2h}{3L} \leq 1$, it converges expoennetially fast (this is really hard and usually Newton's method has many oscilations).

### Gradient Descnet + Momentum or N.A.
All discussion in the following few sections will be around a particular case of a convex function, a nice one (we wil generalize later):

$$
\phi(x) = \frac{1}{2} x^T A x
$$

Now recall gradient descent and let's add a ***first order Markovian memory*** to it. If the current gradient direction aligns with the previous gradient direction, we move a little bit further (constructive interference) and do the opposite if we are exact opposite with previous gradient. This is called ***momentum*** and using this method we can avoid sudden updates in teh gradient (zig-zag shape) and create the decent in  much smoother way. Formally, we can write it as:

$$
x^{(t+1)} = x^{(t)} - \mu \nabla f(x^{(t)}) + \beta (x^{(t)} - x^{(t-1)})
$$

To study the convergence property, we can stack up the current state and next state, just like in ***control theory*** calculating state transition. This way of analyzing convergence is very common and quite popular in optimization as well (the intuition is that we want the eigenvalues of this $M$ matrix to be less than $1$, then the system would approach towards stability).

$$
\begin{bmatrix}
x^{(t+1)} \\
x^{(t)}
\end{bmatrix} = 
\underbrace{
\begin{bmatrix}
1 - \mu \lambda + \beta & -\beta \\
1 & 0
\end{bmatrix}}_{M}
\begin{bmatrix}
x^{(t)} \\
x^{(t-1)}
\end{bmatrix}
$$

Under a quadratic equation condition of $\frac{1}{2} x^T A x$ (we can generalize this quadratic equation later with strongly convex property), gradient descnet with momentum will converge under:

$$
\left(\frac{k-1}{k+1}\right)^t \quad \text{where} \quad k = \frac{\lambda_{max}}{\lambda_{min}}
$$

A similar approach (Nestrov Acceleration) works similar as momentum, but it goes  little bit further first before taking the gradient. It is less intuitive than gradient descent with momentum, but in practice is has nice property that out performs momentum, namely under continuou  environment and differential euqation environment.

$$
(1) \quad y^{(t+1)} = x^{(t)} + \beta (x^{(t)} - x^{(t-1)})
$$

$$
(2) \quad x^{(t+1)} = y^{(t+1)} - \mu \nabla f(y^{(t+1)})
$$


In general, we can say the convergence rate $|| x^{(t)} - x^* ||$ from GD to GD + M to GD + N.A. as:

$$
\underbrace{(\frac{k+1}{k+1})^t}_{\text{GD}} \rightarrow \underbrace{\left(\frac{\sqrt{k}-1}{\sqrt{k}+1}\right)^t}_{\text{GD + M}} \rightarrow \underbrace{\left(\sqrt{\frac{\sqrt{k}-1}{\sqrt{k}}}\right)^t}_{\text{GD + N.A.}}
$$

Notice that they all converges exponentially fast, but this exponentially fast is conditioned on this conditon number $k$, essetially the ratio of largest eigenvalue to the smallest eigenvalue. With more square root bracket is added to it, it will make this number very small, which makes taking the exponential more powerful for minimizing it.

### Newton's Method $\rightarrow$ Conjugate Gradient Descent
Let's go back to thinking about solving this problem mentioned in Newton's method, but let's still look at teh special case of $\phi(x) = \frac{1}{2} x^T A x$ and so we want to solve the problem of $Ax^* - b = 0$ where the gradient is $\nabla \phi(x) = Ax - b$. We know that doing the inverse is very costly and numerically instable. So can we solve this problem ***without inversing A*** and maybe we can ***incrementally*** solve this issue. Let's first define the mathamaticla notion of conjugate, let's say that ${p_1, ..., p_n}$ is the conjugate of a Positive Definite (PD) matrix A if:

$$
p_i^T A p_j = 0 \quad \text{if} \quad i \neq j
$$

This conjugate is a general notion of ***orthogonality*** and the idea is to maybe update in one orthogonal direction at each time and just not care of it (independent of future update). Intuitively, we can frame it like the following:

$$
x^{(t+1)} = x^{(t)} + \alpha_t \vec{p}_t
$$

Where

$$
\alpha_t = \underset{\alpha \in \mathbb{R}}{\arg \min} \phi(x^{(t)} + \alpha \vec{p}_t)
$$

The first ensures the ***orthogonal step*** and the second ensure the ***descent step***. Notice that this second optimization problem is a easier problem to solve and close form solution does exist as we are only looking at a minimization problem that involve two vectors, way easier than the problem we begin with. Close form solution of optimal $\alpha^*$ would be:

$$
d_t = \alpha^* = \frac{(b - Ax^{(k)})^T p_t}{p_t^T A p_t} = \frac{- \nabla \phi(x^{(t)})^T p_t}{p_t^T A p_t}
$$

This almost looks like a gradient descent with just a bunch of other fancy multiplication in it. Turns out that we are actually doing a gradient descent that is projected onto the $p_t$ conjugate axis. Taking the gradient in the component direction of $p_t$. All of theses sounds very nice, but we still have one problem. How do we find the conjugate? Doing $p_i^T A p_j = 0 \quad \text{if} \quad i \neq j$ is not a cheap operation. Let's do it like ***Bellman Update***, let's use a dynamic way of updating the conjugate!

Assume that each $p_t$ only need the previous one $p_{t-1}$ to be computed, we just need the current vector to be conjugate to the previous one, and if the chain forms for being conjugate, all of them will be conjugate vectors and we can throw away $p_o$ to $p_{t-2}$. Let's start with:

$$
p_t = -\nabla \phi(x^{(t)}) + \beta_t p_{t-1}
$$

Then we multiply $p_{t-1} A$ to both side and try to make RHS zero.

$$
p_{t-1}^T A p_t = -p_{t-1}^T A \nabla \phi(x^{(t)}) + \beta_t p_{t-1}^T A p_{t-1}
$$

This has a close form solution again where we can calculate the optimal $\beta_t$ to satisfy this condition. The CGD algorithm becomes clear as well, we just need to randomly initiate $\beta$ and \p_0$, then update base on this given constraint.

$$
\beta_t = \frac{p_{t-1}^T A \nabla \phi(x^{(t)})}{p_{t-1}^T A p_{t-1}}
$$

Conjugate gradient descent is very very powerful (similar to gradient descent with momentum):

$$
||x^{(t)} - x^*||_A \leq 2 \left(\frac{\sqrt{k}-1}{\sqrt{k}+1}\right)^t ||x^{(0)} - x^*||_A
$$

However, the plain CGD algorithm may not work as efficiently in practice, which is why we usually use th ***redidual algorithm***, which is described in more details in the note.

<a href="../../../assets/math/optimization_notes4.pdf" target="_blank">
    <p><span class="link-icon">&#9881;</span> Two expressions of the CGD algorithm</p>
    </a>

<a href="../../../assets/math/optimization_notes6.pdf" target="_blank">
    <p><span class="link-icon">&#9881;</span> Code implementation of CGD</p>
    </a>

***As a comparison to Newton's method***, CGD is trying to make the original hard optimization problem to smaller problems "along each direction". Newton's method is trying to solve everything at once (in fact when the function is linear regression, the update rule for Newton's method is actually directly the analytical solution normal equation for linear regression) while CGD want to ***solve the problem along every single conjugate direction***.

## Beyond Convexity, Optimality May Be Guaranteed

### Strongly Convex
What happens beyond convexity? We can still talk about them in theory (though not as convineint as in convex situations). First we will introduce the concept of ***stronly convex***, there are 2 ways of understanding it.

1. Back to Taylor's theory, we are essentially swapping out the $\nabla^2 f(z)$ with the smallest eigenvalue of such matrix and that $\nabla^2 f(z) \geq CI$. Mathamatically, this is $0 \leq C \leq \lambda_{\text{min}} \nabla^2 f(z)$.
2. We are essentially constructing sort of a tangent curve instead of a tangent line in the original convex definition.

$$
f(y) \geq f(x) + \nabla f(x)^T (y-x) + \frac{C}{2} ||y-x||^2
$$

and we can show that the above definition leads to the following:

$$
f(x) - f(x^*) \leq \frac{||\nabla f(x)||^2}{2C}
$$

When  strongly convex is achieved, L-smooth condition is matched, and when choosing learning rate as $\frac{1}{\mu}$, we have a incrediablly strong convergence rate, ***an exponential convergence rate that is independent of the condition number $k$***.

$$
f(x^{(t+1)}) - f(x^*) \leq (\frac{C}{L})^t (f(x^{(0)}) - f(x^*))
$$

More critically, when strongly convex condition is matched, all the previous method's convergence property remains for functions that is strongly convex but not neccessarily just quadratic in the form of $\frac{1}{2} x^T A x$. This is really how strongly convex is used in practice. Practically speaking, ***when $f(w)$ is convex and $R(w)$ is c-strongly convex, then $f(w) + R(w)$ is also c-strongly convex***. This gives the power for regulaorizor to show its power. For instance, in ridge regression, other than just making a constraint on keeping the weights small, ridge regression gurantees a better convergence rate than just normal gradient descent. For more proof related content, visit the notes.

<a href="../../../assets/math/optimization_notes7.pdf" target="_blank">
    <p><span class="link-icon">&#9881;</span>Strongly convex proof</p>
    </a>

### PL (Polyak-Lojasiewicz) Condition
When discussion in non-convex situations, we talk about the ***PL-Condition***, which is eessentially a condition that looks very similar with strongly convex where strongly convex implies PL-condition but not vice versa.

$$
f: \mathbb{R}^n \rightarrow \mathbb{R} \text{ satisfies } \mu \text{-PL-Condition if } \forall x, y \in \mathbb{R}^n
$$

$$
\frac{1}{2}||\nabla f(x)||_2^2 \geq \mu (f(x) - f(x^*))
$$

Essentially, we are putting a upperbound on the gradient saying that when we are far from $x^*$, we have  big gradient to move faster. Importantly, PL-Condition has 2 important factors:

1. PL-Condition can hold for non-convex functions and it acts in as sort of a strongly convex guarantees.
2. If $f(x)$ s L-smooth + $\mu$-PL-Condition, then gradient descent with a step-size of $\frac{1}{L}$ will converge at a rate of

$$
f(x^{(t)}) - f(x^*) \leq \left(1 - \frac{\mu}{L}\right)^t (f(x^{(0)}) - f(x^*))
$$

This is similar to strongly convex, very strong exponential convergence. In practice, we actually observes this phenomenon! Turns out that an ***over-parametrized*** neural network (highly non-convex function) can be written in a ***Neural Tangent Kernel*** form (where we use, again, the eigenvectors to hide away the complexity of matrix) and then we can derive that:

$$
||\nabla L(w)||^2 \geq 2\mu L(w)
$$

Which satisfy the PL-Condition since the loss function at $x^*$ should always be zero. This shows that neural network would converge as the rate of $(1 - \frac{\mu}{\beta})^t$, it converges exponentially fast. This is exactly why we see exponential convergence in teh begining when we randomly initialize an neural network. This sort of example is what the PL-Condition is truly used for.

***The moral of the story is, with certain constraints/conditions satisfied, we can use theory to make something practically work!***

## Extra Resources & Code

For more detailed information and code implementation of some of teh algorithms:

<a href="../../../assets/math/optimization_notes1.pdf" target="_blank">
    <p><span class="link-icon">&#9881;</span> Notes on convex optimization</p>
    </a>

<a href="../../../assets/math/optimization_notes5.pdf" target="_blank">
    <p><span class="link-icon">&#9881;</span> Code implementation of some variants of gradient descent</p>
    </a>
