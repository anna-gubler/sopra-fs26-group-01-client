# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - 25.03 to 30.03

* Scrum meeting 1: 30.03

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@chiawld** | 25.03.2026   | [Commit Frontend](https://github.com/anna-gubler/sopra-fs26-group-01-client/compare/d68fe82...fedce43) | Frontend: Cleaned up frontend and fixed auth endpoints to match REST specs (#1, #2), applied Catppuccin Mocha colour scheme & styled in Ant design | Ensures client correctly integrates with backend and establishes the visual design foundation |
|                    | 26.03.2026   | [Commit Backend](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/8e75271) | Backend: Implemented iSkillMapMembership entity and all remaining skillmap endpoints (#39, #40, #41, #42) | Completes the central SkillMap backend needed for the frontend to manage maps and memberships |
|                    | 28. - 29.03.2026   | [Commit Frontend](https://github.com/anna-gubler/sopra-fs26-group-01-client/compare/fedce43...51e692f) & [Commit Backend](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/1d70487) | Frontend: Full UI redesign with dark theme, animated landing page, fixed login redirect and logout state (#1, #2, #3, #4). Backend: Implemented POST /skillmaps/join and fixed spec compliance issues in skillmap validation (#36, #39) | Design based on our mockups, resolves auth flow bugs, and completes the skillmap join flow |
| **@anna-gubler** | 25.03.2026   | [Link to Commit 1](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/2b26058395444599aa7a8462a07820459e5c97eb) | Created Entity Skill, with service, controller, dto and mappings (#33, #35). | Basic compontent of our Skill Map. |
|                    | 26.03.2026   | [Link to Commit 2](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/02c88374e2f6747e3614ce3de204e35d77b6dba9) | Created SkillMap Entity with service and controller (#51, #52, #53, #54, #55). | Skill Map is the foundational element of our project. |
| **@elsithewizzard** | 29.03.2026   | [Commit Frontend] (https://github.com/anna-gubler/sopra-fs26-group-01-client/commit/769faf317146bb68f4b41dbcc0ccc887c9937d6c) | Added base frontend skillmap logic, Merged S1 Design & resolved CSS conflicts, built skillmap overview page, skill map create page & skill map edit page, added join map button | Initial front end setup, required for continued working on logic and design. Total effort around 7h |
|                    | 29.03.2026   | [Commit Frontend] (https://github.com/anna-gubler/sopra-fs26-group-01-client/commit/7986ffa654e5e2a476d95d108bd3ef89eaac62c2) | Added Skillmap page using react flow, styling according to design | Visual base for nodes & interaction. Skeleton of Skillmap needs to be there in order to function. Currently, using mock data only. Total effort around 3.4h |
| **@sebdahub** | 26.03.2026   | [https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/4e71aaef6f78c371f5fe667347de515dee9f0760] (last commit of branch) | refactored and cleaned up everything user related in backend, including API and tests | Give a solid basis to work on and make sure the design follows the specs. Effort about 12h.  |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@haslam** | 29.03.2026 | [Commit 1](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/ee6dbd2e9e8ebc19642b7150d0ee93f014ac576a)(latest commit to that branch) | Added seed and style fields to User entity, set avatar defaults on registration, implemented PUT /users/me/avatar endpoint with DTO and mapper (#47, #48) | Implements backend avatar generation logic for S3, enabling frontend to display and update user avatars |
|                    | 29.03.2026 | [Commit 2](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/a7d0dd5d8448779cf6e5253227a6579733efb8f0) | Added SkillMapController tests for all endpoints and fixed getUserByToken to checkToken in SkillMapService (#43) | Ensures skillmap endpoints are tested and fixes S1/S2 integration issue |

---

## Contributions Week 2 - 30.03 to 05.04

* Easter break starts on 02.04

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@chiawld** | 03.04.2036   | BE [S7: skillmap join tests](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/f04dd89) | Added integration tests for POST /skillmaps/join and GET /skillmaps. Added controller tests for all POST /skillmaps/join errors. | I had already implemented #77, #78, #79 last week, only #80, the tests, were missing for User Story 7 Backend. |
|                    | 04.04.2026   | BE: [S1 password endpoint](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/923439e), [auth fixes](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/04005cf) / FE: [profile edit](https://github.com/anna-gubler/sopra-fs26-group-01-client/commit/4273d7c), [skill map nav](https://github.com/anna-gubler/sopra-fs26-group-01-client/commit/96d99e4)  | Implemented password change endpoint with old password verification, fixed backend inconsistency interfering with frontend functionality (after merge of S4), added edit profile form, password change UI, skill delete confirmation, and added additional skill map navigation | Completes the user profile management flow end-to-end (#2) and improved skill map interaction (#11, #13, #14), backend fixes resolved auth issues affecting frontend. |
| **@anna-gubler** | 03.04.2026  | BE: [S4 writing tests and merging](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/15c4623ebd049cf076b5e8bf904a28c009cb2390) | Implemented most important tests to ensure that S4 works correctly and then merged while resolving merge conflicts. | Ensures that S4 (Skills) is properly merged into main and functionable. |
|                    | 04.04.2026   | BE: [S5 dependencies backend](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/b9f29e3f1cf95f491ed81ed6c34b7c361f8a833f) | I implemented the whole user story 5 backend, with entity dependency, it's services, REST endpoints and tests. Now ready to merge into main. | Dependencies connect our skills inside a skillmap and are an integral part of our project. |
| **@elsithewizzard** | 31.03.2026 | [Refactoring CSS, API Structure, Error Handling](https://github.com/anna-gubler/sopra-fs26-group-01-client/commit/f8c8273b54c78677f200f356c92fc16723f8bf4d) | Refactored CSS, API Struct and Errors according to Feedback from the 30.03 TA meeting. CSS in separate files for better performance and convention, error handling using hot toast, and API structure according to convention | Made everything (hopefully) run smoother in the long run, as well as clean up the front end [Refer to Branch for more commits](https://github.com/anna-gubler/sopra-fs26-group-01-client/commits/S4/Skillmap-Visualisation) |
|                    | 04.04.2026 | [S4 #11 & #12](https://github.com/anna-gubler/sopra-fs26-group-01-client/commit/fa6c3b091941dd2cf978987a3f1672467367641f) | Finished Tasks #11 and #12, as well as adding a publish and edit button based on map ownership. Tasks #11 and #12 included visualisation of the map, as well as skill adding & editing | Base for building the skillmap. This way, we can connect endpoints and build our first version of a skillmap :) |
| **@sebdahub** | 03.04.2026   | [[S1/be-user-entity-refactors](https://github.com/anna-gubler/sopra-fs26-group-01-server/tree/S1/be-user-entity-refactors)] | [deleted GET /users, added interceptor, added OpenAPI swagger, several small refactors like changing getUserByUsername from type User to type Optional] | [Self-explanatory] |
|                    | 05.04.2026   | [https://github.com/anna-gubler/sopra-fs26-group-01-client/commit/bc498a183a25bb7de3217ead1acbf90ca11e1e09] | [designed a specification for the websocket] | [Agreeing on high level decisions before starting work on collaboration mode will help to reduce confusion.] |
| **@haslam** | 05.04.2026   | FE: [S3 #8 avatar display](https://github.com/anna-gubler/sopra-fs26-group-01-client/commit/c2ec35e9149737016762f489881c771716abb5a4) | Added `seed` and `style` fields to User type, created DiceBear avatar URL helper, integrated avatar display on profile and skillmaps pages. | Completes S3 #8 frontend — users now get a unique auto-generated avatar displayed on registration. |
|                    | 05.04.2026   | FE: [S3 #9 avatar picker](https://github.com/anna-gubler/sopra-fs26-group-01-client/commit/1ae8798) | Built style/seed picker UI on profile page with live previews and save functionality via PUT /users/me/avatar. | Completes S3 #9 — users can now customise their avatar style and seed from their profile page. |

---

## Contributions Week 3 - 06.04 to 12.04

* Easter break till 12.04
* @elsithewizzard is less available and took up extra work in Week 2 to compensate

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@chiawld** | 06.04.2026   |BE: [S5 fix: auth & graph](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/e870dcd55c60265aebaeea7d6d970d353ffa381b) & FE: [S5 feat: dependecy creation, deletion and interaction in skill map](https://github.com/anna-gubler/sopra-fs26-group-01-client/pull/76) | Fixed Bearer token stripping in DependencyController and wired dependencies into GET /skillmaps/{id}/graph; implemented edge creation/deletion with logical UI, difficulty-based node colors, and drag-to-reposition skills with optimistic UI updates. | Implementation of front-end User Story 5, closes tasks #15–#18: enabled full interactive skill map editing and visualisations. |
|                    | 09.04.2026   | FE: [S8 node inspection](https://github.com/anna-gubler/sopra-fs26-group-01-client/commit/1642217) | Implemented skill node detail panel with side view, differing between student and owner view for functionalities (edit, viewing). Adapted skill map view formatting with title bar and information placeholders. Implemented updating dashboard stats. | Completes the front-end of User Story 8. Students can now inspect a skill node and view information, owners can edit information in a skill node. |
| **@anna-gubler** | 11.04.2026    | [BE: S10 Implementation](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/fab630dca209cf3498dcdd89577f1178c473ce4c) | Created understanding Rating Functionality | Key Live Collaboration Feature |
|                    | 11.04.2026  | [BE: S10 Tests](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/bc2f04238c93ceb26c06069980f879f3f000d31b) | Tested S10 functionality | To ensure code quality and functionality |
| **@elsithewizzard** | 12.04.2026 | [S7: Skill Map Join](https://github.com/anna-gubler/sopra-fs26-group-01-client/commit/e0ca518060cccf179904a23bdd17878d9ac0574a) | Added Skill Map join functionality (front end only). Skill map join code shown in the skillmap view to copy, and added the option to join a map via a code or a link. Separated my maps and joined maps on dashboard | Allows for users to join skillmaps |
|                    | 12/13.04.2026 | [S7: Skill Map join error handling, navigation adjustments and quality of life UI/UX](https://github.com/anna-gubler/sopra-fs26-group-01-client/compare/main...S7/Skillmap_Join) | Error handling via hot toast for private or unavailable maps, navigation overhaul and redirect adjustments | More "enjoyable" user experience when using the platform |
| **@sebdahub** | 10.04.2026   | [S9: CollaborationSession (Websocket Setup)](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/b871c7e6917b9f0dca527974cce889aad9af31b3) | [Implemented start and end collaboration session (without testing)] | [enables us to build all collaboration session functionality on top of it] |
|                    | 11.04.2026   | [S9: CollaborationSession Tests](https://github.com/anna-gubler/sopra-fs26-group-01-server/commit/9b2271613654d0933f49d8b10bff580ab7df763e) | [Implemented all tests for the features of S9] | [Self-explanatory] |
| **@hadaslam** | [12.04.2026]   | [FE: S6 implementation](https://github.com/anna-gubler/sopra-fs26-group-01-client/commit/990062f817a040821f5e8a5e0dca92c3a6d8b43d) | Added privacy toggle to map creation form and invite code display with copy button on public map cards. (backend already done, only few minor stweaks)| Allows entire map sharing function|
|                   | 11.04.2026   | FE: [feat(#9): add all DiceBear styles to avatar picker and clean up styling](https://github.com/anna-gubler/sopra-fs26-group-01-client/commit/3fe8c13dd0c363c6d4cdcb78504428b248bbe11e) | Added all 31 DiceBear styles to avatar picker, cleaned up avatar styling in profile and skillmaps pages (& fixed minor bug in backend to make it compatible with frontend) | Users can now pick from all available DiceBear styles for avatar & tried to eliminate inline styling, but style classes did not work for img & img grid|

---

## Contributions Week 4 - 13.04 to 19.04

* Scrum meeting 2: 13.04

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@chiawld** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@anna-gubler** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@elsithewizzard** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@sebdahub** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@haslam** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 5 - 20.04 to 24.04 Deadline

* Scrum meeting 3: 20.04
* Deadline M3: 24.04

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@chiawld** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@anna-gubler** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@elsithewizzard** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@sebdahub** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **@haslam** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

