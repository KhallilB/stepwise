# M3 screener

The questions people answer to take part in the [M3 learner study](../docs/roadmap.md#m3--learner-study). It takes about three minutes. How we find people and book them is in the [recruiting plan](m3-recruiting.md).

**Status:** draft, not published. The questions are written so they can be pasted into any form tool; the owner picks the tool.

Each question is marked:

- **Gate:** the answer decides whether someone can take part.
- **Profile:** helps us pick a balanced eight. Never a reason on its own to turn someone down.
- **Record:** kept for the study report only.

## Form introduction

> **Help test a new way to debug algorithm practice**
>
> Stepwise shows your code running one step at a time, drawn as a picture: arrows on an array, a grid filling in. We're testing an early prototype with eight people who practice coding-interview problems.
>
> A session is 45 minutes on a video call, from your own laptop. You'll fix two small bugs we've planted in short JavaScript solutions, one with Stepwise and one with `console.log`. We're testing the tool, not you.
>
> [Incentive line, once decided.] This form takes about three minutes. Your answers are kept privately and are only used to choose participants for this study.

## Questions

### About your practice

**1. Are you 18 or older?** *Gate: Yes.*

- Yes
- No

**2. In the last three months, have you practiced coding-interview or data structures and algorithms problems?** For example on a practice site, from a book, or for a class. *Gate: either Yes.*

- Yes, most weeks
- Yes, now and then
- No

**3. Which languages do you practice those problems in?** Choose all that apply. *Record.*

- JavaScript
- TypeScript
- Python
- Java
- C++
- C#
- Go
- Other: ____

**4. If you had to pick one, which is your main language for practice?** *Record.* Same choices as question 3, one answer.

**5. How did you mostly learn to code?** *Profile.*

- On my own
- At a bootcamp
- At university or college
- Other: ____

**6. How long have you worked as a paid software developer?** *Profile.*

- Not yet
- Less than a year
- 1 to 3 years
- More than 3 years

**7. When an algorithm uses indexes, pointers or recursion, which sounds most like you?** *Profile.*

- I can usually follow it in my head
- I follow it until a few things change at once, then lose track
- I often lose track and need to draw it out or print values

**8. When your solution gives the wrong answer, what do you usually do first?** *Record.*

- Print values (`console.log`, `print` or similar)
- Use a debugger with breakpoints
- Re-read the code
- Look at a worked solution
- Other: ____

### JavaScript

The study's problems are in JavaScript, so we need people who can read it. You don't need to practice in it.

**9. How comfortable are you reading and writing JavaScript?** *Profile.*

- 1 — I can't really read it
- 2 — I can read simple code
- 3 — I can write small functions
- 4 — I'm comfortable
- 5 — I use it every day

**10. What does this print?** *Gate: 4.*

```js
const nums = [4, 8, 15];
nums.push(16);
console.log(nums.length);
```

- 3
- 4
- 16
- Not sure

**11. Have you used print statements to find a bug before?** *Gate: either Yes.*

- Yes, `console.log` in JavaScript
- Yes, but only in another language (for example `print` in Python)
- No

### The session

**12. Can you join from a laptop or desktop computer and share your screen?** *Gate: Yes.*

- Yes
- No

**13. Which times usually suit you?** Choose all that apply. *Record, for booking.*

- Weekday mornings
- Weekday afternoons
- Weekday evenings
- Weekends

**14. What's your time zone?** *Record, for booking.* Free text.

**15. Have you used Stepwise before?** *Gate: not the last answer.*

- No
- I've heard of it or seen screenshots
- I've stepped through problems in the prototype

**16. Do you know the person running this study, or have you worked on Stepwise?** *Profile.*

- No
- Yes

**17. Is there anything that would help you take part?** For example a screen reader, captions, or extra time. Optional free text. *Never used to turn anyone down.*

### Contact

**18. What should we call you?** Free text.

**19. Email address.** Used only to contact you about this study.

**20. Can we email you about taking part in this study?** *Gate: checked.*

- [ ] Yes, you can email me about this study

## Choosing the eight

1. Drop anyone who fails a gate.
2. From the rest, pick eight to book and two as standbys, aiming for:
   - At least 5 of 8 who answered the second or third choice in question 7. They're the visual learners the product is for.
   - No more than 2 of 8 with more than 3 years of paid work (question 6), so the result isn't carried by people who would fix the bugs quickly anyway.
   - No more than 2 of 8 who know the person running the study (question 16).
   - A spread of main languages (question 4) and learning paths (question 5). Python users who can read JavaScript are welcome; don't screen them out.
3. Use a random draw to break ties, and note that you did.

## What the language question is for

The [roadmap](../docs/roadmap.md#risks) and [decision 0005](../docs/decisions/0005-javascript-first.md) both say we should bring Python forward if most study participants practice in Python. The study report gives two counts for question 4, with no names:

- the eight booked participants, and
- everyone who answered the screener, whether or not they were picked.

The second count is the better signal. Question 10 means everyone booked can read JavaScript, which pulls the first count towards JavaScript. Both counts are also shaped by where we post, so the report names the channels.
