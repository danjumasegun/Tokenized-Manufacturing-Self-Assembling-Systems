;; Quality Control Contract
;; Ensures self-assembly precision and quality standards

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u300))
(define-constant ERR_INVALID_INSPECTION (err u301))
(define-constant ERR_ALREADY_INSPECTED (err u302))
(define-constant ERR_QUALITY_FAILED (err u303))

;; Quality standards
(define-constant MIN_QUALITY_SCORE u70)
(define-constant MAX_QUALITY_SCORE u100)

;; Data structures
(define-map quality-inspections
  uint
  {
    assembly-id: uint,
    inspector: principal,
    quality-score: uint,
    precision-rating: uint,
    defects-found: uint,
    inspection-date: uint,
    passed: bool,
    notes: (string-ascii 100)
  }
)

(define-map assembly-quality-status uint bool)
(define-data-var next-inspection-id uint u1)

;; Read-only functions
(define-read-only (get-quality-inspection (inspection-id uint))
  (map-get? quality-inspections inspection-id)
)

(define-read-only (get-assembly-quality-status (assembly-id uint))
  (default-to false (map-get? assembly-quality-status assembly-id))
)

(define-read-only (calculate-quality-grade (quality-score uint))
  (if (>= quality-score u90)
    "A"
    (if (>= quality-score u80)
      "B"
      (if (>= quality-score u70)
        "C"
        "F"
      )
    )
  )
)

;; Public functions
(define-public (conduct-quality-inspection
  (assembly-id uint)
  (quality-score uint)
  (precision-rating uint)
  (defects-found uint)
  (notes (string-ascii 100))
)
  (let ((inspection-id (var-get next-inspection-id)))
    (asserts! (and (>= quality-score u0) (<= quality-score MAX_QUALITY_SCORE)) ERR_INVALID_INSPECTION)
    (asserts! (not (get-assembly-quality-status assembly-id)) ERR_ALREADY_INSPECTED)

    (let ((passed (>= quality-score MIN_QUALITY_SCORE)))
      (map-set quality-inspections inspection-id {
        assembly-id: assembly-id,
        inspector: tx-sender,
        quality-score: quality-score,
        precision-rating: precision-rating,
        defects-found: defects-found,
        inspection-date: block-height,
        passed: passed,
        notes: notes
      })

      (map-set assembly-quality-status assembly-id passed)
      (var-set next-inspection-id (+ inspection-id u1))

      (if passed
        (ok inspection-id)
        ERR_QUALITY_FAILED
      )
    )
  )
)

(define-public (approve-quality (assembly-id uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (map-set assembly-quality-status assembly-id true)
    (ok true)
  )
)

(define-public (reject-quality (assembly-id uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (map-set assembly-quality-status assembly-id false)
    (ok true)
  )
)
