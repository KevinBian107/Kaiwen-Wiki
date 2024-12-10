<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

<div class="wrapper">
  <h1>Lend It Some Confidence</h1>

  <div class="profile">
    <img src="../../../assets/index/profile_pic.jpeg" alt="Profile Picture">
    <div class="profile-details">
      <span class="name">Kaiwen Bian</span>
      <span class="metadata">5 min read · Jun 14, 2024</span>
    </div>
  </div>
  <p>
      Statistics is a very practical domain, but often tools in statistics have very deep mathamatical roots in probability theory. I found this to be quite facinating because I think that only when understand the theoritical aspects of these tools will one be getting 
      an intuitive understanding of these tools and use/adapt them under appropriate circumstances. Things works for a mathamatical reason, they work because the math have happened to discover and support some things that happen to work.
  </p>

  <P>
      I want to use an concept that is very oftenly used through out many branches of statistics and probability to illustarte such point: <strong>Confidence Interval</strong>. It is so simple that probably a high school statistic class would discuss it but it is also so complex to 
      the point that one might not fully understand it until learning meausre theory in graduate school (for the record, I don't think I underatand it fully yet, but I can already see some of the intrinsic connections that makes it so amazing).
  </P>

  <h2>Approach To Some Distribution</h2>

  <p>
      The way I think about confidence interval is to reason why it is needed. I think the idea of needing it comes from statsistics with the question: can we do better than just giving a <strong>point estimate</strong> of what we believe about the true distribution? Can we give an <strong>interval estimate</strong>?
      Point estimate itself is a huge domain in statistics and probability (i.e. MOM, MLE,...), which we would not go into, but feel free to look into it a bit more as it is also very much rooted in probabilistic theory (i.e. MLE is maximizing the likelihood of observing all observatiosn in the same time, which are treated as independent and 
      identitically distributed random variable). Essentially an estimator is an random variable that tries to estimate the correct parameter for the given distribution to fit all the data (i.e. \(\mu\) for gaussian distribution or \(\lambda\) for poisson distribution). Okay, so we have an point estimator, but we want a range for it, maybe <strong>extracting an interval from the distribution 
      of this estimator</strong> since an estimator is techniqually an random variable? Let's look at the simple example when the estimator is \(\bar X\) or the mean of the sample. We know that
      
      $$
      \bar X = \frac{x_1+...+x_n}{n}
      $$
      
      and that 
      
      $$
      x_i \sim N(\mu, \sigma) \text{ with } \bar X \sim N(\mu, \frac{\sigma}{\sqrt n})
      $$

      Then we can make an new random variable that approaches a standard normal distribution \(N(0,1)\) by simply sifting values around:

      $$
      \frac{\bar{X} - \mu}{\frac{\sigma}{\sqrt{n}}} \sim N(0,1)
      $$

      This is doesn't show exactly why confidence interval is in it's form shown below, but this at least lend some ideas about how we can "extend" the estimator by giving it a interval. You may now have some intuition that these two seems to be weird values attached to the estimator does have a very probabilistic meaning since they look pretty similar.

      $$
      \bar{x} \pm z_{\frac{\alpha}{2}} \left(\frac{\sigma}{\sqrt{n}}\right)
      $$

      Techniqually, such confidence interval would be descrbed with an confidence level of \(100(1-\alpha)%\), assuming \(\alpha=0.05\), this is a 95% confidence interval, which is saying that we are 95% confident that the true parameter \(\theta\) is in the interval or that when we plug in the data, 95% of the times the real parameter would be in such random range 
      (random because it is a random varaible + random margin that depends on data)

      $$
      P(\bar{x} \pm z_{\frac{\alpha}{2}} \left(\frac{\sigma}{\sqrt{n}}\right) \text{ contains } \mu) = 1 - \alpha
      $$

      Notice that this is not talking about the probability that teh true parameter is in the random interval, it is in it or not, nothing is random here. However, we will see later that in a connection such value may have some probabilistic interpretation.
  </p>

  <p>
    In fact, there is a deep conection between decision making hypothesis testing (HT) and confidence interval known as the <strong>confidence interval duality</strong> where not rejecting the null hypothesis \(H_0\)is the equivalence with such random interval around \(\hat \theta\) contains the real parameter \(\theta\). Intuitively speaking, it is like talking about one with thinking the center as 
      \(\hat \theta\) and building confidence around that and the other is thinking center around \(\theta\).

      $$
      \bar{x} \pm z_{\frac{\alpha}{2}} \left(\frac{\sigma}{\sqrt{n}}\right) \rightarrow \left| \frac{\bar{X} - \mu_0}{\frac{\sigma}{\sqrt{n}}} \right| < z_{\alpha/2}
      $$
  </p>

  <blockquote>
    <p>
      <strong>Some small detials on HT</strong>: The hypothesis testing representation here is illustrating fail to reject the null hypothesis condition, or the region that is not the critical region (the mid region of the normal curve where area is \(1-\alpha\)). Notice that here we are talking about a probabilistic statement where \(\alpha\) is the probability of seeing the observed test statistic (r.v.) as extreme or being more extreme than the 
      alternative hypothesis \(H_1\) direction. Usually \(\alpha\) is manually set (i.e. 0.05) and treat that region to be trhe critical region for rejecting the null hypothesis. Inherently, the rest of the region would be saying that it is not that rare to see the observed test statistics under the null hypothesis, thus not rejecting it.
    </p>
  </blockquote>

  <p>
    These theoritical connection between statistical tools and probability theory goes much longer, extending to some other pretty well known distributions (you may have heard about \(T\) or \(X_n^2\) distribution, which are used when \(\sigma^2\) is not present) adn we can use standard deviation as a replacement in the new random variable, which approach to a different distribution. 
    If you are interested, here are some notes that goes deeper into these connections.
  </p>

  <p>Some notes that I concluded on basic statistics and probability connections across three areas: point estimate, interval estimate, adn decision making (HT) 
        (only personal understandings, may not be 100% correct).</p>

  <a href="../../../assets/math/confidence.jpg" target="_blank">
   <p>\(N(\mu, \sigma)\) Some Notes on Basic Statistic Connections</p>
    </a>


  <p>
    The connections for confidence interval itself actually serves much more than just in statistics, also to other realms (i.e. in algorithm and reinforcment: UCB).
  </p>
</div>