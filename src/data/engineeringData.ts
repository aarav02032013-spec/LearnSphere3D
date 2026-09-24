import { AdvancedMachine } from '../types';

export const ADVANCED_MACHINES: AdvancedMachine[] = [
  {
    id: 'ev_powertrain',
    name: 'Next-Gen Electric Vehicle Powertrain',
    category: 'Automotive',
    subtitle: 'Dual Permanent Magnet Synchronous Motors & 800V Structural Battery Architecture',
    description: 'A complete rolling chassis of an advanced electric vehicle featuring front and rear axial-flux motors, Silicon Carbide (SiC) inverters, structural battery pack, double-wishbone active suspension, and regenerative braking.',
    renderType: 'ev_powertrain',
    specifications: [
      { label: 'System Voltage', value: '800V Architecture' },
      { label: 'Combined Power', value: '750 kW (1,006 hp)' },
      { label: 'Max Motor RPM', value: '21,500 RPM' },
      { label: 'Battery Capacity', value: '102 kWh (4680 Cells)' },
      { label: 'Peak Efficiency', value: '97.4% (SiC Inverter)' },
      { label: 'Regen Braking Power', value: 'Up to 300 kW' }
    ],
    components: [
      {
        id: 'rear_motor',
        name: 'Rear High-Torque Axial Motor',
        role: 'Primary Propulsion',
        detail: 'Oil-cooled permanent magnet synchronous motor delivering 450 kW with planetary differential gearbox.',
        position: [0, 0.2, -1.4]
      },
      {
        id: 'battery_pack',
        name: 'Structural Lithium-Ion Pack',
        role: 'Energy Storage & Rigidity',
        detail: 'Integrated floor-pan enclosure with 4680 cylindrical cells and serpentined glycol cooling channels.',
        position: [0, -0.2, 0]
      },
      {
        id: 'inverter',
        name: 'Silicon Carbide (SiC) Inverter',
        role: 'DC to 3-Phase AC Modulation',
        detail: 'Switches high voltages at 40 kHz with ultra-low thermal dissipation and rapid field-oriented control (FOC).',
        position: [0, 0.4, -0.7]
      },
      {
        id: 'front_motor',
        name: 'Front Induction Assist Motor',
        role: 'Torque Vectoring & AWD Launch',
        detail: 'Secondary 300 kW motor decoupled at cruising speeds to eliminate parasitic drag.',
        position: [0, 0.2, 1.4]
      },
      {
        id: 'suspension_brakes',
        name: 'Active Air Suspension & Ceramic Brakes',
        role: 'Kinetic Energy Recapture & Ride Dynamics',
        detail: 'Electronically modulated dampers synchronized with hydraulic regenerative blended braking.',
        position: [1.2, 0.1, 1.2]
      }
    ]
  },
  {
    id: 'jet_engine',
    name: 'High-Bypass Turbofan Jet Engine',
    category: 'Aerospace',
    subtitle: 'Geared Turbofan with Carbon-Titanium Composite Fan & Superalloy Core',
    description: 'An aerospace propulsion engine operating on the Brayton thermodynamic cycle. Compresses incoming air, mixes with atomized jet fuel in an annular combustor, drives high-pressure turbines, and produces up to 350 kN of thrust.',
    renderType: 'jet_engine',
    specifications: [
      { label: 'Bypass Ratio', value: '12.5 : 1 (Ultra-High)' },
      { label: 'Takeoff Thrust', value: '350 kN (78,600 lbf)' },
      { label: 'Fan Diameter', value: '3.15 meters (124 in)' },
      { label: 'Combustion Temp', value: '1,720 °C (Turbine Inlet)' },
      { label: 'Overall Pressure Ratio', value: '50 : 1' },
      { label: 'Core Speed (N2)', value: '14,200 RPM' }
    ],
    components: [
      {
        id: 'titanium_fan',
        name: 'Composite Swept Fan Blades',
        role: 'Mass Flow & Cold Bypass Thrust',
        detail: '18 wide-chord 3D carbon-fiber blades with titanium leading edges generating 85% of total sea-level thrust.',
        position: [0, 0, 1.6]
      },
      {
        id: 'compressors',
        name: 'High-Pressure Axial Compressor',
        role: 'Aerodynamic Fluid Compression',
        detail: 'Multi-stage bladed disks (blisks) accelerating and pressurizing core air up to 50 times atmospheric pressure.',
        position: [0, 0, 0.6]
      },
      {
        id: 'combustor',
        name: 'Annular Combustion Chamber',
        role: 'Isobaric Heat Addition',
        detail: 'Ceramic thermal-barrier coated liners with swirl fuel nozzles where Jet A-1 burns at stoichiometric peaks.',
        position: [0, 0, -0.3]
      },
      {
        id: 'turbine',
        name: 'Single-Crystal HP Turbine',
        role: 'Work Extraction for Shaft Drive',
        detail: 'Internally air-cooled nickel superalloy blades extracting thousands of horsepower to spin compressor shafts.',
        position: [0, 0, -0.9]
      },
      {
        id: 'exhaust_nozzle',
        name: 'Convergent-Divergent Exhaust Nozzle',
        role: 'Sonic Gas Acceleration',
        detail: 'Exhaust cone shaping core flow to maximize momentum velocity discharge according to Newton’s 3rd Law.',
        position: [0, 0, -1.7]
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
