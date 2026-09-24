import { NoteItem } from '../types';

export const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'note_1',
    title: 'Cellular Respiration & Photosynthesis Energetics',
    subject: 'Biology',
    tags: ['Plant Cell', 'Chloroplast', 'Mitochondria', 'Bioenergetics'],
    updatedAt: Date.now() - 3600000 * 24 * 2,
    favorite: true,
    labReference: '3D Learning: Eukaryotic Plant Cell',
    content: `### Core Energy Pathways in Eukaryotes

1. **Photosynthesis in Chloroplasts**:
   - Equation: \`6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂\`
   - Occurs across the thylakoid membrane (light-dependent reactions) and stroma (Calvin-Benson cycle).
   - Generates NADPH and ATP to fix atmospheric carbon into triose phosphate.

2. **Oxidative Phosphorylation in Mitochondria**:
   - Equation: \`C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~32 ATP\`
   - The electron transport chain pumps protons into the intermembrane space, creating an electrochemical gradient (proton-motive force) that drives ATP synthase rotary motor.

*Key Takeaway*: Plants are autotrophs performing both photosynthesis during daytime and continuous mitochondrial respiration day and night.`
  },
  {
    id: 'note_2',
    title: 'Momentum Conservation & Impulse in Collisions',
    subject: 'Physics',
    tags: ['Momentum', 'Kinetic Energy', 'Collisions', 'Newton Laws'],
    updatedAt: Date.now() - 3600000 * 12,
    favorite: true,
    labReference: 'Physics Simulation: Elastic & Inelastic 1D Collisions',
    content: `### Conservation Laws in Mechanics

- **Linear Momentum**: In an isolated system with no external net force:
  \`p_total = m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'\`
  Momentum is conserved in **both** elastic and inelastic collisions.

- **Kinetic Energy Classification**:
  - *Elastic Collision* (\`e = 1\`): Mechanical kinetic energy is 100% conserved (\`ΔKE = 0\`).
  - *Inelastic Collision* (\`0 ≤ e < 1\`): Some mechanical energy converts into heat, acoustic waves, or material deformation.
  - *Perfectly Inelastic* (\`e = 0\`): Objects coalesce and stick together with common velocity:
    \`v_final = (m₁v₁ + m₂v₂) / (m₁ + m₂)\`

*Lab Note*: Tested with 1.5 kg and 2.5 kg gliders. The center of mass velocity remained strictly constant at 1.88 m/s.`
  },
  {
    id: 'note_3',
    title: 'Exothermic Neutralization & pH Shifts',
    subject: 'Chemistry',
    tags: ['Acids & Bases', 'Enthalpy', 'pH Scale', 'Indicators'],
    updatedAt: Date.now() - 3600000 * 4,
    favorite: false,
    labReference: 'Chemistry Lab: HCl + NaOH Neutralization',
    content: `### Chemical Equilibrium & Thermochemistry

- **Reaction**: \`HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)\`
- **Net Ionic Equation**: \`H⁺(aq) + OH⁻(aq) → H₂O(l)\`
- **Standard Enthalpy of Neutralization**: \`ΔH° = -57.1 kJ/mol\`
- **Indicator Behavior**:
  - Universal indicator shifts from crimson red (pH 1.0) through orange/yellow, reaching emerald green at equivalence (pH 7.0), then deep purple at alkaline excess (pH 13+).
  - Observed beaker temperature rise: from 22°C to 36.5°C when mixing 1.0M solutions.`
  },
  {
    id: 'note_4',
    title: 'Multivariable Calculus & Gradient Descent in AI',
    subject: 'Mathematics',
    tags: ['Calculus', 'Gradients', 'Optimization', 'Saddle Points'],
    updatedAt: Date.now() - 3600000 * 2,
    favorite: true,
    labReference: '3D Learning: Multivariable Calculus 3D Surface',
    content: `### Differential Geometry of Surfaces

For a scalar function \`z = f(x, y) = sin(x) · cos(y)\`:
- **Gradient Vector**:
  \`∇f = (∂f/∂x) î + (∂f/∂y) ĵ = (cos(x)cos(y)) î - (sin(x)sin(y)) ĵ\`
- **Steepest Ascent**:
  The directional derivative \`D_u f = ∇f · û\` is maximized in the exact direction of \`∇f\`.
- **Hessian Matrix & Saddle Points**:
  At critical points where \`∇f = 0\`, evaluate \`D = f_xx f_yy - (f_xy)²\`.
  If \`D < 0\`, the critical point is a hyperbolic saddle point. This explains the challenge of saddle-point plateaus in high-dimensional deep learning optimization.`
  },
  {
    id: 'note_5',
    title: 'Electric Vehicle Powertrain Architecture',
    subject: 'Engineering',
    tags: ['EV', 'Permanent Magnet Motors', 'Silicon Carbide', 'Inverter'],
    updatedAt: Date.now() - 3600000 * 1,
    favorite: false,
    labReference: 'Advanced 3D Lab: EV Rolling Chassis',
    content: `### 800V Powertrain Systems Overview

- **Silicon Carbide (SiC) Inverters**:
  Replaces silicon IGBTs with wide-bandgap SiC MOSFETs, slashing switching losses by over 70% and sustaining switching frequencies exceeding 40 kHz.
- **Axial Flux Motors**:
  Offers unprecedented torque density (>35 Nm/kg) with short axial length compared to traditional radial flux stators.
- **Regenerative Braking Physics**:
  Electric motors operate in reverse as generators, converting the vehicle’s kinetic energy (\`KE = ½mv²\`) into electrical current back into the battery pack.`
  }
];
