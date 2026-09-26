---
title: "Review a Data Processing Clause for DPDP Compliance"
subTab: review
difficulty: medium
timeMinutes: 20
skills: ["contract-review", "data-protection", "risk-spotting"]
relatedLearn: [dpdp-act-basics]
rubric:
  - "Flagged that the clause never identifies which party is the Data Fiduciary and which (if either) is a processor acting on instructions."
  - "Flagged that there is no consent mechanism described at all — the clause assumes data can be processed without addressing how consent is obtained."
  - "Flagged the absence of any security safeguard obligation."
  - "Flagged that there's no provision for a Data Principal's withdrawal of consent or data deletion request."
  - "Proposed a concrete redraft addressing each gap, not just a list of problems."
modelAnswer:
  - "Missing fiduciary/processor allocation: the clause says the Vendor 'may process customer data as needed to perform the Services' without ever stating whether the Vendor is acting as a Data Fiduciary in its own right or purely as a processor on the Company's instructions. Under the DPDP Act, this allocation matters — a Data Fiduciary bears the compliance obligations (notice, consent, security safeguards) directly, so leaving it unstated leaves genuine ambiguity about who is actually responsible if something goes wrong."
  - "No consent mechanism: the clause is silent on how (or whether) the Data Principal's consent was obtained for the processing described. Since consent is the operative basis for lawful processing under the Act (free, specific, informed, unconditional and unambiguous, via clear affirmative action), a contract that authorises processing without addressing this is building on an assumption that may not hold."
  - "No security safeguards obligation: there's no requirement that the Vendor take reasonable security measures to prevent a personal data breach — an obligation the Act places on a Data Fiduciary directly, and one a commercial contract should mirror as a contractual (not just statutory) obligation, so a breach gives the Company a contractual remedy too."
  - "No withdrawal/deletion mechanism: the clause doesn't address what happens if a Data Principal withdraws consent, or what the Vendor must do with data after the engagement ends. A DPDP-aware clause should require the Vendor to support the Company's obligations to honour withdrawal (which must be roughly as easy as giving consent was) and to delete or return data on termination."
  - "A stronger redraft: explicitly designates the Company as Data Fiduciary and the Vendor as a processor acting solely on the Company's written instructions; requires the Vendor to implement reasonable security safeguards and notify the Company promptly of any suspected breach; requires the Vendor to assist the Company in honouring Data Principal requests (access, correction, withdrawal of consent, erasure); and requires deletion or return of all personal data on termination, subject to any legal retention requirement."
---

## Brief

You act for a company (the "Company") engaging a third-party vendor to run its customer support platform, which involves processing customer personal data. The vendor's draft services agreement includes this one-sentence data clause:

> *"The Vendor may process customer data as needed to perform the Services under this Agreement."*

## Instructions

This clause treats a genuinely significant compliance question as an afterthought. Identify what's missing from a DPDP Act perspective, explain why each gap matters, and propose a redraft that actually addresses them — not just a longer version of the same one-liner.
