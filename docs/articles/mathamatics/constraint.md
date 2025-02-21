<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<div class="wrapper">
  <div class="profile">
    <img src="../../../assets/index/profile_pic.jpeg" alt="Profile Picture">
    <div class="profile-details">
      <span class="name">Kaiwen Bian</span>
      <span class="metadata">15 min read · Dec 16, 2024</span>
    </div>
  </div>
</div>

When I first learned about the idea  of constraint solving (I belive it was in a class taught by professor Sichun Gao in UCSD CSE called *"Search and optimization"*), I wasn't as exiciting as I am. I thought of constraint solving just as a small sub-branch of optimization, but I was wrong. It is actually the ***"class"*** that can generates any other type optimization, reasoning, or machine learning techniques when you look at if from the right perspective. Quoting from what professor Gao said himself: ***"All you need is constraint solving"***. If I wnat to summarize the ideas in this article, it would be:

1. Theporitically, constraints greatly reduced our search problem because among all the answers we can search for, we only care about the ones  that matches with our constraint.
2. Practically, "doability" is always part of the puzzle, in theory we can do everything but in practice we can't, so how do we optimize with these constraint not as a hinderance but as a helper?

This article tries to go over some quite complicated topic, which I focuesed more on the intuition of it and less on the athamatical deriviation.

## Standard Models (SM) Constraint
(Though I should probbaly put the section describing Variational Autoencoder as the first section since it will be a easier introduction to Expectation Maximization, but I think that starting with the Standard Model illusrate mypoints much clearer.)

From a theoritical perspective, looking at constraint is very interesting. I come from a background of doing reinforcement learning and in there we like to frame our problem as a ***search & optimization*** problem. How do we find the best path in a tree (the tree here is not actually a search tree but an abstract concept of so)? Or how do we find the optimal trajectory for getting to the maximum of the objective surface that changes over time since we get more and more knowledge of such surface? From a ***classical machine learning*** perspective, learning is about finding patterns in the dataset, no matter if you are doing supervised or unsupervised, it is all about looking for some useful pattern and characteristic from the dataset. Things got particularly interesting when I took a class named *"Machine learning with few labels"* taught by professor Zhiting Hu in UCSD HDSI. One of the major work that he has done was establishing the ***standard model for machine learning***, similar to how physicist established the standard model of all partcles. As he always says in this class:
  
<blockquote>
  <p>We want to study machine learning like chemistry, to understand and constructs upon each other, not arcamy.</p>
</blockquote>

The main reason of mentioning the SM is because when we look at the Standard Equation (SE) proposed in the same paper that unifies all type of learning and can be derived into any type of learning algorithm with specific configuration, which can be written as the following, we results in a constraint optimization problem.

\[
\min_{q,\theta,\xi} \quad -\alpha \mathcal{H}(q) \;+\; \beta \mathcal{D}(q, p_\theta) \;+\; U(\xi)
\]

subject to

\[
-\mathbb{E}_q\left[f_k^{(\theta)}\right] \;\leq\; \xi_k, \quad k = 1, \ldots, K.
\]

Where the first term is teh ***Uncertainty function \(\mathcal{H}(\cdot)\)*** that controls the compactness of the output model, for example, by regulating the amount of allowed randomness while trying to fit experience. The second term is the ***Divergence function \(\mathcal{D}(\cdot,\cdot)\)*** that measures the distance between the target model to be trained and the auxiliary model, facilitating a teacher–student mechanism. At last, the thrid term is teh ***Experience function***, introduced by a ***Penalty term \(U(\xi)\)***, which incorporates the set of "experience functions" \(f_k^{(\theta)}\) that represent external experience of various kinds for training the target model. With the follwoing assumptions, we can frame this problem as a Expecttaion Maximization (EM) procedure (EM is also a very very interesting topic that I want to go into a little bit, for now I have attached an example of EM for binomial mixture model below).

  <a href="../../../literature/notes/em_binomial_derive.pdf" target="_blank">
        <p><span class="link-icon">&#9881;</span> Example of Expectation Maximization</p>
    </a>
    

***Uncertainty***: Maximizing \(\mathcal{H}(q)\) encourages the model to maintain a certain level of 'spread' or variability, implicitly allowing for more uncertainty in the distribution \(q\).

\[
\mathcal{H}(q) = -\mathbb{E}_q[\log q] \quad\text{(Shannon Entropy)}
\]

***Divergence***: Minimizing \(\mathcal{D}(q,p_\theta)\) pushes \(p_\theta\) to better match the distribution \(q\), effectively acting as a divergence measure.


\[
\mathcal{D}(q,p_\theta) = -\mathbb{E}_q[\log p_\theta] \quad\text{(Cross-Entropy)}
\]

***Experience***: \(f(t)\) encodes knowledge or constraints from external sources or data, influencing the target model’s learning process.

With these asumption, the derived update would take in the following form. In EM, parameters doesn’t matter, the ***hidden distribution*** is what impact all important information, then we just optimize parameter with regard to this distribution is fine. The below illustrate an analytical ideal $q$ distribution that comes from SE (incorporating both uncertainty, divergence, and experiences), with such $q$ distribution, we just directly MLE the parameter (same with minimizing the KL).

\[
\text{(E-Step):}\quad q^{(n+1)}(t) = \frac{\exp\left\{\frac{\beta \log p_{\theta^{(n)}}(t) + f(t)}{\alpha}\right\}}{Z}
\]

\[
\text{(M-Step):}\quad \theta^{(n+1)} = \arg\max_{\theta} \mathbb{E}_{q^{(n+1)}(t)}\left[\log p_{\theta}(t)\right]
\]


We wouldn't dive into the specific formulation and mathamatical deriviation of such model (I have attached my note that trys to conduct some of the deriviation below), but notice that this is a ***constraint solvcing problem***! We will go over one instance of SM (MLE) to illustrate this idea.


### From SM $\rightarrow$ MLE:
For an arbitrary configuration \((x_0,y_0)\), its probability \(p_d(x_0,y_0)\) under the data distribution can be seen as measuring the *expected similarity* between \((x_0,y_0)\) and true data samples \((x^*,y^*)\), and can be written as:

\[
p_d(x_0,y_0) = \mathbb{E}_{p_d(x^*,y^*)} \left[ \mathbb{I}^{(x^*,y^*)}(x_0,y_0) \right]
\]

Here the similarity measure is \(\mathbb{I}^{(x^*,y^*)}(x,y)\), an indicator function that takes the value 1 if \((x,y)=(x^*,y^*)\) and 0 otherwise. The experience function would thus be defined as:

\[
f := f_{\text{data}}(x,y;D) = \log \mathbb{E}_{(x^*,y^*)\sim D}\left[\mathbb{I}^{(x^*,y^*)}(x,y)\right]
\]

Plugging this into the teacher model for the expected \(q\)-distribution, we have:

\[
q(x,y) = \frac{\exp\left\{\frac{\beta \log p_{\theta}(x,y) + f_{\text{data}}(x,y;D)}{\alpha}\right\}}{Z}
\]

Notice that under this condition we don't care about the $\beta \log p_{\theta}(x,y)$ term (derived from divergence). Since we don't care about the true distribution $q$'s distance to \((p_{\theta}(x,y))\) and instead we just want to fit the data (which is what MLE is doing):

\[
q(x,y) = \frac{\exp\{f_{\text{data}}(x,y;D)\}}{Z} \approx \tilde{p}_d(x,y)
\]

Then we maximize where the derived \(q\) distribution is the direct data distribution since $q$ is retrieved from an indicator function on the data distribution. This is exactly the definition of MLE.

\[
\max_{\theta} \mathbb{E}_{t \sim \tilde{p}_d(x,y)}[\log p_{\theta}(t)]
\]

Essentially, the SE provides a new perspective of looking at all types of learning as a ***instance*** of a constraint solving problem. If we say RL is a search and optimization process under the reward constraint, then we can also think of supervised learning not as finding patterns in data, but as a ***optimization or a search in the landscape of weights with the constraint of data***. Think how we are doing projected gradient descent (Hard constraint) or regularized gradient descent (Lagrangian constraint) where we are projecting the steps onto a subspace following the constraint requirement (refer to [this article](../optimization)). Then our constraint in supervised setting is just constraining (a strict constraint) all posible weight world steps to a data space. For more information:

  <a href="../../../literature/notes/standard_model.pdf" target="_blank">
        <p><span class="link-icon">&#9881;</span> Notes on Standard Model of Machine Learning</p>
    </a>

## Variational Autoencoder (VAE) Constraint
We have briefly mentioned the name of EM in the previous section. Turns out that, in practice, how we optimize EM is also a constraint optimization process. To quickly recap, the key of vanilla EM is to gradually find such $q$ (posterrior) distribution that captures all the hidden variable and we maximize based on this $q$ distribution. Usually, we optimize the ***Evidence of Lower Bound*** (ELBO) objective (the equation showing here is for the KL divergence definition).

\[
\mathcal{L}(\theta, x) = \mathbb{E}_{q(z|x)} \left[ \log \frac{p(x, z | \theta)}{p(z | \theta)} \right] - KL(q(z|x) || p(z | x, \theta))
\]

I have also attached the proof of deriving both ELBO + KL divergence and ELBO + entropy for reference in the links below:

  <a href="../../../assets/math/elbo_entropy_proof.pdf" target="_blank">
        <p><span class="link-icon">&#9881;</span> Proof of ELBO + Entropy</p>
    </a>

  <a href="../../../assets/math/elbo_kl_proof.pdf" target="_blank">
        <p><span class="link-icon">&#9881;</span> Proof of ELBO + KL Divergence</p>
    </a>


Deriving such posterrior distribution in simpler examples such as [Binomial Mixture Model](../../../literature/notes/em_binomial_derive.pdf) would be tractable. lHowever, derving it in much more complicated situations may get very tedious (i.e. Baysian Mixture of Gaussian's posterriror distribution):

\[
\begin{align*}
        p(\mu_{1:K}, z_{1:n} | x_{1:n}) = \frac{\prod_{k=1}^{K} p(\mu_k) \prod_{i=1}^{n} p(x_i | z_i) p(z_i | \mu_k)}{\int_{\mu_{1:K}} \sum_{z_{1:n}} \prod_{k=1}^{K} p(\mu_k) \prod_{i=1}^{n} p(x_i | z_i) p(z_i | \mu_k)}
\end{align*}
\]

Naturally, an question that we would be asking is whether we can do a approximation of such posterrior distribution. This is known as ***Variational Inference*** (as compared to what we do in traditional EM as inference). Traditional method would involve factorizing this posterrior to many independent Gaussian distrbution (Mean Field) or using re-parametrization tricks to approximate any family of distribution (Black Box Inference). As neural networks becomes more popular, more modern approaches such as ***Variational Autoencoder*** (VAE) becomes more popular where it reframes the original ELBO objective in EM into a generative model format of $p_{\theta}(x|z)$ and adding the same constraint of the KL divergence.

\[
\log p_{\theta}(x|z) = \log \left[ \frac{p_{\theta}(x, z)}{p_{\theta}(z)} \right]
\]

Thus, the whole VAE expression becomes the following.

\[
\mathcal{L}(\theta, \phi, x) = \mathbb{E}_{q_{\phi}(z|x)} \left[ \log p_{\theta}(x|z) \right] - KL(q_{\phi}(z|x) || p(z))
\]

When taking the gradient, we can borrow the same re-parametrize trick from Black Box Inference where we treat this complicated distribution of $z$ as a transformation on a simpler distribution that we know of. We can then take gradient of the encoder $q_{\phi}$ distribution with respect to $\phi$ and also gradient of the decoder $p_{\theta}$ distribution with respect to $\theta$.

\[
\begin{align*}
\nabla_{\boldsymbol{\phi}} \mathcal{L} &= \mathbb{E}_{\boldsymbol{\epsilon} \sim \mathcal{N}(0,1)} \left[ \nabla_{\boldsymbol{\phi}} \left[ \log p_{\boldsymbol{\theta}}(\mathbf{x}, \mathbf{z}) - \log q_{\boldsymbol{\phi}}(\mathbf{z} | \mathbf{x}) \right] \nabla_{\boldsymbol{\epsilon}} \mathbf{z}(\boldsymbol{\epsilon}, \boldsymbol{\phi}) \right] \\
\nabla_{\boldsymbol{\theta}} \mathcal{L} &= \mathbb{E}_{q_{\boldsymbol{\phi}}(\mathbf{z} | \mathbf{x})} \left[ \nabla_{\boldsymbol{\theta}} \log p_{\boldsymbol{\theta}}(\mathbf{x}, \mathbf{z}) \right]
\end{align*}
\]

Notice that this is a ***constraint solving*** problem again. We are maximizing the first term (decoder) to get improved in acccuracy while minimizing the second term (encoder) which is measuring divergence. With more trials, we get better encoder,hence, better decoder, and hence, better encoder. In the same trend of thoughts, further extensions of VAE such as ***Variational Information Bottleneck*** (IB) can alsobe framed into an constraint optimization as well.


## Practical "Doability" Constraint
This constraint solving philosophy does not live in theory only, it is also widely used in practical domains, but just from an different perspective. I will be describiing two eaxmples that I think illustrate this idea quite well, one from the domain of  recommender system and one from the domain of database management.

### Recommender System and Netflix Price
Without going too much into recommender and the Netxflix price, this price is for a contest of seeing who can build the best recommender system that best predict the rating changes in actual Netflix user data. Turns out the best model was the one that captured temporal trends (designed temporal user bias as a parametric function to fit the shape of the data) in ratings by ***over-engineered*** towards the particular dataset that the contest was using (not over-fit training data, but over-engineer on the construct of the entire dataset). It teaches us a few really nice engineeing lessons that aligns with what we said before, that ***true intelligence comes from the data***, you should only use a temporal model if your data tells you so, not just by imaginations. There is no "penacea" model for recommendation, it's not like the introduction of transformer would suddenly solve all problem in recommender domains. You want to over-engineer and squeeze all the values from the data of a particular problem and in the particular domain.

The ***data*** (projecting onto data space similar to what we discuessed in [gradient descent](../optimization/#all-families-comes-from-twitch)) and ***domain*** (telling you what you  can and can't do, what cost you can afford, and what you can extract from the data.) is essentially a constraint that we put on the model (The goals in the domain may change, the constraint always changes, and the model that is designed to the particular constraint also changes).

### Database Management
When thinking about database management, something that people wouldn't really think to have anything to do with optimization (just talking about the higher level management here, not optimizations in data access and retrieving), is actually filled with need of constraint solving.

Imagine that you want to store population data with precise geographical locations and you have data for the overall region but not to each clusters of where people are living at. In theory you can use settlelite images and establish a computer vision task with some clustering algorithm to figure out where are the major cluster that people live at. In theory you can, but what if this population data storage is only one small part of your project, your actual problem is trying to design optimal transport? This is a constraint, a constraint on the cost and efficiency of what you can do: ***"sometimes taking the mean is not worst than doing computer vision"***.

## Life? Tree Constraint Solving? 🌲
Maybe life itself can be framed as a constraint solving or constraint search problem. I think that life itself is not even a supervised problem, you can't just copy someone else's "success models" ad hope it works, let along having an analytical solution. The enviornment would take you to the next stage and you can only take the actions. It is a search and optimization problem with a constraint that may not be a hinderance but rather a guidance: the ***tree*** yoiu have grown.

You should have grown your tree independently from other trees, doing your search and generating more backtracking statistics along the way (similar to the idea mentioned on my [ideology page](https://kbian.org/idea.html), referencing to Monte Carlo Tree Search). With any new tasks you try to solve or any new paradigms that you step in, you don't try to just adapt to someone elses's tree but rather branch out a leaf from your tree to see what the returnning statistics tells you. You have traveled a long way, expanded the tree to so far, and everything works just fine, so you should trust your $q$ function, trust the constraint that your history and your tree have given upon you.

Don't be afraid to branch out to unknown places since ***the key of going to the unknown is to make mistakes***. No matter where you go, your tree leaves a mark in the space and as the further you travel to, the more marks you leave and when they are abundant enough, they form a shape, a more intricate machine, that tell you who you are. At last, I want to put down a quote that inspired me greatly from professor Gao: "with every try, you have explored the space a little bit more, grown the subtree a little bit deeper, and pushed more values into the table. Success never comes from one good state but rather the path you have explored and the large subtree you have built: The tree has been explored and nothing is lost".
