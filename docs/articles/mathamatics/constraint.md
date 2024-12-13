<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<div class="wrapper">
  <div class="profile">
    <img src="../../../assets/index/profile_pic.jpeg" alt="Profile Picture">
    <div class="profile-details">
      <span class="name">Kaiwen Bian</span>
      <span class="metadata">10 min read · Dec 13, 2024</span>
    </div>
  </div>
</div>

When I first learned about the idea  of constraint solving (I belive it was in a class taught by professor Sichun Gao in UCSD CSE called *"Search and optimization"*), I wasn't as exiciting as I am. I thought of constraint solving just as a small sub-branch of optimization, but I was wrong. It is actually the ***"class"*** that can generates any other type optimization, reasoning, or machine learning techniques when you look at if from the right perspective. Quoting from what professor Gao said himself: ***"All you need is constraint solving"***. If I wnat to summarize the ideas in this article, it would be:

1. Theporitically, constraints greatly reduced our search problem because among all the answers we can search for, we only care about the ones  that matches with our constraint.
2. Practically, "doability" is always part of the puzzle, in theory we can do everything but in practice we can't, so how do we optimize with these constraint not as a hinderance but as a helper?

## Constraint in Standard Models
From a theoriticla perspective, looking at constraint is very interesting. I come from a background of doing reinforcement learning and in there we like to frame our problem as a ***search & optimization*** problem. How do we find the best path in a tree (the tree here is not actually a search tree but an abstract concept of so)? Or how do we find the optimal trajectory for getting to the maximum of the objective surface that changes over time since we get more and more knowledge of such surface? From a ***classical machine learning*** perspective, learning is about finding patterns in the dataset, no matter if you are doing supervised or unsupervised, it is all about looking for some useful pattern and characteristic from the dataset. Things got particularly interesting when I took a class named *"Machine learning with few labels"* taught by professor Zhiting Hu in UCSD HDSI. One of the major work that he has done was establishing the ***standard model for machine learning***, similar to how physicist established the standard model of all partcles. Quoting from himself:
  
<blockquote>
  <p>"We want to do chemistry, to understand and constructs upon each other, not arcamy."</p>
</blockquote>

That was going of tangent a bit, the main reason of mentioning the Standard Model is because when we look at the Standard Equation (SE) proposed in the same paper that unifies all type of learning and can be derived into any type of learning algorithm with specific configuration, which can be written as the following, we results in a constraint optimization problem.

\[
\min_{q,\theta,\xi} \quad -\alpha \mathcal{H}(q) \;+\; \beta \mathcal{D}(q, p_\theta) \;+\; U(\xi)
\]

subject to

\[
-\mathbb{E}_q\left[f_k^{(\theta)}\right] \;\leq\; \xi_k, \quad k = 1, \ldots, K.
\]

Where each components are:

- Uncertainty function \(\mathcal{H}(\cdot)\) controls the compactness of the output model, 
  for example, by regulating the amount of allowed randomness while trying to fit experience.

- Divergence function \(\mathcal{D}(\cdot,\cdot)\) measures the distance between the target 
  model to be trained and the auxiliary model, facilitating a teacher–student mechanism.

- Experience function, introduced by a penalty term \(U(\xi)\), incorporates the set of 
  "experience functions" \(f_k^{(\theta)}\) that represent external experience of various kinds for training 
  the target model.

This equation would be optimized with an Expecttaion Maximization (EM) like procedure (EM is also a very very interesting topic that I want to go into a little bit, still writing that article).

\[
\text{Teacher (E-Step):}\quad q^{(n+1)}(t) = \frac{\exp\left\{\frac{\beta \log p_{\theta^{(n)}}(t) + f(t)}{\alpha}\right\}}{Z}
\]

\[
\text{Student (M-Step):}\quad \theta^{(n+1)} = \arg\max_{\theta} \mathbb{E}_{q^{(n+1)}(t)}\left[\log p_{\theta}(t)\right]
\]

We wouldn't dive into the specific formulation and mathamatical deriviation of such model (I have attached my note that trys to conduct some of the deriviation below), but notice that ***this is a constraint solvcing problem***! Essentially, the SE provides a new perspective of looking at all types of learning as a ***instance*** of a constraint solving problem. If we say RL is a search and optimization process under the reward constraint, then we can also think of supervised learning not as finding patterns in data, but as a optimization or a search in the landscape of weights with the constraint of data. Think how we are doing projected gradient descent (Hard constraint) or regularized gradient descent (Lagrangian constraint) where we are projecting the steps onto a subspace following the constraint requirement (refer to [this article](../optimization)). Then our constraint in supervised setting is just constraining (a strict constraint) all posible weight world steps to a data space. For more information:

  <a href="../../../literature/notes/standard_model.pdf" target="_blank">
        <p><span class="link-icon">&#9881;</span> Notes on Standard Model of Machine Learning</p>
    </a>

## Constraint in "Doability"
This constraint solving philosophy does not live in theory only, it is also widely used in practical domains, but just from an different perspective. I will be describiing two eaxmples that I think illustrate this idea quite well, one from the domain of  recommender system and one from the domain of database management.

### Recommender System and Netflix Price
Without going to much into recommender and the Netxflix price, this price is for a contest of seeing who can build the best recommender system that best predict the rating changes in actual Netflix user data. Turns out the best model was the one that captured temporal trends (designed temporal user bias as a parametric function to fit the shape of the data) in ratings by ***over-engineered*** towards the particular dataset that the contest was using (not over-fit training data, but over-engineer on the construct of the entire dataset). It teaches us a few really nice engineeing lessons that aligns with what we said before, that ***true intelligence comes from the data***, you should only use a temporal model if your data tells you so, not just by imaginations. There is no "penacea" model for recommendation, it's not like the introduction of transformer would suddenly solve all problem in recommender domains. You want to over-engineer and squeeze all the values from the data of a particular problem and in the particular domain.

The ***data*** (projecting onto data space similar to what we discuessed in [gradient descent](../optimization/#all-families-comes-from-twitch)) and ***domain*** (telling you what you  can and can't do, what cost you can afford, and what you can extract from the data.) is essentially a constraint that we put on the model (The goals in the domain may change, the constraint always changes, and the model that is designed to the particular constraint also changes).

### Database Management
Think about database management, something that doesn't really have anything to do with optimization (just talking about the higher level management here, not optimizations in data access and retrieving), but it is filled with need of constraint solving. Imagine that you want to store population data with precise geographical locations and you have data for the overall region but not to each clusters of where people are living at. In theory you can use settlelite images and establish a computer vision task with some clustering algorithm to figure out where are the major cluster that people live at. In theory you can, but what if this population data storage is only one small part of your project, your actual problem is trying to design optimal transport? This is a constraint, a constraint on the cost and efficiency of what you can do: ***"sometimes taking the mean is not worst than doing computer vision"***.
