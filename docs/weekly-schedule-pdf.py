#!/usr/bin/env python3
"""Generate Anywhere Learning Post-Launch Weekly Marketing Schedule PDF."""

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

# Brand colors
FOREST = HexColor('#588157')
FOREST_DARK = HexColor('#3d5c3b')
GOLD = HexColor('#d4a373')
CREAM = HexColor('#faf9f6')
WARM_GRAY = HexColor('#f7f5f0')
DARK = HexColor('#2d2d2d')
MID = HexColor('#555555')
LIGHT = HexColor('#888888')
ROSE = HexColor('#c47a8f')
TERRA = HexColor('#c4836a')

output_path = os.path.expanduser("~/Desktop/Anywhere Learning/weekly-marketing-schedule.pdf")

doc = SimpleDocTemplate(
    output_path,
    pagesize=letter,
    topMargin=0.75*inch,
    bottomMargin=0.6*inch,
    leftMargin=0.75*inch,
    rightMargin=0.75*inch,
)

styles = {}
styles['title'] = ParagraphStyle('Title', fontName='Helvetica-Bold', fontSize=26, textColor=FOREST, spaceAfter=6, alignment=TA_CENTER)
styles['subtitle'] = ParagraphStyle('Subtitle', fontName='Helvetica', fontSize=12, textColor=LIGHT, spaceAfter=24, alignment=TA_CENTER)
styles['h1'] = ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=18, textColor=FOREST, spaceBefore=24, spaceAfter=10)
styles['h2'] = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=14, textColor=FOREST_DARK, spaceBefore=16, spaceAfter=8)
styles['h3'] = ParagraphStyle('H3', fontName='Helvetica-Bold', fontSize=12, textColor=GOLD, spaceBefore=12, spaceAfter=6)
styles['body'] = ParagraphStyle('Body', fontName='Helvetica', fontSize=10, textColor=DARK, leading=15, spaceAfter=6)
styles['body_bold'] = ParagraphStyle('BodyBold', fontName='Helvetica-Bold', fontSize=10, textColor=DARK, leading=15, spaceAfter=6)
styles['bullet'] = ParagraphStyle('Bullet', fontName='Helvetica', fontSize=10, textColor=DARK, leading=15, leftIndent=18, spaceAfter=4, bulletIndent=6)
styles['sub_bullet'] = ParagraphStyle('SubBullet', fontName='Helvetica', fontSize=9.5, textColor=MID, leading=14, leftIndent=36, spaceAfter=3, bulletIndent=24)
styles['quote'] = ParagraphStyle('Quote', fontName='Helvetica-Oblique', fontSize=10, textColor=MID, leading=15, leftIndent=24, rightIndent=24, spaceAfter=8)
styles['small'] = ParagraphStyle('Small', fontName='Helvetica', fontSize=9, textColor=LIGHT, spaceAfter=4, leading=13)
styles['tc'] = ParagraphStyle('TC', fontName='Helvetica', fontSize=8.5, textColor=DARK, leading=12)
styles['tc_bold'] = ParagraphStyle('TCBold', fontName='Helvetica-Bold', fontSize=8.5, textColor=DARK, leading=12)
styles['tc_small'] = ParagraphStyle('TCSmall', fontName='Helvetica', fontSize=7.5, textColor=MID, leading=10)

story = []
S = Spacer

def hr():
    return HRFlowable(width="100%", thickness=1, color=HexColor('#e5e5e5'), spaceBefore=12, spaceAfter=12)

def P(text, style='body'):
    return Paragraph(text, styles[style])

# ═══════════════════════════════════════════════════
# COVER PAGE
# ═══════════════════════════════════════════════════
story.append(S(1, 120))
story.append(P("Anywhere Learning", 'title'))
story.append(S(1, 8))
story.append(Paragraph("Weekly Marketing Schedule", ParagraphStyle('CoverSub', fontName='Helvetica', fontSize=18, textColor=GOLD, alignment=TA_CENTER, spaceAfter=8)))
story.append(S(1, 12))
story.append(HRFlowable(width="40%", thickness=2, color=FOREST, spaceBefore=0, spaceAfter=12))
story.append(Paragraph("Post-launch operating rhythm for a solo founder", ParagraphStyle('CoverDesc', fontName='Helvetica', fontSize=11, textColor=MID, alignment=TA_CENTER)))
story.append(S(1, 6))
story.append(Paragraph("~8-10 hours/week total", ParagraphStyle('CoverHrs', fontName='Helvetica-Bold', fontSize=11, textColor=FOREST, alignment=TA_CENTER)))
story.append(S(1, 40))
story.append(Paragraph("April 2026", ParagraphStyle('CoverDate', fontName='Helvetica', fontSize=10, textColor=LIGHT, alignment=TA_CENTER)))
story.append(PageBreak())

# ═══════════════════════════════════════════════════
# OVERVIEW
# ═══════════════════════════════════════════════════
story.append(P("Weekly Overview", 'h1'))
story.append(P("This schedule covers all recurring marketing activities post-launch. It's designed for one person spending 8-10 hours per week. Batch-create content on Sunday, then spend weekdays on distribution and engagement.", 'body'))
story.append(S(1, 6))

story.append(P("Channel Time Allocation", 'h2'))
time_data = [
    [P('<b>Channel</b>', 'tc_bold'), P('<b>Weekly Time</b>', 'tc_bold'), P('<b>Frequency</b>', 'tc_bold'), P('<b>Purpose</b>', 'tc_bold')],
    [P('Content creation (batch)', 'tc'), P('2-3 hrs', 'tc'), P('Sunday', 'tc'), P('Film Reels, design carousels, write captions, draft blog', 'tc')],
    [P('Instagram', 'tc'), P('1 hr/day', 'tc'), P('Daily', 'tc'), P('Post, Stories, engage, DMs', 'tc')],
    [P('Pinterest / Tailwind', 'tc'), P('1 hr', 'tc'), P('1x/week', 'tc'), P('Pin new content, schedule via Tailwind', 'tc')],
    [P('Blog / SEO', 'tc'), P('2-3 hrs', 'tc'), P('1 post/week', 'tc'), P('Write, optimize, internal link', 'tc')],
    [P('Facebook groups', 'tc'), P('15 min/day', 'tc'), P('Daily', 'tc'), P('Engage, answer questions, be helpful', 'tc')],
    [P('Reddit', 'tc'), P('15 min/day', 'tc'), P('Daily', 'tc'), P('r/homeschool, r/worldschooling, add value', 'tc')],
    [P('Email (Kit newsletter)', 'tc'), P('1 hr', 'tc'), P('1x/week', 'tc'), P('Weekly email: tip + product mention', 'tc')],
    [P('Influencer seeding', 'tc'), P('30 min', 'tc'), P('1x/week', 'tc'), P('Outreach, follow up, ship free products', 'tc')],
    [P('New product dev', 'tc'), P('2-3 hrs', 'tc'), P('Ongoing', 'tc'), P('Design next activity pack or bundle', 'tc')],
    [P('Analytics review', 'tc'), P('30 min', 'tc'), P('1x/week', 'tc'), P('Check what\'s working, adjust', 'tc')],
]

t = Table(time_data, colWidths=[1.7*inch, 0.9*inch, 0.9*inch, 3.2*inch], repeatRows=1)
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
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
]))
story.append(t)

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# DAILY SCHEDULE
# ═══════════════════════════════════════════════════
story.append(P("Daily Schedule", 'h1'))
story.append(P("Each day has a primary focus plus recurring daily tasks (IG Stories, community engagement). The heavy creation happens Sunday so weekdays are lighter.", 'body'))
story.append(S(1, 8))

# Color-coded day headers
def day_header(day, focus, color):
    return KeepTogether([
        Paragraph(f'<font color="{color}"><b>{day}</b></font>  —  {focus}',
                  ParagraphStyle('DayHead', fontName='Helvetica-Bold', fontSize=13, textColor=DARK, spaceBefore=14, spaceAfter=6)),
    ])

# SUNDAY
story.append(day_header("Sunday", "Batch Creation Day (2-3 hrs)", '#588157'))
story.append(P("<bullet>&bull;</bullet> <b>Film 3 Reels</b> for the week (can be rough, authentic > polished)", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Design 2 carousels</b> in Canva using brand templates", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Write all captions</b> for Mon-Sat posts + schedule in Meta Business Suite", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Draft weekly blog post</b> (or finish one started mid-week)", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Schedule 15-20 Pinterest pins</b> in Tailwind for the week", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Draft Kit newsletter</b> for Thursday send", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Review last week's analytics</b> — top posts, email opens, site traffic, sales", 'bullet'))
story.append(S(1, 4))
story.append(P("This is your power block. Protect it. Everything else in the week is distribution and engagement.", 'small'))

story.append(hr())

# MONDAY
story.append(day_header("Monday", "Instagram + Community (1.5 hrs)", '#d4a373'))
story.append(P("<b>Morning (45 min):</b>", 'body_bold'))
story.append(P("<bullet>&bull;</bullet> Post Reel #1: \"Try This Today\" activity (scheduled or manual)", 'bullet'))
story.append(P("<bullet>&bull;</bullet> 3-5 IG Stories: poll or question sticker related to Reel topic", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Engage: reply to weekend DMs + comments, comment on 10 neighbor accounts", 'bullet'))
story.append(P("<b>Afternoon (45 min):</b>", 'body_bold'))
story.append(P("<bullet>&bull;</bullet> Facebook groups: browse 3-5 homeschool groups, answer 2-3 questions helpfully", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Reddit: check r/homeschool, r/worldschooling — answer 1-2 posts where relevant", 'bullet'))
story.append(P("<bullet>&bull;</bullet> IG Stories: share a behind-the-scenes or what you're working on", 'bullet'))

story.append(hr())

# TUESDAY
story.append(day_header("Tuesday", "Blog + Pinterest (1.5 hrs)", '#6b8e6b'))
story.append(P("<b>Morning (60 min):</b>", 'body_bold'))
story.append(P("<bullet>&bull;</bullet> <b>Publish weekly blog post</b> — optimize title, meta, internal links, add to sitemap", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Create 3-5 Pinterest pins for the new blog post (different titles/images, same URL)", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Schedule pins in Tailwind with keyword-rich descriptions", 'bullet'))
story.append(P("<b>Afternoon (30 min):</b>", 'body_bold'))
story.append(P("<bullet>&bull;</bullet> Post carousel on IG (educational/tips, relates to blog topic)", 'bullet'))
story.append(P("<bullet>&bull;</bullet> IG Stories: behind-the-scenes of creating content", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Community engagement: FB groups + Reddit (15 min)", 'bullet'))

story.append(hr())

# WEDNESDAY
story.append(day_header("Wednesday", "Engagement + Influencer Outreach (1 hr)", '#c4836a'))
story.append(P("<b>No feed post today — rest day for the algorithm.</b>", 'body_bold'))
story.append(P("<bullet>&bull;</bullet> <b>Influencer outreach</b> (30 min): DM or email 2-3 micro homeschool creators. Offer free product for honest review. Follow up on previous outreach.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> IG Stories: engagement-focused — reply to DMs on camera, share a follower win, repost tagged content", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Community engagement: FB groups + Reddit (15 min)", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Product development</b> — if building a new pack, use the extra time here", 'bullet'))

story.append(PageBreak())

# THURSDAY
story.append(day_header("Thursday", "Email + Instagram (1.5 hrs)", '#c47a8f'))
story.append(P("<b>Morning (45 min):</b>", 'body_bold'))
story.append(P("<bullet>&bull;</bullet> <b>Send Kit newsletter</b> — weekly tip, personal note, one product mention. Keep it warm and short.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Post Reel #2: personal story or trending format adapted to homeschool", 'bullet'))
story.append(P("<bullet>&bull;</bullet> IG Stories: product teaser or \"did you know\" fact about one of your guides", 'bullet'))
story.append(P("<b>Afternoon (45 min):</b>", 'body_bold'))
story.append(P("<bullet>&bull;</bullet> Engage: reply to all IG comments/DMs from the day", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Community engagement: FB groups + Reddit (15 min)", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Share blog post in 1-2 relevant Facebook groups (only where self-promo is allowed)", 'bullet'))

story.append(hr())

# FRIDAY
story.append(day_header("Friday", "Lightweight + Weekend Prep (45 min)", '#8b7355'))
story.append(P("<bullet>&bull;</bullet> Post static image: permission/encouragement quote (brand template in Canva)", 'bullet'))
story.append(P("<bullet>&bull;</bullet> IG Stories: weekend activity suggestion + link sticker to free guide", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Community engagement: FB groups + Reddit (15 min)", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Quick check: any DMs or comments to respond to", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Optional:</b> start drafting next week's blog post", 'bullet'))

story.append(hr())

# SATURDAY
story.append(day_header("Saturday", "Product Showcase + Light Engagement (45 min)", '#588157'))
story.append(P("<bullet>&bull;</bullet> Post Reel #3: product in action (kids using activities, flat lay, or \"Comment GUIDE\" CTA)", 'bullet'))
story.append(P("<bullet>&bull;</bullet> IG Stories: casual weekend content — what your family is doing, nature shots", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Light engagement: quick scroll through DMs, reply to comments", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Optional:</b> work on new product if energy allows", 'bullet'))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# MONTHLY RECURRING
# ═══════════════════════════════════════════════════
story.append(P("Monthly Recurring Tasks", 'h1'))
story.append(S(1, 6))

monthly = [
    ("Week 1", "New product launch or bundle update", "Release at least 1 new activity pack per month. Announce via email, IG, Pinterest. Keep the catalog growing — more products = more search surface."),
    ("Week 2", "Influencer check-in + collab planning", "Review which micro-creators posted about you. Re-engage the best ones. Identify 3-5 new creators to seed."),
    ("Week 3", "Content audit + repurpose", "Review top-performing content from the month. Repurpose: top Reel becomes a carousel, top blog post becomes an IG carousel, top carousel becomes Pinterest pins."),
    ("Week 4", "Analytics deep dive + next month planning", "Review: site traffic, email list growth, conversion rate, top products, IG growth. Plan next month's blog topics, product launches, and any seasonal content."),
]

for week, title, desc in monthly:
    story.append(KeepTogether([
        P(f"<b>{week}: {title}</b>", 'body_bold'),
        P(desc, 'body'),
        S(1, 4),
    ]))

story.append(hr())

# ═══════════════════════════════════════════════════
# CHANNEL PLAYBOOKS
# ═══════════════════════════════════════════════════
story.append(P("Channel Playbooks", 'h1'))
story.append(P("Quick-reference rules for each channel.", 'body'))

# Blog
story.append(P("Blog / SEO", 'h2'))
story.append(P("<bullet>&bull;</bullet> <b>Frequency:</b> 1 post per week minimum. Consistency matters more than length.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Length:</b> 1,000-2,000 words for SEO posts. 500-800 for personal/story posts.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Topics:</b> Alternate between SEO-targeted posts (\"best outdoor activities for homeschoolers\") and personal/story posts (\"what deschooling looked like for us\").", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Internal linking:</b> Every post links to at least 1 product and 1 other blog post.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Summary boxes:</b> Add AI-citability summary blocks to substantial reference posts.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Repurpose:</b> Every blog post becomes 3-5 Pinterest pins + 1 IG carousel or Reel.", 'bullet'))

# Pinterest
story.append(P("Pinterest / Tailwind", 'h2'))
story.append(P("<bullet>&bull;</bullet> <b>Frequency:</b> 15-20 pins per week via Tailwind scheduler (batch on Sunday).", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Pin types:</b> Blog post pins (3-5 per post with different titles), product pins, IG Reel reposts, seasonal idea pins.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Descriptions:</b> Keyword-rich, natural language. Include \"homeschool,\" \"outdoor learning,\" \"no prep\" in every description.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Boards:</b> Organize by category — Outdoor Learning, Nature Activities, Homeschool Ideas, Real-World Math, Creativity, Worldschool Tips.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Tailwind Communities:</b> Join 3-5 homeschool/education communities for extra reach.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Key insight:</b> Pinterest is a search engine, not social media. Pins compound over months. A pin you create today can drive traffic for 2+ years.", 'bullet'))

# Email
story.append(P("Email Newsletter (Kit)", 'h2'))
story.append(P("<bullet>&bull;</bullet> <b>Frequency:</b> 1x per week (Thursday morning — high open rates for parent audience).", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Format:</b> Short and warm. One personal note or tip + one product/blog mention + one CTA.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Subject lines:</b> Personal, curiosity-driven. \"This changed our mornings\" beats \"Newsletter #12.\"", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Segments:</b> Leads (haven't bought) get more educational content + soft sells. Buyers get cross-sells + new products.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Automated sequences:</b> Lead magnet course, post-purchase nurture, cart abandonment — these run on autopilot.", 'bullet'))

story.append(PageBreak())

# FB Groups
story.append(P("Facebook Groups", 'h2'))
story.append(P("<bullet>&bull;</bullet> <b>Frequency:</b> 15 min/day browsing and engaging. Never batch — consistency matters.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Groups to join:</b> Search \"homeschool activities,\" \"secular homeschool,\" \"worldschool families,\" \"nature homeschool,\" \"unschooling.\" Join 5-10 active ones.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Strategy:</b> Be genuinely helpful. Answer questions. Share experience. Never drop links unprompted.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>When to share your link:</b> Only when someone specifically asks for a resource you have, or in designated promo threads.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Profile optimization:</b> Your FB profile bio should mention Anywhere Learning + link to your site. Curious people will click.", 'bullet'))

# Reddit
story.append(P("Reddit", 'h2'))
story.append(P("<bullet>&bull;</bullet> <b>Frequency:</b> 15 min/day. Reddit rewards consistent, helpful participation.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Subreddits:</b> r/homeschool (287k), r/HomeEducation, r/Worldschooling, r/unschool. Also r/Parenting for broader reach.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Rules:</b> Reddit hates self-promotion. Build karma first (2-4 weeks of pure engagement). Then occasionally share blog posts when genuinely relevant to a question.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Strategy:</b> Answer questions in depth. Share your homeschool experience authentically. If your answer naturally leads to your product, mention it as \"I actually made something for this\" — not \"check out my store.\"", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Biggest win:</b> A single viral Reddit comment can drive more traffic than a week of IG posts. Invest in thoughtful answers.", 'bullet'))

# Influencer
story.append(P("Influencer Seeding", 'h2'))
story.append(P("<bullet>&bull;</bullet> <b>Frequency:</b> 30 min/week dedicated outreach + ongoing relationship building.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Target:</b> Micro-creators with 1k-10k followers in homeschool/nature/worldschool niche on IG, TikTok, YouTube.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Offer:</b> Free product (full bundle, not just one pack) in exchange for honest review. No script, no requirements — authenticity converts.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Outreach template:</b> \"Hey [name]! I love your [specific post]. I make no-prep activity guides for homeschool families and I think your audience would love them. Can I send you a free bundle to try with your kids? No strings attached.\"", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Goal:</b> 2-3 new creators seeded per month. Track who posts, who doesn't, who to re-engage.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Long game:</b> Build real relationships, not transactional exchanges. The creators who genuinely love your product will mention it again and again unprompted.", 'bullet'))

story.append(hr())

# ═══════════════════════════════════════════════════
# NEW PRODUCT CADENCE
# ═══════════════════════════════════════════════════
story.append(P("New Product Cadence", 'h1'))
story.append(P("A growing catalog is your best marketing asset. Every new product is a new search surface on Google, Pinterest, and TPT.", 'body'))
story.append(S(1, 6))

story.append(P("<bullet>&bull;</bullet> <b>Goal:</b> 1-2 new activity packs per month + 1 new bundle per quarter.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Launch day:</b> Email announcement to full list + IG Reel + 5 Pinterest pins + blog post about the topic.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Seasonal timing:</b> Launch seasonal packs 4-6 weeks before the season starts (parents plan ahead).", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Cross-post to TPT:</b> Every new product goes on TPT too. Two revenue streams from one creation effort.", 'bullet'))
story.append(P("<bullet>&bull;</bullet> <b>Bundle strategy:</b> Once you have 4+ packs in a category, create a mega bundle. Bundles are your highest-margin, highest-AOV products.", 'bullet'))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# CONTENT CALENDAR TEMPLATE
# ═══════════════════════════════════════════════════
story.append(P("Weekly Content Calendar Template", 'h1'))
story.append(P("Copy this template each week. Fill in specifics during Sunday batch session.", 'body'))
story.append(S(1, 8))

cal_data = [
    [P('<b>Day</b>', 'tc_bold'), P('<b>IG Feed</b>', 'tc_bold'), P('<b>IG Stories</b>', 'tc_bold'), P('<b>Other Channels</b>', 'tc_bold')],
    [P('<b>Sun</b>', 'tc_bold'), P('Schedule week\'s posts', 'tc'), P('Week preview poll', 'tc'), P('Tailwind: schedule pins<br/>Draft newsletter<br/>Analytics review', 'tc')],
    [P('<b>Mon</b>', 'tc_bold'), P('Reel: Try This Today', 'tc'), P('Poll/question sticker', 'tc'), P('FB groups + Reddit (15 min)', 'tc')],
    [P('<b>Tue</b>', 'tc_bold'), P('Carousel: educational', 'tc'), P('Behind-the-scenes', 'tc'), P('Publish blog post<br/>Create Pinterest pins', 'tc')],
    [P('<b>Wed</b>', 'tc_bold'), P('(rest day)', 'tc'), P('Engagement: DMs, reposts', 'tc'), P('Influencer outreach<br/>FB groups + Reddit', 'tc')],
    [P('<b>Thu</b>', 'tc_bold'), P('Reel: personal/trend', 'tc'), P('Product teaser', 'tc'), P('Send Kit newsletter<br/>FB groups + Reddit', 'tc')],
    [P('<b>Fri</b>', 'tc_bold'), P('Static: quote/mindset', 'tc'), P('Free guide link sticker', 'tc'), P('FB groups + Reddit<br/>Optional: draft blog', 'tc')],
    [P('<b>Sat</b>', 'tc_bold'), P('Reel: product/CTA', 'tc'), P('Weekend family content', 'tc'), P('Light engagement only', 'tc')],
]

t = Table(cal_data, colWidths=[0.6*inch, 1.7*inch, 1.7*inch, 2.7*inch], repeatRows=1)
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

story.append(S(1, 20))
story.append(hr())

# ═══════════════════════════════════════════════════
# QUARTERLY GOALS
# ═══════════════════════════════════════════════════
story.append(P("Quarterly Milestones", 'h1'))
story.append(S(1, 6))

story.append(P("Q2 2026 (Launch Quarter)", 'h2'))
story.append(P("<bullet>&bull;</bullet> Launch site + complete pre-launch checklist", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Publish 8-10 blog posts", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Grow IG to 200-500 followers", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Grow email list to 200+ subscribers", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Seed 5-10 micro-influencers", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Set up Tailwind + pin consistently", 'bullet'))
story.append(P("<bullet>&bull;</bullet> First direct site sales", 'bullet'))

story.append(P("Q3 2026 (Growth Quarter)", 'h2'))
story.append(P("<bullet>&bull;</bullet> 500-1,000 IG followers", 'bullet'))
story.append(P("<bullet>&bull;</bullet> 500+ email subscribers", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Launch 3-4 new products + 1 new bundle", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Pinterest driving measurable traffic", 'bullet'))
story.append(P("<bullet>&bull;</bullet> First organic Google traffic from blog", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Consider Meta Pixel + first retargeting ad test ($5-10/day)", 'bullet'))
story.append(P("<bullet>&bull;</bullet> TPT revenue: $600-800/month", 'bullet'))

story.append(P("Q4 2026 (Scale Quarter)", 'h2'))
story.append(P("<bullet>&bull;</bullet> 1,000+ IG followers", 'bullet'))
story.append(P("<bullet>&bull;</bullet> 1,000+ email subscribers", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Direct site revenue matching or exceeding TPT", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Referral program generating organic sales", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Back-to-school + fall seasonal content performing", 'bullet'))
story.append(P("<bullet>&bull;</bullet> Holiday bundle(s) for Q4 gift-giving season", 'bullet'))

story.append(S(1, 20))
story.append(HRFlowable(width="40%", thickness=2, color=FOREST, spaceBefore=0, spaceAfter=12))
story.append(P("The system works when you work it consistently. One hour a day, every day, compounds into an audience and revenue stream that grows on its own. Don't optimize — just execute.", 'quote'))

doc.build(story)
print(f"PDF saved to: {output_path}")
