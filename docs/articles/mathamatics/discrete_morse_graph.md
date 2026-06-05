---
hide:
  - navigation
---

<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

<div class="wrapper">
  <div class="profile">
    <img src="../../../assets/index/profile_pic.jpeg" alt="Profile Picture">
    <div class="profile-details">
      <span class="name">Kaiwen Bian</span>
      <span class="metadata">20 min read · Jun 4, 2026</span>
    </div>
  </div>
</div>

Some structure does not announce itself. It hides. A road network does not arrive labeled as a graph --- it arrives as millions of GPS pings scattered across a city. A neuron does not arrive as a tree of branches --- it arrives as a faint, broken smear of intensity in a microscope volume. In both cases the object you actually want, *a clean one-dimensional graph*, is buried inside a cloud of points where some places are crowded and some are empty. The whole question of this article is: **how do you read a graph back out of where the data piles up?**

The answer is a beautiful one, and it has a single sentence at its center:

> Treat your data as a **density field** --- where are samples piled up? The structure you want to recover is the set of **ridges** of that density terrain. **Discrete Morse theory** is a robust, combinatorial way to extract those ridges as a graph, and **persistence** decides which ridges are real and which are noise.

Everything below is an unpacking of that one sentence. We will build it up in layers: first the picture (a graph hiding in a terrain), then the smooth calculus version, then its robust combinatorial twin, then persistence as a noise filter, then the algorithm itself, and finally the version that runs on a raw point cloud in any dimension --- which is the one you would actually deploy. No topology background is assumed.

## A Graph Hiding in a Density Field

Imagine millions of GPS pings from cars in a city, each a point in $\mathbb{R}^2$, and the goal of recovering the road network as an actual graph: intersections are nodes, roads are edges. Two facts make this *the* canonical problem, and they will recur in every other setting.

- **Roads are where pings pile up.** Count pings per unit area and you get a *density field* $\rho(x)$: high on roads, very high at busy intersections, low in the empty space between roads.
- **The data is messy.** GPS scatters off the road (noise), and a highway gets far more pings than an adjacent side street (*non-uniform sampling*). So you cannot simply threshold $\rho$: a cutoff high enough to kill the side-street noise also erases the side street itself.

Now picture $\rho$ as the **height** of a terrain over the city map. Roads become **mountain ridges** of that terrain, busy intersections become **peaks**, and the empty blocks become **valleys**. The road network is exactly the ridge lines joining the peaks. That single reframing --- ***the hidden graph is the ridge set of the density terrain*** --- is the whole idea.

And it is general. The same picture recovers neuronal branches from a microscopy image (where the density *is* the image intensity), or any other graph-like structure that its samples concentrate on. Once you start seeing data this way, "find the structure" becomes "find the ridges," and ridges are a thing mathematics knows how to chase.

## The Smooth Picture: Terrains, Critical Points, Ridges

Before the combinatorial machinery, here is the calculus picture, because it is where all the vocabulary comes from.

Let $\rho : \Omega \to \mathbb{R}$ be a smooth density on a region $\Omega \subseteq \mathbb{R}^2$. Its graph $\{(x, \rho(x))\}$ is a terrain. **Critical points** are where the terrain is flat, $\nabla \rho(x) = 0$, and in 2D there are exactly three kinds:

- **maxima** (peaks): busy intersections,
- **minima** (valley bottoms): empty block centers,
- **saddles** (passes): the low point along a ridge between two peaks.

There is a number attached to each critical point, the **index**: the count of independent *downhill* directions (the number of negative eigenvalues of the Hessian). It is $0$ at a minimum, $1$ at a saddle, $2$ at a maximum. Hold onto this number --- in the discrete world it will become a *dimension*, and that coincidence is not an accident.

An **integral line** is the path you trace by always following the gradient: drop a marble and let it roll, and it traces an integral line that starts and ends (in the limit) at critical points. The object we care about is the **unstable 1-manifold of a saddle**: the *two uphill lines* leaving it, each climbing to a peak. Glue these together over all saddles and you get the **mountain-ridge network**, threading peak $\to$ saddle $\to$ peak. That ridge network *is* the road graph.

One sign-flip is worth pinning down now, because it shows up everywhere. It is algorithmically easier to compute the mirror-image *valley ridges* (saddle down to *minima*, called the **stable 1-manifolds**) than mountain ridges. So the algorithms run on $f = -\rho$ instead of $\rho$. Flipping the sign turns peaks into pits and mountain ridges into valley ridges, so "mountain ridges of $\rho$" equals "valley ridges of $-\rho$." Whenever you later see $-\rho$ or "lower-star filtration with respect to $-\rho$," this is all that is happening --- a computational convenience, nothing deeper.

## Going Combinatorial: Discrete Morse Theory

The smooth story needs derivatives and clean flow-lines. Real data has neither --- you have samples, not a function, and estimated gradients are noisy, especially in high dimensions. So the field replaced *all of it* with bookkeeping on a mesh. This is **discrete Morse theory**, due to Robin Forman (1998), and it is one of those rare reformulations that loses essentially nothing while needing no calculus at all.

The data now lives on a **simplicial complex** $K$ built from the samples:

- **0-simplices** = vertices (your sample points),
- **1-simplices** = edges (pairs of points joined),
- **2-simplices** = triangles (triples).

For graph reconstruction you never need anything above triangles --- the "2-skeleton" is enough.

The smooth gradient gets replaced by a **discrete gradient vector field** $M(K)$, which is nothing more than a *pairing* of simplices (this is Forman's definition). It pairs each simplex $\sigma^{p}$ with one simplex $\tau^{p+1}$ exactly one dimension higher that contains it as a face --- a vertex with one of its edges, or an edge with one of its triangles --- subject to two rules: (1) **every simplex appears in at most one pair**, and (2) **the pairs, read as arrows, never form a closed loop** (no nontrivial cyclic V-path).

Think of each pair as a small flow arrow pointing from the small simplex into the big one. A **critical simplex** is one left unpaired --- it is the discrete stand-in for a critical point. And here the index-becomes-dimension coincidence pays off exactly:

$$
\underbrace{\text{critical vertex}}_{\text{index } 0} = \text{minimum}, \qquad
\underbrace{\text{critical edge}}_{\text{index } 1} = \text{saddle}, \qquad
\underbrace{\text{critical triangle}}_{\text{index } 2} = \text{maximum}.
$$

A **V-path** is the discrete flow-line: an alternating sequence of simplices following the arrows. The **stable 1-manifold of a critical edge** is then the discrete valley ridge --- the vertex-edge V-paths descending from that saddle edge down to critical vertices (minima). Those V-paths are precisely the ridges we are after.

Finally, the one cleanup operation: **Morse cancellation**. If a critical pair $(\sigma, \tau)$ is connected by a *unique* V-path, you can "cancel" them by reversing the arrows along that path, so neither stays critical. Cancelling deletes a pair of critical simplices and simplifies the ridge structure. The uniqueness matters --- cancellation is only legal when there is *exactly one* gradient V-path between the two cells, not merely when one exists. The entire denoising step is just "cancel the unimportant critical simplices," and the next two sections are about deciding which ones are unimportant.

## Why Dimension Equals Role

It is worth pausing on *why* vertex = min, edge = saddle, triangle = max, beyond the bookkeeping fact that dimension equals Morse index. There is a clean structural reason, and it makes the whole algorithm feel inevitable.

A $p$-simplex **encodes a relationship among the $(p-1)$-simplices on its boundary**. An edge's boundary is its two vertices, so an edge *is a relation between two vertices*. A triangle's boundary is its three edges, so a triangle *is a relation among three edges*. A vertex has empty boundary, so it relates nothing --- it just exists. (This "the boundary of a $p$-thing is made of $(p-1)$-things" is the boundary operator $\partial_p$, the backbone of homology.)

Now overlay one fact from persistence. As the complex grows, each simplex entering is either **positive** --- it *creates* a new hole of its own dimension, a *birth* --- or **negative** --- it *destroys* a hole one dimension down, a *death*. Match that against what each dimension is even *capable* of:

- **Vertex: can only create.** It has nothing below it to destroy, so a vertex is always positive --- it can only start a new connected component. A pure creator $\Rightarrow$ **minimum**.
- **Triangle: can only destroy** (on a surface there is no 2-void to create), so a triangle only ever fills a loop. A pure destroyer $\Rightarrow$ **maximum**.
- **Edge: can do both.** It is the only ambivalent object, the hinge between creation and destruction --- which is exactly what a **saddle** is.

So the saddle being the edge is not arbitrary. A saddle is by nature the in-between critical point, and the edge is the only simplex that can be either creator or destroyer.

This positive/negative split is exactly the two kinds of feature a graph skeleton carries: the **negative edges** assemble its tree structure --- the connections between peaks --- while the **positive edges** of high persistence are its independent loops, its $H_1$ cycles. We will see both fall straight out of the algorithm.

## Persistence: Telling Real Ridges From Noise

If you extracted *every* ridge you would get a hairball, because noise manufactures tiny spurious peaks and saddles everywhere. **Persistent homology** ranks features by how *robust* they are, so you can keep the real ones and cancel the rest. It is the part that turns a fragile heuristic into something principled.

**Filtration.** Flood the terrain from the bottom up. Formally, the **lower-star filtration** with respect to $f = -\rho$ adds simplices in order of increasing $f$ (equivalently, *decreasing density*):

$$
\emptyset = K_0 \subset K_1 \subset \cdots \subset K_N = K,
$$

so ***dense regions enter first***. As the flood rises, connected pieces are born and later merge, and loops are born and later filled.

**Persistence value.** Each topological feature gets a birth-death pair of simplices $(\sigma_b, \sigma_d)$, and its **persistence** measures how long it survived the flood:

$$
\mathrm{pers}(\sigma_b, \sigma_d) \;=\; \bigl| \rho(\sigma_d) - \rho(\sigma_b) \bigr|.
$$

A feature with **large** persistence --- a peak that stood tall over a long range of heights, or a loop that stayed open for a long range --- is **real structure**. A feature with **tiny** persistence --- born and immediately killed --- is **noise**. This gives a single knob, a threshold $\delta$: keep features with $\mathrm{pers} > \delta$, treat $\mathrm{pers} \le \delta$ as noise.

**Persistence-guided cancellation.** Now connect persistence back to Morse cancellation: process the critical pairs in increasing persistence order and cancel every pair with $\mathrm{pers} \le \delta$. What remains are the saddles of *genuine* ridges, and tracing their stable 1-manifolds gives a clean graph. The threshold $\delta$ is **the denoising dial**: small $\delta$ keeps fine structure (and noise), large $\delta$ keeps only the boldest ridges.

There is even a topological floor that makes this safe. The **weak Morse inequalities** say the number of surviving critical $p$-simplices is at least the $p$-th Betti number, $c_p \ge \beta_p$. Two genuinely persistent basins *force* at least two critical minima to survive; a genuinely unfilled loop forces at least one critical edge to survive. You can simplify aggressively, but you cannot accidentally cancel away real topology --- persistence is exactly how you decide what counts as "real."

## The Algorithm, Made Simple

Here is the practical surprise, due to Dey, Wang & Wang (2018): you **never have to build or maintain the gradient vector field at all**. The discrete gradient field is a proof device; the *output* can be read straight off the persistence pairing. That is what makes the method fast and easy to implement.

!!! example "Algorithm: DM-graph$(K, \rho, \delta)$"
    **Input:** complex $K$, density $\rho$ on its vertices, persistence threshold $\delta$.
    **Output:** graph skeleton $G_\delta$.

    1. Compute the persistence pairing $P$ from the lower-star filtration with respect to $-\rho$.
    2. Let $T_\delta = \{\text{negative edges } e \text{ with } \mathrm{pers}(e) \le \delta\}$. These edges form a **forest**; root each tree $T$ at its highest-density vertex, $r(T) = \arg\min_{v \in T}\,(-\rho(v))$.
    3. For each *surviving* critical edge $e = (u,v)$ with $\mathrm{pers}(e) > \delta$, output $e$ together with the unique tree paths $\pi_T$ from its endpoints up to their roots:

    $$
    G_\delta \;=\; \bigcup_{\substack{e=(u,v)\\ \mathrm{pers}(e) > \delta}} \Bigl\{\, e \,\cup\, \pi_{T_u}\!\bigl(u, r(T_u)\bigr) \,\cup\, \pi_{T_v}\!\bigl(v, r(T_v)\bigr) \,\Bigr\}.
    $$

In words: each surviving saddle edge is connected, through unique tree paths, to the two density peaks it sits between --- and those tree paths *are* the stable 1-manifolds, the ridges, recovered without ever building the gradient field. The roots are the peaks (intersections), the surviving critical edges are the passes (roads), and stitching them together gives the graph. Steps 2 and 3 run in time linear in the number of vertices and edges.

So the three ideas compose into one clean pipeline: **density terrain $\to$ persistence ranks its ridges $\to$ keep the ridges above $\delta$, traced as tree paths to peaks.**

## From a Clean Grid to a Raw Point Cloud

Everything so far assumed you already had a complex $K$ and a density living on it. That is true for an image --- pixels are the grid, intensity is the density. But often you have *neither*: only a bare point cloud $P \subset \mathbb{R}^d$, possibly high-dimensional, with **no density handed to you**. Magee & Wang (2022) close both gaps, and this is the version you would actually run.

**Why the naive fix fails.** The obvious plan --- build a *Rips complex* (join any two points closer than a radius $r$, fill in triangles), estimate density by counting neighbors, run `DM-graph` --- breaks in four ways, and each failure motivates the real design:

- There is **no single good radius $r$**: too small and the shape disconnects; too large and you manufacture spurious loops of *infinite* persistence that $\delta$ cannot remove, and you lose resolution.
- **Non-uniform sampling** means a dense highway and a sparse alley cannot share one $r$ --- the highway problem again.
- A usable $r$ makes the complex **enormous**, and persistence on a huge complex is slow.
- **Background noise** gets bridged by the radius, connecting things that should stay separate.

**A density built into the complex.** The fix is to derive the density from the points themselves, via the **distance-to-measure (DTM)** weight. For each point $p$, define a weight from its $k$ nearest neighbors:

$$
w_p \;=\; \sqrt{\frac{1}{k} \sum_{q \,\in\, \mathrm{kNN}(p)} d_P(p,q)^2 }.
$$

This is the average distance to your $k$ nearest neighbors: **small in dense regions, large in sparse regions.** So $w_p$ is an *inverse density estimator*, and $k$ is the only density parameter. Bake it into the complex by giving each point a weighted radius $r_p(\alpha) = \sqrt{\alpha^2 - w_p^2}$ and letting a simplex $\sigma = \{p_0, \dots, p_s\}$ enter the filtration at scale

$$
\rho_w(\sigma) \;=\; \min\Bigl\{ \alpha \;:\; w_{p_i} \le \alpha \ \text{ and } \ d_P(p_i, p_j) \le r_{p_i}(\alpha) + r_{p_j}(\alpha) \ \ \forall i \ne j \Bigr\}.
$$

The effect is that ***simplices spanned by higher-density points enter earlier*** --- the same "dense first" ordering as the lower-star filtration, now derived directly from the points. Sweeping all scales at once, rather than fixing one radius $r$, dissolves the radius, sampling, and noise problems together. A **sparsified** version $\widehat{\mathcal{F}}_{\rho_w}(\varepsilon)$ with parameter $\varepsilon$ then keeps the size manageable.

!!! example "Algorithm: DM-PCD$(P, k, \varepsilon, \delta)$"
    1. Build the sparse weighted (DTM) Rips filtration $\widehat{\mathcal{F}}_{\rho_w}(\varepsilon)$ using $k$ (density weights) and $\varepsilon$ (sparsification).
    2. Run the generalized `DM-graph` on that filtration with threshold $\delta$.

Three parameters, all now meaningful: $k$ (density neighborhood, paper default $15$), $\varepsilon$ (sparsification, trades exactness for speed, common default $0.99$), and $\delta$ (the persistence / denoising dial from before, problem-dependent).

It is worth resolving the "density" versus "inverse density" wording while we are here, since it trips people up. The DTM weight $w_p$ is *large* where points are sparse, so it is literally an inverse density, and the filtration is ordered by it. The smooth algorithm equivalently runs on $f = -\rho$. In both cases the governing scalar is *small where data is dense*, so dense regions flood first. The object of interest is always just the **density field**; whether you phrase the construction through $\rho$, through $-\rho$, or through the inverse-density weight is an internal convention of the filtration, not a different method.

## Why It Is Trustworthy: The Guarantees

Two theorems lift this from "a heuristic that seems to work" to "a method with proofs."

**Topology preserved under noise (Dey--Wang--Wang).** Define an honest noise model. Call $\rho$ a $(\beta, \nu, \omega)$-approximation of a connected graph $G$ if there is an $\omega$-thick tube $G^\omega$ around $G$ that deformation-retracts to $G$, the density is in $[\beta, \beta+\nu]$ inside the tube and in $[0, \nu]$ outside it, with a clear signal-to-noise gap $\beta > 2\nu$. Then for any threshold $\delta \in [\nu, \beta - \nu)$ --- an interval that is nonempty *precisely because* $\beta > 2\nu$ --- the reconstruction $\widehat{G}$ lies inside the $\omega$-neighborhood of $G$ and has the **same first Betti number** $\beta_1$. In the planar case this strengthens all the way to homotopy equivalence ($G^\omega$ deformation-retracts to both $G$ and $\widehat{G}$). Informally: if the density genuinely concentrates on the hidden graph with a clear margin, the output is geometrically close and topologically correct.

**Optimal loops (Magee--Wang, Theorem 3.5).** The generalized algorithm's output $G_\delta$ contains a **lexicographically-optimal persistent cycle basis** for the loops of persistence $> \delta$, and its first Betti number equals the number of those loops. "Lex-optimal" is defined with respect to the *filtration order*: among all the ways to draw a given loop, it picks the one whose edges come in *as early as possible*. And because, under the DTM weighting, the earliest edges are exactly those spanned by the highest-density points, the algorithm draws each loop **hugging the densest, most reliable data** rather than taking an arbitrary detour.

Together: if the data really does concentrate on a structure with a clear margin, the recovered skeleton is geometrically close, topologically correct, and the loops it reports are the persistence-optimal, highest-density ones.

## Where It Is Used

**Road networks** (Wang--Wang--Li, 2015). The origin of the method and the source of all the road/ridge vocabulary: GPS samples give a density field, Morse ridges give road centerlines, and persistence simplification removes spurious branches --- while Morse theory copes with the non-uniform-sampling problem inside one unified framework. If the opening section made sense, you already have the gist.

**Neuron tracing** (Banerjee et al., 2020). In microscopy volumes the density field is the image intensity (or a network's pixel-probability map), and neuronal branches are its ridges. A pixelwise classifier is locally accurate but will happily break a single neuron into disconnected blobs across a faint gap, because it has *no notion of global connectivity*. The DM-graph supplies a **topological prior**: it enforces that the traced structure is a connected graph with the right branch and loop topology, exactly the long-range connectivity the pixel classifier misses. Fused with an encoder--decoder network it beats either part alone. The general lesson: ***DM-graph is most valuable precisely when connectivity and topology matter more than per-point labels.***

## Conclusion

What I find genuinely beautiful here is the move at the very start, before any theorem: the decision to stop looking at the *points* and start looking at *where the points pile up*. A point cloud has no shape --- it is just a set. But the density it induces has a terrain, and a terrain has ridges, and ridges have a graph. The structure was never in the data; it was in the *accumulation* of the data. Discrete Morse theory is the apparatus that makes "accumulation" into something you can compute on without derivatives, and persistence is the apparatus that tells you which accumulations to believe.

There is a quiet lesson in that, beyond the algorithm. The naive instinct --- threshold the density, keep the dense stuff, drop the rest --- fails for a precise reason: a global cutoff cannot tell a faint-but-real side street from faint-but-spurious noise, because *faintness is not the signal*. The signal is **persistence**: how stubbornly a feature survives as you sweep the whole range of scales at once. The honest move is never to pick one scale; it is to look across all of them and ask which structures refuse to die. That is a good habit for far more than graph reconstruction.

And the topology is a *prior*, not an afterthought. A per-point classifier optimizes each pixel and forgets that a neuron is one connected thing; the density-ridge view never forgets, because connectivity is the object it is built from. Whenever the thing you care about is the *shape of how parts connect* --- a road map, a neuron, a trajectory through some latent space --- the right unit of analysis is not the point but the ridge it lives on. The graph was hiding in the density the whole time. You just have to know that ridges are where to look.

## References

The framing here comes largely from the work and teaching of ***Yusu Wang*** (UC San Diego), whose group is behind most of the discrete-Morse graph-reconstruction line below.

1. S. Wang, Y. Wang, Y. Li. **Efficient Map Reconstruction and Augmentation via Topological Methods**. *Proc. 23rd ACM SIGSPATIAL*, 2015.
2. T. K. Dey, J. Wang, Y. Wang. **Graph Reconstruction by Discrete Morse Theory**. *34th Symp. on Computational Geometry (SoCG)*, 31:1--31:15, 2018. ([arXiv:1803.05093](https://arxiv.org/abs/1803.05093))
3. L. Magee, Y. Wang. **Graph Skeletonization of High-Dimensional Point Cloud Data via Topological Method**. *Journal of Computational Geometry*, 13(1):429--470, 2022. ([arXiv:2109.07606](https://arxiv.org/abs/2109.07606))
4. S. Banerjee et al. **Semantic Segmentation of Microscopic Neuroanatomical Data by Combining Topological Priors with Encoder--Decoder Deep Networks**. *Nature Machine Intelligence*, 2:585--594, 2020.
5. R. Forman. **Morse Theory for Cell Complexes**. *Advances in Mathematics*, 134(1):90--145, 1998.
6. F. Chazal, D. Cohen-Steiner, Q. Mérigot. **Geometric Inference for Probability Measures**. *Foundations of Computational Mathematics*, 11(6):733--751, 2011.
