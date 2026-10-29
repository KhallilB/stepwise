# M3 recruiting plan

How we find and book the eight people for the [M3 learner study](../docs/roadmap.md#m3--learner-study). This is slice 3.1, and it's done when **eight participants are booked**.

## Status

On 2026-10-29: the [screener](m3-screener.md), this plan and the [consent form](m3-consent.md) are drafted. Nothing has been posted or sent, no tools have been set up, and **0 of 8** participants are booked. The decisions the owner still has to make are listed under [Open decisions](#open-decisions).

## Who we're looking for

The study is for the people Stepwise is for first (see [Product](../docs/product.md#who-its-for)): **visual learners practicing coding-interview problems**. That means self-taught developers, bootcamp graduates and students who:

- practice data structures and algorithms problems, now or in the last three months,
- can read basic JavaScript, because the prototype's problems are in JavaScript, and
- lose track once indexes, pointers or recursion show up.

Interview candidates and computer science students are welcome too, as long as most of the eight fit the description above. The [screener](m3-screener.md#choosing-the-eight) says how we choose.

We don't screen out people who practice in Python. We want to know how many of them there are (see [What the language question is for](m3-screener.md#what-the-language-question-is-for)).

## What a session is

Enough detail to book people. The full protocol is part of the study kit (slice 3.2).

- **Length:** 45 minutes on a video call, booked as a 60-minute slot so a late start doesn't cut the session short.
- **Setup:** the participant's own laptop or desktop, a recent Chrome or Firefox, screen sharing on. Camera is optional.
- **Task:** fix a planted bug in a short JavaScript solution twice: once with Stepwise and once with `console.log`, on two different problems. Which tool comes first, and which problem goes with which tool, is varied across participants so neither tool gets the easier problem or the second try every time.
- **Recorded:** the study kit logs times, steps and runs. Screen and audio are recorded only if the participant agrees (see [consent](m3-consent.md)).
- **Afterwards:** a few questions about what helped and what didn't.

## Timeline

Weeks count from the day M1 started, as in the [roadmap](../docs/roadmap.md). M3's target is week 5.

| When | What |
|---|---|
| Week 1 (now) | Owner reviews this plan and makes the [open decisions](#open-decisions) |
| Weeks 1 to 2 | Publish the screener. Post in the owner's own network first, then in one or two communities at a time |
| Weeks 2 to 3 | Choose eight and two standbys. Invite them and book slots in weeks 4 and 5 |
| Booked | Record slice 3.1 in [`progress.json`](../progress.json) once eight have confirmed a slot |
| Two days before each session | Reminder with the call link and what to have ready |
| Weeks 4 to 5 | Sessions run (slice 3.3) |

Sessions are booked before the study kit exists, which is why recruiting starts early. If the kit's dry run (slice 3.2) slips, move every slot together and tell participants straight away, and keep the standbys warm.

## Where we'll ask

In this order. Stop adding channels once there are about 25 eligible answers, which should be enough to pick a balanced eight.

| Channel | Why | Before posting | Status |
|---|---|---|---|
| Owner's own network (LinkedIn, X or Bluesky, friends of friends) | Fastest, and people answer someone they know | Nothing; it's the owner's own account. Keep people the owner knows to 2 of 8 | Not posted |
| Bootcamp alumni groups and learning communities (for example freeCodeCamp's forum, The Odin Project's Discord, a local bootcamp's alumni Slack) | Exactly the self-taught and bootcamp learners we want | Read the community's rules on research and self-promotion, and ask a moderator first | Not posted |
| Interview practice communities (for example r/leetcode, r/learnprogramming, r/cscareerquestions) | Many people practicing interview problems, in every language | Read each subreddit's rules; several ban surveys or self-promotion or want moderator approval. Ask the moderators first | Not posted |
| University coding clubs and local meetups | Students checking coursework, and in-person learners | Ask the organiser | Not posted |

Each post links to the screener with a different tag (for example `?src=network`), so the report can say where people came from.

## Booking

1. Choose eight and two standbys from the screener answers, as the [screener](m3-screener.md#choosing-the-eight) describes.
2. Send the [invite](#invite-chosen) with a booking link that shows 60-minute slots in weeks 4 and 5, in the participant's time zone.
3. When someone books, the calendar invite includes the call link, the [consent form](m3-consent.md) and what to have ready.
4. A participant counts as **booked** when they've picked a slot and replied to the [confirmation](#confirmation).
5. Send a [reminder](#reminder) two days before. If someone cancels, offer one new slot; if that fails, invite the next standby.
6. Send the [not chosen](#not-chosen-this-time) reply to everyone else who passed the gates, so nobody is left waiting.

## Consent

Everyone signs the [consent form](m3-consent.md) before their session starts. It's sent with the calendar invite and checked again at the start of the call.

- Taking part and being recorded are separate choices. Someone who doesn't want to be recorded can still take part; the study kit's logs carry the timings.
- Participants can stop at any time, and can ask for their data to be deleted until the report is published.
- Participants must be 18 or older.

## Incentive

**Proposed, not decided:** a $30 gift card, or a donation of the same amount to a charity they choose, for each session, even if the participant stops early. It's paid within a week, and also paid if we cancel with less than a day's notice. The amount is the owner's call; once it's set, add it to the form introduction and every draft below.

## Privacy and records

This repository is public. See the [privacy rules](README.md#privacy).

- Screener answers stay in the form tool. Bookings stay in the booking tool. A private tracker links them, with one row per person: label (P1 to P10), status (screened, invited, booked, confirmed, done, no-show, standby), slot and screener notes.
- Recordings and session notes are stored privately and deleted when the report is written and checked, at most 90 days after the last session.
- Only counts go into this repository: how many answered, how many passed the gates, how many were booked, the language counts, and which channels they came from.

When eight are booked, update the `s3-1-recruit` entry in [`progress.json`](../progress.json): `result` to `pass`, the date, what was measured (participants booked, standbys, screener answers, eligible answers, main practice language for both counts), this page as evidence, and the commit.

## Risks

| Risk | What we'll do |
|---|---|
| Too few answers | Add the next channel. Ask the first few participants to pass the screener on |
| Mostly experienced engineers answer | Hold to the 2-of-8 limit and post in more beginner-focused places |
| Most respondents practice in Python | Still book people who can read JavaScript, and report the count; that's what [decision 0005](../docs/decisions/0005-javascript-first.md) asks us to watch for |
| No-shows | Two standbys, a reminder two days ahead, and one offer to reschedule |
| The study kit isn't ready in time | Move all slots together and tell participants straight away |

## Open decisions

The owner makes these before anything is published.

| Decision | Options | Decided |
|---|---|---|
| Form tool for the screener | Any form tool that can export answers and tag sources, such as Google Forms or Tally | Not yet |
| Booking tool | A scheduling link such as Cal.com or Calendly, or slots offered by email | Not yet |
| Call and recording tool | Any video call tool that records screen and audio locally or privately | Not yet |
| Incentive | See [Incentive](#incentive) | Not yet |
| Contact address in the drafts | An address used only for this study, or the owner's own | Not yet |
| Which channels to post in | See [Where we'll ask](#where-well-ask) | Not yet |

## Outreach drafts

All drafts. Nothing here has been posted or sent. Replace each `[bracketed]` part before use.

### Short post

For LinkedIn, X, Bluesky or a community thread.

> Practicing coding-interview problems? I'm looking for 8 people to try an early prototype of Stepwise, a tool that shows your code running one step at a time as a picture: arrows on an array, a grid filling in.
>
> 45 minutes on a video call. You fix two small planted bugs in JavaScript, one with Stepwise and one with console.log. We're testing the tool, not you. [Incentive.]
>
> 3-minute form: [screener link]

### Longer post

For a forum or subreddit, after a moderator has said yes.

> **Looking for 8 people to test a visual debugger for algorithm practice (45 min, remote, [incentive])**
>
> Hi all, [moderator name] said it was OK to post this here.
>
> I'm building Stepwise, an open-source tool that runs your solution one step at a time and draws it the way a teacher would sketch it: `lo` and `hi` as arrows on an array, a BFS grid filling in, one plain sentence per step. Before building the real thing, I want to find out whether it actually helps people fix bugs faster than `console.log`.
>
> **Who:** you've practiced data structures and algorithms or interview problems in the last few months, and you can read basic JavaScript (you don't need to practice in it). Especially if you lose track once indexes, pointers or recursion show up.
>
> **What:** a 45-minute video call from your own laptop. You'll fix two small planted bugs, one with Stepwise and one with `console.log`. We're testing the tool, not you.
>
> **Privacy:** your answers and any recording stay private. The public write-up only has counts and anonymous findings.
>
> 3-minute form: [screener link]. Questions welcome here or at [contact address].

### Moderator request

> Hi [name], I'm [owner name], building Stepwise, an open-source visual debugger for people practicing algorithm problems. I'm looking for 8 people for a 45-minute remote study comparing it with `console.log`, and [community] has exactly the learners it's for. Would you be OK with me posting a short call for participants? It links to a 3-minute form, nothing is sold, and [incentive]. Happy to change the wording or post it wherever you prefer. Thanks either way.

### Personal message

> Hey [name], I'm testing an early prototype of Stepwise, a tool that shows algorithm code running step by step as a picture. Do you (or someone you know who's practicing interview problems) have 45 minutes in [weeks] to try it on a video call? You'd fix two small planted bugs, one with the tool and one with console.log. [Incentive.] 3-minute form: [screener link]

### Invite (chosen)

> Subject: Stepwise study: pick a time
>
> Hi [name],
>
> Thanks for filling in the Stepwise screener. I'd love you to take part.
>
> The session is 45 minutes on a video call, from your own laptop or desktop with a recent Chrome or Firefox. You'll fix two small planted bugs in JavaScript, one with Stepwise and one with `console.log`. We're testing the tool, not you. [Incentive.]
>
> Please pick a time here: [booking link]. The slots are in your time zone.
>
> Before the session, please read the consent form: [consent link]. You can stop at any time, and being recorded is a separate choice.
>
> If none of the times work, reply and we'll find another.
>
> Thanks,
> [owner name]

### Confirmation

> Subject: Stepwise study on [date] at [time]
>
> Hi [name], you're booked for [date] at [time] ([time zone]). Could you reply to confirm?
>
> - Call link: [link]
> - Have ready: a laptop or desktop, a recent Chrome or Firefox, and screen sharing allowed. Camera is optional.
> - Consent form: [consent link]
>
> If you need to move it, reply any time before then.

### Reminder

> Subject: Reminder: Stepwise study [day] at [time]
>
> Hi [name], a reminder that your Stepwise session is on [date] at [time] ([time zone]). Call link: [link]. If you need to move it, just reply. See you then.

### Not chosen this time

> Subject: Stepwise study
>
> Hi [name], thanks for filling in the Stepwise screener. This round is full, so I won't be booking you this time. If a place opens up, could I get in touch? I'll also delete your answers once the study is done.
>
> Thanks for your interest,
> [owner name]

### Thank you

> Subject: Thanks for testing Stepwise
>
> Hi [name], thanks for your time today. It really helps. [Incentive and when it arrives.] When the study write-up is public, I'll send you the link. If you'd like your data deleted before then, just reply.
