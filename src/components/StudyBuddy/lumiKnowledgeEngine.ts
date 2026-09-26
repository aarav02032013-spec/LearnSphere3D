import { NCERT_DIAGRAMS } from '../../data/ncertDiagramsData';
import { DEFAULT_NOTES } from '../../data/defaultNotes';

export interface LumiLocalRequest {
  message: string;
  history: Array<{ role: 'user' | 'model'; text: string }>;
  subject: string;
  gradeBand: string;
  studyMode: 'explain' | 'solver' | 'exam' | 'quiz';
}

interface TopicEntry {
  keywords: string[];
  title: string;
  subject: 'Physics' | 'Chemistry' | 'Biology' | 'Mathematics' | 'Study Tips';
  explain: string;
  solver?: string;
  exam: string;
  memoryTrick: string;
  quizQuestion: string;
  quizAnswerKey: string[];
  quizExplanation: string;
}

const CORE_STEM_TOPICS: TopicEntry[] = [
  {
    keywords: ['motor', 'fleming', 'left hand', 'left-hand', 'commutator', 'armature', 'split ring', 'split-ring', 'lorentz'],
    title: 'Electric Motor, Armature & Fleming’s Left-Hand Rule',
    subject: 'Physics',
    explain: `## Electric Motor & Fleming's Left-Hand Rule

An **Electric Motor** is a device that converts **electrical energy into mechanical rotational energy** using the magnetic force acting on a current-carrying conductor placed in a magnetic field.

### How it Works Step-by-Step:
1. **Current in the Armature Coil**: Conventional current \`I\` from the DC battery enters the rectangular copper armature loop through the stationary **carbon brushes** and **split-ring commutator**.
2. **Opposing Lorentz Forces (\`F = I · L × B\`)**:
   - The magnetic field \`B\` points horizontally from the **North (N) pole** to the **South (S) pole**.
   - On the **left arm**, current flows toward the back while \`B\` points right-to-left, producing an **upward magnetic force \`F\`**.
   - On the **right arm**, current flows toward the front, producing a **downward magnetic force \`F\`**.
3. **Continuous Clockwise Torque**: These two equal and opposite forces form a **turning couple (torque)** that rotates the coil.
4. **Role of the Split-Ring Commutator**: Every half-rotation (\`180°\`), the two golden half-rings swap contact with the carbon brushes, reversing current direction in the coil arms so the torque stays in the **same clockwise direction**!`,
    solver: `### Key Formulas for an Electric Motor:
- **Lorentz Force on one arm**: \`F = B · I · L · sin(θ)\` (Maximum when \`θ = 90°\`, so \`F = B · I · L\`)
- **Net Torque on an N-turn rectangular coil**: \`τ = N · I · A · B · cos(α)\`
  - \`N\` = Number of turns in armature coil
  - \`I\` = Electric current (Amperes, A)
  - \`A\` = Area of coil (\`length × width\`, in \`m²\`)
  - \`B\` = Magnetic field strength (Tesla, T)`,
    exam: `### High-Yield NCERT Board Exam Points:
- **Principle**: Based on the magnetic force experienced by a current-carrying conductor in a magnetic field (\`F = I · L × B\`).
- **Split-Ring Commutator Function**: Acts as a mechanical current-reverser every \`180°\` so the coil rotates unidirectionally.
- **Carbon Brushes Function**: Maintain low-friction sliding electrical contact between the stationary battery wires and the rotating split rings.
- **Common Exam Pitfall**: Do not confuse **Fleming's Left-Hand Rule** (used for **Electric Motors** to find force direction) with **Fleming's Right-Hand Rule** (used for **Electric Generators** to find induced current).`,
    memoryTrick: `Lumi's Memory Trick: Stretch your LEFT hand's **F**irst finger, **B**i-finger (middle), and **I**ndicator thumb mutually perpendicular — **F-B-I**: **F**orce (Thumb), **B**-Field (Forefinger), **I**-Current (Middle finger)!`,
    quizQuestion: `**Quick Quiz on Electric Motors!** 🦉
In a DC Electric Motor, what is the exact role of the **split-ring commutator**, and what would happen to the armature coil if we removed it?`,
    quizAnswerKey: ['reverse', 'direction', 'current', 'half', '180', 'continuous', 'same direction', 'oscillate', 'stop'],
    quizExplanation: `The **split-ring commutator** reverses the direction of electric current through the armature coil every half-rotation (\`180°\`). Without it, the torque would reverse after half a turn and the coil would simply oscillate back and forth instead of spinning continuously in one direction!`
  },
  {
    keywords: ['digestive', 'digestion', 'stomach', 'duodenum', 'intestine', 'bile', 'pancreas', 'peristalsis', 'villi', 'alimentary', 'pepsin', 'amylase'],
    title: 'Human Digestive System (NCERT Fig. 2.11)',
    subject: 'Biology',
    explain: `## Human Digestive System (Alimentary Canal)

Digestion is the step-by-step breakdown of complex, insoluble food molecules into simple, absorbable nutrients along the **alimentary canal**:

1. **Buccal Cavity (Mouth)**:
   - **Salivary glands** secrete saliva containing **salivary amylase (ptyalin)**, which begins breaking down **starch into maltose** at \`pH ~ 6.8\`.
2. **Oesophagus (Food Pipe)**:
   - Pushes the food bolus down into the stomach via rhythmic muscular waves called **peristalsis**.
3. **Stomach (J-Shaped Organ)**:
   - Gastric glands secrete **HCl** (creates acidic \`pH ~ 1.8\` and kills microbes), **Pepsin** (digests proteins into peptones), and **Mucus** (protects the stomach lining).
4. **Duodenum & Small Intestine (Complete Digestion & Absorption)**:
   - **Liver** secretes **bile juice** (stored in the gall bladder) which **emulsifies fats** into tiny droplets and makes the medium alkaline.
   - **Pancreas** secretes pancreatic juice containing **Trypsin** (proteins), **Pancreatic Amylase** (carbohydrates), and **Lipase** (emulsified fats).
   - Finger-like **villi** in the ileum massively increase surface area to absorb glucose, amino acids, and fatty acids into the bloodstream.
5. **Large Intestine (Colon)**:
   - Absorbs excess water and electrolytes before egestion.`,
    exam: `### High-Yield NCERT Exam Points (Class 10 Life Processes & Class 11):
- **Site of Complete Digestion**: **Small Intestine** (specifically the duodenum and jejunum/ileum).
- **Why Bile has NO Enzymes yet is Essential**: Bile salts emulsify large fat globules into micelle droplets so lipase can act efficiently, and bile neutralizes acidic chyme from the stomach so pancreatic enzymes can work.
- **Herbivores vs. Carnivores**: Herbivores have a much **longer small intestine** because plant cellulose takes much longer to digest than meat.`,
    memoryTrick: `Lumi's Memory Trick: Remember Pancreatic Enzymes with **T-A-L**: **T**rypsin (Proteins), **A**mylase (Starch/Carbs), **L**ipase (Lipids/Fats)!`,
    quizQuestion: `**Quick Quiz on Human Digestion!** 🦉
**Bile juice** secreted by the liver does not contain any digestive enzymes, yet it is crucial for fat digestion. Can you explain why?`,
    quizAnswerKey: ['emulsif', 'fat', 'globule', 'droplet', 'surface area', 'alkaline', 'basic', 'lipase'],
    quizExplanation: `Spot on! **Bile salts** break down (emulsify) large fat globules into tiny droplets, dramatically increasing the surface area for the enzyme **lipase** to act, while also making the acidic food from the stomach **alkaline** so pancreatic enzymes can function!`
  },
  {
    keywords: ['periodic', 'atomic radius', 'ionization', 'electronegativity', 'electron affinity', 'group', 'period', 'valency', 'effective nuclear'],
    title: 'Periodic Table Trends (Atomic Radius, Ionization Energy & Electronegativity)',
    subject: 'Chemistry',
    explain: `## Master Guide to Periodic Table Trends

All periodic table trends are governed by two competing forces: **Effective Nuclear Charge (\`Z_eff\`)** (inward pull of protons on valence electrons) and **Number of Electron Shells (\`n\`)** (shielding/distance).

### 1. Across a Period (Left → Right):
- **Atomic Radius DECREASES**: Protons are added to the nucleus while electrons enter the **same shell**, increasing \`Z_eff\` and pulling the shell closer.
- **Ionization Energy INCREASES**: Because valence electrons are held more tightly, more energy is required to remove an electron.
- **Electronegativity INCREASES**: Non-metals on the right strongly attract shared bonding electrons (Fluorine \`F\` is the highest at \`4.0\`).

### 2. Down a Group (Top → Bottom):
- **Atomic Radius INCREASES**: A brand-new principal electron shell (\`n\`) is added at each step down, increasing distance and inner-shell shielding.
- **Ionization Energy DECREASES**: Outer electrons are farther from the nucleus and easier to remove.
- **Electronegativity DECREASES**: Larger atomic size weakens attraction for shared electron pairs.`,
    exam: `### High-Yield Exceptions Asked in Exams:
- **Nitrogen vs. Oxygen Ionization Energy**: **Nitrogen (\`2p³\`)** has a higher first ionization enthalpy than **Oxygen (\`2p⁴\`)** because Nitrogen has a extra-stable **half-filled \`2p\` subshell**.
- **Chlorine vs. Fluorine Electron Gain Enthalpy**: **Chlorine (\`Cl\`)** has a more negative electron gain enthalpy than **Fluorine (\`F\`)** because Fluorine's tiny \`2p\` subshell experiences strong inter-electronic repulsion.`,
    memoryTrick: `Lumi's Memory Trick: Use **F-R-I-E-N-D**: **F**luorine (top-right corner) is the king of **I**onization Energy & **E**lectronegativity, while **Fr**ancium/Cesium (bottom-left corner) is the giant of **R**adius!`,
    quizQuestion: `**Quick Periodic Table Quiz!** 🦉
Why does **Atomic Radius decrease** as we move from Left to Right across Period 3 (from \`Na\` to \`Cl\`), even though the number of electrons is increasing?`,
    quizAnswerKey: ['nuclear charge', 'proton', 'same shell', 'pull', 'attract', 'z_eff', 'effective'],
    quizExplanation: `Across a period, each new electron enters the **same valence shell** while the nuclear charge (number of protons) increases by \`+1\` each step. This stronger **effective nuclear charge (\`Z_eff\`)** pulls the electron cloud closer to the nucleus!`
  },
  {
    keywords: ['nephron', 'kidney', 'excretory', 'urine', 'glomerulus', 'bowman', 'henle', 'tubule', 'filtration', 'reabsorption'],
    title: 'Human Nephron & Urine Formation',
    subject: 'Biology',
    explain: `## Structure & Function of the Human Nephron

The **nephron** is the microscopic functional filtration unit of the kidney (~1 million per kidney).

### 3 Steps of Urine Formation:
1. **Glomerular Ultrafiltration**:
   - High blood pressure inside the **glomerulus** (capillary tuft) forces water, glucose, amino acids, salts, and urea across the membrane into **Bowman's Capsule** to form primary filtrate.
2. **Selective Tubular Reabsorption**:
   - **PCT (Proximal Convoluted Tubule)**: Reabsorbs **100% of glucose**, amino acids, and most water/ions back into peritubular capillaries.
   - **Loop of Henle**: Creates an osmotic gradient in the medulla (counter-current mechanism) to conserve water.
3. **Tubular Secretion**:
   - Distal Convoluted Tubule (DCT) and Collecting Duct actively secrete excess \`K+\`, \`H+\`, and ammonia into the filtrate to maintain blood \`pH\` and ionic balance.`,
    exam: `### High-Yield Exam Points:
- **Bowman's Capsule + Glomerulus** together are called the **Malpighian Body (Renal Corpuscle)**.
- **Afferent Arteriole** is wider than the **Efferent Arteriole**, which creates the high hydrostatic pressure needed for ultrafiltration.`,
    memoryTrick: `Lumi's Memory Trick: Remember the 3 steps of urine formation in order with **U-R-S**: **U**ltrafiltration → **R**eabsorption → **S**ecretion!`,
    quizQuestion: `**Quick Nephron Quiz!** 🦉
Which specific part of the nephron is responsible for reabsorbing nearly **100% of filtered glucose and amino acids** back into the blood?`,
    quizAnswerKey: ['pct', 'proximal', 'convoluted tubule'],
    quizExplanation: `The **Proximal Convoluted Tubule (PCT)** is lined with brush-border cuboidal epithelium rich in mitochondria, allowing it to actively reabsorb 100% of filtered glucose and amino acids!`
  },
  {
    keywords: ['acid', 'base', 'salt', 'ph', 'indicator', 'neutralization', 'arrhenius', 'bronsted', 'molarity', 'titration'],
    title: 'Acids, Bases, Salts & pH Calculations',
    subject: 'Chemistry',
    explain: `## Acids, Bases, Salts & The pH Scale

- **Acids**: Substances that release hydrogen/hydronium ions (\`H+\` or \`H3O+\`) in aqueous solution and turn **blue litmus red** (\`pH < 7\`).
- **Bases**: Substances that release hydroxide ions (\`OH-\`) in water and turn **red litmus blue** (\`pH > 7\`).
- **Neutralization Reaction**: \`Acid + Base → Salt + Water + Heat\` (e.g., \`HCl + NaOH → NaCl + H2O\`).

### Understanding the pH Formula:
- \`pH = -log10[H+]\`
- \`pH + pOH = 14\` (at \`25°C\`)
- Every **1 unit change in pH** represents a **10-fold change** in \`[H+]\` ion concentration!`,
    solver: `### Step-by-Step pH Calculation Examples:
- **Example 1**: Find the pH of \`0.001 M HCl\`.
  - Since \`HCl\` is a strong monoprotic acid, \`[H+] = 0.001 M = 10^-3 M\`.
  - \`pH = -log10(10^-3) = 3.0\`.
- **Example 2**: Find the pH of \`0.01 M NaOH\`.
  - \`[OH-] = 0.01 M = 10^-2 M\` → \`pOH = 2.0\`.
  - \`pH = 14 - pOH = 14 - 2 = 12.0\`.`,
    exam: `### Important NCERT Everyday Salts:
- **Baking Soda**: Sodium hydrogen carbonate (\`NaHCO3\`) — mild non-corrosive base, used in antacids and baking powder.
- **Washing Soda**: \`Na2CO3 · 10H2O\` — removes permanent hardness of water.
- **Plaster of Paris (POP)**: Calcium sulphate hemihydrate (\`CaSO4 · 1/2 H2O\`), made by heating Gypsum (\`CaSO4 · 2H2O\`) at \`373 K\`.`,
    memoryTrick: `Lumi's Memory Trick: **B-R-A** & **R-B-B**: **B**lue litmus turns **R**ed in **A**cid; **R**ed litmus turns **B**lue in **B**ase!`,
    quizQuestion: `**Quick Chemistry Quiz!** 🦉
Solution A has a \`pH\` of **3** and Solution B has a \`pH\` of **6**. Which solution is more acidic, and by how many times is its \`H+\` ion concentration greater?`,
    quizAnswerKey: ['1000', 'thousand', '10^3', 'solution a', 'a is more'],
    quizExplanation: `**Solution A (\`pH = 3\`)** is more acidic! Since the pH scale is logarithmic, a difference of \`6 - 3 = 3\` pH units means Solution A has **\`10³ = 1,000 times\`** higher \`[H+]\` concentration than Solution B!`
  },
  {
    keywords: ['heart', 'cardiac', 'ventricle', 'atrium', 'aorta', 'pulmonary', 'double circulation', 'blood', 'artery', 'vein'],
    title: 'Human Heart & Double Circulation',
    subject: 'Biology',
    explain: `## Human Heart & Double Circulation

The human heart has **4 chambers** (Left & Right Atria, Left & Right Ventricles) to prevent the mixing of **oxygenated** and **deoxygenated** blood.

### Pathway of Double Circulation:
1. **Pulmonary Circulation (Heart ↔ Lungs)**:
   - Deoxygenated blood from the body enters the **Right Atrium** via the Vena Cava → flows into the **Right Ventricle** → pumped through the **Pulmonary Artery** to the lungs for oxygenation.
2. **Systemic Circulation (Heart ↔ Body)**:
   - Oxygenated blood from the lungs returns to the **Left Atrium** via the **Pulmonary Veins** → enters the muscular **Left Ventricle** → pumped out through the **Aorta** to the entire body.`,
    exam: `### High-Yield Exam Points:
- **Why Left Ventricle has the Thickest Wall**: It must pump oxygenated blood at high pressure to the entire body, whereas the right ventricle only pumps blood to the nearby lungs.
- **Only Artery Carrying Deoxygenated Blood**: **Pulmonary Artery**.
- **Only Vein Carrying Oxygenated Blood**: **Pulmonary Vein**.`,
    memoryTrick: `Lumi's Memory Trick: **L-O-R-D** — **L**eft side of the heart always carries **O**xygenated blood; **R**ight side always carries **D**eoxygenated blood!`,
    quizQuestion: `**Quick Human Heart Quiz!** 🦉
Why does the **Left Ventricle** have a much thicker muscular wall than the Right Ventricle and the Atria?`,
    quizAnswerKey: ['high pressure', 'entire body', 'whole body', 'aorta', 'pump', 'further', 'distance'],
    quizExplanation: `The **Left Ventricle** has the thickest muscular wall (myocardium) because it has to pump oxygenated blood under **high pressure** through the aorta to reach the **entire body**!`
  },
  {
    keywords: ['study', 'pomodoro', 'schedule', 'routine', 'exam', 'revision', 'memorize', 'focus', 'procrastinat', 'time table', 'timetable', 'active recall'],
    title: 'High-Retention Study Routine & Active Recall Coach',
    subject: 'Study Tips',
    explain: `## Lumi's 3-Hour High-Retention Study Blueprint

Instead of passively re-reading textbooks (which creates the *illusion of competence*), use **Active Recall + Spaced Repetition**:

### 1. Block 1 (50 mins): Concept & 3D Visualization
- **25 mins (Pomodoro 1)**: Pick one chapter (e.g., *Magnetic Effects of Current* or *Life Processes*). Explore its 3D model in **Visual Learning** and inspect every pinpointed part.
- **5 mins Break**: Stretch and hydrate.
- **25 mins (Pomodoro 2)**: Close your book and write down the key definitions, formulas, and a rough sketch of the diagram **from memory** (Blurting Method).

### 2. Block 2 (50 mins): Numericals & Application
- Solve 8–10 graded problems (start with solved NCERT examples, then in-text questions, then back exercises).
- Whenever you get stuck, switch Lumi to **Step-by-Step Solver** mode to see the exact formula and unit conversion.

### 3. Block 3 (30 mins): Self-Testing & Error Log
- Run the **Labeling Quiz** in Visual Learning or ask Lumi **"Quiz Me!"**.
- Save any tricky formula or mistake into the **Notes** tab so you can review it in 5 minutes before exam day!`,
    exam: `### Top 3 Exam-Scoring Habits:
1. **Always Write the Formula First**: Even if you make a calculation slip, step-marking awards points for stating the given quantities, formula, and SI units.
2. **Underline Keywords in Biology/Chemistry**: Examiners scan for terms like *peristalsis*, *emulsification*, *split-ring commutator*, and *effective nuclear charge*.
3. **1-3-7 Spaced Revision Rule**: Revise a new topic on **Day 1**, **Day 3**, and **Day 7** to lock it into long-term memory.`,
    memoryTrick: `Lumi's Study Tip: Use the **Feynman Technique** — if you can explain a topic out loud in simple words as if teaching a 12-year-old, you've truly mastered it!`,
    quizQuestion: `**Quick Study Habit Check!** 🦉
What is the **Active Recall (Blurting) Method**, and why is it much more effective than highlighting or re-reading your textbook?`,
    quizAnswerKey: ['memory', 'close', 'test', 'retrieve', 'brain', 'write', 'without looking'],
    quizExplanation: `**Active Recall** means closing your book and retrieving concepts from memory (by writing them down or answering quiz questions). Actively pulling information out of memory strengthens neural pathways far more than passively re-reading!`
  }
];

function trySolvePhysicsOrChemNumerical(message: string): string | null {
  const lower = message.toLowerCase();

  // 1. Projectile Motion Solver
  if (lower.includes('projectile') || (lower.includes('angle') && (lower.includes('m/s') || lower.includes('velocity') || lower.includes('speed')))) {
    const nums = message.match(/\d+(\.\d+)?/g)?.map(Number) || [];
    const u = nums[0] || 20;
    const thetaDeg = nums[1] || 30;
    const g = nums[2] || 9.8;
    const thetaRad = (thetaDeg * Math.PI) / 180;
    const sinTheta = Math.sin(thetaRad);
    const sin2Theta = Math.sin(2 * thetaRad);

    const timeOfFlight = (2 * u * sinTheta) / g;
    const maxHeight = (u * u * sinTheta * sinTheta) / (2 * g);
    const range = (u * u * sin2Theta) / g;

    return `## Step-by-Step Projectile Motion Solution

### 1. Given Quantities:
- Initial Launch Velocity (\`u\`) = \`${u} m/s\`
- Launch Angle (\`θ\`) = \`${thetaDeg}°\`
- Acceleration due to gravity (\`g\`) = \`${g} m/s²\`

### 2. Formulas Used:
- **Maximum Height (\`H\`)**: \`H = (u² · sin²θ) / (2g)\`
- **Time of Flight (\`T\`)**: \`T = (2 · u · sinθ) / g\`
- **Horizontal Range (\`R\`)**: \`R = (u² · sin(2θ)) / g\`

### 3. Step-by-Step Substitution:
1. **Maximum Height (\`H\`)**:
   - \`sin(${thetaDeg}°) = ${sinTheta.toFixed(4)}\`
   - \`H = (${u}² × ${sinTheta.toFixed(4)}²) / (2 × ${g})\`
   - **\`H = ${maxHeight.toFixed(2)} meters\`**
2. **Total Time of Flight (\`T\`)**:
   - \`T = (2 × ${u} × ${sinTheta.toFixed(4)}) / ${g}\`
   - **\`T = ${timeOfFlight.toFixed(2)} seconds\`**
3. **Horizontal Range (\`R\`)**:
   - \`sin(${2 * thetaDeg}°) = ${sin2Theta.toFixed(4)}\`
   - \`R = (${u}² × ${sin2Theta.toFixed(4)}) / ${g}\`
   - **\`R = ${range.toFixed(2)} meters\`**

Lumi's Study Tip: Horizontal range \`R\` is always **maximum** when the launch angle is **\`θ = 45°\`** (since \`sin(90°) = 1\`)!`;
  }

  // 2. Ohm's Law / Electric Circuit Solver
  if (lower.includes('ohm') || (lower.includes('resistance') && (lower.includes('volt') || lower.includes('current') || lower.includes('amp')))) {
    const vMatch = message.match(/(\d+(?:\.\d+)?)\s*v(?:olt)?/i);
    const rMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:ohm|Ω)/i);
    const iMatch = message.match(/(\d+(?:\.\d+)?)\s*a(?:mp)?/i);

    const V = vMatch ? parseFloat(vMatch[1]) : 12;
    const R = rMatch ? parseFloat(rMatch[1]) : 4;
    const I = iMatch ? parseFloat(iMatch[1]) : V / R;
    const P = V * I;

    return `## Step-by-Step Ohm's Law & Circuit Calculation

### 1. Core Formulas:
- **Ohm's Law**: \`V = I × R\`  (or \`I = V / R\`)
- **Electrical Power**: \`P = V × I = I² × R = V² / R\`

### 2. Worked Calculation:
- Voltage (\`V\`) = \`${V} V\`
- Resistance (\`R\`) = \`${R} Ω\`
- **Electric Current (\`I\`)** = \`V / R = ${V} / ${R} = ${(V / R).toFixed(2)} A\`
- **Power Dissipated (\`P\`)** = \`V × I = ${V} × ${(V / R).toFixed(2)} = ${P.toFixed(2)} W\`

Lumi's Memory Trick: Picture the **V-I-R Triangle** with \`V\` on top and \`I · R\` at the base — cover the unknown quantity with your finger to see the exact formula!`;
  }

  return null;
}

export function generateLocalLumiResponse(req: LumiLocalRequest): string {
  const { message, history, subject, gradeBand, studyMode } = req;
  const lower = message.toLowerCase().trim();

  // 1. Check if the previous message from Lumi was a Quiz question and the user is answering it!
  const lastModelMsg = [...history].reverse().find((m) => m.role === 'model');
  if (lastModelMsg && lastModelMsg.text.includes('Quick') && lastModelMsg.text.includes('Quiz')) {
    const matchedQuizTopic = CORE_STEM_TOPICS.find((t) =>
      lastModelMsg.text.toLowerCase().includes(t.quizQuestion.slice(0, 35).toLowerCase())
    );
    if (matchedQuizTopic) {
      const hitKeywords = matchedQuizTopic.quizAnswerKey.filter((kw) => lower.includes(kw));
      const isGreatAnswer = hitKeywords.length >= 1 || lower.length > 25;
      return `${
        isGreatAnswer
          ? `### Awesome job! You nailed the core concept! 🎉🦉`
          : `### Good effort! Let's review the key concept together! 🦉✨`
      }

${matchedQuizTopic.quizExplanation}

${matchedQuizTopic.memoryTrick}

Would you like another quiz question on **${matchedQuizTopic.subject}**, or should we explore a new topic?`;
    }
  }

  // 2. Check if user is asking for a numerical calculation in Solver mode (or with numbers)
  const solvedNumerical = trySolvePhysicsOrChemNumerical(message);
  if (solvedNumerical && (studyMode === 'solver' || /\d/.test(message))) {
    return solvedNumerical;
  }

  // 3. Search NCERT 3D Diagrams database for direct match
  const matchedDiagram = NCERT_DIAGRAMS.find((diag) => {
    const titleWords = diag.title.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    return (
      lower.includes(diag.title.toLowerCase()) ||
      titleWords.some((w) => lower.includes(w) && !['human', 'system', 'structure', 'diagram', 'model'].includes(w))
    );
  });

  // 4. Search Core STEM Topics
  const matchedTopic = CORE_STEM_TOPICS.find((topic) =>
    topic.keywords.some((kw) => lower.includes(kw))
  );

  if (matchedTopic) {
    if (studyMode === 'quiz' || lower.includes('quiz me')) {
      return `${matchedTopic.quizQuestion}\n\n*Type your answer below and I'll check it for you!*`;
    }
    if (studyMode === 'solver' && matchedTopic.solver) {
      return `${matchedTopic.explain}\n\n${matchedTopic.solver}\n\n${matchedTopic.memoryTrick}`;
    }
    if (studyMode === 'exam') {
      return `${matchedTopic.explain}\n\n${matchedTopic.exam}\n\n${matchedTopic.memoryTrick}`;
    }
    return `${matchedTopic.explain}\n\n${matchedTopic.exam}\n\n${matchedTopic.memoryTrick}`;
  }

  if (matchedDiagram) {
    const partsList = matchedDiagram.pinpoints
      .map((p) => `- **${p.name}**: ${p.description} *(Significance: ${p.significance})*`)
      .join('\n');

    return `## ${matchedDiagram.title} (${matchedDiagram.chapter} · Class ${matchedDiagram.classGrade})

${matchedDiagram.description}

### Key Labeled Structures & Functions:
${partsList}

### High-Yield Exam Takeaways:
${matchedDiagram.keyConcepts.map((k: string) => `- ${k}`).join('\n')}
${matchedDiagram.examTips.map((t: string) => `- **Exam Tip**: ${t}`).join('\n')}

Lumi's Study Tip: Open the **Visual Learning** tab and select **${matchedDiagram.title}** to rotate the 3D model, use the **Explode / Cross-Section** slider, and test yourself with the **Labeling Quiz**!`;
  }

  // 5. Check Default Study Notes for matching concepts
  const matchedNote = DEFAULT_NOTES.find((n) =>
    n.tags.some((t) => lower.includes(t.toLowerCase())) ||
    lower.includes(n.title.toLowerCase())
  );
  if (matchedNote) {
    return `## ${matchedNote.title} (${matchedNote.subject})

${matchedNote.content}

Lumi's Study Tip: You can also view and edit this study guide anytime in your **Notes** tab!`;
  }

  // 6. If user clicked "Quiz Me!" generally
  if (studyMode === 'quiz' || lower.includes('quiz')) {
    const topicPool =
      subject === 'All Subjects'
        ? CORE_STEM_TOPICS
        : CORE_STEM_TOPICS.filter((t) => t.subject === subject);
    const chosen = topicPool[Math.floor(Math.random() * topicPool.length)] || CORE_STEM_TOPICS[0];
    return `### Let's test your ${chosen.subject} mastery (${gradeBand})! 🦉✨\n\n${chosen.quizQuestion}\n\n*Reply with your answer in your own words—I'll give you feedback and a memory trick!*`;
  }

  // 7. Helpful structured response for any other study question
  return `## Lumi's Study Breakdown: "${message.slice(0, 68)}${message.length > 68 ? '...' : ''}" (${subject} · ${gradeBand})

Here is a structured framework to master this topic for **${gradeBand}**:

### 1. Core Concept & First Principles
- Start by identifying the **fundamental definition** and the physical, chemical, or biological mechanism driving the process.
- Connect the concept to its visual structure—check the **Visual Learning** or **3D Learning** tabs to inspect the interactive 3D model and its labeled pinpoints.

### 2. Key Formulas / Processes to Remember
- **Physics**: State the governing law (e.g., \`F = m · a\`, \`V = I · R\`, \`F = I · L × B\`, or \`1/f = 1/v - 1/u\`) and always convert quantities into **SI units** before substituting.
- **Chemistry**: Write the balanced chemical equation with physical states \`(s), (l), (g), (aq)\` and note any periodic or pH trends (\`pH = -log[H+]\`).
- **Biology**: Trace the pathway in sequence (e.g., *Organ → Tissue → Specialized Cell → Enzyme/Hormone Action*).

### 3. Quick Exam Checklist
- Write a crisp 2-line definition using textbook keywords.
- Include a neat labeled diagram or balanced equation wherever applicable.

Lumi's Study Tip: Try asking me about specific topics like **"Electric Motor & Fleming's Left-Hand Rule"**, **"Human Digestive System"**, **"Periodic Table Trends"**, **"Human Nephron"**, **"Acids, Bases & pH"**, or paste a **Projectile Motion / Ohm's Law numerical**!`;
}
