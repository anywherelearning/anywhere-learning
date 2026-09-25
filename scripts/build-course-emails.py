#!/usr/bin/env python3
"""
Builds the Kit custom HTML templates for the free email course
"Real-World Learning in 5 Days" (emails 2 to 5; email 1 was hand-built and
approved first, and this file reuses its exact styles).

Each template hardcodes the body. In Kit, the sequence email holds only the
greeting, which lands in {{ message_content }}.

Usage:  python3 scripts/build-course-emails.py 2      (builds email 2)
Writes emails/kit-ready/course-<n>-day<n>.html, copies it to
~/Desktop/Anywhere Learning/Convert Kit/kit-ready/, and writes a preview with the
photo embedded to notes/preview-course-<n>.html.
"""
import base64, os, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOREST, DARK, INK, BODY, TINT, GOLD = '#588157', '#3d5c3b', '#2f3a2e', '#4b5563', '#eef2ea', '#e8c99a'


def header(n, label, title):
    dots = ''.join(
        f'<td style="padding:0 4px;"><div style="height:6px; width:{26 if i == n else 18}px; border-radius:3px; '
        f'background:{FOREST if i <= n else "#ded9cc"}; line-height:6px; font-size:0;">&nbsp;</div></td>'
        for i in range(1, 6))
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<style>
  :root {{ color-scheme: light; supported-color-schemes: light; }}
  html, body {{ margin:0; padding:0; background:#ebe9e2; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; -webkit-font-smoothing:antialiased; }}
  a {{ color:{FOREST}; }}
  @media (max-width: 620px) {{
    .lm-card {{ border-radius:0 !important; }}
    .lm-pad  {{ padding-left:24px !important; padding-right:24px !important; }}
    .stack   {{ display:block !important; width:100% !important; padding:0 0 10px 0 !important; }}
  }}
</style>
</head>
<body style="background-color:#ebe9e2; margin:0; padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ebe9e2" style="background:#ebe9e2;">
<tr><td align="center" style="padding:30px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" class="lm-card" style="width:600px; max-width:100%; background:#faf9f6; border-collapse:separate; border-radius:16px; overflow:hidden; box-shadow:0 16px 46px rgba(60,50,30,0.13); color:{INK};">

  <tr><td style="height:5px; line-height:5px; font-size:0; background:{FOREST};">&nbsp;</td></tr>

  <tr><td align="center" style="padding:26px 40px 0;">
    <img src="https://anywherelearning.co/email-anywhere-learning-wordmark.png" alt="Anywhere Learning" width="180" style="display:inline-block; width:180px; max-width:70%; height:auto; border:0;">
  </td></tr>

  <tr><td align="center" style="padding:22px 40px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
      <td align="center" bgcolor="{TINT}" style="background:{TINT}; border-radius:999px; padding:7px 18px; font-size:11px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:{DARK};">Day {n} of 5 &nbsp;&middot;&nbsp; {label}</td>
    </tr></table>
    <div style="height:14px; line-height:14px; font-size:0;">&nbsp;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>{dots}</tr></table>
  </td></tr>

  <tr><td class="lm-pad" align="center" style="padding:20px 44px 0;">
    <div style="font-size:31px; line-height:1.2; font-weight:700; color:{INK}; letter-spacing:-0.01em;">{title}</div>
  </td></tr>

  <tr><td class="lm-pad" style="padding:26px 40px 0;">
    <div style="font-size:16px; line-height:1.65; color:{INK}; margin:0 0 14px;">{{{{ message_content }}}}</div>
'''


def footer(n, ps=None):
    utm = f'utm_source=kit&amp;utm_medium=email&amp;utm_campaign=course-day{n}'
    psline = (f'\n    <p style="font-size:15.5px; line-height:1.62; color:{BODY}; margin:18px 0 0;"><strong style="color:{INK};">P.S.</strong> {ps}</p>' if ps else '')
    return f'''  <tr><td class="lm-pad" style="padding:20px 40px 0;">
    <img src="https://anywherelearning.co/email-fn-amelie.png" alt="Amelie" width="110" height="38" style="display:block; width:110px; height:auto; border:0;">{psline}
  </td></tr>

  <tr><td class="lm-pad" align="center" style="padding:28px 40px 36px; text-align:center;">
    <div style="height:1px; line-height:1px; font-size:0; background:#e3e0d6; margin-bottom:18px;">&nbsp;</div>
    <p style="font-size:13px; color:#8a8578; margin:0 0 8px; font-style:italic;">Meaningful Learning, Wherever You Are</p>
    <p style="font-size:13px; margin:0 0 12px;"><a href="https://anywherelearning.co/blog?{utm}" style="color:{FOREST}; text-decoration:none; font-weight:600;">Blog</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="https://anywherelearning.co?{utm}" style="color:{FOREST}; text-decoration:none; font-weight:600;">Website</a></p>
    <p style="font-size:12px; color:#a09a8c; margin:0; line-height:1.7;">You&rsquo;re getting this because you signed up for Real-World Learning in 5 Days.<br><a href="{{{{ unsubscribe_url }}}}" style="color:#a09a8c; text-decoration:underline;">Unsubscribe</a> any time, no hard feelings.</p>
  </td></tr>

</table>
</td></tr></table>
</body>
</html>
'''


# ── building blocks (styles copied from the approved email 1) ──
def p(t):
    return f'    <p style="font-size:16.5px; line-height:1.68; color:{BODY}; margin:0 0 16px;">{t}</p>\n'

def h(t):
    return f'    <div style="font-size:20px; line-height:1.3; font-weight:700; color:{INK}; margin:28px 0 12px;">{t}</div>\n'

def pull(t):
    return (f'    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:18px 0 20px;"><tr>'
            f'<td style="border-left:4px solid {FOREST}; padding:4px 0 4px 20px;"><div style="font-size:20px; line-height:1.42; color:{INK}; font-weight:600;">{t}</div></td></tr></table>\n')

def dark_box(label, body, big=None):
    bigline = f'<div style="font-size:19px; line-height:1.4; font-weight:700; color:#faf9f6; margin-bottom:8px;">{big}</div>' if big else ''
    return (f'    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="{DARK}" style="background:{DARK}; border-radius:14px; margin:18px 0 20px;"><tr>'
            f'<td style="padding:22px 24px; font-size:15.5px; line-height:1.62; color:#faf9f6;"><div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.16em; color:{GOLD}; margin-bottom:10px;">{label}</div>{bigline}{body}</td></tr></table>\n')

def tags(label, items):
    pills = ''.join(
        f'<span style="display:inline-block; margin:3px 2px; padding:5px 11px; background:#ffffff; border:1px solid #b9c9b3; border-radius:999px; font-size:13px; font-weight:600; color:{DARK}; line-height:1.3; max-width:100%; box-sizing:border-box;">{t}</span>'
        for t in items)
    return (f'    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="{TINT}" style="background:{TINT}; border-radius:14px; margin:22px 0 18px;"><tr>'
            f'<td align="center" style="padding:20px 22px;"><div style="font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; color:{FOREST}; margin-bottom:12px;">{label}</div>'
            f'<div style="line-height:1;">{pills}</div></td></tr></table>\n')

def two_cards(cards, big=False, white=False):
    """Two light cards side by side (stack on phones). cards = [(top, text), (top, text)]."""
    cells = []
    for i, (top, text) in enumerate(cards):
        pad = 'padding:0 6px 0 0;' if i == 0 else 'padding:0 0 0 6px;'
        topstyle = (f'font-size:30px; font-weight:800; color:{FOREST}; line-height:1.1; margin-bottom:8px;' if big
                    else f'font-size:15.5px; font-weight:700; color:{INK}; line-height:1.35; margin-bottom:6px;')
        cells.append(
            f'<td class="stack" width="50%" valign="top" style="{pad}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="{"#ffffff" if white else TINT}" style="background:{"#ffffff" if white else TINT};{" border:1px solid #e8e3d5;" if white else ""} border-radius:14px;"><tr>'
            f'<td style="padding:18px 18px;"><div style="{topstyle}">{top}</div><div style="font-size:14.5px; line-height:1.55; color:{BODY};">{text}</div></td></tr></table></td>')
    return (f'    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:6px 0 20px;"><tr>{"".join(cells)}</tr></table>\n')

def story_card(label, text, white=False):
    bg = '#ffffff' if white else TINT
    border = ' border:1px solid #e8e3d5;' if white else ''
    return (f'    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="{bg}" style="background:{bg};{border} border-radius:14px; margin:0 0 12px;"><tr>'
            f'<td style="padding:18px 22px;"><div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.16em; color:{FOREST}; margin-bottom:8px;">{label}</div>'
            f'<div style="font-size:15.5px; line-height:1.65; color:{BODY};">{text}</div></td></tr></table>\n')

def steps(items):
    rows = ''.join(
        f'<tr><td valign="top" width="40" style="padding:0 0 14px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>'
        f'<td align="center" valign="middle" width="28" height="28" bgcolor="{FOREST}" style="width:28px; height:28px; background:{FOREST}; border-radius:999px; font-size:14px; font-weight:700; color:#faf9f6; line-height:28px;">{i}</td></tr></table></td>'
        f'<td valign="top" style="padding:3px 0 14px 4px; font-size:16px; line-height:1.6; color:{BODY};">{t}</td></tr>'
        for i, t in enumerate(items, 1))
    return f'    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:6px 0 8px;">{rows}</table>\n'

def move(i, title, text):
    return (f'    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 16px;"><tr>'
            f'<td valign="top" width="40"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>'
            f'<td align="center" valign="middle" width="30" height="30" bgcolor="{FOREST}" style="width:30px; height:30px; background:{FOREST}; border-radius:999px; font-size:15px; font-weight:700; color:#faf9f6; line-height:30px;">{i}</td></tr></table></td>'
            f'<td valign="top" style="padding:3px 0 0 6px;"><div style="font-size:17px; font-weight:700; color:{INK}; line-height:1.35; margin-bottom:5px;">{title}</div>'
            f'<div style="font-size:16px; line-height:1.65; color:{BODY};">{text}</div></td></tr></table>\n')

def offer_box(label, intro, checks):
    """Path 2: same light card as Path 1 (story_card), set apart only by a green outline and a checklist."""
    rows = ''.join(
        f'<tr><td valign="top" width="24" style="padding:0 0 8px 0; font-size:15px; font-weight:700; color:{FOREST}; line-height:1.55;">&#10003;</td>'
        f'<td valign="top" style="padding:0 0 8px 0; font-size:15.5px; line-height:1.55; color:{BODY};">{c}</td></tr>' for c in checks)
    return (f'    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="{TINT}" style="background:{TINT}; border:2px solid {FOREST}; border-radius:14px; margin:0 0 20px;"><tr>'
            f'<td style="padding:18px 22px 10px;"><div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.16em; color:{FOREST}; margin-bottom:8px;">{label}</div>'
            f'<div style="font-size:15.5px; line-height:1.65; color:{BODY}; margin-bottom:14px;">{intro}</div>'
            f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">{rows}</table></td></tr></table>\n')

def button(text, href):
    return (f'    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="center" style="padding:10px 0 8px;">'
            f'<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="{FOREST}" style="background:{FOREST}; border-radius:14px;">'
            f'<a href="{href}" style="display:inline-block; padding:15px 34px; font-family:-apple-system, BlinkMacSystemFont, \'Segoe UI\', Arial, sans-serif; font-size:16px; font-weight:600; color:#faf9f6; text-decoration:none; line-height:1;">{text}</a>'
            f'</td></tr></table></td></tr></table>\n')

def reply(q):
    return p(f'<strong style="color:{INK};">Reply and tell me:</strong> {q}')

def tomorrow(t):
    return f'    <p style="font-size:15.5px; line-height:1.6; color:#8a8578; margin:22px 0 0; font-style:italic;">{t}</p>\n'

def close_body():
    return '  </td></tr>\n\n'

def open_body():
    return '  <tr><td class="lm-pad" style="padding:22px 40px 0;">\n'

def photo(src, alt, width=320):
    return (close_body() +
            f'  <tr><td align="center" style="padding:0 40px;"><img src="https://anywherelearning.co/email/{src}" alt="{alt}" width="{width}" '
            f'style="display:block; width:{width}px; max-width:100%; height:auto; border:0; border-radius:14px;"></td></tr>\n\n' + open_body())


# ── the emails ──
def email2():
    n = 2
    out = header(n, 'Why it matters', 'Better at school, worse at life')
    out += p('Yesterday was the definition. Today is why it matters, and why I think it matters more now than when we were kids.')
    out += p('I taught for fifteen years. Somewhere around 2020 I started noticing something that worried me more than any test score. The kids were getting better at school and worse at life.')
    out += p('They could fill in a worksheet. But hand them a task without step-by-step instructions and they&rsquo;d wait for someone to tell them what to do. Get one answer wrong and stop trying. Fall apart when the schedule changed.')
    out += p('One moment stays with me. A grade 4 class, independent work time, and one boy wasn&rsquo;t writing. By the time I noticed, five or maybe ten minutes had gone by.')
    out += pull('He didn&rsquo;t have a pencil.')
    out += p('There was a basket of extra pencils on my desk and a room full of kids who had one. He didn&rsquo;t try either. He waited for an adult to notice.')
    out += p('That isn&rsquo;t a bad kid. That&rsquo;s a kid who had learned that being stuck means waiting, because someone always comes. And I&rsquo;ll be honest: when I went home, I saw the same thing at my own table. I did a lot for my kids. Mostly out of love, sometimes just because it was faster.')
    out += h('What I think happened')
    out += p('Learning got separated from real life, and it shows up in two ways.')
    out += two_cards([
        ('Kids stopped being able to do things', 'Because they rarely get to practise.'),
        ('Kids stopped wanting to learn', 'Because when learning isn&rsquo;t about anything real, it&rsquo;s boring.'),
    ])
    out += h('Why real tasks stick')
    out += photo('course-day2-faucet.jpg', 'My daughter holding up the old kitchen faucet she took out')
    out += p('Kids remember what they did and forget what they were told. Our kitchen faucet needed replacing, and my daughter, who&rsquo;s ten, asked if she could be the one to put it in. The fast answer was later. Her dad said yes, and it took an hour instead of twenty minutes. She did everything she could, and he did the two parts she wasn&rsquo;t strong enough for. Next time it breaks, she&rsquo;s the one who knows how.')
    out += p('The research agrees, and so does what parents tell researchers.')
    out += two_cards([
        ('1.5&times;', 'In 2014, a review of 225 studies in university science and math classes found that students who only listened to lectures were one and a half times more likely to fail than students who actually did the work.'),
        ('4 in 5', 'parents of 9 to 11 year olds say free time without an adult is good for kids. Only half would let that same kid find something in another aisle of the store. (University of Michigan Mott Poll, 2023)'),
    ], big=True)
    out += p('That first one is adults at university. Imagine what it means for a ten year old.')
    out += h('Why it matters more now')
    out += p('A computer can write the essay now, solve the equation and summarise the chapter in seconds. So think about what&rsquo;s left for a person to do.')
    out += tags('What&rsquo;s left for a person to do', [
        'Deciding what&rsquo;s worth doing', 'Noticing when something is off', 'Talking to a real person and working it out',
        'Planning a day', 'Keeping going when the first try doesn&rsquo;t work'])
    out += p('None of that comes from a worksheet. All of it comes from doing real things. And our kids get less room to practise than we did. Nobody is doing anything wrong. The day just isn&rsquo;t set up for kids to practise.')
    out += p('So I took a year off, unpaid, and travelled with my two. No curriculum. We learned by doing: budgets in another currency, maps, talking to strangers, figuring it out when things went wrong. They came home more capable and more themselves, and I never went back.')
    out += dark_box('Try this today', 'When your kid gets stuck on something small today, wait ten seconds before you help. Just ten. Watch what they do with them.')
    out += reply('what&rsquo;s something your kid can do now that you weren&rsquo;t sure they could?')
    out += tomorrow('Tomorrow: how one ordinary afternoon can hold math, writing and science at the same time, and a simple way to spot it at your house.')
    out += close_body()
    out += footer(n)
    meta = ('<!--\n  REAL-WORLD LEARNING IN 5 DAYS (free email course) - Email 2 of 5\n'
            '  Kit sequence "Course: Real-World Learning in 5 Days" (id 2904485), position 2, 1 day after email 1, 7am ET.\n'
            '  Subject: Better at school, worse at life\n  Preview: What I watched disappear in fifteen years of teaching.\n\n'
            '  In Kit: paste as a custom template. Type ONLY the greeting in the Email tab, e.g.\n'
            '  Hi {{ subscriber.first_name | default: "there" }},\n-->\n')
    return meta + out, 'course-day2-faucet.jpg'


def email3():
    n = 3
    out = header(n, 'All of it in one task', 'Math, writing and science in one afternoon')
    out += p('Yesterday was why. Today is the part that surprises parents most: you don&rsquo;t have to choose between academics and life skills.')
    out += h('The mistake')
    out += p('School splits learning into boxes. Math at nine, writing at ten, science on Thursday. So when we think about real-world learning, we picture it as the life skills part, something extra on top of the &ldquo;real&rdquo; subjects. Real life never splits like that. One real task carries almost everything at once, and the life skills come along for the ride.')
    out += p('Here are three from our house.')
    out += photo('course-day3-drawings.jpg', 'Two drawings of a stove side by side, from the directions activity', width=520)
    out += story_card('The directions', 'My son, who&rsquo;s thirteen, drew a picture, hid it, and wrote me instructions to draw the same thing. Words only. I drew exactly what he wrote, not what I could tell he meant. The drawings didn&rsquo;t match. So he went back, added details, and we did it again, and the second pair was much closer. That&rsquo;s writing, clarity and editing, and he found every mistake himself.')
    out += story_card('The shelter', 'My daughter had to build a shelter outside, using only what she could find, that would keep a paper towel dry when I poured water over it. The first one let the water straight through. She looked at it, decided the roof was too thin, built it thicker, and the second one stayed dry. That&rsquo;s engineering: a goal, a test, a failure, a reason, one change and a result. It&rsquo;s also what handling failure looks like at ten.')
    out += story_card('The board games', 'When my two decided to build board games, each about something they picked, my son chose ancient Rome and took notes from a documentary. My daughter chose countries of the world and went through books for facts worth putting on a board. Nobody assigned any of it. That&rsquo;s history and geography for the research, writing for rules clear enough that someone else can play, math to make the scoring fair, and art for the board. Then comes the playtest, where someone else plays it and finds every rule that wasn&rsquo;t clear yet.')
    out += h('The tool: the subject hunt')
    out += p('This is how you start seeing it everywhere.')
    out += steps([
        'Pick one thing your kid did today. Anything real: cooking, a game, a plan, an argument they won.',
        'Write down every school subject hiding inside it. Math, reading, writing, science, history, geography, art.',
        'Then write down every life skill. Planning, patience, asking for help, handling a mistake, working with someone.',
        'Circle the ones nobody taught them on purpose.'])
    out += dark_box('Try this today', 'Do the subject hunt on one thing from today. It takes five minutes, and you&rsquo;ll never look at a grocery run the same way.')
    out += reply('what&rsquo;s the most subjects you found in one ordinary thing?')
    out += tomorrow('Tomorrow: the four moves I use to make this happen on purpose every week, including what to hand over at different ages.')
    out += close_body()
    out += footer(n, ps='Every activity in my library lists the skills and subjects inside it, so you can see the learning before you even start.')
    meta = ('<!--\n  REAL-WORLD LEARNING IN 5 DAYS (free email course) - Email 3 of 5\n'
            '  Kit sequence "Course: Real-World Learning in 5 Days" (id 2904485), position 3, 1 day after email 2, 7am ET.\n'
            '  Subject: Math, writing and science in one afternoon\n  Preview: Nobody noticed. That\'s the point.\n\n'
            '  In Kit: paste as a custom template. Type ONLY the greeting in the Email tab, e.g.\n'
            '  Hi {{ subscriber.first_name | default: "there" }},\n-->\n')
    return meta + out, 'course-day3-drawings.jpg'


def email4():
    n = 4
    trial = 'https://anywherelearning.co/start-trial?source=course&amp;utm_source=kit&amp;utm_medium=email&amp;utm_campaign=course-day4'
    out = header(n, 'The four moves', 'The four moves I use every week')
    out += p('You&rsquo;ve got the definition, the why, and the subject hunt. Today is the how: exactly what I do, by hand, to make real-world learning happen in our house on purpose. Then I&rsquo;ll tell you about the easier way.')
    out += h('The four moves')
    out += p('These come straight from how I write every project guide, and from how we actually do it at home.')
    out += move(1, 'Give them a real mission.', 'Not a pretend task. Something worth doing anyway: dinner for the family, a repair, a plan for Saturday. Twenty dollars each and a celebration dinner was a mission. So was my daughter asking to put in the faucet.')
    out += move(2, 'Split the jobs: theirs and yours.', 'You&rsquo;re there the whole time, but you know exactly which part is yours. With the faucet, she did everything she could, and her dad did the two parts she wasn&rsquo;t strong enough for. Nothing else. Not the slow parts, not the parts she was working out.')
    out += move(3, 'Ask, don&rsquo;t tell.', 'When they&rsquo;re stuck, a question does more than an answer. When my daughter&rsquo;s shelter let the water straight through, I didn&rsquo;t tell her the roof was too thin. I asked her what she thought happened. She looked at the wet paper towel, worked out that the roof was too thin, built it thicker, and the second one stayed dry.')
    out += photo('course-day4-shelter.jpg', 'My daughter&rsquo;s shelter, a roof of big leaves laid over bark, sticks and two rocks', width=440)
    out += move(4, 'Look back together.', 'At the end, look at what happened. When my son and I put the two drawings side by side, the gaps showed him exactly where his instructions weren&rsquo;t clear, so he rewrote them and we went again. The look back is what turns one afternoon into a skill.')
    out += h('What to hand over, from my two')
    out += two_cards([
        ('My son, 13', 'He cooks and bakes on his own now and could feed himself for a few days on real food, not toast. He builds websites for small businesses.'),
        ('My daughter, 10', 'She already thinks like an entrepreneur: a lemonade stand a few times, and right now she collects cans and bottles for the refund money. She even hired her brother for that one.'),
    ], white=True)
    out += p('With a younger kid, it&rsquo;s the same four moves with a smaller job.')
    out += h('Why it still slips')
    out += p('Here&rsquo;s the honest part. Even knowing all this, it doesn&rsquo;t happen as often as we&rsquo;d like.')
    out += tags('What gets in the way', ['You&rsquo;re tired', 'It&rsquo;s faster to do it yourself', 'You&rsquo;re not sure what&rsquo;s right for their age',
                                         'You can&rsquo;t always see where the learning is', 'You mean to, and then it&rsquo;s Thursday'])
    out += p('That&rsquo;s not a you problem. It&rsquo;s why I built what I built.')
    out += h('Two paths from here')
    out += story_card('Path 1: do it by hand', 'You have the definition, the test, the subject hunt and the four moves. It works. I did it this way for a long time. The only catch is that you&rsquo;re the one coming up with the next job every single week.', white=True)
    out += offer_box('Path 2: let the library do the four moves for you',
        'Anywhere Learning is 120+ real-world activities for kids 6 to 14, and the project guides are built on those same four moves. Each one gives you the mission, then walks you through it step by step: your job and their job at every step, the questions to ask as you go, and a look back at the end. They run from thirty minutes to a few days, across twelve skill areas from real-world math and writing to critical thinking and life skills. Invent a new sport. Plan a road trip budget. Pitch a market stall. Write directions and watch someone follow them exactly.',
        ['<strong style="color:#2f3a2e;">The next one is already picked</strong> and waiting on your family&rsquo;s trail. Do it together, tap done, and the next one takes its place.',
         '<strong style="color:#2f3a2e;">Guides come in three levels,</strong> so a six year old and a twelve year old can do the same thing at the same table.',
         '<strong style="color:#2f3a2e;">Each month</strong> there&rsquo;s a skill to focus on, a seasonal set of activities, and one family challenge.',
         '<strong style="color:#2f3a2e;">Each kid gets a record</strong> of everything they&rsquo;ve done, ready to print.'])
    out += p('I&rsquo;ll be straight with you: this is small. It&rsquo;s me, not a company. If you want a polished platform with a thousand of everything, this isn&rsquo;t it.')
    out += two_cards([
        ('It&rsquo;s for you if', 'you want your kids doing real things with real learning inside them, you&rsquo;d rather not plan it all yourself, and you&rsquo;re willing to do it with them, not just hand it off.'),
        ('It&rsquo;s not for you if', 'you&rsquo;re looking for a curriculum to follow page by page, or something your kid does alone on a screen.'),
    ], white=True)
    out += p('<strong style="color:#2f3a2e;">Try it free for fourteen days.</strong> You&rsquo;ll add a card, but nothing is charged today, and you can cancel anytime during the trial and pay nothing at all. After that it&rsquo;s $99 a year at the founder rate, which is only for the first 100 members, or $15 a month. And if you stay and it doesn&rsquo;t earn its place, email me within 14 days of your first charge and I&rsquo;ll refund you in full.')
    out += button('Start my free 14 days', trial)
    out += tomorrow('Tomorrow&rsquo;s is the last one, and it&rsquo;s short.')
    out += close_body()
    out += footer(n)
    meta = ('<!--\n  REAL-WORLD LEARNING IN 5 DAYS (free email course) - Email 4 of 5 (the offer)\n'
            '  Kit sequence "Course: Real-World Learning in 5 Days" (id 2904485), position 4, 1 day after email 3, 7am ET.\n'
            '  Subject: The four moves I use every week\n  Preview: Plus the easier way to do them.\n\n'
            '  In Kit: paste as a custom template. Type ONLY the greeting in the Email tab, e.g.\n'
            '  Hi {{ subscriber.first_name | default: "there" }},\n-->\n')
    return meta + out, 'course-day4-shelter.jpg'


def email5():
    n = 5
    trial = 'https://anywherelearning.co/start-trial?source=course&amp;utm_source=kit&amp;utm_medium=email&amp;utm_campaign=course-day5'
    out = header(n, 'Last one', 'Where to go from here')
    out += p('Last one, and it&rsquo;s short.')
    out += p('This week: real-world learning is when the task would exist even if school didn&rsquo;t. It sticks because kids remember what they did. One real task carries the math, the writing and the life skills together. And the four moves make it happen on purpose:')
    out += tags('The four moves', ['1. A real mission', '2. Split the jobs', '3. Ask, don&rsquo;t tell', '4. Look back together'])
    out += p(f'If you want the next one already picked and waiting for you, the free trial is here: <a href="{trial}" style="color:#588157; font-weight:600;">Start my free 14 days</a>. If you&rsquo;d rather do it by hand, you have everything you need, and you&rsquo;ll still get my newsletter with what&rsquo;s new.')
    out += p('If you try one of the four moves this week, I&rsquo;d love to hear how it went. Just hit reply.')
    out += p('Thank you for spending these five days with me.')
    out += close_body()
    out += footer(n)
    meta = ('<!--\n  REAL-WORLD LEARNING IN 5 DAYS (free email course) - Email 5 of 5 (short personal close)\n'
            '  Kit sequence "Course: Real-World Learning in 5 Days" (id 2904485), position 5, 1 day after email 4, 7am ET.\n'
            '  Subject: Where to go from here\n  Preview: The whole week in four lines.\n\n'
            '  In Kit: paste as a custom template. Type ONLY the greeting in the Email tab, e.g.\n'
            '  Hi {{ subscriber.first_name | default: "there" }},\n-->\n')
    return meta + out, None


EMAILS = {2: email2, 3: email3, 4: email4, 5: email5}

if __name__ == '__main__':
    n = int(sys.argv[1])
    html, img = EMAILS[n]()
    assert '{{ message_content }}' in html and '{{ unsubscribe_url }}' in html
    assert '—' not in html, 'em dash found'
    name = f'course-{n}-day{n}.html'
    out = os.path.join(ROOT, 'emails', 'kit-ready', name)
    open(out, 'w').write(html)
    desk = os.path.expanduser('~/Desktop/Anywhere Learning/Convert Kit/kit-ready')
    os.makedirs(desk, exist_ok=True)
    shutil.copy(out, desk)
    preview = html.replace('{{ message_content }}', 'Hi Sarah,')
    if img:
        b64 = base64.b64encode(open(os.path.join(ROOT, 'public', 'email', img), 'rb').read()).decode()
        preview = preview.replace(f'https://anywherelearning.co/email/{img}', 'data:image/jpeg;base64,' + b64)
    open(os.path.join(ROOT, 'notes', f'preview-course-{n}.html'), 'w').write(preview)
    print('wrote', out)
