#!/usr/bin/env python3
"""Build shared/mentorRefresh.json and RESEARCH.md from checked public sources.

Checked 2026-11-11. Follower counts are X public_metrics from that day.
Revenue figures are quoted only when the person states them, and are labeled
self-reported. Hooks are original templates, not copied posts.
"""
from __future__ import annotations

import json
from pathlib import Path

CHECKED = "2026-11-11"
ROOT = Path(__file__).resolve().parents[1]


def fmt(n: int) -> str:
    if n >= 1_000_000:
        return f"{n / 1_000_000:.2f}".rstrip("0").rstrip(".") + "M"
    if n >= 10_000:
        return f"{round(n / 1000):,}K".replace(",", "")
        # 73281 -> 73K is too coarse. Use one decimal under 100k.
    if n >= 1_000:
        return f"{n / 1000:.1f}".rstrip("0").rstrip(".") + "K"
    return f"{n:,}"


def src(label: str, url: str, note: str = "") -> dict:
    row = {"label": label, "url": url, "checked": CHECKED}
    if note:
        row["note"] = note
    return row


def play(pid, emoji, title, description, action, frequency, example, source) -> dict:
    return {
        "id": pid,
        "emoji": emoji,
        "title": title,
        "description": description,
        "action": action,
        "frequency": frequency,
        "example": example,
        "sourceUrl": source,
    }


def mentor(**kwargs):
    followers = kwargs.pop("followers")
    kwargs["followers"] = followers
    kwargs["followersStr"] = fmt(followers)
    kwargs["followersAsOf"] = CHECKED
    return kwargs


# fmt() for 73281: 73.3K good. For 991367: >= 10000 branch I wrote wrong.
# Fix below before use.

def fmt(n: int) -> str:  # noqa: F811
    if n >= 1_000_000:
        s = f"{n / 1_000_000:.2f}".rstrip("0").rstrip(".")
        return s + "M"
    if n >= 1_000:
        s = f"{n / 1000:.1f}".rstrip("0").rstrip(".")
        return s + "K"
    return str(n)


MENTORS: dict[str, dict] = {}

def add(mid: str, profile: dict, notes: list[str]):
    MENTORS[mid] = {"profile": profile, "notes": notes}


add("maya", mentor(
    followers=4162,
    name="Maya",
    handle="@buildwithmaya",
    xHandle="buildwithmaya",
    bio="Host of the BuildingNow podcast. Conversations with founders on how they got their first customers. Learning distribution in public.",
    currentFocus="Maya is hosting BuildingNow, a weekly founder podcast and YouTube show about first customers, and still publishes IdeaPanda plus the Newbie Marketer newsletter.",
    products=[
        {"name": "BuildingNow", "url": "https://www.buildingnow.fm/", "description": "Podcast and guides on how founders find their first customers"},
        {"name": "IdeaPanda", "url": "https://getideapanda.com", "description": "Idea discovery tool she still publishes at getideapanda.com"},
        {"name": "Newbie Marketer", "url": "https://newbiemarketer.to", "description": "Newsletter of marketing experiments for builders"},
        {"name": "buildwithmaya.com", "url": "https://www.buildwithmaya.com/", "description": "Personal site for the weekly BuildingNow lessons"},
    ],
    pillars=[
        "Founder interviews about the first customers, not vanity metrics",
        "Distribution practiced in public, one channel at a time",
        "Owned media: podcast, YouTube, and a newsletter",
        "Products that come out of her own marketing bottlenecks",
    ],
    milestones=[
        {"label": "Followers", "value": "4,162 as of Nov 11, 2026"},
        {"label": "Posts", "value": "17,042 on X"},
        {"label": "Show", "value": "BuildingNow"},
        {"label": "Location", "value": "United States"},
    ],
    plays=[
        play("maya-show", "🎙️", "Interview the first-customer story",
             "Maya's public work is a weekly conversation with a founder about how the first customers actually arrived. The play is to borrow that format: one guest, one acquisition channel, one tactic a viewer can try this week.",
             "Record or write one founder conversation. Open with the channel they used, name the experiment that failed, and end with a single tactic. Publish it where your buyers already watch or read.",
             "Weekly",
             "BuildingNow.fm leads with founder episodes such as Jay Yang on cold email and Elitza Vasileva on a Product Hunt launch, plus a 7-day first-customer plan on the show site.",
             "https://www.buildingnow.fm/"),
        play("maya-owned", "📬", "Put the lesson on owned media",
             "The X bio points at the podcast and the YouTube archive, and buildwithmaya.com collects the weekly lessons. X introduces the episode. The email and the show site keep it.",
             "Publish the long version on a site or newsletter you control. Use X only for the hook, the guest name, and the link. Repeat the same URL in the profile.",
             "Weekly",
             "Her X profile links BuildingNow.fm and the YouTube archive, and buildwithmaya.com offers the weekly lessons by email.",
             "https://www.buildwithmaya.com/"),
        play("maya-product", "🐼", "Ship the tool you needed",
             "IdeaPanda and Newbie Marketer are still live next to the show. The pattern is to turn a personal marketing problem into a small product, then let the interviews supply the distribution lessons.",
             "Name one bottleneck in your own marketing. Ship a narrow tool or a short guide for it. Tell the origin in one post and link the live page.",
             "Monthly",
             "getideapanda.com and newbiemarketer.to both responded on Nov 11, 2026. IdeaPanda is also listed on BuildHop as her product.",
             "https://getideapanda.com"),
        play("maya-cadence", "🧪", "Report one experiment",
             "Her site frames the work as weekly experiments: what she tried, what worked, and what did not. The useful post is a number and a decision, not a motivational thread.",
             "Once a week, post one distribution experiment with the channel, the action, and the result. If it failed, say what you will change next week.",
             "Weekly",
             "buildwithmaya.com describes weekly experiments and founder insights, after she writes that marketing burnout led her to learn distribution in public.",
             "https://www.buildwithmaya.com/"),
    ],
    hooks=[
        "The useful founder story is not the revenue screenshot. It is how the first ten customers showed up.",
        "This week's distribution experiment: one channel, one offer, and a number I will actually report.",
        "I am learning distribution in public so the next product does not die quietly.",
        "A podcast question worth stealing: which experiment failed before the one that worked?",
        "Put the long lesson somewhere you own. Let X only carry the hook and the link.",
    ],
    angles=[
        "Interview format: one founder, one acquisition channel, one tactic",
        "Weekly experiment log with a real result",
        "Owned media first, X as the trailer",
        "Build the small tool that removes your own marketing bottleneck",
    ],
    sources=[
        src("X profile @buildwithmaya", "https://x.com/buildwithmaya", "Bio, 4,162 followers, 17,042 posts on Nov 11, 2026. Bio links BuildingNow.fm and YouTube."),
        src("BuildingNow", "https://www.buildingnow.fm/", "Live show site with founder episodes and a 7-day plan."),
        src("Personal site", "https://www.buildwithmaya.com/", "Weekly lessons and the distribution-in-public framing."),
        src("IdeaPanda", "https://getideapanda.com", "Product site still live. Not named in the current X bio."),
        src("Newbie Marketer", "https://newbiemarketer.to", "Newsletter site still live."),
    ],
), [
    "Follower count moved from the old 1.8K figure to 4,162, checked on X on Nov 11, 2026.",
    "X bio now leads with the BuildingNow podcast. IdeaPanda and Newbie Marketer remain live, so they stay, but they are no longer the bio headline.",
    "Removed the stale 'Newsletter issue #2' milestone and the copied post hooks.",
    "Could not read her post archive: the X search endpoint declined this token. Episode examples come from the show site.",
])

add("kp", mentor(
    followers=73281,
    name="KP",
    bio='The "Build In Public" Guy. Head of Community at Netlify. Evangelist for AI startups. Previously Paddle and On Deck. Based in Atlanta.',
    currentFocus="KP is Netlify's Head of Community, running in-person builder programs such as the August 2026 Build with Netlify workshop at RenderATL, and publishing at thisiskp.com.",
    products=[
        {"name": "Netlify", "url": "https://www.netlify.com", "description": "Platform where he leads community"},
        {"name": "KP", "url": "https://thisiskp.com/", "description": "Essays, about page, and build-in-public writing"},
        {"name": "Joining Netlify", "url": "https://thisiskp.com/essays/joining-netlify/", "description": "Nov 6, 2025 essay on taking the Head of Community role"},
    ],
    pillars=[
        "Community programs that put builders in a room",
        "Build-in-public shipping with a live URL",
        "Essays turned into one practical maker takeaway",
        "Amplifying other people's launches, not only his own",
    ],
    milestones=[
        {"label": "Followers", "value": "73,281 as of Nov 11, 2026"},
        {"label": "Posts", "value": "50,185 on X"},
        {"label": "Role", "value": "Head of Community, Netlify"},
        {"label": "Based", "value": "Atlanta"},
    ],
    plays=[
        play("kp-room", "🛠️", "Host the build, then post the room",
             "KP's observable 2026 community work is in person. Netlify's blog credits him with hosting an Atlanta-trivia workshop during RenderATL on August 12-13, 2026. The play is to run a small build session and publish the proof the same week.",
             "Pick a one-hour build prompt. Host it, take three photos or a short clip, and post who came, what they shipped, and the next date. Tag the host org only if you are actually working with them.",
             "Monthly",
             "Netlify blog: Build with Netlify came to Atlanta, hosted by Karthik Puvvada during RenderATL 2026.",
             "https://www.netlify.com/blog/build-with-netlify-came-to-atlanta/"),
        play("kp-role", "📣", "Announce the role with the work, not the title",
             "His joining essay (Nov 6, 2025) states the job, the reason, and the first community bets: hackathons, AMAs, demo days, customer stories. A role post works when it names the work you will do for other builders.",
             "When something changes in your work, write one page: the role, who it serves, and the first two programs. Link it from the profile. Do not stop at the announcement.",
             "When it changes",
             "thisiskp.com essay Joining Netlify, dated Nov 6, 2025, still the canonical account of the role.",
             "https://thisiskp.com/essays/joining-netlify/"),
        play("kp-ship", "📦", "Ship a small demo and name the stack",
             "His about page still centers on building in public since 2018. The durable format is a finished URL, one sentence on who it is for, and the tool that made it fast. Keep the claim tied to something a reader can open.",
             "Deploy one small web demo. Post the name, the user, the URL, and the stack in four lines. Reply to the first five people who try it.",
             "Weekly",
             "thisiskp.com/about describes the build-in-public practice and the Netlify role.",
             "https://thisiskp.com/about/"),
        play("kp-credit", "🤝", "Hand the microphone to a builder",
             "The Atlanta recap names the teammates and the builders in the room. Community accounts grow when the host's post is mostly other people's work.",
             "Each week, quote one community ship with a specific detail and a link. Add one sentence of why it matters. Ask a question that person can answer.",
             "Weekly",
             "The RenderATL recap thanks Biilmann, Herrington, Puvvada, Chakraborty, Bridgpal, and Jalal by name.",
             "https://www.netlify.com/blog/build-with-netlify-came-to-atlanta/"),
    ],
    hooks=[
        "We put builders in a room and left with working URLs. Here is what shipped.",
        "The job is not the title. The job is the next room full of people who will ship.",
        "Just opened: a small demo, who it is for, and the link.",
        "One idea from a long essay, translated into a single maker move.",
        "Your launch deserves a specific sentence, not a generic congratulations.",
    ],
    angles=[
        "Event recap with names, a build prompt, and photos",
        "Role or program update that lists the work, not the perks",
        "Four-line ship post: name, user, URL, stack",
        "Amplify a community member with one concrete detail",
    ],
    sources=[
        src("X profile @thisiskp_", "https://x.com/thisiskp_", "73,281 followers, 50,185 posts, Atlanta. Bio: Head of Community at Netlify."),
        src("About KP", "https://thisiskp.com/about/", "Head of Community at Netlify, build-in-public background."),
        src("Joining Netlify", "https://thisiskp.com/essays/joining-netlify/", "Nov 6, 2025. Role announcement in his own words."),
        src("Netlify blog", "https://www.netlify.com/blog/build-with-netlify-came-to-atlanta/", "Aug 2026 RenderATL workshop hosted by KP."),
    ],
), [
    "Followers updated from 70.6K to 73,281. Post count on X is 50,185.",
    "Removed the AI Shippers cohort as his product. The cohort site is live and says it is backed by Netlify, but the pages checked do not name KP as the owner.",
    "Removed copied hooks, including a quoted Paul Graham line and an art-reaction line.",
    "Recent original posts were not available from the X search endpoint.",
])

def load_more():
    from mentors_rest import register
    register(add, mentor, play, src)

def main():
    load_more()
    profiles = {mid: row["profile"] for mid, row in MENTORS.items()}
    out = ROOT / "shared" / "mentorRefresh.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(profiles, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = [
        "# Mentor research",
        "",
        "Checked **November 11, 2026**. Follower counts are X `public_metrics` retrieved that day through X user search. They move, so each profile stores `followersAsOf`.",
        "",
        "Revenue and audience claims inside a bio or on a personal site are repeated only as **self-reported**. Recent post text was not pulled: the X full-archive search endpoint rejected this token for lack of a billing scope. Plays cite a profile, a product page, a dated essay, or a release note instead.",
        "",
        "Hooks in the app are original templates in the spirit of each person's cadence. They are not pasted posts.",
        "",
        f"Profiles updated: **{len(MENTORS)}**.",
        "",
    ]
    for mid, row in MENTORS.items():
        p = row["profile"]
        route = f"/?mentor={mid}"
        lines.append(f"## {p.get('name', mid)} ({p.get('handle', '')})")
        lines.append("")
        lines.append(f"- Route: `{route}`")
        lines.append(f"- X: https://x.com/{p.get('xHandle', '')}")
        lines.append(f"- Followers: {p['followers']:,} ({p['followersStr']}) as of {CHECKED}")
        lines.append(f"- Now: {p.get('currentFocus', '')}")
        lines.append("- What changed:")
        for note in row["notes"]:
            lines.append(f"  - {note}")
        lines.append("- Sources:")
        for s in p.get("sources", []):
            extra = f" — {s['note']}" if s.get("note") else ""
            lines.append(f"  - [{s['label']}]({s['url']}){extra}")
        lines.append("")
    research = ROOT / "RESEARCH.md"
    research.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {out} ({len(profiles)} mentors) and {research}")


if __name__ == "__main__":
    main()
