Orientation
Time: 2.5 weeks remaining
The four dimensions assessed at the end:
	• Functionality — do the things work?
	• Completeness — are the things that were promised there?
	• Robustness — does it hold up under realistic conditions?
	• Usability — can a new user figure it out without help?
Bug tolerance threshold: no more than 1 major or 4 minor problems.
	• Major: app crash, or rendering issues that prevent interaction
	• Minor: high latency, confusing dialogs, small UX issues
Scope can influence the rating if the app is "too simple". Lucio and our M3 feedback both confirmed that our MVP scope already clears that bar — so this is not our main risk.
There are no free quiz APIs suitable for our use case. If we go for the quiz, we build it ourselves.

Option A — Robustness
Focus on:
	• Identifying and eradicating bugs
	• Implementing features that improve usability
	• Preparing documents (Report, README, etc.)
Only in second priority:
	• Expanding scope (quiz feature)
Intention:
	• Functionality & Robustness: Collect bug to-do's 
		○ Get feedback from beta testers
		○ Break Mappd as hard as possible ourselves until Wednesday
	• Completeness: Go through M1 acceptance criteria, check if anything promised is missing
	• Usability (if time allows): Observe a non-technical person navigating the platform cold
On Wednesday:
	• Collect all identified bugs
	• Sort remaining to-do's into: 
		○ Features that advance usability → high priority
		○ Features that expand scope → low priority
	• Prioritize and distribute tasks across the team

Option B — Quiz
Focus on:
	• Implementing the quiz feature (S15, S16 — scoped to core flow only: no skill unlocking, no cooldown enforcement, no session-mode integration)
	• Fixing bugs outlined by beta testers
Only in second priority:
	• Robustness and usability polish
	• Documents (Report, README, etc.)
Risk: 2.5 weeks is tight for a feature of this scope alongside stabilization work. If the quiz cannot be completed cleanly or begins to destabilize the product, it gets cut.

Personal preference
Based on effort estimates and the explicit focus of the M4 assignment on stability and polish over new features, I would recommend Option A. It is more aligned with what the assignment asks of us and carries significantly less risk given the time remaining.