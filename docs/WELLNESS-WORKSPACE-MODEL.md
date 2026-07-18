# Wellness and workspace model

## Status

The private eight-dimension assessment, current and desired ratings, focus states, reminder preference, dated history and companion-tool links are implemented on `codex/frontend-wellness-redesign`. They are not live because the production migration and Worker deployment are still pending.

The nested area hierarchy, context tags, organisation workspaces, client portals, shared roles and tenant model remain product direction for a future iteration. Nothing in this document should be read as a claim that those collaboration features or integrations currently exist.

## The wellness wheel

DeskOps should use eight **Dimensions of Wellness** as the optional lens through which a person can reflect on their life:

1. Physical
2. Emotional
3. Financial
4. Intellectual
5. Occupational
6. Social
7. Spiritual
8. Environmental

The wheel is a check-in, not a diagnostic, scorecard, or instruction to optimise every part of life. A person may leave a dimension unassessed, hide it from their wheel, or choose not to receive prompts about it. An unassessed dimension must be represented as `not tracking`, never as a score of zero.

Each assessment should independently record:

- current feeling: optional 1–10 rating;
- desired feeling: optional 1–10 rating for where the person would like it to be;
- focus state: active focus, background, or not tracking;
- optional reminder cadence, including never.

Current feeling and focus state are deliberately separate. Someone may be unhappy with their family situation but correctly decide that it is not their priority this month. DeskOps must respect that choice and must not turn a lower rating into pressure, an alert, or an automatic task.

Assessments are historical records associated with the signed-in person. The product may show changes over time only for dimensions the person has chosen to track.

## Areas and context tags

Dimensions describe the lens used by the Wheel. They are not a limit on how a person structures their life.

Users can create a nested hierarchy of areas below a dimension, plus optional context tags. A task can have one primary dimension and additional dimensions or tags when useful.

Start each dimension with three optional areas. They are helpful prompts, not a required taxonomy: a person can remove them, skip their scores, rename them, or add their own areas.

| Dimension | Optional starting areas |
| --- | --- |
| Physical | Diet and nutrition; Fitness and movement; Health and recovery |
| Emotional | Stress and resilience; Self-understanding; Rest and joy |
| Intellectual | Learning and skills; Creativity and curiosity; Focus and thinking |
| Social | Family and close relationships; Friends and community; Communication and belonging |
| Spiritual | Purpose and values; Practice and reflection; Meaning and contribution |
| Occupational | Employment and career; Independent work; Client and business work |
| Environmental | Home and living space; Digital and physical organisation; Nature and surroundings |
| Financial | Everyday money; Security and planning; Income, tax and future goals |

Occupational is intentionally designed for people whose work does not fit a single employer. It should feel equally natural for an employee, contractor, freelancer, creator, side-hustler, founder, volunteer, or someone between roles. Its starting areas mean:

- **Employment and career**: day job, job search, progression, studies, volunteering, or a role transition.
- **Independent work**: freelance work, contracts, personal projects, and side hustles.
- **Client and business work**: client delivery, a company, sales, operations, products, and founder work.

Examples of a deeper hierarchy:

- **Physical**
  - Diet and nutrition
  - Fitness and movement
  - Health and recovery
- **Occupational**
  - Day job
  - Side hustle
  - Client 1
  - Client 2
  - Internal work
- **Social**
  - Family
  - Relationships
  - Friends

`family`, `relationship`, `friend`, `home`, `leisure`, `client`, and similar labels should be usable as context tags. This preserves detail without requiring them to be separate Wheel dimensions.

Examples of classification:

- Book a dentist appointment → Physical; `health`
- Plan date night → Social + Emotional; `relationship`
- Resolve an energy bill → Financial + Environmental; `home`
- Prepare an invoice → Occupational + Financial; `client`

## Workspaces and clients

The Occupational hierarchy needs a first-class workspace model, rather than treating every work item as a personal tag.

1. **Personal space**: private to the person and includes all wellness data.
2. **Organisation workspace**: a shared business space with its own members, tickets, projects, clients, and reporting.
3. **Client portal**: a contained space for one client. Client members can raise and follow their own tickets and see only the records explicitly shared with that client.

The personal Wellness Wheel and all personal assessments must remain private. Organisation members and client portal users never gain visibility into them merely because a ticket is associated with Occupational work.

For a reliable single source of truth, each ticket has one owning workspace. DeskOps may surface a linked personal reminder or queue view, but it must reference the canonical ticket rather than duplicate or synchronise competing copies.

Before multi-user client workspaces ship, the data model needs organisation and membership boundaries, role-based permissions, auditable sharing, and tenant-scoped row-level security. Suggested initial roles are owner, operator, client requester, and client viewer.

## Assessment and focus flow

The first-run check-in should be calm, fully skippable, and have four short stages.

1. **Set the context.** Explain that this is a private snapshot, not a test or diagnosis.
2. **Assess only what matters.** For each selected dimension and optional starting area, show a plain-language description and ask for:
   - how the person feels about it now (optional 1–10);
   - where they would like it to be (optional 1–10);
   - whether they want to track it, keep it in the background, or ignore it for now.
3. **Choose focus.** DeskOps reflects the assessment back and asks which one to three areas the person actively wants support with. A gap between current and desired score is information, never a recommendation on its own.
4. **Offer optional next steps.** Only after focus is chosen, DeskOps may suggest a small number of relevant open-source companion tools and a few draft actions. The person explicitly chooses whether to see these suggestions and must approve every created task.

The assessment should persist both current and desired ratings with the assessment date, dimension/area identity, focus state, and reminder preference. This permits a private historical view without overwriting previous answers.

Open-source suggestions are external links only until a real opt-in integration exists. They must be labelled as independent projects, must not receive assessment data, and must never require OAuth, API keys, or any data connection to appear. Examples include wger for Physical goals, Actual Budget for Financial organisation, Paperless-ngx for life admin, Home Assistant or Grocy for Environmental/home systems, n8n for automation, and Plane or OpenClaw for Occupational workflows.

## Front-end language

The first-run check-in should use calm, optional language:

> How are you feeling across your life right now? There are no right answers. This gives DeskOps a starting point.

Then ask:

> What would you most like more support with over the next few weeks?

The interface should always offer **Not tracking right now** and **Skip this assessment**, and should explain that people can change their focus and reminder settings at any time. When a rating is requested, include a quiet note such as: *A 10 is not perfect. It is simply what feels right to you.*

For the hack/demo, existing life-domain functionality remains valid until this model is implemented across the schema, AI classifier, queue filters, Wheel, and tests.
