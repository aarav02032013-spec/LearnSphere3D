import { GoogleGenAI } from '@google/genai';
import { NCERT_DIAGRAMS } from '../../data/ncertDiagramsData';
import { DEFAULT_NOTES } from '../../data/defaultNotes';
import { ELEMENTS_DATA } from '../../data/elementsData';

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
    keywords: ['atomicity', 'monoatomic', 'diatomic', 'triatomic', 'tetra-atomic', 'tetraatomic', 'polyatomic', 'p4', 's8', 'o3'],
    title: 'Atomicity of Elements & Molecules (NCERT Class 9 & 11 Chemistry)',
    subject: 'Chemistry',
    explain: `## What is Atomicity?

**Atomicity** is defined as the **total number of atoms present in a single molecule** of an element, substance, or compound.

### Classification of Molecules by Atomicity:
1. **Monoatomic Molecules (\`Atomicity = 1\`)**:
   - Consist of only **1 single atom** because their valence shell is already complete (or they exist as atomic lattices).
   - **Examples**: Noble gases — **Helium (\`He\`)**, **Neon (\`Ne\`)**, **Argon (\`Ar\`)**; Metals — **Sodium (\`Na\`)**, **Iron (\`Fe\`)**, **Copper (\`Cu\`)**.
2. **Diatomic Molecules (\`Atomicity = 2\`)**:
   - Each molecule is made of **2 chemically bonded atoms**.
   - **Examples**: **Hydrogen (\`H₂\`)**, **Oxygen (\`O₂\`)**, **Nitrogen (\`N₂\`)**, **Chlorine (\`Cl₂\`)**, **Fluorine (\`F₂\`)**, **Hydrogen Chloride (\`HCl\`)**, **Carbon Monoxide (\`CO\`)**.
3. **Triatomic Molecules (\`Atomicity = 3\`)**:
   - Each molecule contains **3 atoms**.
   - **Examples**: **Ozone (\`O₃\`)**, **Water (\`H₂O\` → 2 H + 1 O = 3)**, **Carbon Dioxide (\`CO₂\` → 1 C + 2 O = 3)**.
4. **Tetra-atomic Molecules (\`Atomicity = 4\`)**:
   - Each molecule contains **4 atoms**.
   - **Examples**: **White Phosphorus (\`P₄\`)**, **Ammonia (\`NH₃\` → 1 N + 3 H = 4)**, **Sulfur Trioxide (\`SO₃\`)**.
5. **Polyatomic Molecules (\`Atomicity > 4\`)**:
   - Contain **more than 4 atoms** per molecule.
   - **Examples**: **Octasulfur (\`S₈\`, Atomicity = 8)**, **Methane (\`CH₄\`, Atomicity = 5)**, **Sulfuric Acid (\`H₂SO₄\`, Atomicity = 7)**, **Glucose (\`C₆H₁₂O₆\`, Atomicity = 24)**, **Buckminsterfullerene (\`C₆₀\`, Atomicity = 60)**.`,
    solver: `### How to Calculate the Atomicity of Any Formula Step-by-Step:
Simply **add the subscripts** of all elements in one molecule:
- **\`O₃\` (Ozone)**: \`3 Oxygen atoms\` → **Atomicity = 3** (Triatomic)
- **\`P₄\` (Phosphorus)**: \`4 Phosphorus atoms\` → **Atomicity = 4** (Tetra-atomic)
- **\`S₈\` (Sulfur)**: \`8 Sulfur atoms\` → **Atomicity = 8** (Polyatomic / Octa-atomic)
- **\`H₂SO₄\` (Sulfuric Acid)**: \`2 (H) + 1 (S) + 4 (O) = 7\` → **Atomicity = 7**
- **\`Ca(OH)₂\` (Calcium Hydroxide)**: \`1 (Ca) + 2×1 (O) + 2×1 (H) = 5\` → **Atomicity = 5**
- **\`Al₂(SO₄)₃\` (Aluminium Sulfate)**: \`2 (Al) + 3×1 (S) + 3×4 (O) = 2 + 3 + 12 = 17\` → **Atomicity = 17**`,
    exam: `### High-Yield NCERT Exam Points:
- **Phosphorus (\`P₄\`) vs. Sulfur (\`S₈\`)**: A classic 1-mark and 2-mark board question! Always remember: **Phosphorus is tetra-atomic (\`P₄ = 4\`)** and **Sulfur is polyatomic/octa-atomic (\`S₈ = 8\`)**.
- **Noble Gases**: Always have an atomicity of **1** because their octet/duplet is already full (\`valency = 0\`).`,
    memoryTrick: `Lumi's Memory Trick: **H-O-N-Cl-Br-I-F** ("**H**ave **N**o **F**ear **O**f **I**ce **C**old **B**eer") are the **7 famous Diatomic Elements** (\`H₂, N₂, F₂, O₂, I₂, Cl₂, Br₂\`) that always have **Atomicity = 2** in their standard state!`,
    quizQuestion: `**Quick Atomicity Quiz!** 🦉
What is the **atomicity** of **White Phosphorus (\`P₄\`)**, **Sulfur (\`S₈\`)**, and **Sulfuric Acid (\`H₂SO₄\`)**?`,
    quizAnswerKey: ['4', '8', '7', 'tetra', 'poly', 'octa'],
    quizExplanation: `**Phosphorus (\`P₄\`)** has an atomicity of **4** (tetra-atomic), **Sulfur (\`S₈\`)** has an atomicity of **8** (polyatomic/octa-atomic), and **\`H₂SO₄\`** has \`2 + 1 + 4 = 7\` atoms per molecule!`
  },
  {
    keywords: ['valency', 'valence electron', 'octet', 'duplet', 'combining capacity', 'covalency', 'electrovalency'],
    title: 'Valency & Valence Electrons (Combining Capacity of Atoms)',
    subject: 'Chemistry',
    explain: `## Valency vs. Valence Electrons

- **Valence Electrons**: The number of electrons present in the **outermost shell (valence shell)** of an atom.
- **Valency**: The **combining capacity** of an atom—i.e., the number of electrons an atom **loses, gains, or shares** to achieve a stable noble-gas configuration (**8 electrons / Octet**, or **2 electrons / Duplet** for \`H, He, Li, Be\`).

### How to Find Valency Instantly:
1. **If Valence Electrons = 1, 2, or 3** (Metals + Hydrogen/Boron):
   - \`Valency = Number of Valence Electrons\`
   - Example: **Sodium (\`Na, Z=11\`)** → Shells \`2, 8, 1\` → **Valency = 1**.
   - Example: **Magnesium (\`Mg, Z=12\`)** → Shells \`2, 8, 2\` → **Valency = 2**.
2. **If Valence Electrons = 4, 5, 6, 7, or 8** (Non-Metals & Noble Gases):
   - \`Valency = 8 - (Number of Valence Electrons)\`
   - Example: **Nitrogen (\`N, Z=7\`)** → Shells \`2, 5\` → \`Valency = 8 - 5 = 3\`.
   - Example: **Oxygen (\`O, Z=8\`)** → Shells \`2, 6\` → \`Valency = 8 - 6 = 2\`.
   - Example: **Chlorine (\`Cl, Z=17\`)** → Shells \`2, 8, 7\` → \`Valency = 8 - 7 = 1\`.
   - Example: **Neon (\`Ne, Z=10\`)** → Shells \`2, 8\` → \`Valency = 8 - 8 = 0\` (Inert).`,
    exam: `### Variable Valency in Transition Elements:
- **Iron (\`Fe\`)**: Shows **+2 (Ferrous)** and **+3 (Ferric)**.
- **Copper (\`Cu\`)**: Shows **+1 (Cuprous)** and **+2 (Cupric)**.
- **Sulfur (\`S\`)**: Shows valencies of **2, 4, and 6** (e.g., \`H₂S\`, \`SO₂\`, \`SF₆\`).`,
    memoryTrick: `Lumi's Memory Trick: Valency across a Period goes up to 4 and then back down to 0 like a mountain peak: **1 → 2 → 3 → 4 → 3 → 2 → 1 → 0**!`,
    quizQuestion: `**Quick Valency Quiz!** 🦉
An element **X** has atomic number \`Z = 15\` (Phosphorus). Write its K, L, M electronic configuration and find its primary **valency**!`,
    quizAnswerKey: ['2, 8, 5', '2,8,5', '3', '5', 'three'],
    quizExplanation: `For \`Z = 15\`, the shell distribution is **K=2, L=8, M=5** (5 valence electrons). Its primary valency is \`8 - 5 = 3\` (and it can also expand its octet to show a covalency of **5** in \`PCl₅\`)!`
  },
  {
    keywords: ['isotope', 'isobar', 'isotone', 'protium', 'deuterium', 'tritium', 'atomic number', 'mass number', 'nucleon'],
    title: 'Isotopes, Isobars & Isotones (Atomic Structure)',
    subject: 'Chemistry',
    explain: `## Isotopes, Isobars & Isotones Compared

1. **Isotopes (Same Protons \`Z\`, Different Neutrons / Mass \`A\`)**:
   - Atoms of the **same element** having the **same atomic number (\`Z\`)** but **different mass numbers (\`A\`)**.
   - **Examples**:
     - **Hydrogen Isotopes**: Protium (\`¹₁H\`, 0 neutrons), Deuterium (\`²₁H\`, 1 neutron), Tritium (\`³₁H\`, 2 neutrons).
     - **Carbon Isotopes**: \`¹²₆C\`, \`¹³₆C\`, \`¹⁴₆C\`.
     - **Chlorine Isotopes**: \`³⁵₁₇Cl\` (75%) and \`³⁷₁₇Cl\` (25%) → Average atomic mass = \`35.5 u\`.
2. **Isobars (Same Mass Number \`A\`, Different Atomic Number \`Z\`)**:
   - Atoms of **different elements** with different \`Z\` but the **same mass number (\`A\`)**.
   - **Example**: **Argon (\`⁴⁰₁₈Ar\`)**, **Potassium (\`⁴⁰₁₉K\`)**, and **Calcium (\`⁴⁰₂₀Ca\`)** all have \`A = 40\`.
3. **Isotones (Same Number of Neutrons \`N = A - Z\`)**:
   - Atoms of different elements having the **same neutron count**.
   - **Example**: \`¹⁴₆C\` (\`14 - 6 = 8\` neutrons) and \`¹⁶₈O\` (\`16 - 8 = 8\` neutrons).`,
    exam: `### Important NCERT Applications of Radioisotopes:
- **An isotope of Uranium (\`²³⁵U\`)**: Used as fuel in nuclear reactors.
- **An isotope of Cobalt (\`⁶⁰Co\`)**: Used in radiation therapy for treating cancer.
- **An isotope of Iodine (\`¹³¹I\`)**: Used in the treatment of **goitre** (thyroid disorder).`,
    memoryTrick: `Lumi's Memory Trick: **Iso-TOP-es** differ at the **TOP** (Mass number \`A\` on top is different, \`Z\` at the bottom is the same); **Iso-TONE-s** have the same **N**eutrons!`,
    quizQuestion: `**Quick Atomic Structure Quiz!** 🦉
Why do all **isotopes** of an element have **identical chemical properties** even though their physical masses are different?`,
    quizAnswerKey: ['electron', 'valence', 'same atomic number', 'configuration', 'proton'],
    quizExplanation: `Chemical properties depend entirely on the **number of electrons (and valence shell configuration)**. Since isotopes have the same atomic number (\`Z\`), they have the exact same electronic configuration and chemical behavior!`
  },
  {
    keywords: ['mole', 'avogadro', 'molar mass', 'stoichiometry', 'limiting reagent', '6.022', 'molarity', 'molality'],
    title: 'Mole Concept, Avogadro’s Number & Stoichiometry',
    subject: 'Chemistry',
    explain: `## The Mole Concept Made Simple

A **mole (\`mol\`)** is the chemist's counting unit—just like \`1 dozen = 12 items\`, **1 mole** of any substance always contains **Avogadro's Number (\`N_A\`)** of particles:
- \`1 mole = 6.022 × 10²³ atoms, molecules, or ions\`

### The 3 Golden Mole Formulas:
1. **From Mass**: \`Number of moles (n) = Given Mass (m) / Molar Mass (M)\`
2. **From Particles**: \`Number of moles (n) = Number of Particles (N) / (6.022 × 10²³)\`
3. **From Gas Volume at STP (\`273.15 K, 1 bar\`)**: \`Number of moles (n) = Volume in Litres / 22.4 L\``,
    solver: `### Concentration Formulas for Numericals:
- **Molarity (\`M\`)**: \`Moles of Solute / Volume of Solution in Litres (L)\` (Temperature-dependent)
- **Molality (\`m\`)**: \`Moles of Solute / Mass of Solvent in kg\` (Temperature-independent)
- **Mole Fraction (\`χ_A\`)**: \`n_A / (n_A + n_B)\``,
    exam: `### High-Yield Exam Tip:
- **Molality (\`m\`) vs. Molarity (\`M\`)**: **Molality** does NOT change with temperature because mass is independent of temperature, whereas volume expands on heating!`,
    memoryTrick: `Lumi's Memory Trick: Put **Moles (\`n\`)** at the center of your hub — **Divide** to convert TO moles (\`÷ Molar Mass\`, \`÷ 6.022×10²³\`, \`÷ 22.4 L\`), and **Multiply** to convert AWAY from moles!`,
    quizQuestion: `**Quick Mole Concept Quiz!** 🦉
How many moles and how many molecules are present in **\`36 g\` of Water (\`H₂O\`, Molar Mass = \`18 g/mol\`)**?`,
    quizAnswerKey: ['2', 'two', '1.2044', '12.044'],
    quizExplanation: `Number of moles \`n = 36 g / 18 g/mol = 2 moles\`! And the number of molecules is \`2 × 6.022 × 10²³ = 1.2044 × 10²⁴ molecules\` of \`H₂O\`!`
  },
  {
    keywords: ['motor', 'fleming', 'left hand', 'left-hand', 'commutator', 'armature', 'split ring', 'split-ring', 'lorentz'],
    title: 'Electric Motor, Armature & Fleming’s Left-Hand Rule',
    subject: 'Physics',
    explain: `## Electric Motor & Fleming's Left-Hand Rule

An **Electric Motor** converts **electrical energy into mechanical rotational energy** using the magnetic force acting on a current-carrying conductor in a magnetic field.

### How it Works Step-by-Step:
1. **Current in the Armature Coil**: Conventional current \`I\` from the DC battery enters the rectangular copper armature loop through the stationary **carbon brushes** and **split-ring commutator**.
2. **Opposing Lorentz Forces (\`F = I · L × B\`)**:
   - The magnetic field \`B\` points horizontally from the **North (N) pole** to the **South (S) pole**.
   - On the **left arm**, current flows perpendicular to \`B\`, producing an **upward magnetic force \`F\`**.
   - On the **right arm**, current flows in the opposite direction, producing a **downward magnetic force \`F\`**.
3. **Continuous Clockwise Torque**: These two equal and opposite forces form a **turning couple (torque)** that rotates the coil.
4. **Role of the Split-Ring Commutator**: Every half-rotation (\`180°\`), the two golden half-rings swap contact with the carbon brushes, reversing current direction in the coil arms so the torque stays in the **same clockwise direction**!`,
    solver: `### Key Formulas for an Electric Motor:
- **Lorentz Force on one arm**: \`F = B · I · L · sin(θ)\` (Maximum when \`θ = 90°\`, so \`F = B · I · L\`)
- **Net Torque on an N-turn rectangular coil**: \`τ = N · I · A · B · cos(α)\``,
    exam: `### High-Yield NCERT Board Exam Points:
- **Principle**: Based on the magnetic force experienced by a current-carrying conductor in a magnetic field (\`F = I · L × B\`).
- **Split-Ring Commutator Function**: Acts as a mechanical current-reverser every \`180°\` so the coil rotates unidirectionally.
- **Carbon Brushes Function**: Maintain low-friction sliding electrical contact between the stationary battery wires and the rotating split rings.`,
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
- **Site of Complete Digestion**: **Small Intestine** (duodenum and ileum).
- **Why Bile has NO Enzymes yet is Essential**: Bile salts emulsify large fat globules into tiny droplets so lipase can act efficiently, and bile neutralizes acidic chyme from the stomach so pancreatic enzymes can work.`,
    memoryTrick: `Lumi's Memory Trick: Remember Pancreatic Enzymes with **T-A-L**: **T**rypsin (Proteins), **A**mylase (Starch/Carbs), **L**ipase (Lipids/Fats)!`,
    quizQuestion: `**Quick Quiz on Human Digestion!** 🦉
**Bile juice** secreted by the liver does not contain any digestive enzymes, yet it is crucial for fat digestion. Can you explain why?`,
    quizAnswerKey: ['emulsif', 'fat', 'globule', 'droplet', 'surface area', 'alkaline', 'basic', 'lipase'],
    quizExplanation: `Spot on! **Bile salts** break down (emulsify) large fat globules into tiny droplets, dramatically increasing the surface area for the enzyme **lipase** to act, while also making the acidic food from the stomach **alkaline** so pancreatic enzymes can function!`
  },
  {
    keywords: ['periodic', 'atomic radius', 'ionization', 'electronegativity', 'electron affinity', 'effective nuclear'],
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
- **Nitrogen vs. Oxygen Ionization Energy**: **Nitrogen (\`2p³\`)** has a higher first ionization enthalpy than **Oxygen (\`2p⁴\`)** because Nitrogen has an extra-stable **half-filled \`2p\` subshell**.
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
    keywords: ['acid', 'base', 'salt', 'ph', 'indicator', 'neutralization', 'arrhenius', 'bronsted', 'titration', 'litmus'],
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
    keywords: ['heart', 'cardiac', 'ventricle', 'atrium', 'aorta', 'pulmonary', 'double circulation', 'artery', 'vein'],
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
    keywords: ['photosynthesis', 'chloroplast', 'chlorophyll', 'stomata', 'thylakoid', 'stroma', 'calvin', 'light reaction', 'dark reaction'],
    title: 'Photosynthesis, Stomata & Chloroplast Structure',
    subject: 'Biology',
    explain: `## Photosynthesis & Chloroplast Function

**Photosynthesis** is the process by which autotrophs (green plants) synthesize glucose from carbon dioxide and water using sunlight and **chlorophyll**:
- **Balanced Equation**: \`6CO2 + 12H2O --(Sunlight / Chlorophyll)--> C6H12O6 + 6O2 + 6H2O\`

### The 3 Key Events of Photosynthesis (NCERT Class 10):
1. **Absorption of light energy** by chlorophyll pigments in the **thylakoid membranes (grana)**.
2. **Conversion of light energy into chemical energy** (\`ATP\` and \`NADPH\`) and **photolysis (splitting) of water** (\`2H2O → 4H+ + 4e- + O2↑\`).
3. **Reduction of Carbon Dioxide (\`CO2\`)** into carbohydrates (glucose) in the **stroma** (Calvin Cycle / Dark Reaction).`,
    exam: `### High-Yield Exam Points:
- **Source of Oxygen (\`O2\`) released**: Comes from the **splitting of water (\`H2O\`)**, NOT from \`CO2\`.
- **Guard Cells & Stomata**: When water flows into guard cells, they become **turgid** and bow apart, **opening** the stomatal pore; when they lose water, they become **flaccid** and close the pore.`,
    memoryTrick: `Lumi's Memory Trick: **G-L / S-D** — **G**rana runs the **L**ight reaction; **S**troma runs the **D**ark (Calvin) reaction!`,
    quizQuestion: `**Quick Photosynthesis Quiz!** 🦉
During photosynthesis, does the oxygen gas (\`O2\`) released into the atmosphere come from Carbon Dioxide (\`CO2\`) or from Water (\`H2O\`)?`,
    quizAnswerKey: ['water', 'h2o', 'photolysis', 'splitting of water'],
    quizExplanation: `The released oxygen gas (\`O2\`) comes 100% from the **photolysis (light-driven splitting) of water (\`H2O\`)** in the thylakoid membrane!`
  },
  {
    keywords: ['neuron', 'synapse', 'reflex', 'brain', 'cerebrum', 'cerebellum', 'medulla', 'nervous', 'axon', 'dendrite'],
    title: 'Neuron, Reflex Arc & Human Brain (Control & Coordination)',
    subject: 'Biology',
    explain: `## Nervous System: Neuron, Synapse & Reflex Arc

### 1. Pathway of a Nerve Impulse in a Neuron:
- **Dendrites** (detect stimulus) → **Cell Body (Cyton)** → **Axon** (electrical impulse travels along myelin sheath) → **Nerve Ending (Axon Terminal)** → **Synapse** (neurotransmitters like *acetylcholine* cross the synaptic cleft to the next dendrite).

### 2. Reflex Arc (Rapid Automatic Response):
- \`Receptor (Skin) → Sensory Neuron → Spinal Cord (Relay Neuron) → Motor Neuron → Effector (Muscle)\`.
- Reflex arcs are processed in the **Spinal Cord** so the body can pull away from danger (like a hot pan) **before** the slow thinking part of the brain even finishes processing!

### 3. Major Parts of the Human Brain:
- **Forebrain (Cerebrum)**: Main thinking part; memory, voluntary actions, sight, hearing, hunger.
- **Midbrain**: Controls reflex movements of head, neck, and eye muscles.
- **Hindbrain**:
  - **Cerebellum**: Posture, balance, and precision of voluntary actions (walking, riding a bicycle).
  - **Medulla**: Involuntary actions (blood pressure, salivation, vomiting, heartbeat).
  - **Pons**: Regulates respiration.`,
    exam: `### High-Yield Exam Distinction:
- **Cerebrum vs. Cerebellum**: **Cerebrum** (Forebrain) handles conscious intelligence and memory; **Cerebellum** (Hindbrain) maintains **body balance and posture**.`,
    memoryTrick: `Lumi's Memory Trick: **Cere-BELL-um = BALANCE** (both have 'B' and 'L'!) and **Medulla = Automatic Must-Do's** (heartbeat, breathing, BP)!`,
    quizQuestion: `**Quick Nervous System Quiz!** 🦉
Which part of the **Hindbrain** is responsible for maintaining your **posture and balance** when riding a bicycle?`,
    quizAnswerKey: ['cerebellum', 'hindbrain'],
    quizExplanation: `The **Cerebellum** in the hindbrain controls posture, equilibrium, and fine motor coordination!`
  },
  {
    keywords: ['mirror', 'lens', 'refraction', 'reflection', 'focal', 'concave', 'convex', 'magnification', 'snell', 'prism', 'dispersion', 'myopia', 'hypermetropia'],
    title: 'Ray Optics: Mirrors, Lenses, Prism & Human Eye Defects',
    subject: 'Physics',
    explain: `## Ray Optics: Mirrors, Lenses & Dispersion

### 1. Core Formulas (with Cartesian Sign Convention):
- **Mirror Formula**: \`1/f = 1/v + 1/u\`  |  Magnification: \`m = -v/u = h'/h\`
- **Lens Formula**: \`1/f = 1/v - 1/u\`  |  Magnification: \`m = +v/u = h'/h\`
- **Power of a Lens**: \`P = 1 / f(in meters)\` — measured in **Dioptre (D)**.
- **Snell's Law of Refraction**: \`n1 · sin(i) = n2 · sin(r)\`.

### 2. Sign Convention Quick Rules:
- Object distance \`u\` is **always negative (\`-\`)**.
- Focal length \`f\` of a **Concave Mirror / Concave Lens** is **negative (\`-\`)**.
- Focal length \`f\` of a **Convex Mirror / Convex Lens** is **positive (\`+\`)**.`,
    exam: `### Human Eye Defects & Corrections:
- **Myopia (Near-sightedness)**: Image forms *in front of* the retina → Corrected using a **Concave (Diverging) Lens** of negative power.
- **Hypermetropia (Far-sightedness)**: Image forms *behind* the retina → Corrected using a **Convex (Converging) Lens** of positive power.`,
    memoryTrick: `Lumi's Memory Trick: **M-C-N**: **M**yopia is fixed by a **C**oncave lens (**N**egative power)! And for prism dispersion: **VIBGYOR** — **V**iolet bends the most (shortest wavelength), **R**ed bends the least (longest wavelength)!`,
    quizQuestion: `**Quick Optics Quiz!** 🦉
A student can read a book held close to their eyes clearly, but cannot see the classroom blackboard far away. Name the eye defect and the type of lens needed to correct it!`,
    quizAnswerKey: ['myopia', 'near', 'short', 'concave', 'diverging'],
    quizExplanation: `That defect is **Myopia (Near-sightedness)**, where light focuses in front of the retina. It is corrected using a **Concave (diverging) lens** of suitable focal length!`
  },
  {
    keywords: ['redox', 'oxidation', 'reduction', 'displacement', 'decomposition', 'combination', 'exothermic', 'endothermic', 'rancidity', 'corrosion'],
    title: 'Chemical Reactions, Equations & Redox Processes',
    subject: 'Chemistry',
    explain: `## Types of Chemical Reactions & Redox Mastery

1. **Combination Reaction**: Two or more reactants combine to form a single product (\`CaO + H2O → Ca(OH)2 + Heat\`).
2. **Decomposition Reaction**: A single reactant breaks down into simpler products via heat (**Thermal**), light (**Photolytic**, e.g. \`2AgCl → 2Ag + Cl2\`), or electricity (**Electrolytic**).
3. **Displacement Reaction**: A more reactive metal displaces a less reactive metal from its salt solution (\`Fe + CuSO4 → FeSO4 + Cu\`).
4. **Double Displacement (Precipitation)**: Exchange of ions between two aqueous reactants (\`Na2SO4 + BaCl2 → BaSO4↓ (white ppt) + 2NaCl\`).
5. **Redox (Oxidation–Reduction)**:
   - **Oxidation**: Gain of Oxygen OR Loss of Hydrogen OR Loss of Electrons.
   - **Reduction**: Loss of Oxygen OR Gain of Hydrogen OR Gain of Electrons.`,
    exam: `### High-Yield Exam Points:
- **Oxidizing Agent**: The substance that *gets reduced* (gives oxygen / accepts electrons).
- **Reducing Agent**: The substance that *gets oxidized* (removes oxygen / donates electrons).`,
    memoryTrick: `Lumi's Memory Trick: **OIL RIG** — **O**xidation **I**s **L**oss of electrons; **R**eduction **I**s **G**ain of electrons!`,
    quizQuestion: `**Quick Redox Quiz!** 🦉
In the reaction \`CuO + H2 → Cu + H2O\`, which substance is getting **oxidized** and which substance is getting **reduced**?`,
    quizAnswerKey: ['h2', 'hydrogen', 'cuo', 'copper'],
    quizExplanation: `**Hydrogen (\`H2\`)** gains oxygen to become \`H2O\`, so **\`H2\` is oxidized** (and acts as the reducing agent). **Copper(II) oxide (\`CuO\`)** loses oxygen to become \`Cu\`, so **\`CuO\` is reduced**!`
  },
  {
    keywords: ['mitosis', 'meiosis', 'cell division', 'prophase', 'metaphase', 'anaphase', 'telophase', 'chromosome', 'cytokinesis'],
    title: 'Cell Division: Mitosis vs. Meiosis',
    subject: 'Biology',
    explain: `## Cell Division: Mitosis vs. Meiosis

### 1. Mitosis (Equational Division — Somatic Cells):
- **Purpose**: Growth, tissue repair, and asexual reproduction.
- **Outcome**: \`1 Diploid (2n) Parent Cell → 2 Identical Diploid (2n) Daughter Cells\`.
- **4 Stages (PMAT)**:
  1. **Prophase**: Chromatin condenses into visible chromosomes; nuclear envelope breaks down.
  2. **Metaphase**: Chromosomes align along the **equatorial plate**; spindle fibers attach to kinetochores.
  3. **Anaphase**: Sister chromatids separate at the centromere and move to opposite poles.
  4. **Telophase**: Two new nuclear membranes form around the separated sets, followed by **Cytokinesis**.

### 2. Meiosis (Reductional Division — Germ Cells / Gametes):
- **Purpose**: Production of gametes (sperm, egg, pollen) for sexual reproduction.
- **Outcome**: \`1 Diploid (2n) Germ Cell → 4 Genetically Diverse Haploid (n) Gametes\`.
- **Crossing Over**: Occurs in **Pachytene of Prophase I**, creating genetic variation!`,
    exam: `### High-Yield Exam Points:
- **Best stage to count & study chromosome morphology**: **Metaphase** (chromosomes are thickest, shortest, and aligned at the equator).
- **Stage where centromeres split**: **Anaphase** in Mitosis (and **Anaphase II** in Meiosis).`,
    memoryTrick: `Lumi's Memory Trick: **P-M-A-T**: **P**rophase (**P**repare), **M**etaphase (**M**iddle equator), **A**naphase (**A**part), **T**elophase (**T**wo nuclei)!`,
    quizQuestion: `**Quick Cell Division Quiz!** 🦉
During which stage of **Mitosis** do chromosomes line up along the **equatorial plate**, making it the best stage to study chromosome shape?`,
    quizAnswerKey: ['metaphase', 'middle', 'equator'],
    quizExplanation: `**Metaphase**! During metaphase, chromosomes reach maximum condensation and align along the equatorial (metaphase) plate!`
  },
  {
    keywords: ['equation of motion', 'equations of motion', 'third equation of motion', 'second equation of motion', 'first equation of motion', 'v^2 - u^2', 'v2 - u2', '2as', 'ut + 1/2', 'v = u + at'],
    title: 'Derivation of the Three Equations of Motion (Class 9 & 11 Physics)',
    subject: 'Physics',
    explain: `## Step-by-Step Derivation of the Equations of Motion

Consider a body moving in a straight line with **uniform acceleration (\`a\`)**:
- \`u\` = Initial velocity (at time \`t = 0\`)
- \`v\` = Final velocity (after time \`t\`)
- \`s\` = Displacement covered in time \`t\`

---

### 1. First Equation of Motion: \`v = u + at\` (Velocity–Time Relation)
- By definition, **acceleration (\`a\`)** is the rate of change of velocity:
  \`a = (Change in velocity) / (Time taken) = (v - u) / t\`
- Multiply both sides by \`t\`:
  \`a · t = v - u\`
- Rearranging gives the **First Equation of Motion**:
  **\`v = u + at\`**  *(Equation 1)*

---

### 2. Second Equation of Motion: \`s = ut + ½at²\` (Position–Time Relation)
- For uniform acceleration, **Average Velocity** is:
  \`v_avg = (u + v) / 2\`
- Total displacement \`s = Average Velocity × Time\`:
  \`s = ((u + v) / 2) × t\`
- Substitute \`v = u + at\` from *Equation 1*:
  \`s = ((u + u + at) / 2) × t = ((2u + at) / 2) × t\`
- Distribute \`t\` and split the fraction:
  **\`s = ut + ½at²\`**  *(Equation 2)*

---

### 3. Third Equation of Motion: \`v² - u² = 2as\` (Position–Velocity Relation)

#### Method A: Algebraic / Substitution Method
1. Start with the displacement formula using average velocity:
   \`s = ((v + u) / 2) × t\`
2. From the First Equation of Motion (\`v = u + at\`), express time \`t\` in terms of \`v, u, a\`:
   \`t = (v - u) / a\`
3. Substitute \`t = (v - u) / a\` into the displacement equation:
   \`s = ((v + u) / 2) × ((v - u) / a)\`
4. Multiply the numerators using the algebraic identity \`(v + u)(v - u) = v² - u²\`:
   \`s = (v² - u²) / (2a)\`
5. Multiply both sides by \`2a\`:
   **\`v² - u² = 2as\`**  *(or \`2as = v² - u²\`)*

#### Method B: Graphical Method (Velocity–Time Graph)
1. In a velocity–time (\`v–t\`) graph for uniform acceleration, the displacement \`s\` equals the **area of the trapezium OABC** under the line:
   \`s = ½ × (Sum of parallel sides) × (Height)\`
   \`s = ½ × (u + v) × t\`
2. The slope of the velocity–time graph gives acceleration \`a = (v - u) / t\`, which means:
   \`t = (v - u) / a\`
3. Substituting \`t\` into the trapezium area formula:
   \`s = ½ × (v + u) × ((v - u) / a) = (v² - u²) / (2a)\`
4. Rearranging gives:
   **\`v² - u² = 2as\`**`,
    solver: `### When to Use Which Equation in Numericals:
- **No displacement (\`s\`) mentioned?** → Use \`v = u + at\`
- **No final velocity (\`v\`) mentioned?** → Use \`s = ut + ½at²\`
- **No time (\`t\`) mentioned?** → Use \`v² - u² = 2as\``,
    exam: `### High-Yield Exam Tips for Full Marks:
- Always begin your derivation by **defining the symbols** (\`u\`, \`v\`, \`a\`, \`t\`, \`s\`) and stating **"for a body moving with uniform acceleration"**.
- If the exam asks for the **Graphical Derivation**, draw a neat velocity–time trapezium graph with \`u\` on the y-axis at \`t = 0\` and \`v\` at time \`t\`, and write \`s = Area of trapezium OABC\`.`,
    memoryTrick: `Lumi's Memory Trick: To derive the **3rd Equation (\`v² - u² = 2as\`)**, notice that **time \`t\` is missing**! So just take \`s = ((v + u)/2) · t\` and replace \`t\` with \`(v - u)/a\` — then \`(v + u)(v - u)\` magically becomes \`v² - u²\`!`,
    quizQuestion: `**Quick Kinematics Quiz!** 🦉
In the derivation of the third equation of motion (\`v² - u² = 2as\`), which variable do we eliminate by substituting \`t = (v - u) / a\`?`,
    quizAnswerKey: ['time', 't'],
    quizExplanation: `We eliminate **time (\`t\`)**! That is why \`v² - u² = 2as\` is called the **Position–Velocity relation** and is super useful whenever a problem doesn't give you the time taken!`
  },
  {
    keywords: ['newton', 'inertia', 'momentum', 'impulse', 'action and reaction', 'force', 'f = ma', 'laws of motion'],
    title: 'Newton’s Laws of Motion, Momentum & Impulse',
    subject: 'Physics',
    explain: `## Newton's Three Laws of Motion

1. **First Law (Law of Inertia)**:
   - Every object stays at rest or in uniform straight-line motion unless acted upon by an unbalanced external force.
   - **Mass** is the direct measure of an object's **inertia**.
2. **Second Law (Force & Rate of Change of Momentum)**:
   - Linear momentum \`p = m · v\` (SI unit: \`kg·m/s\`).
   - The net external force equals the rate of change of momentum: \`F = Δp / Δt = m · (v - u) / t = m · a\` (SI unit: **Newton, N**).
3. **Third Law (Action & Reaction)**:
   - For every action force, there is an **equal and opposite** reaction force (\`F_AB = -F_BA\`) acting simultaneously on **two different bodies**.`,
    solver: `### Key Kinematics & Dynamics Equations:
- \`v = u + a·t\`
- \`s = u·t + ½·a·t²\`
- \`v² - u² = 2·a·s\`
- **Conservation of Momentum (Collisions / Recoil)**: \`m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂\``,
    exam: `### Classic Board Exam Conceptual Question:
- **Why does a cricketer pull their hands backward while catching a fast ball?**
  - Pulling hands back **increases the time interval (\`Δt\`)** taken to bring the ball's momentum to zero. By \`F = Δp / Δt\`, a larger \`Δt\` drastically **reduces the impact force \`F\`** on the hands!`,
    memoryTrick: `Lumi's Memory Trick: Action and Reaction forces NEVER cancel each other out because they always act on **two different objects**!`,
    quizQuestion: `**Quick Physics Quiz!** 🦉
If Action and Reaction forces are always equal and opposite (Newton's 3rd Law), why don't they cancel each other out?`,
    quizAnswerKey: ['different', 'two bodies', 'separate', 'objects'],
    quizExplanation: `Because action and reaction forces always act on **two different bodies**, never on the same body!`
  },
  {
    keywords: ['study', 'pomodoro', 'schedule', 'routine', 'revision', 'memorize', 'focus', 'procrastinat', 'time table', 'timetable', 'active recall'],
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

function tryAnalyzeElementOrFormula(message: string): string | null {
  const lower = message.toLowerCase();

  // 1. Chemical Formula Atomicity & Molar Mass Calculator (e.g. H2SO4, CaCO3, C6H12O6, P4, S8, O3, NH3, CH4)
  const formulaTokens = message.match(/\b([A-Z][a-z]?\d*){2,}\b|\b(O3|P4|S8|N2|O2|H2|Cl2|F2|Br2|I2|C60)\b/g);
  if (
    formulaTokens &&
    formulaTokens.length > 0 &&
    (lower.includes('atomicity') ||
      lower.includes('molar mass') ||
      lower.includes('molecular mass') ||
      lower.includes('atoms in') ||
      lower.includes('formula') ||
      formulaTokens[0].length >= 2)
  ) {
    const formula = formulaTokens[0];
    const atomRegex = /([A-Z][a-z]?)(\d*)/g;
    let match: RegExpExecArray | null;
    const breakdown: Array<{ symbol: string; name: string; count: number; mass: number }> = [];
    let validFormula = true;

    while ((match = atomRegex.exec(formula)) !== null) {
      if (!match[1]) continue;
      const sym = match[1];
      const count = match[2] ? parseInt(match[2], 10) : 1;
      const el = ELEMENTS_DATA.find((e) => e.symbol === sym);
      if (!el) {
        validFormula = false;
        break;
      }
      breakdown.push({ symbol: sym, name: el.name, count, mass: el.atomicMass });
    }

    if (validFormula && breakdown.length > 0 && (breakdown.length > 1 || breakdown[0].count > 1)) {
      const totalAtomicity = breakdown.reduce((sum, item) => sum + item.count, 0);
      const totalMolarMass = breakdown.reduce((sum, item) => sum + item.count * item.mass, 0);
      const atomicityType =
        totalAtomicity === 1
          ? 'Monoatomic'
          : totalAtomicity === 2
          ? 'Diatomic'
          : totalAtomicity === 3
          ? 'Triatomic'
          : totalAtomicity === 4
          ? 'Tetra-atomic'
          : 'Polyatomic';

      return `## Chemical Formula Analysis: \`${formula}\`

### 1. Atomicity (Total Number of Atoms in 1 Molecule):
- **Atomicity of \`${formula}\` = \`${totalAtomicity}\` (${atomicityType})**
${breakdown
  .map((b) => `- **${b.name} (\`${b.symbol}\`)**: \`${b.count}\` atom${b.count > 1 ? 's' : ''}`)
  .join('\n')}

### 2. Step-by-Step Molar Mass Calculation:
${breakdown
  .map(
    (b) =>
      `- **${b.symbol}**: \`${b.count} × ${b.mass} u = ${(b.count * b.mass).toFixed(3)} u\``
  )
  .join('\n')}
- **Total Molar Mass of \`${formula}\` = \`${totalMolarMass.toFixed(2)} g/mol\`**

Lumi's Memory Trick: **Atomicity** is simply the sum of all atomic subscripts in one molecule (\`${breakdown.map((b) => b.count).join(' + ')} = ${totalAtomicity}\`), while **Molar Mass** multiplies each subscript by its atomic mass!`;
    }
  }

  // 2. Check if user is asking about a specific chemical element from our 118-element database
  const matchedElement = ELEMENTS_DATA.find((el) => {
    const nameRegex = new RegExp(`\\b${el.name.toLowerCase()}\\b`, 'i');
    const zRegex = new RegExp(`\\batomic number\\s+${el.number}\\b|\\bz\\s*=\\s*${el.number}\\b`, 'i');
    return nameRegex.test(lower) || zRegex.test(lower);
  });

  if (matchedElement && (lower.includes(matchedElement.name.toLowerCase()) || lower.includes('atomic number'))) {
    const shellLabels = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
    const shellStr = matchedElement.shells
      .map((count, i) => `${shellLabels[i]}=${count}`)
      .join(', ');

    return `## Element Profile: ${matchedElement.name} (\`${matchedElement.symbol}\`, Atomic Number \`Z = ${matchedElement.number}\`)

${matchedElement.description}

### 1. Atomic & Electronic Structure
- **Atomic Number (\`Z\`)**: \`${matchedElement.number}\` (${matchedElement.number} protons, ${matchedElement.number} electrons)
- **Atomic Mass**: \`${matchedElement.atomicMass} u\`
- **Block, Group & Period**: **${matchedElement.block.toUpperCase()}-block** · Group \`${matchedElement.group || 'f-block'}\` · Period \`${matchedElement.period}\`
- **Shell Distribution (Bohr Model)**: \`${shellStr}\`
- **Subshell Electronic Configuration**: \`${matchedElement.electronConfiguration}\` (Short: \`${matchedElement.electronConfigurationShort}\`)

### 2. Valency & Chemical Properties
- **Valence Electrons**: \`${matchedElement.valenceElectrons}\`
- **Valency**: \`${matchedElement.valency.join(', ')}\` — ${matchedElement.valencyDescription}
- **Phase at STP**: ${matchedElement.phase}
- **Electronegativity (Pauling)**: \`${matchedElement.electronegativity ?? 'N/A'}\`  |  **1st Ionization Energy**: \`${matchedElement.ionizationEnergy ?? 'N/A'} kJ/mol\`

### 3. Real-World Applications
${matchedElement.applications.map((app) => `- ${app}`).join('\n')}

Lumi's Study Tip: Open the **Atomic Foundation** tab and select **${matchedElement.name} (\`${matchedElement.symbol}\`)** on the interactive Periodic Table to inspect its 3D Bohr shells and quantum orbitals!`;
  }

  return null;
}

function trySolveNumericalProblem(message: string): string | null {
  const lower = message.toLowerCase();

  // 1. Projectile Motion Solver
  if (lower.includes('projectile') || (lower.includes('angle') && (lower.includes('m/s') || lower.includes('velocity') || lower.includes('speed') || lower.includes('launch')))) {
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

  // 3. Quadratic Equation Solver (e.g. x^2 - 5x + 6 = 0)
  const quadMatch = message.replace(/\s+/g, '').match(/([+-]?\d*)x\^?2([+-]\d*)x([+-]\d+)=0/i);
  if (quadMatch || lower.includes('quadratic')) {
    const a = quadMatch ? (quadMatch[1] === '' || quadMatch[1] === '+' ? 1 : quadMatch[1] === '-' ? -1 : parseFloat(quadMatch[1])) : 1;
    const b = quadMatch ? (quadMatch[2] === '+' ? 1 : quadMatch[2] === '-' ? -1 : parseFloat(quadMatch[2])) : -5;
    const c = quadMatch ? parseFloat(quadMatch[3]) : 6;
    const D = b * b - 4 * a * c;

    return `## Step-by-Step Quadratic Equation Solution

### 1. Standard Form (\`ax² + bx + c = 0\`):
- Given: \`a = ${a}\`, \`b = ${b}\`, \`c = ${c}\`

### 2. Discriminant (\`D = b² - 4ac\`):
- \`D = (${b})² - 4(${a})(${c}) = ${b * b} - ${4 * a * c} = ${D}\`

### 3. Roots by Quadratic Formula (\`x = (-b ± √D) / (2a)\`):
${
  D >= 0
    ? `- \`x₁ = (${-b} + √${D}) / ${2 * a} = ${((-b + Math.sqrt(D)) / (2 * a)).toFixed(2)}\`
- \`x₂ = (${-b} - √${D}) / ${2 * a} = ${((-b - Math.sqrt(D)) / (2 * a)).toFixed(2)}\``
    : `- Since \`D < 0\`, the roots are complex conjugates: \`x = ${(-b / (2 * a)).toFixed(2)} ± ${(Math.sqrt(-D) / (2 * a)).toFixed(2)}i\``
}

Lumi's Study Tip: Always check the sign of the discriminant \`D = b² - 4ac\` first: \`D > 0\` gives 2 distinct real roots, \`D = 0\` gives 2 equal real roots, and \`D < 0\` gives no real roots!`;
  }

  return null;
}

/**
 * Extracts a clean search query from a natural-language student question
 * (e.g. "What is Atomicity?" -> "Atomicity")
 */
function extractCleanTopicQuery(question: string): string {
  return question
    .replace(/^(hi|hello|hey|lumi|please|can you|could you|would you|help me)\s+/gi, '')
    .replace(
      /^(what\s+is\s+(an?\s+|the\s+)?(role\s+of\s+|function\s+of\s+|formula\s+of\s+|meaning\s+of\s+|importance\s+of\s+|use\s+of\s+|principle\s+of\s+|cause\s+of\s+)?|what\s+are\s+(the\s+)?|what\s+happens\s+(when|if|during)\s+|why\s+(is|are|do|does|did|can|should)\s+(an?\s+|the\s+)?|how\s+(does|do|is|are|can|many|much|to)\s+(an?\s+|the\s+)?|who\s+(discovered|invented|proposed|found|was|is)\s+(an?\s+|the\s+)?|when\s+(was|did|is)\s+|where\s+(is|are|does|do)\s+|define\s+(the\s+)?|explain\s+(to\s+me\s+)?(why\s+|how\s+|what\s+|about\s+|the\s+)?|tell\s+me\s+about\s+|describe\s+(the\s+)?|state\s+(and\s+explain\s+)?(the\s+)?|write\s+(a\s+)?(short\s+)?note(s)?\s+on\s+|give\s+(me\s+)?(an?\s+)?(example|notes|formula|definition)\s+(of|on|for)\s+|derive\s+(the\s+)?)/i,
      ''
    )
    .replace(
      /\s+(and\s+(its|their)\s+(formula|uses|applications|examples|types|derivation|importance|function|functions)|with\s+(an?\s+)?(example|examples|formula|diagram)|for\s+class\s+\d+|in\s+ncert|work|works|happen|happens|in\s+science|in\s+chemistry|in\s+physics|in\s+biology|in\s+mathematics|in\s+detail|simply|step\s+by\s+step|in\s+short|briefly)\??$/i,
      ''
    )
    .replace(/[?!.]+$/g, '')
    .trim();
}

/**
 * Cleans LaTeX math delimiters and \frac / superscript / subscript commands from LLM outputs
 * into readable backtick/Unicode math so formulas render cleanly across the entire website.
 */
export function cleanAIMathFormatting(raw: string): string {
  if (!raw) return '';

  let out = raw
    // Strip $$ ... $$ inside backticks first: `$$ ... $$` -> `...`
    .replace(/`\s*\$\$\s*([\s\S]*?)\s*\$\$\s*`/g, (_m, inner) => `\`${cleanTexSymbols(inner)}\``)
    .replace(/`\s*\$\s*([^$`\n]+?)\s*\$\s*`/g, (_m, inner) => `\`${cleanTexSymbols(inner)}\``)
    // Display math blocks \[ ... \] and $$ ... $$
    .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_m, inner) => `\n- \`${cleanTexSymbols(inner)}\`\n`)
    .replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (_m, inner) => `\`${cleanTexSymbols(inner)}\``)
    // Inline math \( ... \) and $ ... $
    .replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, (_m, inner) => `\`${cleanTexSymbols(inner)}\``)
    .replace(/\$([^$\n]+?)\$/g, (_m, inner) => `\`${cleanTexSymbols(inner)}\``);

  // Clean any remaining LaTeX inside single-line backticks or bare \frac / \sqrt / \times in plain text
  out = out.replace(/`([^`\n]+)`/g, (_m, inner) => `\`${cleanTexSymbols(inner)}\``);
  if (/\\(?:d?frac|sqrt|times|cdot|text|left|right|alpha|beta|gamma|theta|Delta|pi|Omega)/.test(out)) {
    out = cleanTexSymbols(out, true);
  }

  return out.replace(/\n{3,}/g, '\n\n').trim();
}

export function cleanTexSymbols(tex: string, preserveNewlines = false): string {
  let s = tex
    .replace(/\$\$/g, '')
    .replace(/\\tag\{[^}]*\}/g, '')
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\\mathrm\{([^{}]*)\}/g, '$1')
    .replace(/\\mathbf\{([^{}]*)\}/g, '$1')
    .replace(/\\left\s*([()[\]|])/g, '$1')
    .replace(/\\right\s*([()[\]|])/g, '$1')
    .replace(/\\left|\\right/g, '');

  // Convert superscripts and subscripts BEFORE \frac so inner braces like v^{2} don't block \frac matching
  const supMap: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '+': '⁺',
    '-': '⁻',
    n: 'ⁿ'
  };
  const subMap: Record<string, string> = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
    '+': '₊',
    '-': '₋'
  };

  s = s
    .replace(/\^\{([0-9+-n]+)\}/g, (_m, exp: string) =>
      exp
        .split('')
        .map((c) => supMap[c] || c)
        .join('')
    )
    .replace(/\^([0-9])/g, (_m, d: string) => supMap[d] || `^${d}`)
    .replace(/\^\{([^{}]+)\}/g, '^($1)')
    .replace(/_\{([0-9+-]+)\}/g, (_m, sub: string) =>
      sub
        .split('')
        .map((c) => subMap[c] || c)
        .join('')
    )
    .replace(/_([0-9])/g, (_m, d: string) => subMap[d] || `_${d}`)
    .replace(/_\{([^{}]+)\}/g, '_$1');

  // Resolve \frac, \dfrac, \tfrac iteratively (handles nested fractions)
  for (let i = 0; i < 4; i++) {
    s = s.replace(/\\[dt]?frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, (_m, num: string, den: string) => {
      const n = num.trim();
      const d = den.trim();
      if (n === '1' && d === '2') return '½';
      if (n === '1' && d === '3') return '⅓';
      if (n === '1' && d === '4') return '¼';
      if (n === '3' && d === '4') return '¾';
      const nWrap = /[+\-*/\s]/.test(n) ? `(${n})` : n;
      const dWrap = /[+\-*/\s]/.test(d) || d.length > 1 ? `(${d})` : d;
      return `${nWrap} / ${dWrap}`;
    });
  }

  s = s
    .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\mp/g, '∓')
    .replace(/\\leq|\\le/g, '≤')
    .replace(/\\geq|\\ge/g, '≥')
    .replace(/\\neq|\\ne/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\propto/g, '∝')
    .replace(/\\infty/g, '∞')
    .replace(/\\rightarrow|\\to|\\longrightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\rightleftharpoons/g, '⇌')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\nu/g, 'ν')
    .replace(/\\pi/g, 'π')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\,/g, ' ')
    .replace(/\\;/g, ' ')
    .replace(/\\quad|\\qquad/g, '  ');

  if (!preserveNewlines) {
    s = s.replace(/\s+/g, ' ').trim();
  }
  return s;
}

/**
 * Calls Gemini's Free Flash AI Model directly via @google/genai when deployed to GitHub Pages
 * (if GEMINI_API_KEY / VITE_GEMINI_API_KEY is embedded at build time) and falls back to
 * zero-key cloud AI inference so Lumi is always fast and intelligent on static hosts.
 */
export async function fetchClientGeminiFlashAnswer(req: LumiLocalRequest): Promise<string | null> {
  const modeInstructions: Record<string, string> = {
    explain:
      'Mode: Explain Simply. Break the concept down step-by-step using clear headings, everyday analogies, worked derivations/examples when relevant, and end with a line starting with "Lumi\'s Memory Trick: ".',
    solver:
      'Mode: Step-by-Step Solver. State the given quantities/definitions, write the exact formula, show every algebraic or numerical step clearly with units, and highlight the final answer.',
    exam:
      'Mode: Exam & NCERT Revision Coach. Provide the exact textbook derivation/definition, high-yield board exam points, common pitfalls to avoid, and end with "Lumi\'s Study Tip: ".',
    quiz:
      'Mode: Interactive Quiz Coach. Ask 1 engaging question or evaluate the student\'s previous answer warmly and explain the solution.'
  };

  const systemPrompt = `You are Lumi, an encouraging NCERT & STEM tutor for ${req.gradeBand} (${req.subject}).
${modeInstructions[req.studyMode] || modeInstructions.explain}
Keep your explanation clear, structured, and concise (120–220 words) using ## headings, bullet points (- ), and single backticks for formulas like \`s = (v² - u²) / (2a)\` (never use LaTeX $$ or \\frac).`;

  // 1. Try Official @google/genai SDK with Gemini Free Flash Models ONLY if a real browser AIzaSy* key is configured
  let apiKey = '';
  try {
    apiKey =
      process.env.GEMINI_API_KEY ||
      ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY ?? '');
  } catch {
    apiKey = '';
  }

  if (apiKey && apiKey.trim().startsWith('AIza') && apiKey.trim().length >= 35) {
    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey.trim()
      });
      const contents = [
        ...req.history.slice(-4).map((turn) => ({
          role: turn.role,
          parts: [{ text: turn.text.slice(0, 400) }]
        })),
        {
          role: 'user' as const,
          parts: [{ text: req.message.trim() }]
        }
      ];

      const freeGeminiModels = [
        'gemini-2.5-flash',
        'gemini-3-flash-preview',
        'gemini-flash-latest'
      ];
      for (const modelName of freeGeminiModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.65
            }
          });
          if (response.text && response.text.trim().length > 15) {
            return cleanAIMathFormatting(response.text.trim());
          }
        } catch {
          // Try next free Gemini Flash model
        }
      }
    } catch {
      // Fall through to zero-key cloud AI relay
    }
  }

  // 2. Zero-Key HuggingFace Dedicated TGI Relay (fast ~3s, CORS-enabled for *.github.io)
  try {
    const hfPrompt = `${systemPrompt}\n\nStudent Question: ${req.message.trim()}\n\nLumi's Response:`;
    const postCtrl = new AbortController();
    const postTimer = setTimeout(() => postCtrl.abort(), 10000);
    const postRes = await fetch(
      'https://huggingface-projects-llama-3-2-3b-instruct.hf.space/gradio_api/call/generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [hfPrompt, 600, 0.6, 0.9, 50, 1.2]
        }),
        signal: postCtrl.signal
      }
    );
    clearTimeout(postTimer);

    if (postRes.ok) {
      const postJson = await postRes.json();
      const eventId = postJson?.event_id;
      if (eventId) {
        const streamCtrl = new AbortController();
        const streamTimer = setTimeout(() => streamCtrl.abort(), 18000);
        const streamRes = await fetch(
          `https://huggingface-projects-llama-3-2-3b-instruct.hf.space/gradio_api/call/generate/${eventId}`,
          { signal: streamCtrl.signal }
        );
        clearTimeout(streamTimer);

        if (streamRes.ok) {
          const sseText = await streamRes.text();
          // Extract the last complete data: [...] payload from the SSE stream
          const dataMatches = [...sseText.matchAll(/^data:\s*(\[[\s\S]*?\])\s*$/gm)];
          for (let i = dataMatches.length - 1; i >= 0; i--) {
            try {
              const parsed = JSON.parse(dataMatches[i][1]);
              if (Array.isArray(parsed) && typeof parsed[0] === 'string' && parsed[0].trim().length > 35) {
                return cleanAIMathFormatting(parsed[0].trim());
              }
            } catch {
              // Check previous SSE data frame
            }
          }
        }
      }
    }
  } catch {
    // Fall through to secondary cloud relay
  }

  // 3. Secondary Cloud AI Relay (Pollinations OpenAI endpoint with short 8s timeout)
  const compactHistory = req.history.slice(-2).map((h) => ({
    role: h.role === 'model' ? 'assistant' : 'user',
    content: h.text.slice(0, 300)
  }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...compactHistory,
    { role: 'user', content: req.message }
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        model: 'openai-fast',
        messages,
        temperature: 0.6
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const rawText = (await response.text()).trim();
      if (rawText.startsWith('{')) {
        const data = JSON.parse(rawText);
        const aiContent = data?.choices?.[0]?.message?.content;
        if (typeof aiContent === 'string' && aiContent.trim().length > 20) {
          return cleanAIMathFormatting(aiContent);
        }
      }
    }
  } catch {
    // Fall through to Wikipedia / Local NCERT engine
  }

  return null;
}

/**
 * Live AI + Academic Knowledge Engine for Static Hosts (GitHub Pages) & Server Fallback.
 */
export async function fetchLiveAcademicAnswer(req: LumiLocalRequest): Promise<string | null> {
  // 1. Call Gemini Free Flash Model (@google/genai) + Zero-Key Cloud AI Relay FIRST
  const generativeAIReply = await fetchClientGeminiFlashAnswer(req);
  if (generativeAIReply) return generativeAIReply;

  // 2. Offline / Fallback: Check our curated NCERT/STEM library (derivations, atomicity, 118 elements, numericals)
  const localMatch = findExactLocalMatch(req);
  if (localMatch) return localMatch;

  // 3. Fallback if AI endpoint is unreachable: Check "difference between X and Y" via Wikipedia CORS API
  const diffMatch = req.message.match(
    /(?:difference\s+between|compare|distinguish\s+between)\s+(.+?)\s+and\s+([^?.!]+)|([^\s?.!]+(?:\s+[^\s?.!]+){0,2})\s+vs\.?\s+([^\s?.!]+(?:\s+[^\s?.!]+){0,2})/i
  );
  if (diffMatch) {
    const termA = (diffMatch[1] || diffMatch[3] || '').trim();
    const termB = (diffMatch[2] || diffMatch[4] || '').trim();
    if (termA.length >= 2 && termB.length >= 2) {
      try {
        const fetchWikiIntro = async (term: string) => {
          const sUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
            term
          )}&srlimit=1&format=json&origin=*`;
          const sRes = await fetch(sUrl);
          const sData = await sRes.json();
          const topTitle = sData?.query?.search?.[0]?.title;
          if (!topTitle) return null;

          const eUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(
            topTitle
          )}&format=json&origin=*`;
          const eRes = await fetch(eUrl);
          const eData = await eRes.json();
          const page = Object.values(eData?.query?.pages || {})[0] as
            | { title?: string; extract?: string }
            | undefined;
          return page?.extract
            ? { title: page.title || topTitle, extract: page.extract.trim() }
            : null;
        };

        const [infoA, infoB] = await Promise.all([fetchWikiIntro(termA), fetchWikiIntro(termB)]);
        if (infoA && infoB) {
          const bulletsA = infoA.extract
            .split(/(?<=\.)\s+/)
            .filter((s) => s.length > 20)
            .slice(0, 3)
            .map((s) => `- ${s}`)
            .join('\n');
          const bulletsB = infoB.extract
            .split(/(?<=\.)\s+/)
            .filter((s) => s.length > 20)
            .slice(0, 3)
            .map((s) => `- ${s}`)
            .join('\n');

          return `## Comparison: ${infoA.title} vs. ${infoB.title} (${req.gradeBand})

### 1. ${infoA.title}
${bulletsA}

### 2. ${infoB.title}
${bulletsB}

Lumi's Study Tip: In board exams, always write "Difference Between" answers in a **two-column table** and include 1 concrete example for both **${infoA.title}** and **${infoB.title}**!`;
        }
      } catch {
        // Fall through to single-topic search
      }
    }
  }

  const cleanTopic = extractCleanTopicQuery(req.message);
  if (!cleanTopic || cleanTopic.length < 2) return null;

  try {
    // 1. Search Wikipedia API with origin=* (CORS enabled for all static websites including GitHub Pages)
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      cleanTopic
    )}&srlimit=3&format=json&origin=*`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const results: Array<{ title: string; snippet: string }> = searchData?.query?.search || [];
    if (results.length === 0) return null;

    // Pick the best academic match: prefer exact title match first, then science/STEM match
    const cleanLower = cleanTopic.toLowerCase();
    const bestResult =
      results.find((r) => r.title.toLowerCase() === cleanLower) ||
      results.find((r) => cleanLower.includes(r.title.toLowerCase()) || r.title.toLowerCase().includes(cleanLower.split(/\s+/)[0])) ||
      results.find((r) =>
        /(chemistry|physics|biology|mathematics|atom|molecule|cell|force|energy|law|theorem)/i.test(
          r.title + ' ' + r.snippet
        )
      ) ||
      results[0];

    // 2. Fetch up to 3,200 chars of plain-text extract (not restricted to short disambiguation intros)
    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exchars=3200&explaintext=1&redirects=1&titles=${encodeURIComponent(
      bestResult.title
    )}&format=json&origin=*`;

    const extractRes = await fetch(extractUrl);
    if (!extractRes.ok) return null;
    const extractData = await extractRes.json();
    const pages = extractData?.query?.pages || {};
    const firstPage = Object.values(pages)[0] as { title?: string; extract?: string } | undefined;
    const rawExtract = firstPage?.extract?.trim();

    if (!rawExtract || rawExtract.length < 40) return null;

    // Clean section markers like "== History ==" from full-text extract
    const cleanedParagraphs = rawExtract
      .replace(/==+\s*[^=]+\s*==+/g, '\n')
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 30 && !/may refer to:/i.test(p));

    const leadParagraph = cleanedParagraphs[0] || rawExtract;
    const additionalSentences = cleanedParagraphs
      .slice(1, 5)
      .flatMap((p) => p.split(/(?<=\.)\s+/))
      .filter((s) => s.length > 25 && s.length < 320)
      .slice(0, 6);

    const keyPointsBullets =
      additionalSentences.length > 0
        ? additionalSentences.map((s) => `- ${cleanAIMathFormatting(s)}`).join('\n')
        : leadParagraph
            .split(/(?<=\.)\s+/)
            .slice(1, 5)
            .map((s) => `- ${cleanAIMathFormatting(s)}`)
            .join('\n');

    return `## ${firstPage?.title || bestResult.title} (${req.subject} · ${req.gradeBand})

${cleanAIMathFormatting(leadParagraph)}

${
  keyPointsBullets
    ? `### Key Scientific Principles & Breakdown:\n${keyPointsBullets}\n`
    : ''
}
### How to Write This in Your Exam:
- **Core Definition**: Start your answer with a clear 1–2 sentence definition of **${firstPage?.title || cleanTopic}**.
- **Formula / Mechanism**: State the governing law, equation, or biological/chemical pathway clearly with SI units.

Lumi's Study Tip: Click **Save to Study Notes** below to add this explanation of **${firstPage?.title || cleanTopic}** directly to your revision notebook!`;
  } catch {
    return null;
  }
}

function findExactLocalMatch(req: LumiLocalRequest): string | null {
  const { message, history, subject, gradeBand, studyMode } = req;
  const lower = message.toLowerCase().trim();

  // 0. Friendly conversational greetings
  if (
    /^(hi|hello|hey|good morning|good evening|namaste|who are you|what is your name|help|thanks|thank you)\b/i.test(
      lower
    ) &&
    lower.length < 35
  ) {
    return `Hi there! I'm **Lumi** 🦉✨, your pocket study buddy here in **LearnSphere 3D**!

I can help you with **${subject}** (${gradeBand}) in 4 ways:
- **Explain Simply**: Ask me about any NCERT concept or 3D diagram (e.g., *"What is Atomicity?"*, *"Explain the Electric Motor"*, *"How does the Human Digestive System work?"*, *"Periodic Table trends"*).
- **Step-by-Step Solver**: Paste a Physics, Chemistry, or Math problem (e.g., *Projectile Motion*, *Ohm's Law*, *pH calculations*, *Quadratic Equations*).
- **Exam & NCERT Coach**: Get high-yield definitions, board exam tips, and memory tricks.
- **Quiz Me!**: Ask me to quiz you on any chapter!

What topic should we dive into first?`;
  }

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

  // 2. Check if user is asking for a numerical calculation
  const solvedNumerical = trySolveNumericalProblem(message);
  if (solvedNumerical) {
    return solvedNumerical;
  }

  // 3. Check Core STEM Topics using word-boundary aware matching (only for direct topic queries)
  const matchedTopic = CORE_STEM_TOPICS.find((topic) =>
    topic.keywords.some((kw) => {
      if (kw === 'ph') {
        return /\bph\b|\bph scale\b|\bph value\b/i.test(message);
      }
      if (kw === 'force' || kw === 'study' || kw === 'mirror' || kw === 'lens' || kw === 'refraction' || kw === 'reflection') {
        return false;
      }
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(lower);
    })
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

  // 4. Check Periodic Table Element Profile (all 118 elements)
  const elementProfile = tryAnalyzeElementOrFormula(message);
  if (elementProfile) {
    return elementProfile;
  }

  // 5. Search NCERT 3D Diagrams database ONLY for exact diagram title match
  const matchedDiagram = NCERT_DIAGRAMS.find((diag) =>
    lower.includes(diag.title.toLowerCase())
  );

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

  // 6. Check Default Study Notes ONLY for exact title match
  const matchedNote = DEFAULT_NOTES.find((n) =>
    lower.includes(n.title.toLowerCase())
  );
  if (matchedNote) {
    return `## ${matchedNote.title} (${matchedNote.subject})

${matchedNote.content}

Lumi's Study Tip: You can also view and edit this study guide anytime in your **Notes** tab!`;
  }

  // 7. If user clicked "Quiz Me!" generally
  if (studyMode === 'quiz' || lower.includes('quiz')) {
    const topicPool =
      subject === 'All Subjects'
        ? CORE_STEM_TOPICS
        : CORE_STEM_TOPICS.filter((t) => t.subject === subject);
    const chosen = topicPool[Math.floor(Math.random() * topicPool.length)] || CORE_STEM_TOPICS[0];
    return `### Let's test your ${chosen.subject} mastery (${gradeBand})! 🦉✨\n\n${chosen.quizQuestion}\n\n*Reply with your answer in your own words—I'll give you feedback and a memory trick!*`;
  }

  return null;
}

export function generateLocalLumiResponse(req: LumiLocalRequest): string {
  const exact = findExactLocalMatch(req);
  if (exact) return exact;

  const clean = extractCleanTopicQuery(req.message) || req.message;
  return `## Study Breakdown: ${clean} (${req.subject} · ${req.gradeBand})

Let's break down **${clean}** step by step:

- **Core Definition**: **${clean}** is an important concept in ${req.subject === 'All Subjects' ? 'Science & STEM' : req.subject}. When answering in exams, start by stating what it is, the physical/chemical/biological principle behind it, and its standard units or equation.
- **Key Relationships**: Identify how changing one variable (such as temperature, pressure, concentration, force, or atomic number) affects the outcome.
- **Practical Example**: Always support your explanation with a concrete textbook example or balanced equation.

Lumi's Study Tip: Try asking me a specific question like **"What is Atomicity?"**, **"What is Valency?"**, **"Difference between Mitosis and Meiosis"**, **"Tell me about Carbon"**, or any scientific term!`;
}
