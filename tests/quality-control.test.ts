import { describe, it, expect, beforeEach } from 'vitest'

// Mock Quality Control Contract
const mockQualityContract = {
  qualityInspections: new Map(),
  assemblyQualityStatus: new Map(),
  nextInspectionId: 1,
  contractOwner: 'SP000000000000000000002Q6VF78',
  
  MIN_QUALITY_SCORE: 70,
  MAX_QUALITY_SCORE: 100,
  
  conductQualityInspection(assemblyId, qualityScore, precisionRating, defectsFound, notes) {
    if (qualityScore < 0 || qualityScore > this.MAX_QUALITY_SCORE) {
      return { error: 'ERR_INVALID_INSPECTION' }
    }
    
    if (this.assemblyQualityStatus.has(assemblyId)) {
      return { error: 'ERR_ALREADY_INSPECTED' }
    }
    
    const inspectionId = this.nextInspectionId
    const passed = qualityScore >= this.MIN_QUALITY_SCORE
    
    this.qualityInspections.set(inspectionId, {
      assemblyId,
      inspector: 'SP1234567890ABCDEF1234567890ABCDEF12345678', // Mock inspector
      qualityScore,
      precisionRating,
      defectsFound,
      inspectionDate: 1000,
      passed,
      notes
    })
    
    this.assemblyQualityStatus.set(assemblyId, passed)
    this.nextInspectionId += 1
    
    if (passed) {
      return { success: inspectionId }
    } else {
      return { error: 'ERR_QUALITY_FAILED' }
    }
  },
  
  getQualityInspection(inspectionId) {
    return this.qualityInspections.get(inspectionId) || null
  },
  
  getAssemblyQualityStatus(assemblyId) {
    return this.assemblyQualityStatus.get(assemblyId) || false
  },
  
  calculateQualityGrade(qualityScore) {
    if (qualityScore >= 90) return 'A'
    if (qualityScore >= 80) return 'B'
    if (qualityScore >= 70) return 'C'
    return 'F'
  },
  
  approveQuality(txSender, assemblyId) {
    if (txSender !== this.contractOwner) {
      return { error: 'ERR_UNAUTHORIZED' }
    }
    
    this.assemblyQualityStatus.set(assemblyId, true)
    return { success: true }
  },
  
  rejectQuality(txSender, assemblyId) {
    if (txSender !== this.contractOwner) {
      return { error: 'ERR_UNAUTHORIZED' }
    }
    
    this.assemblyQualityStatus.set(assemblyId, false)
    return { success: true }
  }
}

describe('Quality Control Contract', () => {
  const contractOwner = 'SP000000000000000000002Q6VF78'
  const inspector = 'SP1234567890ABCDEF1234567890ABCDEF12345678'
  const unauthorizedUser = 'SP3456789012CDEF13456789012CDEF1345678901'
  
  beforeEach(() => {
    // Reset contract state
    mockQualityContract.qualityInspections.clear()
    mockQualityContract.assemblyQualityStatus.clear()
    mockQualityContract.nextInspectionId = 1
  })
  
  describe('conduct-quality-inspection', () => {
    it('should successfully conduct inspection with passing score', () => {
      const result = mockQualityContract.conductQualityInspection(
          1, // assemblyId
          85, // qualityScore
          90, // precisionRating
          2, // defectsFound
          'Minor surface defects'
      )
      
      expect(result.success).toBe(1)
      expect(mockQualityContract.getAssemblyQualityStatus(1)).toBe(true)
      
      const inspection = mockQualityContract.getQualityInspection(1)
      expect(inspection.qualityScore).toBe(85)
      expect(inspection.passed).toBe(true)
      expect(inspection.notes).toBe('Minor surface defects')
    })
    
    it('should fail inspection with low quality score', () => {
      const result = mockQualityContract.conductQualityInspection(
          1, // assemblyId
          65, // qualityScore (below minimum)
          80, // precisionRating
          5, // defectsFound
          'Multiple defects found'
      )
      
      expect(result.error).toBe('ERR_QUALITY_FAILED')
      expect(mockQualityContract.getAssemblyQualityStatus(1)).toBe(false)
      
      const inspection = mockQualityContract.getQualityInspection(1)
      expect(inspection.qualityScore).toBe(65)
      expect(inspection.passed).toBe(false)
    })
    
    it('should pass inspection with minimum quality score', () => {
      const result = mockQualityContract.conductQualityInspection(
          1, // assemblyId
          70, // qualityScore (exactly minimum)
          75, // precisionRating
          3, // defectsFound
          'Acceptable quality'
      )
      
      expect(result.success).toBe(1)
      expect(mockQualityContract.getAssemblyQualityStatus(1)).toBe(true)
    })
    
    it('should reject invalid quality score (too high)', () => {
      const result = mockQualityContract.conductQualityInspection(
          1, // assemblyId
          105, // qualityScore (above maximum)
          90, // precisionRating
          0, // defectsFound
          'Perfect assembly'
      )
      
      expect(result.error).toBe('ERR_INVALID_INSPECTION')
    })
    
    it('should reject invalid quality score (negative)', () => {
      const result = mockQualityContract.conductQualityInspection(
          1, // assemblyId
          -10, // qualityScore (negative)
          90, // precisionRating
          0, // defectsFound
          'Invalid score'
      )
      
      expect(result.error).toBe('ERR_INVALID_INSPECTION')
    })
    
    it('should reject duplicate inspection for same assembly', () => {
      // First inspection
      mockQualityContract.conductQualityInspection(1, 85, 90, 2, 'First inspection')
      
      // Second inspection attempt
      const result = mockQualityContract.conductQualityInspection(1, 95, 95, 0, 'Second inspection')
      
      expect(result.error).toBe('ERR_ALREADY_INSPECTED')
    })
    
    it('should handle perfect quality score', () => {
      const result = mockQualityContract.conductQualityInspection(
          1, // assemblyId
          100, // qualityScore (maximum)
          100, // precisionRating
          0, // defectsFound
          'Perfect assembly'
      )
      
      expect(result.success).toBe(1)
      expect(mockQualityContract.getAssemblyQualityStatus(1)).toBe(true)
    })
  })
  
  describe('calculate-quality-grade', () => {
    it('should return A grade for excellent quality (90-100)', () => {
      expect(mockQualityContract.calculateQualityGrade(100)).toBe('A')
      expect(mockQualityContract.calculateQualityGrade(95)).toBe('A')
      expect(mockQualityContract.calculateQualityGrade(90)).toBe('A')
    })
    
    it('should return B grade for good quality (80-89)', () => {
      expect(mockQualityContract.calculateQualityGrade(89)).toBe('B')
      expect(mockQualityContract.calculateQualityGrade(85)).toBe('B')
      expect(mockQualityContract.calculateQualityGrade(80)).toBe('B')
    })
    
    it('should return C grade for acceptable quality (70-79)', () => {
      expect(mockQualityContract.calculateQualityGrade(79)).toBe('C')
      expect(mockQualityContract.calculateQualityGrade(75)).toBe('C')
      expect(mockQualityContract.calculateQualityGrade(70)).toBe('C')
    })
    
    it('should return F grade for failed quality (0-69)', () => {
      expect(mockQualityContract.calculateQualityGrade(69)).toBe('F')
      expect(mockQualityContract.calculateQualityGrade(50)).toBe('F')
      expect(mockQualityContract.calculateQualityGrade(0)).toBe('F')
    })
  })
  
  describe('approve-quality', () => {
    it('should allow contract owner to approve quality', () => {
      const result = mockQualityContract.approveQuality(contractOwner, 1)
      
      expect(result.success).toBe(true)
      expect(mockQualityContract.getAssemblyQualityStatus(1)).toBe(true)
    })
    
    it('should reject approval from unauthorized user', () => {
      const result = mockQualityContract.approveQuality(unauthorizedUser, 1)
      
      expect(result.error).toBe('ERR_UNAUTHORIZED')
    })
  })
  
  describe('reject-quality', () => {
    it('should allow contract owner to reject quality', () => {
      const result = mockQualityContract.rejectQuality(contractOwner, 1)
      
      expect(result.success).toBe(true)
      expect(mockQualityContract.getAssemblyQualityStatus(1)).toBe(false)
    })
    
    it('should reject rejection from unauthorized user', () => {
      const result = mockQualityContract.rejectQuality(unauthorizedUser, 1)
      
      expect(result.error).toBe('ERR_UNAUTHORIZED')
    })
  })
  
  describe('get-assembly-quality-status', () => {
    it('should return true for passed assembly', () => {
      mockQualityContract.conductQualityInspection(1, 85, 90, 2, 'Good quality')
      expect(mockQualityContract.getAssemblyQualityStatus(1)).toBe(true)
    })
    
    it('should return false for failed assembly', () => {
      mockQualityContract.conductQualityInspection(1, 65, 70, 5, 'Poor quality')
      expect(mockQualityContract.getAssemblyQualityStatus(1)).toBe(false)
    })
    
    it('should return false for non-inspected assembly', () => {
      expect(mockQualityContract.getAssemblyQualityStatus(999)).toBe(false)
    })
  })
  
  describe('get-quality-inspection', () => {
    it('should return inspection details', () => {
      mockQualityContract.conductQualityInspection(1, 85, 90, 2, 'Good quality')
      
      const inspection = mockQualityContract.getQualityInspection(1)
      expect(inspection).toEqual({
        assemblyId: 1,
        inspector: inspector,
        qualityScore: 85,
        precisionRating: 90,
        defectsFound: 2,
        inspectionDate: 1000,
        passed: true,
        notes: 'Good quality'
      })
    })
    
    it('should return null for non-existent inspection', () => {
      const inspection = mockQualityContract.getQualityInspection(999)
      expect(inspection).toBeNull()
    })
  })
})
