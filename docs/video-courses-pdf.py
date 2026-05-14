#!/usr/bin/env python3
"""Generate Anywhere Learning Video Course Strategy PDF."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER
import os

FOREST = HexColor('#588157')
FOREST_DARK = HexColor('#3d5c3b')
GOLD = HexColor('#d4a373')
CREAM = HexColor('#faf9f6')
WARM_GRAY = HexColor('#f7f5f0')
DARK = HexColor('#2d2d2d')
MID = HexColor('#555555')
LIGHT = HexColor('#888888')

output_path = os.path.expanduser("~/Desktop/Anywhere Learning/video-course-strategy.pdf")

doc = SimpleDocTemplate(
    output_path,
    pagesize=letter,
    topMargin=0.75*inch,
    bottomMargin=0.6*inch,
    leftMargin=0.85*inch,
    rightMargin=0.85*inch,
)

styles = {}
styles['title'] = ParagraphStyle('Title', fontName='Helvetica-Bold', fontSize=26, textColor=FOREST, spaceAfter=6, alignment=TA_CENTER)
styles['h1'] = ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=18, textColor=FOREST, spaceBefore=24, spaceAfter=10)
styles['h2'] = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=14, textColor=FOREST_DARK, spaceBefore=16, spaceAfter=8)
styles['h3'] = ParagraphStyle('H3', fontName='Helvetica-Bold', fontSize=12, textColor=GOLD, spaceBefore=12, spaceAfter=6)
styles['body'] = ParagraphStyle('Body', fontName='Helvetica', fontSize=10, textColor=DARK, leading=15, spaceAfter=6)
styles['body_bold'] = ParagraphStyle('BodyBold', fontName='Helvetica-Bold', fontSize=10, textColor=DARK, leading=15, spaceAfter=6)
styles['bullet'] = ParagraphStyle('Bullet', fontName='Helvetica', fontSize=10, textColor=DARK, leading=15, leftIndent=18, spaceAfter=4, bulletIndent=6)
styles['quote'] = ParagraphStyle('Quote', fontName='Helvetica-Oblique', fontSize=10, textColor=MID, leading=15, leftIndent=24, rightIndent=24, spaceAfter=8)
styles['small'] = ParagraphStyle('Small', fontName='Helvetica', fontSize=9, textColor=LIGHT, spaceAfter=4, leading=13)
styles['tc'] = ParagraphStyle('TC', fontName='Helvetica', fontSize=9, textColor=DARK, leading=12)
styles['tc_bold'] = ParagraphStyle('TCBold', fontName='Helvetica-Bold', fontSize=9, textColor=DARK, leading=12)

story = []
S = Spacer

def hr():
    return HRFlowable(width="100%", thickness=1, color=HexColor('#e5e5e5'), spaceBefore=12, spaceAfter=12)

def P(text, style='body'):
    if isinstance(style, str):
        return Paragraph(text, styles[style])
    return Paragraph(text, style)

# ═══════════════════════════════════════════════════
# COVER PAGE
# ═══════════════════════════════════════════════════
story.append(S(1, 120))
story.append(P("Anywhere Learning", 'title'))
story.append(S(1, 8))
story.append(Paragraph("Video Course Strategy", ParagraphStyle('CoverSub', fontName='Helvetica', fontSize=18, textColor=GOLD, alignment=TA_CENTER, spaceAfter=8)))
story.append(S(1, 12))
story.append(HRFlowable(width="40%", thickness=2, color=FOREST, spaceBefore=0, spaceAfter=12))
story.append(Paragraph("5 courses, launch order, production guide, and business model", ParagraphStyle('CoverDesc', fontName='Helvetica', fontSize=11, textColor=MID, alignment=TA_CENTER)))
story.append(S(1, 40))
story.append(Paragraph("April 2026", ParagraphStyle('CoverDate', fontName='Helvetica', fontSize=10, textColor=LIGHT, alignment=TA_CENTER)))
story.append(PageBreak())

# ═══════════════════════════════════════════════════
# OVERVIEW TABLE
# ═══════════════════════════════════════════════════
story.append(P("Course Catalog Overview", 'h1'))
story.append(P("Five video courses spanning mindset, practical skills, and lifestyle. Ordered by launch priority.", 'body'))
story.append(S(1, 8))

overview_data = [
    [P('<b>#</b>', 'tc_bold'), P('<b>Course Title</b>', 'tc_bold'), P('<b>Price</b>', 'tc_bold'), P('<b>Videos</b>', 'tc_bold'), P('<b>Length</b>', 'tc_bold'), P('<b>Category</b>', 'tc_bold')],
    [P('1', 'tc'), P('Deschooling: Your First 30 Days', 'tc'), P('$49', 'tc'), P('12', 'tc'), P('~2.5 hrs', 'tc'), P('For Parents (mindset)', 'tc')],
    [P('2', 'tc'), P('Nature as Your Classroom', 'tc'), P('$79', 'tc'), P('16', 'tc'), P('~4 hrs', 'tc'), P('Outdoor Learning', 'tc')],
    [P('3', 'tc'), P('The Worldschool Blueprint', 'tc'), P('$99', 'tc'), P('20', 'tc'), P('~4.5 hrs', 'tc'), P('Worldschooling', 'tc')],
    [P('4', 'tc'), P('Raising Future-Ready Kids', 'tc'), P('$79', 'tc'), P('14', 'tc'), P('~3 hrs', 'tc'), P('For Parents (skills)', 'tc')],
    [P('5', 'tc'), P('Real-World Learning for Every Subject', 'tc'), P('$99', 'tc'), P('20', 'tc'), P('~4.5 hrs', 'tc'), P('Practical how-to', 'tc')],
]

t = Table(overview_data, colWidths=[0.3*inch, 2.4*inch, 0.6*inch, 0.6*inch, 0.8*inch, 1.6*inch], repeatRows=1)
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), FOREST),
    ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
    ('BACKGROUND', (0, 1), (-1, -1), WARM_GRAY),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WARM_GRAY, HexColor('#ffffff')]),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e5e5e5')),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
]))
story.append(t)

story.append(S(1, 8))
story.append(P("<b>Total catalog value:</b> $405 (all 5 courses) &middot; <b>Total runtime:</b> ~18.5 hours &middot; <b>Total videos:</b> 82", 'body'))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# COURSE 1
# ═══════════════════════════════════════════════════
story.append(P("Course 1: Deschooling: Your First 30 Days", 'h1'))
story.append(S(1, 4))

course1_data = [
    [P('<b>Price</b>', 'tc_bold'), P('<b>Videos</b>', 'tc_bold'), P('<b>Video Length</b>', 'tc_bold'), P('<b>Total Runtime</b>', 'tc_bold'), P('<b>Bonus</b>', 'tc_bold')],
    [P('$49', 'tc'), P('12', 'tc'), P('8-15 min each', 'tc'), P('~2.5 hours', 'tc'), P('Deschooling PDF Guide', 'tc')],
]
t = Table(course1_data, colWidths=[0.8*inch, 0.8*inch, 1.3*inch, 1.3*inch, 2.1*inch], repeatRows=1)
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), FOREST),
    ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
    ('BACKGROUND', (0, 1), (-1, -1), WARM_GRAY),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e5e5e5')),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
]))
story.append(t)
story.append(S(1, 8))

story.append(P("<b>Why launch first:</b> Lowest price point, easiest to film (mostly talking head), proven topic from guide sales. Lowest risk, fastest to produce.", 'body'))
story.append(S(1, 6))

story.append(P("Module Breakdown", 'h3'))
story.append(P("<bullet>&bull;</bullet> <b>Module 1: What Is Deschooling?</b> (3 videos)", 'bullet'))
story.append(Paragraph("Why it matters, what to expect, the emotional journey for parent and child", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 2: Week 1-2 — Letting Go</b> (3 videos)", 'bullet'))
story.append(P("Releasing the school mindset, observing your child, what \"doing nothing\" actually looks like", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 3: Week 3-4 — Finding Your Rhythm</b> (3 videos)", 'bullet'))
story.append(P("Following interests, building routines (not schedules), handling doubt from family", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 4: What Comes Next</b> (3 videos)", 'bullet'))
story.append(P("Signs deschooling is working, transitioning to your homeschool style, resources and next steps", styles['small']))

story.append(S(1, 8))
story.append(P("<b>Filming style:</b> 80% talking head (you sharing experience and guidance), 20% B-roll of family moments. Warm, intimate, like a conversation with a friend who's been through it.", 'body'))

story.append(hr())

# ═══════════════════════════════════════════════════
# COURSE 2
# ═══════════════════════════════════════════════════
story.append(P("Course 2: Nature as Your Classroom", 'h1'))
story.append(S(1, 4))

course2_data = [
    [P('<b>Price</b>', 'tc_bold'), P('<b>Videos</b>', 'tc_bold'), P('<b>Video Length</b>', 'tc_bold'), P('<b>Total Runtime</b>', 'tc_bold'), P('<b>Bonus</b>', 'tc_bold')],
    [P('$79', 'tc'), P('16', 'tc'), P('10-20 min each', 'tc'), P('~4 hours', 'tc'), P('Outdoor Mega Bundle', 'tc')],
]
t = Table(course2_data, colWidths=[0.8*inch, 0.8*inch, 1.3*inch, 1.3*inch, 2.1*inch], repeatRows=1)
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), FOREST),
    ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
    ('BACKGROUND', (0, 1), (-1, -1), WARM_GRAY),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e5e5e5')),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
]))
story.append(t)
story.append(S(1, 8))

story.append(P("<b>Why launch second:</b> Your strongest product category, highly visual, fun to film outdoors with kids. Demos your products in action.", 'body'))
story.append(S(1, 6))

story.append(P("Module Breakdown", 'h3'))
story.append(P("<bullet>&bull;</bullet> <b>Module 1: Spring</b> (4 videos)", 'bullet'))
story.append(P("Planting, bird watching, rain science, spring scavenger hunts. Real outdoor demos with kids.", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 2: Summer</b> (4 videos)", 'bullet'))
story.append(P("Water play, bug study, sun & shadow experiments, nature art. Longer outdoor sessions.", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 3: Fall</b> (4 videos)", 'bullet'))
story.append(P("Leaf science, harvest math, animal prep for winter, forest exploration. Transition activities.", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 4: Winter</b> (4 videos)", 'bullet'))
story.append(P("Snow/ice experiments, indoor nature, winter tracking, stargazing. Proving nature learning is year-round.", styles['small']))

story.append(S(1, 8))
story.append(P("<b>Filming style:</b> 50% outdoor activity demos (you + kids doing the activities), 30% talking head (explaining the learning behind each activity), 20% cinematic nature B-roll. This is your most visual, shareable course.", 'body'))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# COURSE 3
# ═══════════════════════════════════════════════════
story.append(P("Course 3: The Worldschool Blueprint", 'h1'))
story.append(S(1, 4))

course3_data = [
    [P('<b>Price</b>', 'tc_bold'), P('<b>Videos</b>', 'tc_bold'), P('<b>Video Length</b>', 'tc_bold'), P('<b>Total Runtime</b>', 'tc_bold'), P('<b>Bonus</b>', 'tc_bold')],
    [P('$99', 'tc'), P('20', 'tc'), P('10-15 min each', 'tc'), P('~4.5 hours', 'tc'), P('Worldschool Activity Pack', 'tc')],
]
t = Table(course3_data, colWidths=[0.8*inch, 0.8*inch, 1.3*inch, 1.3*inch, 2.1*inch], repeatRows=1)
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), FOREST),
    ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
    ('BACKGROUND', (0, 1), (-1, -1), WARM_GRAY),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e5e5e5')),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
]))
story.append(t)
story.append(S(1, 8))

story.append(P("<b>Why launch third:</b> Highest price, most niche and aspirational. Needs the biggest audience to justify. Your personal experience is the content — nobody can compete with that.", 'body'))
story.append(S(1, 6))

story.append(P("Module Breakdown", 'h3'))
story.append(P("<bullet>&bull;</bullet> <b>Module 1: Is Worldschooling Right for You?</b> (4 videos)", 'bullet'))
story.append(P("What it is (and isn't), different styles, family readiness assessment, common fears", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 2: Planning & Logistics</b> (5 videos)", 'bullet'))
story.append(P("Budget, travel hacking, accommodation, health/insurance, legal requirements by country", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 3: Learning on the Road</b> (5 videos)", 'bullet'))
story.append(P("Turning travel into education, language learning, cultural immersion, documenting learning, screen time balance", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 4: The Hard Parts</b> (3 videos)", 'bullet'))
story.append(P("Loneliness, routine disruption, family criticism, when it's not working, knowing when to pause", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 5: Building Your Worldschool Community</b> (3 videos)", 'bullet'))
story.append(P("Finding other families, online communities, co-learning meetups, maintaining friendships across borders", styles['small']))

story.append(S(1, 8))
story.append(P("<b>Filming style:</b> 60% talking head (deep expertise sharing), 30% travel footage and family moments from your worldschool life, 10% screen shares (planning tools, resources, booking demos).", 'body'))

story.append(hr())

# ═══════════════════════════════════════════════════
# COURSE 4
# ═══════════════════════════════════════════════════
story.append(P("Course 4: Raising Future-Ready Kids", 'h1'))
story.append(S(1, 4))

course4_data = [
    [P('<b>Price</b>', 'tc_bold'), P('<b>Videos</b>', 'tc_bold'), P('<b>Video Length</b>', 'tc_bold'), P('<b>Total Runtime</b>', 'tc_bold'), P('<b>Bonus</b>', 'tc_bold')],
    [P('$79', 'tc'), P('14', 'tc'), P('10-15 min each', 'tc'), P('~3 hours', 'tc'), P('Future-Ready Skills Map PDF', 'tc')],
]
t = Table(course4_data, colWidths=[0.8*inch, 0.8*inch, 1.3*inch, 1.3*inch, 2.1*inch], repeatRows=1)
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), FOREST),
    ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
    ('BACKGROUND', (0, 1), (-1, -1), WARM_GRAY),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e5e5e5')),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
]))
story.append(t)
story.append(S(1, 8))

story.append(P("<b>Concept:</b> Deep dive into the 10 skills from your Future-Ready Skills Map. Each video covers one skill — why it matters, how to nurture it through everyday life, and real activities to build it.", 'body'))
story.append(S(1, 6))

story.append(P("Module Breakdown", 'h3'))
story.append(P("<bullet>&bull;</bullet> <b>Module 1: The Future-Ready Framework</b> (2 videos)", 'bullet'))
story.append(P("Why these 10 skills matter, how traditional school misses them, the research behind it", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 2: Thinking Skills</b> (4 videos)", 'bullet'))
story.append(P("Critical thinking, problem solving, creativity, adaptability — one video per skill with practical demos", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 3: People Skills</b> (4 videos)", 'bullet'))
story.append(P("Communication, collaboration, empathy, leadership — real scenarios, not theory", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 4: Self Skills</b> (4 videos)", 'bullet'))
story.append(P("Self-direction, resilience, curiosity, financial literacy — building independence", styles['small']))

story.append(S(1, 8))
story.append(P("<b>Filming style:</b> 50% talking head (explaining each skill with research), 40% activity demos showing how to build each skill, 10% real family moments illustrating the skills in action.", 'body'))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# COURSE 5
# ═══════════════════════════════════════════════════
story.append(P("Course 5: Real-World Learning for Every Subject", 'h1'))
story.append(S(1, 4))

course5_data = [
    [P('<b>Price</b>', 'tc_bold'), P('<b>Videos</b>', 'tc_bold'), P('<b>Video Length</b>', 'tc_bold'), P('<b>Total Runtime</b>', 'tc_bold'), P('<b>Bonus</b>', 'tc_bold')],
    [P('$99', 'tc'), P('20', 'tc'), P('10-15 min each', 'tc'), P('~4.5 hours', 'tc'), P('Full Seasonal Bundle', 'tc')],
]
t = Table(course5_data, colWidths=[0.8*inch, 0.8*inch, 1.3*inch, 1.3*inch, 2.1*inch], repeatRows=1)
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), FOREST),
    ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
    ('BACKGROUND', (0, 1), (-1, -1), WARM_GRAY),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e5e5e5')),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
]))
story.append(t)
story.append(S(1, 8))

story.append(P("<b>Concept:</b> The \"show me how\" course for parents who believe in real-world learning but don't know where to start with specific subjects. Each module covers one subject area with philosophy + real activity walkthroughs.", 'body'))
story.append(S(1, 6))

story.append(P("Module Breakdown", 'h3'))
story.append(P("<bullet>&bull;</bullet> <b>Module 1: Math in the Real World</b> (4 videos)", 'bullet'))
story.append(P("Cooking fractions, shopping estimation, building measurement, nature patterns. Math without worksheets.", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 2: Science Through Exploration</b> (4 videos)", 'bullet'))
story.append(P("Kitchen chemistry, backyard biology, weather observation, simple machines. Experiments, not textbooks.", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 3: Literacy & Language</b> (4 videos)", 'bullet'))
story.append(P("Reading culture (not reading logs), storytelling, journaling, writing for real purposes. Love of words.", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 4: Art & Creativity</b> (4 videos)", 'bullet'))
story.append(P("Process over product, nature art, music exploration, creative problem solving. No Pinterest-perfect crafts.", styles['small']))
story.append(P("<bullet>&bull;</bullet> <b>Module 5: Social Studies & the World</b> (4 videos)", 'bullet'))
story.append(P("Community exploration, cultural learning, geography through food, history through stories and places.", styles['small']))

story.append(S(1, 8))
story.append(P("<b>Filming style:</b> 40% activity demos with kids (the heart of this course — showing real learning in action), 40% talking head (explaining the philosophy and learning behind each activity), 20% B-roll and screen shares.", 'body'))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# PRODUCTION GUIDE
# ═══════════════════════════════════════════════════
story.append(P("Production Guide", 'h1'))
story.append(P("Everything you need to film professional-quality courses at home.", 'body'))
story.append(S(1, 6))

story.append(P("Equipment (~$300-500 total)", 'h2'))
equip = [
    ("iPhone", "You already have one. 4K video is more than enough for courses."),
    ("Ring light or LED panel ($30-50)", "Consistent lighting is the #1 difference between amateur and professional."),
    ("Wireless lapel mic ($20-40)", "Audio quality matters more than video quality. Viewers forgive okay video but not bad audio."),
    ("Tripod or phone mount ($20-30)", "Stable shot for talking head. No shaky hands."),
    ("Background music subscription ($15/mo)", "Epidemic Sound or Artlist. Low volume, sets the mood."),
]
for name, desc in equip:
    story.append(P(f"<bullet>&bull;</bullet> <b>{name}</b> — {desc}", 'bullet'))

story.append(P("Filming Approach", 'h2'))
filming = [
    ("Talking head", "Face camera, natural window light + LED fill. Clean background (bookshelf, plants). Warm and conversational."),
    ("Activity demos", "Camera pointing down at table or over-the-shoulder. Your hands and kids visible. Real, not staged."),
    ("Outdoor B-roll", "Handheld is fine — natural movement feels authentic for your brand."),
    ("Screen recording", "QuickTime or Loom for any digital walkthrough segments."),
]
for name, desc in filming:
    story.append(P(f"<bullet>&bull;</bullet> <b>{name}:</b> {desc}", 'bullet'))

story.append(P("Editing", 'h2'))
story.append(P("<bullet>&bull;</bullet> <b>CapCut</b> (free) — handles cuts, text overlays, transitions, music. More than enough.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>DaVinci Resolve</b> (free) — if you want more control later.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Canva</b> — for intro/outro slides, title cards, and downloadable worksheets per module.", 'bullet'))

story.append(P("Format Rules (All Courses)", 'h2'))
rules = [
    "No video over 20 minutes. Attention drops hard after that. Split into parts if needed.",
    "Mix talking head + activity demos. Never more than 5 min of just talking — cut to showing something.",
    "Each video = one clear takeaway. \"After this video you'll know how to...\" structure.",
    "Downloadable worksheet or checklist per module — gives tangible value beyond watching.",
    "Simple intro (5 sec) + outro (10 sec) with branding. Make once in Canva, reuse forever.",
    "Background music at low volume throughout. Removes awkward silence, feels polished.",
]
for r in rules:
    story.append(P(f"<bullet>&bull;</bullet> {r}", 'bullet'))

story.append(P("What Doesn't Matter", 'h2'))
story.append(P("<bullet>&bull;</bullet> Expensive camera — iPhone is fine", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Perfect background — real home looks authentic for your brand", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Professional editing — overproduced feels wrong for your warm, empowering voice", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Getting it perfect — your audience wants a knowledgeable friend, not a corporate training video", 'bullet'))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# LAUNCH STRATEGY
# ═══════════════════════════════════════════════════
story.append(P("Launch Strategy", 'h1'))
story.append(P("Use the open/close cart model for each course launch. Enrollment opens for 5-7 days, then closes.", 'body'))
story.append(S(1, 6))

story.append(P("Launch Timeline Per Course", 'h2'))
launch_data = [
    [P('<b>When</b>', 'tc_bold'), P('<b>What</b>', 'tc_bold'), P('<b>Channel</b>', 'tc_bold')],
    [P('2 weeks before', 'tc'), P('Tease: "Something big is coming" — behind-the-scenes of filming', 'tc'), P('IG Stories + email', 'tc')],
    [P('1 week before', 'tc'), P('Waitlist: "Get first access" — email capture for launch notification', 'tc'), P('IG + email + blog', 'tc')],
    [P('Day 1 (open)', 'tc'), P('Launch email + IG Reel + announcement post. Early bird bonus for first 24 hrs.', 'tc'), P('Email + IG + FB', 'tc')],
    [P('Day 2-3', 'tc'), P('Testimonials, FAQ, "what\'s inside" breakdown emails', 'tc'), P('Email + IG Stories', 'tc')],
    [P('Day 4-5', 'tc'), P('Overcome objections. Share student wins. Address "is this for me?"', 'tc'), P('Email + IG', 'tc')],
    [P('Day 6 (last day)', 'tc'), P('Urgency: "Doors close tonight at midnight." Final email + Stories countdown.', 'tc'), P('Email (2x) + IG', 'tc')],
    [P('Day 7 (closed)', 'tc'), P('"Doors are closed" email. Waitlist for next round.', 'tc'), P('Email', 'tc')],
]

t = Table(launch_data, colWidths=[1.2*inch, 3.5*inch, 1.6*inch], repeatRows=1)
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), FOREST),
    ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
    ('BACKGROUND', (0, 1), (-1, -1), WARM_GRAY),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WARM_GRAY, HexColor('#ffffff')]),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e5e5e5')),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
]))
story.append(t)

story.append(S(1, 8))
story.append(P("<b>Relaunch:</b> Open the cart again 2-3x per year. Each relaunch is easier — you have testimonials, refined emails, and a bigger audience.", 'body'))

story.append(hr())

# ═══════════════════════════════════════════════════
# BUSINESS MODEL
# ═══════════════════════════════════════════════════
story.append(P("Revenue Projections", 'h1'))
story.append(P("Conservative estimates based on email list size and typical course conversion rates (3-5%).", 'body'))
story.append(S(1, 8))

rev_data = [
    [P('<b>Course</b>', 'tc_bold'), P('<b>Price</b>', 'tc_bold'), P('<b>List Size</b>', 'tc_bold'), P('<b>Conv. Rate</b>', 'tc_bold'), P('<b>Sales</b>', 'tc_bold'), P('<b>Revenue</b>', 'tc_bold')],
    [P('Deschooling (launch 1)', 'tc'), P('$49', 'tc'), P('1,000', 'tc'), P('3-5%', 'tc'), P('30-50', 'tc'), P('$1,470-2,450', 'tc')],
    [P('Nature Classroom (launch 1)', 'tc'), P('$79', 'tc'), P('1,500', 'tc'), P('3-5%', 'tc'), P('45-75', 'tc'), P('$3,555-5,925', 'tc')],
    [P('Worldschool Blueprint (launch 1)', 'tc'), P('$99', 'tc'), P('2,000', 'tc'), P('3-5%', 'tc'), P('60-100', 'tc'), P('$5,940-9,900', 'tc')],
]

t = Table(rev_data, colWidths=[1.8*inch, 0.6*inch, 0.8*inch, 0.8*inch, 0.7*inch, 1.6*inch], repeatRows=1)
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), FOREST),
    ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
    ('BACKGROUND', (0, 1), (-1, -1), WARM_GRAY),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WARM_GRAY, HexColor('#ffffff')]),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e5e5e5')),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
]))
story.append(t)

story.append(S(1, 8))
story.append(P("<b>Note:</b> Each course relaunches 2-3x per year. A course that makes $2,000 on launch 1 can make $3,000-5,000 on launch 2 with a larger list and testimonials. Annual revenue per course grows each cycle.", 'body'))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# HOW IT ALL FITS TOGETHER
# ═══════════════════════════════════════════════════
story.append(P("How Store + Courses + Membership Fit Together", 'h1'))
story.append(S(1, 6))

story.append(P("The Product Ladder", 'h2'))
ladder = [
    ("Free guide ($0)", "Entry point. Captures email. Builds trust."),
    ("Individual packs ($5-15)", "First purchase. Low risk for buyer. Proves your quality."),
    ("Bundles ($45)", "Higher AOV. Customer already trusts you."),
    ("Parent guides ($10)", "Deepens relationship. Different content type."),
    ("Video courses ($49-99)", "Premium. Aspirational. Launched with open/close cart."),
    ("Membership ($79/yr)", "2 pack downloads/month + video library + community + workshops."),
]
for product, desc in ladder:
    story.append(P(f"<bullet>&bull;</bullet> <b>{product}</b> — {desc}", 'bullet'))

story.append(S(1, 8))
story.append(P("The Rules", 'h2'))
rules = [
    "The store stays public and always available. It's your discovery engine (SEO, Pinterest, social).",
    "Courses use open/close cart for urgency. Available during launch windows only.",
    "Membership is the \"get everything\" option. Annual only ($79/year) to prevent download-and-cancel.",
    "Members get 2 pack downloads/month (not the whole library), full video course access, live workshops, community.",
    "Non-members can still buy any individual product at full price. Membership is the better deal, not the only path.",
    "Each rung of the ladder builds trust for the next. Don't skip rungs.",
]
for r in rules:
    story.append(P(f"<bullet>&bull;</bullet> {r}", 'bullet'))

story.append(S(1, 12))
story.append(P("Timeline", 'h2'))
timeline = [
    ("Now - Q4 2026", "Store only. Build catalog (activity packs + parent guides), grow audience, prove demand."),
    ("Q1 2027", "Launch Course 1 (Deschooling) to email list. Open/close cart. Learn the launch process."),
    ("Q2-Q3 2027", "Launch Course 2 (Nature). Relaunch Course 1. Start planning membership."),
    ("Q4 2027", "Launch membership with enough content to justify recurring (30+ packs, 3+ guides, 2 courses)."),
    ("2028+", "Courses 3-5. Quarterly relaunches. Membership grows. Direct revenue exceeds TPT."),
]
for when, what in timeline:
    story.append(KeepTogether([
        P(f"<b>{when}:</b> {what}", 'body'),
        S(1, 4),
    ]))

story.append(S(1, 16))
story.append(HRFlowable(width="40%", thickness=2, color=FOREST, spaceBefore=0, spaceAfter=12))
story.append(P("Build the foundation first. Every $5.99 pack you sell today is building the audience that will buy your $99 course next year. The ladder only works if the bottom rungs are solid.", 'quote'))

doc.build(story)
print(f"PDF saved to: {output_path}")
