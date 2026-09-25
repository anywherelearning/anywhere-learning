#!/usr/bin/env python3
"""
Builds the Kit custom HTML template for the one-off broadcast announcing the
free email course to the existing list (sent Tue Sept 29 2026). Reuses the
course email styles from build-course-emails.py.

Usage:  python3 scripts/build-course-announce-email.py
"""
import importlib.util, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('ce', os.path.join(ROOT, 'scripts', 'build-course-emails.py'))
ce = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ce)

LINK = 'https://anywherelearning.co/course?source=newsletter&amp;utm_source=kit&amp;utm_medium=email&amp;utm_campaign=course-announce'

out = ce.header(0, 'x', 'I made you a free 5-day course')
# Swap the "Day N of 5" pill for a "New" pill and drop the progress dots.
out = out.replace('Day 0 of 5 &nbsp;&middot;&nbsp; x', 'New &nbsp;&middot;&nbsp; Free email course')
out = re.sub(r'\s*<div style="height:14px; line-height:14px; font-size:0;">&nbsp;</div>\s*<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>(<td style="padding:0 4px;">.*?</td>)+</tr></table>', '', out, flags=re.S)
out += ce.p('Quick one, since you just heard from me last week.')
out += ce.p('I made something new: a free email course called <strong style="color:#2f3a2e;">Real-World Learning in 5 Days</strong>.')
out += ce.p('It&rsquo;s the ideas behind everything I make, put in order: what real-world learning actually is, why it matters more for our kids than it did for us, and the four moves I use every week with my own two to make it happen on purpose.')
out += ce.p('One short email each morning for five days, a few minutes to read. There&rsquo;s nothing to prep. It&rsquo;s a new way to see the week you&rsquo;re already having.')
out += ce.button('Start the course', LINK)
out += ce.p('If you did the 5-day challenge with us in September, this is the why behind everything we did that week.')
out += ce.close_body()
foot = ce.footer(0)
foot = foot.replace('course-day0', 'course-announce')
foot = foot.replace('You&rsquo;re getting this because you signed up for Real-World Learning in 5 Days.', 'You&rsquo;re getting this because you signed up for emails from Anywhere Learning.')
out += foot

meta = ('<!--\n  COURSE ANNOUNCEMENT - one-off broadcast to the list, Tue Sept 29 2026\n'
        '  Subject: I made you a free 5-day course\n  Preview: One short email each morning, starting today.\n'
        '  Send to: everyone EXCEPT tag course-rwl.\n\n'
        '  In Kit: paste as a custom template. Type ONLY the greeting in the Email tab, e.g.\n'
        '  Hi {{ subscriber.first_name | default: "there" }},\n-->\n')
html = meta + out
assert '{{ message_content }}' in html and '{{ unsubscribe_url }}' in html
assert '—' not in html, 'em dash found'
dst = os.path.join(ROOT, 'emails', 'kit-ready', 'course-announce.html')
open(dst, 'w').write(html)
shutil.copy(dst, os.path.expanduser('~/Desktop/Anywhere Learning/Convert Kit/kit-ready'))
open(os.path.join(ROOT, 'notes', 'preview-course-announce.html'), 'w').write(html.replace('{{ message_content }}', 'Hi Sarah,'))
print('wrote', dst)
