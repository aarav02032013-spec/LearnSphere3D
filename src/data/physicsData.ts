import { QuizQuestion } from '../types';

export interface CelestialBody {
  id: string;
  name: string;
  gravity: number; // m/s²
  color: string;
}

export const CELESTIAL_BODIES: CelestialBody[] = [
  { id: 'earth', name: 'Earth (1.00g)', gravity: 9.81, color: '#38BDF8' },
  { id: 'moon', name: 'Moon (0.17g)', gravity: 1.62, color: '#94A3B8' },
  { id: 'mars', name: 'Mars (0.38g)', gravity: 3.71, color: '#F87171' },
  { id: 'jupiter', name: 'Jupiter (2.53g)', gravity: 24.79, color: '#FBBF24' }
];

export function generateProjectileQuiz(
  v0: number,
  angleDeg: number,
  g: number,
  planetName: string
): QuizQuestion[] {
  const theta = (angleDeg * Math.PI) / 180;
  const v0y = v0 * Math.sin(theta);
  const v0x = v0 * Math.cos(theta);
  const timeToPeak = v0y / g;
  const totalTime = 2 * timeToPeak;
  const maxH = (v0y * v0y) / (2 * g);
  const range = v0x * totalTime;

  return [
    {
      id: 'q_proj_1',
      prompt: `With an initial velocity of ${v0} m/s launched at ${angleDeg}° on ${planetName} (g = ${g} m/s²), what is the initial vertical velocity component (v₀ᵧ)?`,
      options: [
        `${v0y.toFixed(1)} m/s`,
        `${v0x.toFixed(1)} m/s`,
        `${(v0 * 0.5).toFixed(1)} m/s`,
        `${(v0 * 1.414).toFixed(1)} m/s`
      ],
      correctIndex: 0,
      explanation: `v₀ᵧ is given by v₀ · sin(θ). For ${v0} m/s at ${angleDeg}°, v₀ᵧ = ${v0} · sin(${angleDeg}°) = ${v0y.toFixed(2)} m/s.`,
      formulaUsed: 'v₀ᵧ = v₀ · sin(θ)'
    },
    {
      id: 'q_proj_2',
      prompt: `At the highest apex point of the trajectory, what is the vertical velocity of the projectile?`,
      options: [
        '0 m/s (instantaneously zero before falling)',
        `${v0.toFixed(1)} m/s (remains constant throughout flight)`,
        `${(v0 / 2).toFixed(1)} m/s`,
        `-9.8 m/s²`
      ],
      correctIndex: 0,
      explanation: `At the apex peak, the upward momentum is completely arrested by gravitational deceleration, so v_y = 0 m/s, while horizontal velocity v_x remains constant.`,
      formulaUsed: 'v_y(t_peak) = v₀ᵧ - g · t = 0'
    },
    {
      id: 'q_proj_3',
      prompt: `If the gravitational acceleration g was doubled to ${(g * 2).toFixed(1)} m/s², how would the maximum height (H_max) change?`,
      options: [
        'It would be halved (reduced by 50%)',
        'It would remain exactly the same',
        'It would double',
        'It would decrease by a factor of 4'
      ],
      correctIndex: 0,
      explanation: `In the formula H_max = v₀ᵧ² / (2g), height is inversely proportional to g. Doubling gravity cuts maximum height in half.`,
      formulaUsed: 'H_max ∝ 1 / g'
    },
    {
      id: 'q_proj_4',
      prompt: `What launch angle achieves maximum horizontal range in a vacuum on flat ground?`,
      options: [
        '45° (since sin(2θ) = sin(90°) = 1.0 is maximized)',
        '30° (minimizes air resistance)',
        '60° (maximizes hang time)',
        '90° (pure vertical launch)'
      ],
      correctIndex: 0,
      explanation: `The horizontal range formula is R = (v₀² · sin(2θ)) / g. The term sin(2θ) reaches its maximum value of 1.0 when 2θ = 90°, which occurs at θ = 45°.`,
      formulaUsed: 'R = (v₀² · sin(2θ)) / g'
    }
  ];
}

export function generateCollisionQuiz(
  m1: number,
  m2: number,
  v1: number,
  v2: number,
  isElastic: boolean
): QuizQuestion[] {
  const pTotal = m1 * v1 + m2 * v2;
  const keTotal = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;

  return [
    {
      id: 'q_col_1',
      prompt: `In an isolated system with no external net forces, is total linear momentum always conserved during both elastic and inelastic collisions?`,
      options: [
        'Yes, total linear momentum is ALWAYS conserved in all collisions',
        'No, momentum is only conserved in perfectly elastic collisions',
        'No, momentum disappears due to internal friction',
        'Only if both objects have identical masses'
      ],
      correctIndex: 0,
      explanation: `By Newton's 3rd Law, the internal impulse forces between colliding bodies are equal and opposite (F₁₂ = -F₂₁), which strictly conserves total momentum ∑p = constant for any isolated collision.`,
      formulaUsed: 'm₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′'
    },
    {
      id: 'q_col_2',
      prompt: `Cart 1 (${m1} kg moving at ${v1} m/s) collides with Cart 2 (${m2} kg at ${v2} m/s). What is the total system momentum before collision?`,
      options: [
        `${pTotal.toFixed(2)} kg·m/s`,
        `${(pTotal * 1.5).toFixed(2)} kg·m/s`,
        `${(keTotal).toFixed(2)} kg·m/s`,
        `${(m1 + m2).toFixed(2)} kg·m/s`
      ],
      correctIndex: 0,
      explanation: `Total initial momentum is p = m₁v₁ + m₂v₂ = (${m1} × ${v1}) + (${m2} × ${v2}) = ${pTotal.toFixed(2)} kg·m/s.`,
      formulaUsed: 'p_total = m₁v₁ + m₂v₂'
    },
    {
      id: 'q_col_3',
      prompt: `What is the key physical difference between a perfectly elastic collision and a completely inelastic collision?`,
      options: [
        'Kinetic energy is conserved in elastic, but converted to heat/deformation in inelastic',
        'Momentum is not conserved in inelastic collisions',
        'Elastic collisions only occur in zero gravity',
        'Inelastic collisions produce no sound or heat'
      ],
      correctIndex: 0,
      explanation: `In an elastic collision, total kinetic energy is conserved (KE_initial = KE_final). In an inelastic collision, some mechanical kinetic energy is transformed into thermal energy, sound, or atomic deformation.`,
      formulaUsed: 'Elastic: ΔKE = 0 | Inelastic: ΔKE < 0'
    }
  ];
}

export function generateGravityQuiz(
  radiusKm: number,
  massFactor: number
): QuizQuestion[] {
  return [
    {
      id: 'q_grav_1',
      prompt: `According to Kepler's Third Law (T² ∝ r³), what happens to the orbital period T of a planet if its orbital radius r is increased?`,
      options: [
        'The orbital period increases (takes longer to complete one revolution)',
        'The orbital period decreases (revolves faster)',
        'The period remains identical regardless of distance',
        'The planet immediately leaves orbit'
      ],
      correctIndex: 0,
      explanation: `As orbital radius r increases, the distance increases and gravitational acceleration weakens, requiring a longer orbital period according to T² = (4π²/GM) · r³.`,
      formulaUsed: 'T² ∝ r³ (Harmonic Law)'
    },
    {
      id: 'q_grav_2',
      prompt: `If a satellite is in a stable circular orbit, how does the escape velocity (v_esc) compare to its circular orbital velocity (v_circ)?`,
      options: [
        'Escape velocity is √2 times (≈ 1.414×) the circular velocity',
        'Escape velocity is exactly double the circular velocity',
        'Escape velocity is equal to circular velocity',
        'Escape velocity is half the circular velocity'
      ],
      correctIndex: 0,
      explanation: `Circular velocity is v_circ = √(GM/r) while parabolic escape velocity is v_esc = √(2GM/r) = √2 · v_circ. Accelerating by 41.4% allows escape from gravitational bounds.`,
      formulaUsed: 'v_esc = √2 · v_circ'
    }
  ];
}

export function generatePendulumQuiz(
  lengthM: number,
  gVal: number
): QuizQuestion[] {
  const period = 2 * Math.PI * Math.sqrt(lengthM / gVal);
  return [
    {
      id: 'q_pend_1',
      prompt: `For a simple pendulum of length L = ${lengthM} m (under g = ${gVal} m/s²), what is its approximate period of oscillation T?`,
      options: [
        `${period.toFixed(2)} seconds`,
        `${(period * 2).toFixed(2)} seconds`,
        `${(period / 2).toFixed(2)} seconds`,
        `${(lengthM * gVal).toFixed(2)} seconds`
      ],
      correctIndex: 0,
      explanation: `Using the simple harmonic pendulum equation T = 2π√(L/g) = 2π√(${lengthM} / ${gVal}) ≈ ${period.toFixed(2)} s.`,
      formulaUsed: 'T = 2π · √(L / g)'
    },
    {
      id: 'q_pend_2',
      prompt: `Does changing the mass of the pendulum bob (assuming negligible air drag) alter the period of oscillation?`,
      options: [
        'No, the period is strictly independent of the bob’s mass',
        'Yes, heavier bobs swing much faster',
        'Yes, lighter bobs swing faster',
        'Yes, but only for masses exceeding 10 kg'
      ],
      correctIndex: 0,
      explanation: `In T = 2π√(L/g), mass m cancels out because gravitational force is proportional to mass (F = mg) while inertial resistance to acceleration is also proportional to mass (F = ma).`,
      formulaUsed: 'T is independent of mass m'
    }
  ];
}
