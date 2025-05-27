;; Scalability Management Contract
;; Handles self-assembly scaling and resource allocation

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u400))
(define-constant ERR_INVALID_CAPACITY (err u401))
(define-constant ERR_INSUFFICIENT_RESOURCES (err u402))
(define-constant ERR_SCALING_LIMIT_REACHED (err u403))

;; Scaling constants
(define-constant MAX_CONCURRENT_ASSEMBLIES u100)
(define-constant MIN_RESOURCE_THRESHOLD u10)

;; Data structures
(define-map scaling-configurations
  principal
  {
    max-concurrent: uint,
    current-active: uint,
    resource-allocation: uint,
    scaling-factor: uint,
    last-scaled: uint
  }
)

(define-map resource-pools
  (string-ascii 20)
  {
    total-capacity: uint,
    allocated: uint,
    available: uint,
    cost-per-unit: uint
  }
)

(define-data-var total-system-load uint u0)

;; Read-only functions
(define-read-only (get-scaling-config (manufacturer principal))
  (map-get? scaling-configurations manufacturer)
)

(define-read-only (get-resource-pool (resource-type (string-ascii 20)))
  (map-get? resource-pools resource-type)
)

(define-read-only (get-system-load)
  (var-get total-system-load)
)

(define-read-only (can-scale-up (manufacturer principal) (additional-assemblies uint))
  (match (get-scaling-config manufacturer)
    config (< (+ (get current-active config) additional-assemblies) (get max-concurrent config))
    false
  )
)

;; Public functions
(define-public (initialize-scaling-config
  (manufacturer principal)
  (max-concurrent uint)
  (resource-allocation uint)
  (scaling-factor uint)
)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (asserts! (<= max-concurrent MAX_CONCURRENT_ASSEMBLIES) ERR_INVALID_CAPACITY)

    (map-set scaling-configurations manufacturer {
      max-concurrent: max-concurrent,
      current-active: u0,
      resource-allocation: resource-allocation,
      scaling-factor: scaling-factor,
      last-scaled: block-height
    })
    (ok true)
  )
)

(define-public (allocate-resources
  (manufacturer principal)
  (resource-type (string-ascii 20))
  (amount uint)
)
  (let (
    (config (unwrap! (get-scaling-config manufacturer) ERR_UNAUTHORIZED))
    (pool (unwrap! (get-resource-pool resource-type) ERR_INSUFFICIENT_RESOURCES))
  )
    (asserts! (>= (get available pool) amount) ERR_INSUFFICIENT_RESOURCES)

    (map-set resource-pools resource-type
      (merge pool {
        allocated: (+ (get allocated pool) amount),
        available: (- (get available pool) amount)
      })
    )

    (map-set scaling-configurations manufacturer
      (merge config { current-active: (+ (get current-active config) u1) })
    )

    (var-set total-system-load (+ (var-get total-system-load) amount))
    (ok true)
  )
)

(define-public (scale-up (manufacturer principal) (additional-capacity uint))
  (let ((config (unwrap! (get-scaling-config manufacturer) ERR_UNAUTHORIZED)))
    (asserts! (can-scale-up manufacturer additional-capacity) ERR_SCALING_LIMIT_REACHED)

    (map-set scaling-configurations manufacturer
      (merge config {
        max-concurrent: (+ (get max-concurrent config) additional-capacity),
        last-scaled: block-height
      })
    )
    (ok true)
  )
)

(define-public (create-resource-pool
  (resource-type (string-ascii 20))
  (total-capacity uint)
  (cost-per-unit uint)
)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (asserts! (> total-capacity u0) ERR_INVALID_CAPACITY)

    (map-set resource-pools resource-type {
      total-capacity: total-capacity,
      allocated: u0,
      available: total-capacity,
      cost-per-unit: cost-per-unit
    })
    (ok true)
  )
)
