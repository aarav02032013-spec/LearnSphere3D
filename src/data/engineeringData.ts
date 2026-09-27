import { AdvancedMachine } from '../types';

export const ADVANCED_MACHINES: AdvancedMachine[] = [
  {
    id: 'ev_powertrain',
    name: 'Next-Gen Hybrid-Electric Automotive Powertrain',
    category: 'Automotive',
    subtitle: 'Longitudinal Hybrid Transmission, Offset HV Lithium Pack & Cast Multi-Link Subframes',
    description: 'A complete rolling automotive chassis featuring a front longitudinal engine with integrated hybrid motor-generator, multi-speed planetary transmission, central carbon driveshaft, offset high-voltage lithium-ion battery pack, bright orange high-voltage wiring harness, and cast-aluminum multi-link suspension subframes.',
    renderType: 'ev_powertrain',
    specifications: [
      { label: 'HV Bus Architecture', value: '800V Orange Shielded Harness' },
      { label: 'Combined Output', value: '750 kW (1,006 hp)' },
      { label: 'Drivetrain Layout', value: 'Longitudinal AWD + E-Axle' },
      { label: 'HV Battery Pack', value: 'Offset Structural Li-Ion Pack' },
      { label: 'Suspension Chassis', value: 'Die-Cast Aluminum Multi-Link' },
      { label: 'Peak Inverter Efficiency', value: '97.4% (SiC Power Module)' }
    ],
    components: [
      {
        id: 'front_motor',
        name: 'Front Hybrid Engine & Longitudinal Transmission',
        role: 'Primary Front Powertrain & E-Motor Assist',
        detail: 'Features a ribbed acoustic composite intake cover over an aluminum cylinder block, paired with a longitudinal die-cast aluminum hybrid planetary transmission and integrated starter-generator.',
        position: [1.35, 0.15, 0]
      },
      {
        id: 'battery_pack',
        name: 'Offset High-Voltage Lithium-Ion Battery Pack',
        role: 'High-Density Energy Storage Module',
        detail: 'Heavy-duty dark anthracite stamped steel enclosure mounted alongside the central driveshaft tunnel, complete with structural stiffening ribs, perimeter bolt flanges, and dual HV orange terminal feeds.',
        position: [-0.15, -0.05, 0.58]
      },
      {
        id: 'inverter',
        name: 'High-Voltage Orange Harness & Power Electronics',
        role: 'HV Power Distribution & SiC Inverter Control',
        detail: 'Shielded bright-orange high-voltage power cables and dual-line conduits routing DC/AC power between the offset battery pack, rear power control unit, and front hybrid transmission.',
        position: [0.2, 0.25, -0.45]
      },
      {
        id: 'rear_motor',
        name: 'Rear Cast Subframe, Driveshaft & Exhaust System',
        role: 'Rear Axle Torque Delivery & Acoustic Exhaust',
        detail: 'Sculpted cast-aluminum rear multi-link cradle housing the rear differential, driven by the central propeller shaft, paired with a stainless-steel catalytic exhaust and rear transverse dual-exit muffler.',
        position: [-1.45, 0.1, 0]
      },
      {
        id: 'suspension_brakes',
        name: 'Cast Double-Wishbone Suspension & Wide Radial Tires',
        role: 'Chassis Dynamics, Steering & Regenerative Braking',
        detail: 'Forged aluminum upper A-arms, coil-over dampers, ventilated disc brake rotors with calipers, and wide high-grip treaded performance radial tires at all four corners.',
        position: [1.25, 0.0, 1.05]
      }
    ]
  },
  {
    id: 'jet_engine',
    name: 'High-Bypass Turbofan Jet Engine',
    category: 'Aerospace',
    subtitle: 'Swept Titanium Fan, Blue Acoustic Intake, FADEC/AGB Harness & Ribbed LPT Barrel',
    description: 'A modern high-bypass commercial aerospace turbofan featuring a brushed titanium fan containment barrel with a royal-blue acoustic intake liner, 22 wide-chord swept scimitar fan blades, side-mounted FADEC electronics with red/blue aerospace harnesses, an under-slung chromate accessory gearbox (AGB), a narrow high-pressure core wrapped in stainless bleed-air manifolds, and a heavily ribbed low-pressure turbine (LPT) casing.',
    renderType: 'jet_engine',
    specifications: [
      { label: 'Bypass Ratio', value: '12.5 : 1 (Ultra-High)' },
      { label: 'Takeoff Thrust', value: '350 kN (78,600 lbf)' },
      { label: 'Fan Diameter', value: '3.15 meters (22 Swept Blades)' },
      { label: 'Core & LPT Casing', value: 'Inconel Manifolds & 14-Rib LPT' },
      { label: 'Overall Pressure Ratio', value: '50 : 1' },
      { label: 'Control Architecture', value: 'Dual-Channel FADEC + AGB' }
    ],
    components: [
      {
        id: 'titanium_fan',
        name: 'Swept Titanium Fan & Blue Acoustic Intake Case',
        role: 'Primary Bypass Mass Flow & Acoustic Attenuation',
        detail: '22 wide-chord 3D-swept titanium-composite fan blades with a bi-metallic spinner cone, housed inside a brushed titanium containment barrel lined with a cobalt-blue acoustic honeycomb ring.',
        position: [0, 0.1, 1.35]
      },
      {
        id: 'compressors',
        name: 'FADEC Units, Harnesses & Accessory Gearbox (AGB)',
        role: 'Electronic Engine Control, Ignition & Hydraulic/Fuel Drive',
        detail: 'Case-mounted anthracite FADEC control boxes, color-coded crimson-red ignition/fire loops and cobalt-blue sensor harnesses, and an under-slung yellow-chromate cast accessory gearbox with red anodized manifold caps.',
        position: [1.15, -0.45, 0.75]
      },
      {
        id: 'combustor',
        name: 'High-Pressure Core & Stainless Bleed-Air Manifolds',
        role: '50:1 Axial Compression, Isobaric Combustion & Air Routing',
        detail: 'Narrow-waist high-pressure compressor and annular combustor core densely wrapped in polished stainless-steel S-bend bleed-air ducts, fuel rail manifolds, and variable stator vane (VSV) actuators.',
        position: [0.55, 0.1, -0.25]
      },
      {
        id: 'turbine',
        name: 'Ribbed Low-Pressure Turbine (LPT) Barrel Casing',
        role: 'Multi-Stage Shaft Work Extraction & Thermal Containment',
        detail: 'Flared superalloy turbine drum featuring 14 closely spaced circumferential stiffening/cooling ribs and axial tie-strakes enclosing multi-stage single-crystal turbine rotors.',
        position: [0.65, 0.25, -1.25]
      },
      {
        id: 'exhaust_nozzle',
        name: 'Turbine Exhaust Frame & Core Thrust Nozzle',
        role: 'Core Gas Expansion & High-Velocity Momentum Discharge',
        detail: 'Rear structural turbine exhaust frame with deswirl exit guide vanes and convergent core nozzle cone accelerating hot exhaust gases.',
        position: [0, 0, -1.85]
      }
    ]
  },
  {
    id: 'robot_arm',
    name: '6-Axis Articulated Industrial Robotic Arm',
    category: 'Robotics',
    subtitle: 'High-Precision Harmonic Drive Kinematics & Servo Manipulator',
    description: 'An advanced industrial robotic manipulator engineered for semiconductor fabrication and aerospace assembly, utilizing brushless servomotors, zero-backlash harmonic drive reducers, and closed-loop optical encoders.',
    renderType: 'robot_arm',
    specifications: [
      { label: 'Degrees of Freedom', value: '6 Revolute Axes' },
      { label: 'Payload Capacity', value: '25 kg (55 lbs)' },
      { label: 'Repeatability', value: '± 0.015 mm' },
      { label: 'Maximum Reach', value: '1,820 mm' },
      { label: 'Actuation', value: 'Harmonic Drive Servos' },
      { label: 'Cycle Time', value: '0.45 s (Standard Pick & Place)' }
    ],
    components: [
      {
        id: 'pedestal_base',
        name: 'Cast Iron Base & Axis 1 Swivel',
        role: 'Primary Azimuth Rotation',
        detail: 'Continuous 360-degree rotational turntable with integrated slip rings for high-voltage and etherCAT data.',
        position: [0, -1.2, 0]
      },
      {
        id: 'shoulder_joint',
        name: 'Axis 2 Shoulder Boom',
        role: 'Elevation Kinematic Link',
        detail: 'Dual-opposed harmonic gearboxes handling maximum bending moment forces under full payload extension.',
        position: [0, -0.6, 0.4]
      },
      {
        id: 'elbow_joint',
        name: 'Axis 3 Articulated Elbow',
        role: 'Reach Extension & Compression',
        detail: 'Carbon-fiber composite cast arm connecting shoulder and wrist with internal cable routing.',
        position: [0, 0.4, -0.3]
      },
      {
        id: 'wrist_assembly',
        name: 'Axes 4-5-6 Spherical Wrist',
        role: 'Tool Pitch, Yaw & Roll Orientation',
        detail: 'Compact triple-axis hollow shaft servo cluster enabling intricate orientation angles in confined spaces.',
        position: [0, 1.1, 0.5]
      },
      {
        id: 'end_effector',
        name: 'Pneumatic Parallel Jaw Gripper',
        role: 'Workpiece Manipulation',
        detail: 'Equipped with 6-axis tactile force/torque sensors for compliant assembly without crushing fragile parts.',
        position: [0, 1.4, 0.7]
      }
    ]
  },
  {
    id: 'microchip_motherboard',
    name: 'Supercomputing Microprocessor & Mainboard',
    category: 'Computing',
    subtitle: 'Heterogeneous Chiplet Architecture, PCIe 5.0 Bus & Multiphase VRM',
    description: 'A high-performance computing motherboard demonstrating the physical and electrical topology of computer hardware: 3nm monolithic CPU die with hybrid P/E cores, high-speed differential PCIe traces, DDR5 memory channels, and 24-phase power delivery.',
    renderType: 'microchip_motherboard',
    specifications: [
      { label: 'Transistor Count', value: '45 Billion (3nm FinFET)' },
      { label: 'Core Topology', value: '16 P-Cores + 16 E-Cores' },
      { label: 'Max Boost Clock', value: '6.0 GHz' },
      { label: 'Memory Bandwidth', value: '128 GB/s (DDR5-7200)' },
      { label: 'VRM Phases', value: '24+1+2 Direct Smart Power Stages' },
      { label: 'Thermal Design Power', value: '250 Watts (PL2 Unlocked)' }
    ],
    components: [
      {
        id: 'cpu_socket',
        name: 'LGA Processor Socket & Silicon Die',
        role: 'Central Processing & Instruction Pipeline',
        detail: 'Features 1,700 gold-plated spring pins transmitting microcode instructions across L1, L2, and 64MB shared L3 cache.',
        position: [0, 0.2, 0]
      },
      {
        id: 'vrm_heatsink',
        name: '24-Phase Digital Power VRM',
        role: '12V DC to 1.3V Core Voltage Stepping',
        detail: 'Chokes, solid tantalum capacitors, and MOSFETs stepping down voltage with 95% efficiency under 300A current load.',
        position: [-0.9, 0.3, 0.5]
      },
      {
        id: 'ram_slots',
        name: 'Quad DDR5 Memory Channels',
        role: 'High-Bandwidth Volatile Storage',
        detail: 'Dual 32-bit subchannels per DIMM with on-die error correction code (ECC) and aluminum thermal heat spreaders.',
        position: [0.9, 0.25, 0.3]
      },
      {
        id: 'pcie_lanes',
        name: 'PCIe 5.0 x16 Expansion Bus',
        role: 'Ultra-Fast GPU Data Interconnect',
        detail: 'Steel-armored expansion slot delivering up to 64 GB/s bidirectional throughput directly to CPU lanes.',
        position: [0, 0.15, -0.9]
      },
      {
        id: 'chipset_m2',
        name: 'PCH Chipset & NVMe M.2 Heatshield',
        role: 'I/O Multiplexing & Solid State Storage',
        detail: 'Controls USB4, SATA, Wi-Fi 7, and Direct Memory Access across high-speed Gen5 NVMe solid-state storage.',
        position: [0.7, 0.15, -0.7]
      }
    ]
  }
];
