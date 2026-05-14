#!/usr/bin/env python3
"""Generate Anywhere Learning Instagram Strategy PDF."""

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

output_path = os.path.expanduser("~/Desktop/Anywhere Learning/ig-content-strategy.pdf")

doc = SimpleDocTemplate(
    output_path,
    pagesize=letter,
    topMargin=0.75*inch,
    bottomMargin=0.6*inch,
    leftMargin=0.85*inch,
    rightMargin=0.85*inch,
)

# ── Styles ──
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
styles['tag'] = ParagraphStyle('Tag', fontName='Courier', fontSize=9, textColor=FOREST, leading=13, leftIndent=18, spaceAfter=2)
styles['small'] = ParagraphStyle('Small', fontName='Helvetica', fontSize=9, textColor=LIGHT, spaceAfter=4)
styles['table_header'] = ParagraphStyle('TableHeader', fontName='Helvetica-Bold', fontSize=9, textColor=HexColor('#ffffff'))
styles['table_cell'] = ParagraphStyle('TableCell', fontName='Helvetica', fontSize=9, textColor=DARK, leading=13)
styles['table_cell_bold'] = ParagraphStyle('TableCellBold', fontName='Helvetica-Bold', fontSize=9, textColor=DARK, leading=13)

story = []
S = Spacer

def hr():
    return HRFlowable(width="100%", thickness=1, color=HexColor('#e5e5e5'), spaceBefore=12, spaceAfter=12)

def table_with_style(data, col_widths=None):
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), FOREST),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 1), (-1, -1), WARM_GRAY),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WARM_GRAY, HexColor('#ffffff')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e5e5e5')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    return t

# ═══════════════════════════════════════════════════
# COVER PAGE
# ═══════════════════════════════════════════════════
story.append(S(1, 120))
story.append(Paragraph("Anywhere Learning", styles['title']))
story.append(S(1, 8))
story.append(Paragraph("Instagram Content Strategy", ParagraphStyle('CoverSub', fontName='Helvetica', fontSize=18, textColor=GOLD, alignment=TA_CENTER, spaceAfter=8)))
story.append(S(1, 12))
story.append(HRFlowable(width="40%", thickness=2, color=FOREST, spaceBefore=0, spaceAfter=12))
story.append(Paragraph("A complete playbook for building an engaged homeschool community on Instagram", ParagraphStyle('CoverDesc', fontName='Helvetica', fontSize=11, textColor=MID, alignment=TA_CENTER, spaceAfter=6)))
story.append(S(1, 40))
story.append(Paragraph("April 2026", ParagraphStyle('CoverDate', fontName='Helvetica', fontSize=10, textColor=LIGHT, alignment=TA_CENTER)))
story.append(PageBreak())

# ═══════════════════════════════════════════════════
# 1. CONTENT PILLARS
# ═══════════════════════════════════════════════════
story.append(Paragraph("1. Content Pillars", styles['h1']))
story.append(Paragraph("Every post falls under one of five pillars. They balance value-giving with selling, and personal connection with authority-building.", styles['body']))
story.append(S(1, 8))

pillars = [
    ("Pillar 1: \"Learning Is Already Happening\" (25%)", "Educational Authority",
     "Show parents that real learning happens outside textbooks. Share the science behind experiential learning, nature-based education, and child-led exploration. This is your authority builder.",
     "Establish credibility, earn saves and shares"),
    ("Pillar 2: \"Try This Today\" (25%)", "Actionable Tips",
     "Give away one quick, no-prep activity parents can do right now. People try the free idea, see their kid light up, and want more.",
     "Drive saves, build trust, create \"aha\" moments that lead to product interest"),
    ("Pillar 3: \"Our Worldschool Life\" (20%)", "Behind-the-Scenes",
     "Amelie's own story as a worldschooling mom. The messy real moments, the travel, the doubts, the wins. Builds parasocial connection and loyalty.",
     "Build know-like-trust factor, humanize the brand"),
    ("Pillar 4: \"You Have Permission\" (15%)", "Mindset & Encouragement",
     "Address the fears and guilt homeschool parents carry. \"Am I doing enough?\" Meet them where they are with warmth, not lectures.",
     "Emotional resonance, comments, DM conversations, shares"),
    ("Pillar 5: \"Made for This\" (15%)", "Product Showcase",
     "Show actual products in use. Kids doing activities, flat lays, customer testimonials, bundle breakdowns.",
     "Drive traffic to shop, free guide, and email list"),
]

for title, tag, desc, goal in pillars:
    story.append(Paragraph(title, styles['h3']))
    story.append(Paragraph(desc, styles['body']))
    story.append(Paragraph(f"<b>Goal:</b> {goal}", styles['body']))
    story.append(S(1, 4))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# 2. FORMAT MIX
# ═══════════════════════════════════════════════════
story.append(Paragraph("2. Post Types & Format Mix", styles['h1']))
story.append(Paragraph("The algorithm heavily rewards Reels for reach and carousels for saves. Static posts have lower reach but work for community-building.", styles['body']))
story.append(S(1, 8))

format_data = [
    ['Format', 'Per Week', 'Why'],
    ['Reels (15-60 sec)', '3', 'Highest reach, algorithm priority, discovery tool'],
    ['Carousels (5-10 slides)', '2', 'Highest saves and shares, educational content'],
    ['Static posts', '1', 'Quote graphics, announcements, simple prompts'],
    ['Stories', 'Daily (3-7)', 'Engagement, polls, behind-the-scenes, link stickers'],
]
story.append(table_with_style(format_data, col_widths=[1.8*inch, 1*inch, 3.5*inch]))
story.append(S(1, 8))
story.append(Paragraph("<b>Total: 6 feed posts/week + daily Stories.</b> If 6 feels like too much at launch, drop to 4 (2 Reels, 1 carousel, 1 static) and keep Stories daily.", styles['body']))

story.append(hr())

# ═══════════════════════════════════════════════════
# 3. WEEKLY CADENCE
# ═══════════════════════════════════════════════════
story.append(Paragraph("3. Weekly Posting Cadence", styles['h1']))
story.append(Paragraph("A realistic schedule for a solo founder spending roughly one hour per day.", styles['body']))
story.append(S(1, 8))

cadence_data = [
    ['Day', 'Feed Post', 'Stories'],
    ['Monday', 'Reel: "Try This Today" activity', 'Poll or question sticker'],
    ['Tuesday', 'Carousel: educational/tips', 'Behind-the-scenes'],
    ['Wednesday', 'No feed post (rest)', 'Engagement: reply to DMs, share follower wins'],
    ['Thursday', 'Reel: personal story or trend', 'Product teaser or "did you know"'],
    ['Friday', 'Static: permission/encouragement', 'Weekend activity + link to free guide'],
    ['Saturday', 'Reel: product in action', 'Casual weekend: what your family is doing'],
    ['Sunday', 'No feed post (rest)', 'Week preview, "what should I post?" poll'],
]
story.append(table_with_style(cadence_data, col_widths=[1.1*inch, 2.4*inch, 2.8*inch]))
story.append(S(1, 8))
story.append(Paragraph("<b>Batch creation tip:</b> Block 2-3 hours on Sunday evening to film all Reels and design carousels for the week. Daily hour: Stories (10 min), engagement (30 min), scheduling (20 min).", styles['body']))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# 4. CONTENT IDEAS (25)
# ═══════════════════════════════════════════════════
story.append(Paragraph("4. Content Ideas", styles['h1']))
story.append(Paragraph("25 specific post ideas mapped to pillars with format recommendations.", styles['body']))

# Authority
story.append(Paragraph("Pillar 1: \"Learning Is Already Happening\"", styles['h2']))
ideas_auth = [
    ("Carousel", "\"7 Things Your Kid Learns on a Nature Walk (Without Realizing It)\" -- biology, math estimation, navigation, vocabulary, observation, patience, problem-solving"),
    ("Reel", "\"POV: Your kid has been 'just playing outside' for an hour\" -- text overlay listing everything they actually learned"),
    ("Carousel", "\"Worksheets vs. Real-World Learning\" side-by-side -- worksheet about fractions vs kid halving a recipe"),
    ("Static", "Quote graphic: \"Children learn more from what you are than what you teach.\""),
    ("Reel", "\"3 studies that prove outdoor learning works\" -- talking head with text bullet points"),
]
for fmt, idea in ideas_auth:
    story.append(Paragraph(f"<bullet>&bull;</bullet> <b>{fmt}:</b> {idea}", styles['bullet']))

# Tips
story.append(Paragraph("Pillar 2: \"Try This Today\"", styles['h2']))
ideas_tips = [
    ("Reel", "\"One activity, zero prep, any age\" -- quick nature scavenger hunt. End card: \"Want 50 more? Link in bio.\""),
    ("Carousel", "\"5 No-Prep Outdoor Activities for This Week\" -- one per slide, last slide links to Nature Mega Bundle"),
    ("Reel", "\"Turn any grocery trip into a math lesson\" -- estimation games, price comparison, weight guessing"),
    ("Carousel", "\"Rainy Day? 4 Window Activities That Count as Science\" -- condensation, rain measurement, clouds"),
    ("Static", "Single activity card from your products (watermarked). \"Save this for your next outdoor day.\""),
]
for fmt, idea in ideas_tips:
    story.append(Paragraph(f"<bullet>&bull;</bullet> <b>{fmt}:</b> {idea}", styles['bullet']))

# Personal
story.append(Paragraph("Pillar 3: \"Our Worldschool Life\"", styles['h2']))
ideas_personal = [
    ("Reel", "\"A day in our worldschool life\" -- morning routine, outdoor time, real moments including hard ones"),
    ("Reel", "\"The moment I knew school wasn't working for us\" -- talking head, personal, vulnerable"),
    ("Carousel", "\"What I Wish I Knew Before We Started Homeschooling\" -- personal lessons, one per slide"),
    ("Reel", "\"Things people say when you tell them you homeschool\" -- humorous, relatable"),
    ("Stories", "\"Ask me anything about worldschooling\" -- question box sticker, answer on camera"),
]
for fmt, idea in ideas_personal:
    story.append(Paragraph(f"<bullet>&bull;</bullet> <b>{fmt}:</b> {idea}", styles['bullet']))

# Mindset
story.append(Paragraph("Pillar 4: \"You Have Permission\"", styles['h2']))
ideas_mindset = [
    ("Reel", "\"You don't need a curriculum to be a good homeschool parent\" -- calm, reassuring talking head"),
    ("Static", "Text graphic: \"Your kids don't need you to be their teacher. They need you to be their guide.\""),
    ("Carousel", "\"5 Homeschool Myths That Keep Parents Up at Night\" -- one myth per slide with encouraging debunk"),
    ("Reel", "\"Deschooling is not doing nothing. It's undoing everything.\" -- for families transitioning out"),
    ("Reel", "Stitch/duet responding to a common homeschool criticism with grace and data"),
]
for fmt, idea in ideas_mindset:
    story.append(Paragraph(f"<bullet>&bull;</bullet> <b>{fmt}:</b> {idea}", styles['bullet']))

# Product
story.append(Paragraph("Pillar 5: \"Made for This\"", styles['h2']))
ideas_product = [
    ("Reel", "Flat lay of Outdoor Pack next to hiking boots. Hands flip through pages. \"No prep.\""),
    ("Carousel", "\"What's Inside the Nature Mega Bundle\" -- each pack with preview images, final slide = price + savings"),
    ("Reel", "\"Watch my 4-year-old and 8-year-old do the same activity\" -- proves multi-age value"),
    ("Static", "Customer testimonial graphic on branded template"),
    ("Reel", "\"Free guide that changed how we do mornings\" -- \"Comment GUIDE and I'll send you the link\""),
]
for fmt, idea in ideas_product:
    story.append(Paragraph(f"<bullet>&bull;</bullet> <b>{fmt}:</b> {idea}", styles['bullet']))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# 5. REEL IDEAS
# ═══════════════════════════════════════════════════
story.append(Paragraph("5. Reel Ideas (Top 10)", styles['h1']))
story.append(Paragraph("Adapted from formats that perform well in the parenting/education niche.", styles['body']))
story.append(S(1, 6))

reels = [
    ("\"What I Ordered vs. What I Got\"", "Ordered: Pinterest-perfect homeschool day. Got: kid studying bugs for 3 hours. Caption: \"Honestly? The second one is better.\""),
    ("\"Things That Just Make Sense\" Trend", "Text overlay: letting kids learn through play... teaching math with real recipes... exploring nature instead of worksheets..."),
    ("\"Get Ready With Me: Homeschool Edition\"", "Grab coffee, step outside, hand kids a magnifying glass. Done. 15 seconds. Subverts expectations."),
    ("\"5 Seconds of Every Activity\"", "Quick-cut montage of a child doing each activity from one pack. Fast-paced, ends with product link."),
    ("\"I Stopped Doing This\"", "\"I stopped trying to recreate school at home and started letting my kids lead.\" 30-45 second transformation story."),
    ("\"What Homeschool Kids Actually Do All Day\"", "Montage: cooking, hiking, reading, building, exploring, playing. Answers the #1 question."),
    ("\"The Starter Pack\" Meme", "Worldschool mom starter pack: hiking boots, library card, coffee mug, Anywhere Learning guide, zero worksheets."),
    ("\"One Simple Switch\"", "\"Instead of a worksheet about plants, we planted a garden.\" Voice-over with B-roll of each activity."),
    ("\"POV: Let's Find Out\"", "Kid asks about mushrooms -- go outside, find them, look them up, draw them. The product philosophy in action."),
    ("\"Comment GUIDE\"", "Preview the free guide, show kids enjoying it. \"Comment GUIDE and I'll DM you the link.\" Builds email list from IG."),
]

for i, (title, desc) in enumerate(reels, 1):
    story.append(KeepTogether([
        Paragraph(f"<b>{i}. {title}</b>", styles['body_bold']),
        Paragraph(desc, styles['body']),
        S(1, 4),
    ]))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# 6. CAROUSEL IDEAS
# ═══════════════════════════════════════════════════
story.append(Paragraph("6. Carousel Ideas (Top 5)", styles['h1']))
story.append(Paragraph("Carousels drive saves and shares. Design in Canva with cream backgrounds, forest green accents, gold highlights.", styles['body']))
story.append(S(1, 6))

carousels = [
    ("\"The No-Prep Weekly Planner\"", "10 slides. Bold hook, one activity per day (Mon-Fri), bonus weekend activity, tips, \"save for next week,\" CTA to shop."),
    ("\"Ages and Stages\"", "8 slides. What kids learn naturally at every age (2-3, 4-5, 6-7, 8-9, 10-12). Final slide: \"Trust the process.\""),
    ("\"Homeschool Styles Explained\"", "7 slides. Classical, Charlotte Mason, Unschooling, Worldschooling, Eclectic, Montessori-inspired. Gets shared constantly."),
    ("\"What to Say Instead\"", "8 slides. Reframes: \"Stop playing and come do school\" becomes \"Show me what you're working on.\" Emotional, shareable."),
    ("\"10 Questions to Ask Instead of 'What Did You Learn?'\"", "\"What surprised you today?\" \"What was hardest?\" \"What do you want to know more about?\" Final slide: free guide CTA."),
]

for i, (title, desc) in enumerate(carousels, 1):
    story.append(KeepTogether([
        Paragraph(f"<b>{i}. {title}</b>", styles['body_bold']),
        Paragraph(desc, styles['body']),
        S(1, 4),
    ]))

story.append(hr())

# ═══════════════════════════════════════════════════
# 7. STORY STRATEGY
# ═══════════════════════════════════════════════════
story.append(Paragraph("7. Story Strategy", styles['h1']))
story.append(Paragraph("Stories build real relationships. Lower-pressure, disappear in 24 hours, algorithm rewards interactive stickers.", styles['body']))

story.append(Paragraph("Daily Framework (10-15 min/day)", styles['h2']))
story.append(Paragraph("<bullet>&bull;</bullet> <b>Morning (1-2 stories):</b> What you're up to. Coffee + plan, quick selfie video, scenic shot.", styles['bullet']))
story.append(Paragraph("<bullet>&bull;</bullet> <b>Mid-day (1-2 stories):</b> Interactive element. Rotate: polls, question boxes, quizzes, sliders, this-or-that.", styles['bullet']))
story.append(Paragraph("<bullet>&bull;</bullet> <b>Afternoon (1-2 stories):</b> Share a feed post, behind-the-scenes, quick tip, product highlight with link sticker.", styles['bullet']))

story.append(Paragraph("Weekly Series (Pick One)", styles['h2']))
story.append(Paragraph("<bullet>&bull;</bullet> <b>\"Try It Tuesday\"</b> -- one quick activity families can try today", styles['bullet']))
story.append(Paragraph("<bullet>&bull;</bullet> <b>\"Wins Wednesday\"</b> -- follower win or family learning moment", styles['bullet']))
story.append(Paragraph("<bullet>&bull;</bullet> <b>\"Friday Freebie\"</b> -- remind about the free guide with link sticker", styles['bullet']))

story.append(Paragraph("Story Highlights (Permanent)", styles['h2']))
highlights = ["Start Here -- who you are, your story", "Free Guide -- CTA to lead magnet", "Activities -- product previews", "Tips -- best saved tips", "Reviews -- testimonials", "FAQ -- common questions"]
for h in highlights:
    story.append(Paragraph(f"<bullet>&bull;</bullet> {h}", styles['bullet']))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# 8. HASHTAG STRATEGY
# ═══════════════════════════════════════════════════
story.append(Paragraph("8. Hashtag Strategy", styles['h1']))
story.append(Paragraph("Use 5-15 hashtags per post at the end of the caption. The algorithm reads content to categorize; hashtags reinforce.", styles['body']))

story.append(Paragraph("Core Hashtags (rotate 5-8 per post)", styles['h2']))
core_tags = ["#homeschool", "#homeschooling", "#homeschoolmom", "#worldschool", "#worldschooling", "#natureeducation", "#outdoorlearning", "#handsonlearning", "#homeschoollife", "#anywherelearning"]
story.append(Paragraph("  ".join(core_tags), styles['tag']))

story.append(Paragraph("Niche Hashtags (rotate 3-5 per post)", styles['h2']))
niche_tags = ["#deschooling", "#unschooling", "#charlottemason", "#natureplay", "#forestschool", "#homeschoolactivities", "#learningthroughplay", "#noprepactivities", "#childledlearning", "#experientiallearning", "#relaxedhomeschool"]
story.append(Paragraph("  ".join(niche_tags), styles['tag']))

story.append(Paragraph("Seasonal (rotate as relevant)", styles['h2']))
seasonal_tags = ["#springactivities", "#summerlearning", "#fallactivities", "#winterlearning", "#earthday", "#nationalparkweek"]
story.append(Paragraph("  ".join(seasonal_tags), styles['tag']))
story.append(S(1, 4))
story.append(Paragraph("<b>Branded hashtag:</b> #anywherelearning -- encourage buyers to use it when sharing. Feature every tagged post in Stories.", styles['body']))

story.append(hr())

# ═══════════════════════════════════════════════════
# 9. BIO OPTIMIZATION
# ═══════════════════════════════════════════════════
story.append(Paragraph("9. Bio Optimization", styles['h1']))
story.append(S(1, 6))

bio_lines = [
    "<b>Name field:</b> Anywhere Learning | Homeschool Activities (searchable!)",
    "<b>Bio text:</b>",
    "  Meaningful learning, wherever you are",
    "  Real-world activity guides for homeschool families",
    "  No prep. No worksheets. Just curiosity.",
    "  Free outdoor activity guide below",
    "<b>Category:</b> Education",
    "<b>Profile photo:</b> Warm photo of Amelie with kids outdoors (personal photos build trust faster)",
    "<b>Link:</b> Link-in-bio tool. Priority: (1) Free Guide, (2) Shop, (3) Latest blog post",
]
for line in bio_lines:
    story.append(Paragraph(line, styles['body']))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# 10. GROWTH TACTICS
# ═══════════════════════════════════════════════════
story.append(Paragraph("10. Growth Tactics: 0 to 1,000 Followers", styles['h1']))

story.append(Paragraph("Weeks 1-4: Foundation", styles['h2']))
tactics_1 = [
    "Have at least 9 feed posts before you start promoting. Nobody follows an account with 2 posts.",
    "Follow and engage with 10-15 accounts daily in your niche. Leave genuine, thoughtful comments.",
    "Find 20 \"neighbor\" accounts (1k-10k followers, homeschool niche). Engage with their followers.",
    "Post first Reel optimized for reach -- something universally relatable (humor or emotion).",
]
for t in tactics_1:
    story.append(Paragraph(f"<bullet>&bull;</bullet> {t}", styles['bullet']))

story.append(Paragraph("Months 2-3: Momentum", styles['h2']))
tactics_2 = [
    "Collab with 3-5 micro-creators (500-5k followers). Free product for honest review.",
    "Cross-post Reels to TikTok and Pinterest. Same content, three platforms.",
    "Use \"Comment GUIDE\" strategy on Reels to build email list while boosting algorithm.",
    "Run a giveaway with a complementary brand (nature toys, kids hiking gear, children's books).",
    "Engage in homeschool Facebook groups. Be helpful, add IG handle to profile.",
]
for t in tactics_2:
    story.append(Paragraph(f"<bullet>&bull;</bullet> {t}", styles['bullet']))

story.append(Paragraph("Months 3-6: Acceleration", styles['h2']))
tactics_3 = [
    "Create one \"signature\" series people associate with you (e.g., \"No-Prep Friday\").",
    "Double down on what works. Top 5 posts by saves/shares -- make more like those.",
    "Start a broadcast channel or close friends list for VIP tips and early product access.",
]
for t in tactics_3:
    story.append(Paragraph(f"<bullet>&bull;</bullet> {t}", styles['bullet']))

story.append(hr())

# ═══════════════════════════════════════════════════
# 11. FUNNEL STRATEGY
# ═══════════════════════════════════════════════════
story.append(Paragraph("11. Instagram to Email to Purchase Funnel", styles['h1']))
story.append(S(1, 6))

funnel_data = [
    ['Stage', 'Mechanism', 'Key Action'],
    ['Discovery', 'Reels reach new people', 'Hook in first 1-2 seconds, text overlays for mute viewing'],
    ['Follow', 'Grid + bio convince them to stay', '9+ cohesive posts, clear value prop in bio'],
    ['Engage', 'Stories build trust', 'Interactive stickers daily, reply to every DM'],
    ['Email Capture', 'Free guide via link/comments', '"Comment GUIDE" Reels, link sticker in Stories 3x/week'],
    ['Nurture', 'ConvertKit email sequence', 'Value emails, then soft product intro, then offer'],
    ['Purchase', 'Shop link in emails', 'Email converts better than IG direct'],
    ['Advocacy', 'Buyers share with #anywherelearning', 'Feature tagged posts in Stories, referral program'],
]
story.append(table_with_style(funnel_data, col_widths=[1.3*inch, 2.2*inch, 2.8*inch]))

story.append(PageBreak())

# ═══════════════════════════════════════════════════
# 12. WHAT NOT TO DO
# ═══════════════════════════════════════════════════
story.append(Paragraph("12. What NOT to Do", styles['h1']))
story.append(S(1, 6))

donts = [
    ("Don't buy followers or use pods.", "Algorithm detects it and throttles your account. Fake followers destroy engagement rate."),
    ("Don't post without a hook.", "First line of caption and first second of Reel determine reach. \"The one thing I stopped doing...\" not \"I want to share something.\""),
    ("Don't be a product catalog.", "If more than 20% of posts are direct promo, people unfollow. Lead with value."),
    ("Don't ignore DMs and comments.", "Every interaction matters early on. A thoughtful reply converts viewers to followers to buyers."),
    ("Don't chase every trend.", "Only participate in trends you can authentically connect to homeschooling. Be selective."),
    ("Don't post and ghost.", "Stay on the app 30 min after posting. Reply to comments. Early engagement velocity matters."),
    ("Don't use stock photos.", "Your audience is allergic to institutional/corporate. Real photos, real kids, real settings."),
    ("Don't neglect captions.", "Aim for 100-300 words on carousels, 50-150 on Reels. Captions drive saves."),
    ("Don't spread across all platforms at once.", "Master Instagram first, then repurpose to Pinterest (priority #2) and TikTok."),
    ("Don't compare day 1 to someone's year 3.", "Growth from zero is slow. Consistency beats virality. Keep posting through the quiet period."),
]

for title, desc in donts:
    story.append(KeepTogether([
        Paragraph(f"<b>{title}</b>", styles['body_bold']),
        Paragraph(desc, styles['body']),
        S(1, 4),
    ]))

story.append(hr())

# ═══════════════════════════════════════════════════
# FIRST 30 DAYS
# ═══════════════════════════════════════════════════
story.append(Paragraph("First 30 Days Action Plan", styles['h1']))
story.append(S(1, 8))

plan_data = [
    ['Week', 'Focus', 'Key Actions'],
    ['Week 1', 'Setup', 'Optimize bio, create 9 grid posts, design Story highlight covers, set up link-in-bio, research 20 neighbor accounts'],
    ['Week 2', 'Launch', 'Post 5-6 times, daily Stories, engage 15 accounts/day, first "Comment GUIDE" Reel'],
    ['Week 3', 'Rhythm', 'Full cadence, first carousel, track saves, start DM conversations with engaged followers'],
    ['Week 4', 'Outreach', 'Reach out to 3 micro-creators, cross-post top Reel to Pinterest, run first AMA/poll Story series'],
]
story.append(table_with_style(plan_data, col_widths=[1*inch, 1*inch, 4.3*inch]))

story.append(S(1, 24))
story.append(HRFlowable(width="40%", thickness=2, color=FOREST, spaceBefore=0, spaceAfter=12))
story.append(Paragraph("The single most important thing is consistency. Post regularly, engage genuinely, and always drive toward the free guide as your primary conversion point. The sales will follow the trust.", styles['quote']))

# ── Build ──
doc.build(story)
print(f"PDF saved to: {output_path}")
