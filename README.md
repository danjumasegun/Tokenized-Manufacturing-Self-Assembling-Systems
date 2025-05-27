# Tokenized Manufacturing Self-Assembling Systems

A blockchain-based system for managing tokenized manufacturing processes with self-assembling capabilities. Built on the Stacks blockchain using Clarity smart contracts.

## Overview

This system provides a comprehensive framework for managing self-assembling manufacturing processes through four core smart contracts:

- **Manufacturer Verification**: Validates and manages self-assembly producers
- **Assembly Protocol**: Manages self-assembly processes and workflows
- **Quality Control**: Ensures self-assembly precision and quality standards
- **Scalability Management**: Handles self-assembly scaling and resource allocation

## Architecture

### Smart Contracts

#### 1. Manufacturer Verification Contract (`manufacturer-verification.clar`)
- Verifies and manages manufacturer credentials
- Tracks certification levels and assembly counts
- Provides authorization for manufacturing operations

**Key Functions:**
- `verify-manufacturer`: Add a new verified manufacturer
- `is-verified-manufacturer`: Check if a manufacturer is verified
- `increment-assembly-count`: Track completed assemblies

#### 2. Assembly Protocol Contract (`assembly-protocol.clar`)
- Manages the lifecycle of self-assembly processes
- Tracks assembly status from initiation to completion
- Handles assembly metadata and progress tracking

**Key Functions:**
- `initiate-assembly`: Start a new assembly process
- `update-assembly-status`: Update assembly progress
- `complete-assembly`: Mark assembly as completed

#### 3. Quality Control Contract (`quality-control.clar`)
- Conducts quality inspections on completed assemblies
- Enforces quality standards and precision requirements
- Manages quality scoring and grading system

**Key Functions:**
- `conduct-quality-inspection`: Perform quality assessment
- `get-assembly-quality-status`: Check if assembly passed quality control
- `calculate-quality-grade`: Get quality grade (A, B, C, F)

#### 4. Scalability Management Contract (`scalability-management.clar`)
- Manages resource allocation and scaling operations
- Handles concurrent assembly limits and system load
- Optimizes resource utilization across manufacturers

**Key Functions:**
- `initialize-scaling-config`: Set up manufacturer scaling parameters
- `allocate-resources`: Allocate resources for assembly processes
- `scale-up`: Increase manufacturing capacity

## Features

### 🔐 Manufacturer Verification
- Secure manufacturer onboarding and verification
- Certification level tracking
- Assembly count monitoring

### 🔄 Assembly Management
- Complete assembly lifecycle management
- Status tracking (Initiated → In Progress → Completed/Failed)
- Component and hash-based verification

### ✅ Quality Assurance
- Automated quality scoring system
- Precision rating and defect tracking
- Pass/fail quality determination

### 📈 Scalability
- Dynamic resource allocation
- Concurrent assembly management
- System load optimization

## Getting Started

### Prerequisites
- Stacks blockchain node or testnet access
- Clarity CLI for contract deployment
- Node.js for running tests

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd tokenized-manufacturing
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Run tests:
   \`\`\`bash
   npm test
   \`\`\`

### Deployment

Deploy contracts to Stacks testnet:

\`\`\`bash
# Deploy manufacturer verification contract
clarinet deploy --testnet contracts/manufacturer-verification.clar

# Deploy assembly protocol contract
clarinet deploy --testnet contracts/assembly-protocol.clar

# Deploy quality control contract
clarinet deploy --testnet contracts/quality-control.clar

# Deploy scalability management contract
clarinet deploy --testnet contracts/scalability-management.clar
\`\`\`

## Usage Examples

### Verify a Manufacturer
\`\`\`clarity
(contract-call? .manufacturer-verification verify-manufacturer
'SP1234567890ABCDEF
"TechCorp Manufacturing"
u5)
\`\`\`

### Initiate Assembly Process
\`\`\`clarity
(contract-call? .assembly-protocol initiate-assembly
'SP1234567890ABCDEF
"Widget-X1"
u10
0x1234567890abcdef)
\`\`\`

### Conduct Quality Inspection
\`\`\`clarity
(contract-call? .quality-control conduct-quality-inspection
u1
u85
u90
u2
"Minor surface defects")
\`\`\`

## Quality Standards

- **Minimum Quality Score**: 70/100
- **Quality Grades**:
    - A: 90-100 (Excellent)
    - B: 80-89 (Good)
    - C: 70-79 (Acceptable)
    - F: 0-69 (Failed)

## Scaling Limits

- **Maximum Concurrent Assemblies**: 100 per manufacturer
- **Minimum Resource Threshold**: 10 units
- **System Load Monitoring**: Real-time tracking

## Testing

The project includes comprehensive tests using Vitest:

\`\`\`bash
# Run all tests
npm test

# Run specific test file
npm test manufacturer-verification.test.js

# Run tests in watch mode
npm run test:watch
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support, please open an issue in the GitHub repository.

