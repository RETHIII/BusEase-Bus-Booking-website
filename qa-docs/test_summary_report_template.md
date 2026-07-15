# BharatBus - Test Summary Report Template

This report summarizes the testing activities, execution metrics, test coverage, and defect statuses for a specific release build of BharatBus.

---

## 1. Executive Summary
Provide a high-level summary of the test execution results, highlighting whether the build is stable for production release.

---

## 2. Test Execution Details
* **Release Version**: vX.Y.Z
* **Build Number**: #XXXX
* **Execution Period**: [Start Date] to [End Date]
* **Lead QA**: [Name]
* **Testing Environment**: (e.g., Staging - PostgreSQL + Spring Boot 3.3.0)

---

## 3. Test Case Execution Summary (Metrics)

| Test Module | Total Tests | Executed | Passed | Failed | Blocked | Pass % |
|---|---|---|---|---|---|---|
| Authentication | 8 | 8 | 8 | 0 | 0 | 100% |
| User Profile | 3 | 3 | 3 | 0 | 0 | 100% |
| Bus Search & Filters | 7 | 7 | 7 | 0 | 0 | 100% |
| Seat Selection | 6 | 6 | 6 | 0 | 0 | 100% |
| Booking & Payment | 11 | 11 | 10 | 1 | 0 | 90.9% |
| Security | 6 | 6 | 6 | 0 | 0 | 100% |
| Responsive | 3 | 3 | 3 | 0 | 0 | 100% |
| API & Database | 4 | 4 | 4 | 0 | 0 | 100% |
| Edge Cases | 4 | 4 | 3 | 1 | 0 | 75% |
| **TOTAL** | **52** | **52** | **50** | **2** | **0** | **96.1%** |

---

## 4. Defect Distribution & Summary
Details of the bugs identified during testing, classified by severity.

### Defect Count by Severity:
* **Blocker**: 0
* **Critical**: 1
* **Major**: 1
* **Minor**: 2
* **Trivial**: 0

### Open Defect Details:
| Defect ID | Description | Severity | Priority | Status |
|---|---|---|---|---|
| BUG-1002 | Booking fails when server is restarted during payment processing. | Critical | High | Open |
| BUG-1003 | Profile page takes > 3 seconds to load on Slow 3G network throttling. | Minor | Low | Open |

---

## 5. Scope & Coverage
* **In-Scope**: Web application core flow (Search, Seat Map Redesign, Checkout, Payment simulation, Admin User list, Security filters).
* **Out-of-Scope**: Direct real credit card gateway integration (mocked), SMS notifications.

---

## 6. Recommendations & QA Sign-Off
* **Status**: [GO / NO-GO]
* **Comments**: [Describe if the build can be deployed to production, specifying if any workaround is needed for open minor bugs.]
