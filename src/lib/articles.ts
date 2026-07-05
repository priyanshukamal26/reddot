export interface Article {
  slug: string;
  title: string;
  category: "phase" | "general";
  phase?: "menstrual" | "follicular" | "ovulation" | "luteal";
  topic: string;
  summary: string;
  content: string[]; // split by paragraphs/sections for cleaner rendering
  disclaimer?: string;
  readingTime: string;
}

export const ARTICLES: Article[] = [
  {
    slug: "menstrual-phase",
    title: "The Menstrual Phase: Rest and Shedding",
    category: "phase",
    phase: "menstrual",
    topic: "Cycle Phase Explainer",
    summary: "Understand the physiological process of menstruation, hormonal lows, and how to support your body during this phase.",
    readingTime: "3 min read",
    disclaimer: "This article is for educational purposes only and is not medical advice. Consult a healthcare provider for personalized medical concerns.",
    content: [
      "The menstrual phase marks the beginning of your cycle (Day 1). It is characterized by the shedding of the uterine lining (endometrium) that was built up during the previous cycle in preparation for a potential pregnancy. Because fertilization did not occur, levels of estrogen and progesterone drop significantly, triggering the onset of menstruation.",
      "Physiologically, the low hormone levels signal your brain to start maturing new ovarian follicles for the next cycle, but physically, this hormonal low often translates into lower energy levels, fatigue, and a natural desire to rest and slow down. Mild to moderate uterine cramping is common as prostaglandins cause the uterine muscles to contract and expel the lining.",
      "To support your body during this phase, prioritize active rest, hydration, and gentle movement like stretching or walking if you feel up to it. Focus on nutrient-rich, warming foods such as stews, broths, and iron-dense ingredients to replenish iron levels lost during bleeding. Listen to your body's signals and allow yourself space to reset."
    ]
  },
  {
    slug: "follicular-phase",
    title: "The Follicular Phase: Growth and Rising Energy",
    category: "phase",
    phase: "follicular",
    topic: "Cycle Phase Explainer",
    summary: "Explore the follicle-stimulating hormone (FSH) surge, rising estrogen levels, and how to leverage your natural energy boost.",
    readingTime: "3 min read",
    disclaimer: "This article is for educational purposes only and is not medical advice.",
    content: [
      "The follicular phase overlaps with menstruation but extends beyond it, typically lasting from Day 1 to around Day 13 or 14 in a standard cycle. Under the influence of Follicle-Stimulating Hormone (FSH), several ovarian follicles begin to mature, each housing an egg. Eventually, one dominant follicle matures fully while the others are reabsorbed.",
      "As this follicle grows, it secretes increasing amounts of estrogen. Estrogen performs the vital task of rebuilding the endometrial lining, making it thick and vascular again. The rise in estrogen also boosts serotonin, dopamine, and endorphins in the brain. You will likely feel a progressive increase in physical energy, mental clarity, optimism, and social drive.",
      "This is an excellent window for high-energy exercise, strength training, initiating new projects, and collaboration. Dietary support should focus on fresh, light proteins, complex grains, and cruciferous vegetables (like broccoli and cabbage) which contain compounds that assist the liver in metabolizing estrogen efficiently."
    ]
  },
  {
    slug: "ovulation-phase",
    title: "The Ovulatory Phase: Peak Vitality and Release",
    category: "phase",
    phase: "ovulation",
    topic: "Cycle Phase Explainer",
    summary: "Understand the Luteinizing Hormone (LH) surge, egg release, and optimizing your peak energy window.",
    readingTime: "4 min read",
    disclaimer: "This article is for educational purposes only and is not medical advice. Ovulation timing varies and tracking should not be used as a primary method of contraception.",
    content: [
      "Ovulation is the climax of the first half of the cycle, usually occurring around Day 14. High estrogen levels trigger a rapid spike in Luteinizing Hormone (LH) from the pituitary gland. This LH surge causes the dominant follicle to rupture, releasing a mature egg into the fallopian tube, where it survives for 12 to 24 hours.",
      "Hormonally, estrogen peaks just before ovulation, and testosterone also reaches its highest levels. This unique combination creates a peak in libido, communication skills, confidence, and physical stamina. You might notice changes in cervical fluid, which becomes clear, stretchy, and resembles raw egg whites to assist sperm survival and transport.",
      "During this short phase, engage in high-intensity workouts, collaborative presentations, and social events. Support your endocrine health by eating fiber-rich foods to help bind and clear excess hormones, alongside zinc-dense seeds and plenty of antioxidants from colorful berries and leafy greens."
    ]
  },
  {
    slug: "luteal-phase",
    title: "The Luteal Phase: Progesterone Rise and Winding Down",
    category: "phase",
    phase: "luteal",
    topic: "Cycle Phase Explainer",
    summary: "Examine the corpus luteum, progesterone surge, and managing symptoms as your cycle prepares to reset.",
    readingTime: "4 min read",
    disclaimer: "This article is for educational purposes only and is not medical advice.",
    content: [
      "The luteal phase occupies the second half of your cycle, typically lasting from Day 15 to Day 28. After ovulation, the ruptured follicle transforms into a temporary endocrine gland called the corpus luteum, which secretes progesterone. Progesterone prepares the uterine lining for implantation by making it secretively mature.",
      "Progesterone has a calming, sedating effect on the central nervous system, encouraging rest and sleep. However, if fertilization does not occur, the corpus luteum degenerates, and both progesterone and estrogen levels decline sharply toward the end of the phase. This decline can trigger PMS symptoms such as bloating, breast tenderness, food cravings, and irritability.",
      "Support your body by shifting from high-intensity training to active recovery like yoga or Pilates. Fuel yourself with complex carbohydrates (sweet potatoes, oats) to sustain blood sugar, and incorporate magnesium-rich foods like pumpkin seeds and dark chocolate to alleviate cramping and mood drops. Give yourself permission to hibernate."
    ]
  },
  {
    slug: "pcos-basics",
    title: "Understanding PCOS: Signs, Science, and Support",
    category: "general",
    topic: "Common Conditions",
    summary: "An introductory guide to Polycystic Ovary Syndrome (PCOS), its symptoms, diagnostic criteria, and supportive lifestyle strategies.",
    readingTime: "5 min read",
    disclaimer: "This article is for educational purposes only and is not medical advice. PCOS is a complex endocrine condition that requires proper evaluation and diagnosis by a qualified medical professional.",
    content: [
      "Polycystic Ovary Syndrome (PCOS) is one of the most common endocrine disorders, affecting approximately 8–13% of reproductive-aged individuals. Despite its name, PCOS is not primarily a disease of the ovaries; rather, it is a complex hormonal and metabolic condition characterized by ovulatory dysfunction, insulin resistance, and androgen excess.",
      "Clinically, diagnosis is typically based on the Rotterdam Criteria, requiring at least two of the following: (1) Irregular, infrequent, or absent menstrual cycles; (2) Clinical or biochemical signs of elevated androgens (male-type hormones), leading to symptoms like acne, excess facial/body hair (hirsutism), or thinning hair; (3) The appearance of 'polycystic' ovaries on an ultrasound (which are actually small, immature follicles that stalled in growth).",
      "Metabolic health is closely linked to PCOS, with insulin resistance affecting up to 70% of those diagnosed, regardless of body weight. This means the body struggles to clear glucose from the bloodstream, causing elevated insulin levels, which in turn stimulates the ovaries to produce more androgens, disrupting ovulation.",
      "Managing PCOS involves a combination of medical supervision and tailored lifestyle adjustments. Focus on blood sugar stability through anti-inflammatory nutrition (pairing protein and healthy fats with complex carbs), participating in low-impact strength training to enhance insulin sensitivity, and utilizing tools like RedDot to monitor cycle intervals, helping you and your physician track improvements over time."
    ]
  },
  {
    slug: "tracking-irregular-cycles",
    title: "Tracking Irregular Cycles: Finding Patterns in the Chaos",
    category: "general",
    topic: "Daily Tracking",
    summary: "Learn why your cycle might vary, how RedDot uses range-based predictions, and key metrics to monitor when cycles are unpredictable.",
    readingTime: "4 min read",
    disclaimer: "This article is for educational purposes only and is not medical advice. Irregular cycles can be a normal variation or a sign of underlying health conditions. Always consult a healthcare provider for persistent irregularities.",
    content: [
      "A regular cycle typically lasts between 21 and 35 days, with the actual period bleeding lasting 3 to 7 days. However, for many, cycles vary from month to month. A cycle is generally considered irregular if the variance between your shortest and longest cycle over a year is more than 7 to 9 days.",
      "Cycle irregularity is often caused by delayed or absent ovulation. Since the length of the post-ovulatory luteal phase is relatively fixed (usually 12–16 days), any delay in when you ovulate directly pushes back the start of your next period. Common triggers for delayed ovulation include high stress, illness, intense travel, significant sleep changes, under-fueling, or hormonal imbalances.",
      "RedDot addresses irregular cycles by avoiding 'false precision.' Instead of projecting a single predicted day for your next period, RedDot calculates the variance in your historical data and presents an expected window of several days. This range-based prediction logic prepares you for reality without the stress of an arbitrary countdown.",
      "When tracking an irregular cycle, pay close attention to daily physical symptoms rather than calendar dates alone. Log cervical fluid shifts (noting clear, stretchy fluid), basal body temperature, changes in skin clarity, and mood trends. Over time, these daily logs provide invaluable context for your doctor, revealing whether your irregular cycles follow a broader metabolic or lifestyle pattern."
    ]
  },
  {
    slug: "normal-vs-worth-flagging",
    title: "Cycle Health: What's Normal and When to Consult a Doctor",
    category: "general",
    topic: "Common Conditions",
    summary: "Identify the difference between standard cycle fluctuations and red flags that warrant professional medical review.",
    readingTime: "5 min read",
    disclaimer: "This guide does not replace clinical judgment. If you experience severe symptoms or sudden changes, seek medical attention immediately.",
    content: [
      "While every body is unique, understanding the general boundaries of reproductive health can help you advocate for yourself. Normal menstrual bleeding usually involves losing 30 to 80 ml of fluid per period, feeling manageable cramping on the first day or two, and experiencing mild premenstrual mood shifts that resolve once your period begins.",
      "Fluctuations are normal, but certain signs warrant a conversation with a healthcare provider. These include: (1) Severe, debilitating pain that does not respond to over-the-counter anti-inflammatories or prevents you from working or studying; (2) Heavy bleeding (menorrhagia) where you soak through one or more sanitary pads or tampons every hour for consecutive hours; (3) Cycles shorter than 21 days or longer than 45 days; (4) Sudden absence of bleeding (amenorrhea) for three months or more; (5) Bleeding between periods or after intercourse.",
      "Severe pain is not something you should 'just live with.' It can be a symptom of conditions like endometriosis, uterine fibroids, or pelvic inflammatory disease (PID). Similarly, extremely heavy bleeding can lead to iron-deficiency anemia, causing chronic fatigue and brain fog.",
      "Use your RedDot local logs to prepare for doctor appointments. Export your cycle history and symptom charts to show the precise frequency and severity of your symptoms. Having objective, timestamped logs eliminates guess-work and helps your physician make informed clinical decisions."
    ]
  },
  {
    slug: "nutrition-and-cycle-phases",
    title: "Cycle Syncing Nutrition: Fueling Your Body Through Each Phase",
    category: "general",
    topic: "Nutrition",
    summary: "Discover how metabolic needs change across your cycle and what nutrients support endocrine health in each phase.",
    readingTime: "4 min read",
    disclaimer: "Nutritional needs vary by individual. Consult a registered dietitian or physician before making major dietary changes.",
    content: [
      "Your endocrine system requires specific building blocks to produce hormones and metabolize them efficiently. As your hormone levels rise and fall, your resting metabolic rate and energy levels shift. Adapting your diet to support these phase-specific needs is a practice known as cycle-syncing nutrition.",
      "During the menstrual phase, focus on replenishing iron and supporting active recovery. Incorporate iron-rich grass-fed beef, lentils, spinach, and pair them with vitamin C (citrus, bell peppers) to boost absorption. Warming foods like soups and herbal teas (ginger, raspberry leaf) help soothe uterine contractions.",
      "As estrogen rises in the follicular and ovulatory phases, the body becomes more efficient at using carbohydrates for fuel. Support the liver in processing the peak estrogen load by eating fiber-dense oats, quinoa, and cruciferous vegetables like broccoli, cauliflower, and Brussels sprouts. Include zinc-rich pumpkin seeds and healthy fats from avocados.",
      "In the luteal phase, progesterone increases your basal metabolic rate, meaning your body burns slightly more calories at rest, which can cause increased hunger. Fuel this demand with slow-burning complex carbohydrates (sweet potatoes, squashes) to avoid blood sugar crashes and subsequent mood swings. Magnesium-rich dark chocolate and almonds can help reduce premenstrual water retention and sugar cravings."
    ]
  }
];

export function getArticles(): Article[] {
  return ARTICLES;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((art) => art.slug === slug);
}
