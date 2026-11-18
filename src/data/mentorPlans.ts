import type { PlanStep } from '../lib/playbookPlan';

export interface MentorPlan {
  why: string;
  mistakes: string[];
  steps: PlanStep[];
}

const s = (
  id: string,
  phase: string,
  title: string,
  detail: string,
  deliverable: string,
  checkpoint: string,
  minutes: number,
  minDays: PlanStep['minDays'],
  basis: PlanStep['basis'],
  sourceUrl?: string,
): PlanStep => ({
  id, phaseId: phase, phaseTitle: phase, title, detail, deliverable, checkpoint, minutes, minDays, basis, sourceUrl,
});

export const MENTOR_PLANS: Record<string, MentorPlan> = {
  maya: {
    why: 'Her X bio points at BuildingNow, and the show site is a weekly founder interview about first customers. IdeaPanda and Newbie Marketer are still live. They are not the headline.',
    mistakes: ['Treating IdeaPanda as the main story.', 'Copying a guest’s numbers into your own post.'],
    steps: [
      s('maya-1', 'The show', 'Watch one BuildingNow episode', 'Open buildingnow.fm and finish one founder episode. Note the channel and the experiment that failed.', 'Guest, channel, failure, one tactic.', 'The guest is named on the show site.', 45, 7, 'source', 'https://www.buildingnow.fm/'),
      s('maya-2', 'Owned page', 'Put the long version on a page you control', 'Her profile links the show and YouTube. X is the trailer.', 'One URL that is not an X post.', 'The post points at that URL.', 60, 7, 'source', 'https://www.buildwithmaya.com/'),
      s('maya-3', 'The week', 'Report one distribution experiment', 'Her site frames the work as weekly experiments: what she tried, what worked, what did not.', 'Channel, action, and result.', 'The result is a number you measured, or you say you do not have one.', 40, 7, 'source', 'https://www.buildwithmaya.com/'),
      s('maya-4', 'Side products', 'Open IdeaPanda and Newbie Marketer', 'Both were live on Nov 11, 2026, and neither is the current bio headline.', 'Two sentences from the pages themselves.', 'You did not call either one the main offer.', 25, 14, 'source', 'https://getideapanda.com'),
      s('maya-5', 'Your cut', 'Ask one person how the first customers arrived', 'Suggestion: publish the answer, not a trailer about interviewing.', 'One interview with a named channel.', 'A stranger can try the tactic this week.', 90, 30, 'suggestion'),
      s('maya-6', 'Four weeks', 'Repeat that channel for four weeks', 'Suggestion: one row per week.', 'A four-row log.', 'You can say what changes in week five.', 40, 60, 'suggestion'),
      s('maya-7', 'Index', 'List the episodes you actually used', 'Suggestion: one tactic kept from each.', 'At least four rows, each linked.', 'Every link is a real episode.', 50, 90, 'suggestion', 'https://www.buildingnow.fm/'),
    ],
  },
  kp: {
    why: 'He is Head of Community at Netlify. The Nov 6, 2025 essay says so. The August 2026 Netlify blog credits him with hosting the Atlanta workshop at RenderATL.',
    mistakes: ['Listing AI Shippers as his product. The site does not name him as owner.', 'Announcing a title with no date and no thing that got built.'],
    steps: [
      s('kp-1', 'The room', 'Read the Atlanta recap', 'RenderATL, August 12-13, 2026. Karthik Puvvada hosted the trivia workshop.', 'Three names and one thing builders did.', 'You did not invent a headcount.', 30, 7, 'source', 'https://www.netlify.com/blog/build-with-netlify-came-to-atlanta/'),
      s('kp-2', 'The role', 'Read the joining essay', 'Dated Nov 6, 2025. It names the job and the program types he wanted.', 'The role and two program types from the essay.', 'You did not add programs that are not there.', 25, 7, 'source', 'https://thisiskp.com/essays/joining-netlify/'),
      s('kp-3', 'One hour', 'Host a one-hour build with a prompt', 'Suggestion, in the shape of that workshop: a prompt, a time, and a URL.', 'Date, prompt, and one link that shipped.', 'The link opens.', 90, 14, 'suggestion'),
      s('kp-4', 'Credit', 'Write the recap mostly about other people', 'The Atlanta post names teammates, not only the host.', 'A recap with at least three names and a detail each.', 'Most sentences are not about you.', 40, 30, 'source', 'https://www.netlify.com/blog/build-with-netlify-came-to-atlanta/'),
      s('kp-5', 'The about page', 'Make the bio match one page you control', 'His about page states the Netlify role.', 'Bio and site say the same current job.', 'A stranger gets the same sentence from both.', 20, 30, 'source', 'https://thisiskp.com/about/'),
      s('kp-6', 'Three rooms', 'Run three sessions and keep the prompts', 'Practice only: run three sessions and keep the prompts. Do not present it as something they scheduled.', 'Three dated recaps.', 'Each recap has a link that still works.', 60, 90, 'suggestion'),
    ],
  },
  gerrit: {
    why: 'The Nov 11 bio leads with Rankvisit, then Pixelarticons and QR Code Banana. Majesticons 3.9 still shipped on Nov 3, 2026, with a public changelog.',
    mistakes: ['Quoting an unverified client impression number.', 'Announcing icons without a count and an install line.'],
    steps: [
      s('ge-1', 'Rankvisit', 'Use Rankvisit’s own description', 'The site connects Search Console and analytics to Claude or ChatGPT.', 'One sentence from the page, plus the URL.', 'No revenue guess.', 20, 7, 'source', 'https://rankvisit.com'),
      s('ge-2', 'Changelog', 'Read one icon release', 'Pixelarticons published a 5,646-icon update from search logs. Majesticons 3.9 is dated Nov 3, 2026.', 'Version, date, and three names from the page.', 'You did not round the count.', 30, 7, 'source', 'https://pixelarticons.com/updates/5646-icons-requests-sports-and-basics/'),
      s('ge-3', 'Free set', 'Install the free package or open the gallery', 'The README describes the MIT set and npm install pixelarticons.', 'The install command you ran, or a sentence that you only browsed.', 'The command matches the README.', 25, 14, 'source', 'https://github.com/halfmage/pixelarticons/'),
      s('ge-4', 'Bio order', 'Put the current product first', 'Rankvisit is the first link. The libraries stay. They are just not first.', 'Your bio with the priority URL on line one.', 'The first link is what a new reader should open.', 15, 14, 'source', 'https://x.com/halfmage'),
      s('ge-5', 'Your changelog', 'Ship a count, a date, and how owners get the files', 'Practice only: ship a count, a date, and how owners get the files. Do not present it as something they scheduled.', 'A public note with those parts.', 'The count matches the files.', 70, 30, 'suggestion'),
      s('ge-6', 'Search log', 'Keep empty searches for two weeks', 'The Pixelarticons note says empty searches became icons, including an avocado spelled several ways.', 'The list, and one item you then added.', 'The new item exists because of a row.', 20, 60, 'source', 'https://pixelarticons.com/updates/5646-icons-requests-sports-and-basics/'),
    ],
  },
  lynnzeng: {
    why: 'The X bio names Adobe, MiniMax, and HeyGen, then PicAisso and NewMom Help. 2026 Contra captions name the model next to the film.',
    mistakes: ['Repeating Contra earnings. Those were not used as facts.', 'Posting a model logo with no finished film.'],
    steps: [
      s('lz-1', 'The film', 'Watch one piece and name the model in the caption', 'Her work page captions films with MiniMax, Seedance, or Wan.', 'Title and model from that caption.', 'The model is in the caption.', 30, 7, 'source', 'https://contra.com/lynnzeng/work'),
      s('lz-2', 'The menu', 'Open the three URLs in the bio', 'picaisso.xyz, newmom.help, and zengs.netlify.app.', 'One sentence per page.', 'You opened all three.', 25, 7, 'source', 'https://x.com/zeng_wt'),
      s('lz-3', 'A test', 'Read the Hailuo note from Jan 11, 2026', 'She describes testing a start-and-end frame and sending feedback.', 'The feature and what she says she sent back.', 'You did not claim the same access.', 20, 14, 'source', 'https://contra.com/p/gBRNQkRe-as-a-hailuo-ai-mini-max-ambassador-i-always-have-early-acc'),
      s('lz-4', 'Your clip', 'Finish one clip and name the tool in the first lines', 'Practice only: finish one clip and name the tool in the first lines. Do not present it as something they scheduled.', 'A published clip with the model named.', 'The caption still works if the logo is removed.', 120, 30, 'suggestion'),
      s('lz-5', 'A series', 'Keep two visual constraints for four clips', 'Suggestion. Her work reads as a series: same grade, new story.', 'Four clips and the two constraints, written down.', 'A stranger can see the constraints.', 90, 90, 'suggestion'),
    ],
  },
  jaibhagat: {
    why: 'The Oct 25, 2026 essay walks a music catalog through bronze, silver, and gold, and says the worked copy runs on Google Cloud, not inside a Databricks workspace.',
    mistakes: ['Saying he runs a Databricks workspace.', 'Publishing private catalog numbers. The essay leaves them out.'],
    steps: [
      s('jai-1', 'The essay', 'Read the Oct 25 piece and separate done from proposed', 'chaiwithjai.com/blog/monetizing-music-ip.', 'Three lists: done, proposed, cloud named.', 'The lists do not share a sentence.', 40, 7, 'source', 'https://chaiwithjai.com/blog/monetizing-music-ip'),
      s('jai-2', 'The limit', 'Write what was not used', 'The essay says the implementation does not run a Databricks workspace.', 'One sentence in that shape for a system you know.', 'You named a tool you did not use.', 25, 7, 'source', 'https://chaiwithjai.com/blog/monetizing-music-ip'),
      s('jai-3', 'Teaching', 'Read the Oct 20 note', 'He describes Claude Code as a way to spend more time teaching.', 'What the tool did, and what the time was for.', 'No invented student count.', 20, 14, 'source', 'https://www.linkedin.com/posts/chaiwithjai_how-im-using-claude-code-to-spend-more-time-activity-7518372629880139777-Dxdl'),
      s('jai-4', 'The bio', 'Keep one non-work line', 'His bio includes breathwork at Soma Breath next to the cloud work.', 'Your bio with the work and one true practice that is not the stack.', 'The practice line is true.', 15, 14, 'source', 'https://x.com/ChaiWithJai'),
      s('jai-5', 'Your path', 'Write one path in three stages, with private figures removed', 'Practice only: write one path in three stages, with private figures removed. Do not present it as something they scheduled.', 'A page with three headings and one limit.', 'A reader can see what you have not measured.', 80, 30, 'suggestion'),
      s('jai-6', 'A second pass', 'Delete any sentence you cannot point at', 'Suggestion, after your own writeup.', 'The diff.', 'The deleted line is gone from the public version.', 30, 60, 'suggestion'),
    ],
  },
  nealfrazier: {
    why: 'Season 3, dated Oct 26, 2026, is one live URL, a 15-second reel, and the story. The same page says the 100-site count lost to honesty.',
    mistakes: ['Calling the 100-site sprint a completed win.', 'Adding a phone number or a street address. This site does not publish one.'],
    steps: [
      s('nf-1', 'The contract', 'Read Season 3, day 01', 'Dated Oct 26, 2026. Write the daily contract and what it says about Season 2.', 'Date, three parts of a day, and the Season 2 sentence.', 'You did not write “100 sites shipped” as a fact.', 20, 7, 'source', 'https://www.nealfrazier.tech/season-3/day-01/'),
      s('nf-2', 'One drop', 'Publish one URL and say what broke', 'Suggestion, in that shape.', 'A URL that loads, plus the miss.', 'The miss is specific.', 90, 7, 'suggestion'),
      s('nf-3', 'The archive', 'Leave the old page linked', 'The Season 3 note points at the Season 2 archive on purpose.', 'A link from the new page to the old one, if you have an old challenge.', 'The old page still loads.', 20, 14, 'source', 'https://www.nealfrazier.tech/season-3/day-01/'),
      s('nf-4', 'Local', 'Read what Zoth says stays on the machine', 'zoth.nullai.tech describes a local-first studio.', 'One sentence from the page.', 'No security claim that is not written there.', 25, 14, 'source', 'https://zoth.nullai.tech'),
      s('nf-5', 'The offer', 'Separate the client page from the lab', 'nealfrazier.tech describes Hampton Roads web work next to Zoth and NullAI.', 'Two links: one a client can use, one a lab page.', 'A client does not have to read the lab to find the offer.', 30, 30, 'source', 'https://www.nealfrazier.tech/'),
      s('nf-6', 'Seven days', 'Seven dates, each with a URL or the word missed', 'Practice only: seven dates, each with a URL or the word missed. Do not present it as something they scheduled.', 'The list.', 'Missed days stay visible.', 40, 30, 'suggestion'),
      s('nf-7', 'A month', 'Thirty drops, or a written stop', 'Practice only: thirty drops, or a written stop. Do not present it as something they scheduled.', 'The log, including the stop if you stopped.', 'Short days were not deleted.', 30, 90, 'suggestion'),
    ],
  },
  maddiedreese: {
    why: 'The bio points at maddiedreese.com and a printer people can message. She states five hackathon wins. That count is her claim.',
    mistakes: ['Inventing project names that are not on the site.', 'Treating five wins as an audited list.'],
    steps: [
      s('md-1', 'The printer', 'Open the site and find the printer path', 'The bio invites a message to the printer.', 'The printer URL, or a sentence that you could not find it.', 'You opened maddiedreese.com.', 20, 7, 'source', 'https://maddiedreese.com'),
      s('md-2', 'A toy', 'Ship one interaction that takes under a minute', 'Practice only: ship one interaction that takes under a minute. Do not present it as something they scheduled.', 'A live URL and a one-line invitation.', 'You can finish it yourself in under a minute.', 120, 14, 'suggestion'),
      s('md-3', 'The index', 'Add it to the homepage the same day', 'Her profile sends people to one site.', 'The homepage lists the new thing.', 'The homepage link and the post link match.', 20, 14, 'source', 'https://maddiedreese.com'),
      s('md-4', 'A timed build', 'Enter one hackathon or set your own hour', 'The bio states five wins. You need the constraint and the result, not a win.', 'Prompt, stack, link, and whether it placed.', '“Placed” stays blank if you do not know.', 180, 30, 'source', 'https://x.com/maddiedreese'),
      s('md-5', 'Three toys', 'Three public interactions on one index', 'Practice only: three public interactions on one index. Do not present it as something they scheduled.', 'Three URLs on one page.', 'Each still loads at the end of the month.', 60, 90, 'suggestion'),
    ],
  },
  clarklab: {
    why: 'superfun.team says the studio is Clark and Angie Wimberly in Austin. The bio calls him a design engineer and one half of Superfun.',
    mistakes: ['Describing Superfun as a solo brand.', 'Posting a capabilities list with nothing made that week.'],
    steps: [
      s('cw-1', 'The names', 'Read the first screen', 'City and both names, as the site states them.', 'Those three facts.', 'Angie is in the note.', 15, 7, 'source', 'https://superfun.team'),
      s('cw-2', 'This week', 'Post one screen and one decision you rejected', 'Practice only: post one screen and one decision you rejected. Do not present it as something they scheduled.', 'A clip or image plus five lines.', 'The rejected option is specific.', 60, 7, 'suggestion'),
      s('cw-3', 'The bio', 'One job, one place, one practice', 'His bio is design engineer, Superfun, Austin.', 'Your bio in two lines.', 'It fits.', 15, 14, 'source', 'https://x.com/clarklab'),
      s('cw-4', 'Four notes', 'One make-note a week', 'Practice only: one make-note a week. Do not present it as something they scheduled.', 'Four dated notes, each with an image or a link.', 'The studio page can stay quiet.', 45, 60, 'suggestion'),
    ],
  },
  rasaljaya: {
    why: 'TechTalk360 lives at thett360.com. techtalk360.lk did not resolve. His X bio and rasaljay.com name different ambassador programs, so both lists stay.',
    mistakes: ['Linking the dead .lk domain.', 'Deleting one ambassador list to make the page tidy.'],
    steps: [
      s('rj-1', 'Two sites', 'Open thett360.com and rasaljay.com', 'Write what each says he hosts, and the agency name if the site still has it.', 'Show site, personal site, VoxVerse if named.', 'No .lk link.', 25, 7, 'source', 'https://thett360.com/'),
      s('rj-2', 'Both lists', 'Put the two ambassador lists in one note', 'X on Nov 11: SpaceXSI, BuiltList, Replit, Devin, ElevenLabs. The site also lists Cursor and SpaceXAI.', 'Two columns, dated.', 'Neither is labeled current unless you checked that day.', 20, 7, 'source', 'https://www.rasaljay.com'),
      s('rj-3', 'BuiltList', 'Describe only what the X profile shows', 'A separate product site was not verified.', 'What the profile says, and “no site verified” if that is still true.', 'No invented URL.', 15, 14, 'source', 'https://x.com/builtlistlk'),
      s('rj-4', 'One episode', 'Publish one local detail with an episode link', 'Suggestion: a detail that only makes sense in Sri Lanka.', 'The post.', 'The detail is checkable.', 40, 30, 'suggestion', 'https://thett360.com/'),
      s('rj-5', 'A month', 'Four episode posts', 'Practice only: four episode posts. Do not present it as something they scheduled.', 'Four links.', 'Each points at the show.', 30, 60, 'suggestion'),
    ],
  },
  ayushtweetshere: {
    why: 'The bio links Voibe and OutlierKit. The profile link is the Superframeworks idea bank. Three products, three URLs.',
    mistakes: ['Inventing a fourth product.', 'Putting all three links in one post.'],
    steps: [
      s('ay-1', 'Three pages', 'Open the three URLs', 'getvoibe.com, outlierkit.com, superframeworks.com/idea-bank.', 'One sentence per site, from the page.', 'Three sentences, three URLs.', 30, 7, 'source', 'https://superframeworks.com/idea-bank'),
      s('ay-2', 'One URL', 'Write about only one of them', 'Practice only: write about only one of them. Do not present it as something they scheduled.', 'One post, one URL.', 'The other two domains are absent.', 30, 7, 'suggestion'),
      s('ay-3', 'The free link', 'Point a profile at the free page', 'His profile URL is the idea bank. The location field says Free Idea Bank.', 'Your profile link, if you have a free page.', 'It is not a checkout.', 15, 14, 'source', 'https://x.com/ayushtweetshere'),
      s('ay-4', 'A rotation', 'Three posts on three days', 'Practice only: three posts on three days. Do not present it as something they scheduled.', 'Three posts.', 'Each names a different URL.', 25, 30, 'suggestion'),
      s('ay-5', 'Twelve', 'Keep the rotation for four weeks', 'Suggestion. Drop a product whose site goes down.', 'A tally.', 'No post contains two product URLs.', 20, 90, 'suggestion'),
    ],
  },
  phanindra_ai: {
    why: 'magicteams.ai calls itself an AIOS for founders. The X bio says the same thing. The location field says Dubai.',
    mistakes: ['Adding features the homepage does not name.', 'Using Dubai as decoration.'],
    steps: [
      s('ph-1', 'The sentence', 'Put the homepage line next to the bio line', 'Both say an AIOS for founders.', 'The two sentences and the date.', 'You wrote the difference if they no longer match.', 15, 7, 'source', 'https://magicteams.ai/'),
      s('ph-2', 'One task', 'Describe one founder task, not a feature list', 'The public line is about the founder being the bottleneck.', 'Task, before, after, link.', 'No feature you did not see.', 40, 7, 'source', 'https://magicteams.ai/'),
      s('ph-3', 'Your line', 'Make your bio and homepage match the same day', 'Practice only: make your bio and homepage match the same day. Do not present it as something they scheduled.', 'Both URLs showing the same line.', 'You changed them together.', 30, 14, 'suggestion'),
      s('ph-4', 'The city', 'Mention Dubai only with a reason', 'The location field says Dubai.', 'One post, or no post.', 'If the city is there, the reason is there.', 20, 30, 'source', 'https://x.com/phanindra_ai'),
      s('ph-5', 'Four tasks', 'Four different hours in a founder’s week', 'Practice only: four different hours in a founder’s week. Do not present it as something they scheduled.', 'Four posts.', 'None is a feature grid.', 30, 60, 'suggestion'),
    ],
  },
  ash_wesley_: {
    why: 'The bio says four Top-5 Product Hunt launches, hackathon wins, organizing, and Stripe Community Builder. The website field is empty.',
    mistakes: ['Inventing a product URL.', 'Attaching him to AI Shippers. That was not verified.'],
    steps: [
      s('ash-1', 'Only the profile', 'Write what the profile states, including the empty website', 'Four Top-5 launches, hackathons, organizing, Stripe, England.', 'That list, plus “no website on the profile.”', 'No domain.', 15, 7, 'source', 'https://x.com/AshAmplifies'),
      s('ash-2', 'A program name', 'Keep a program in the bio only while it is true', 'Stripe Community Builder is specific. “Community” is not.', 'Your bio after the edit.', 'You can say how you know each name.', 20, 14, 'source', 'https://x.com/AshAmplifies'),
      s('ash-3', 'A launch note', 'Post a rank only if you have it', 'Suggestion: link, rank or “unranked,” and one tactic.', 'Those fields.', 'A blank rank stays blank.', 40, 14, 'suggestion'),
      s('ash-4', 'The next date', 'After you host, write the next date', 'The bio says he organizes. The useful note is the next date.', 'Count if you have it, one project, next date.', 'The next date is a real day.', 30, 30, 'source', 'https://x.com/AshAmplifies'),
    ],
  },
  conormartin_: {
    why: 'The live username is conormartinai. The profile link is the YouTube channel. The bio says SEO and software, from Spain. No client results were stated.',
    mistakes: ['Linking the old handle conormartin_.', 'Adding rankings or revenue. The bio has none.'],
    steps: [
      s('cm-1', 'The handle', 'Open the X profile and the YouTube channel', 'Confirm they match.', 'Both URLs.', 'Both say Conor Martin.', 15, 7, 'source', 'https://www.youtube.com/@conormartinai/videos'),
      s('cm-2', 'One query', 'Write the query, the page, the change, and the check date', 'Suggestion. Do not claim a ranking.', 'Those four fields.', 'No position yet.', 40, 7, 'suggestion'),
      s('cm-3', 'The check', 'Look the query up on the date you set', 'Practice only: look the query up on the date you set. Do not present it as something they scheduled.', 'The date and the result, including “not in the top 20.”', 'The date matches the earlier note.', 20, 14, 'suggestion'),
      s('cm-4', 'A video', 'If you publish one, put the query in the first line', 'His profile points at YouTube.', 'Title, query, link.', 'The video exists.', 60, 30, 'source', 'https://x.com/conormartinai'),
      s('cm-5', 'Four queries', 'Four checks in a month', 'Practice only: four checks in a month. Do not present it as something they scheduled.', 'A table.', 'No ranking you did not look up.', 30, 90, 'suggestion'),
    ],
  },
  monroe_carol: {
    why: 'carolmonroe.com describes AI products, agentic systems, and adoption. The bio names Supabase and TechloversFM. A “1,600 builders” line on her site is her claim, not an audit. No show domain was verified.',
    mistakes: ['Repeating 1,600 as a verified count.', 'Inventing a TechloversFM website.'],
    steps: [
      s('car-1', 'The first screen', 'Read carolmonroe.com and list the work it names', 'Only that screen.', 'Four bullets.', 'You can point at the paragraph.', 20, 7, 'source', 'https://www.carolmonroe.com'),
      s('car-2', 'One handoff', 'Write one workflow that broke, and the fix', 'Suggestion. No tool list.', 'One note.', 'The fix is a step.', 50, 7, 'suggestion'),
      s('car-3', 'A contribution', 'Name a Supabase surface only if you have one', 'Her site says SupaSquad. Yours needs your own link, or an honest blank.', 'Project, surface, link, or “none yet.”', 'The link opens if you included one.', 30, 14, 'source', 'https://www.carolmonroe.com'),
      s('car-4', 'The show', 'Read the TechloversFM X profile and stop there', 'A standalone domain was not verified.', 'What the profile says.', 'No invented URL.', 15, 14, 'source', 'https://x.com/TechloversFM'),
      s('car-5', 'Four notes', 'Four different handoffs', 'Practice only: four different handoffs. Do not present it as something they scheduled.', 'Four dated notes.', 'None is a tool roundup.', 40, 60, 'suggestion'),
    ],
  },
  picsoung: {
    why: 'The bio is Barcelona, HackBarna, bnbicons.com, duckfight.club, and a Lovable ambassador line.',
    mistakes: ['Letting the joke domain erase the meetup.', 'Naming an employer the bio does not name.'],
    steps: [
      s('ng-1', 'Both toys', 'Open both domains and write what each lets you do', 'They were live on Nov 11.', 'Two sentences.', 'You clicked through.', 20, 7, 'source', 'https://bnbicons.com'),
      s('ng-2', 'Three logos', 'Make three logos if the tool still allows it', 'The bio calls them Airbnb-style logos.', 'Three images and the generator URL, or a note that it would not run.', 'You tried.', 30, 7, 'source', 'https://bnbicons.com'),
      s('ng-3', 'Logistics', 'Write a meetup as date, place, and one talk', 'HackBarna is in the bio. Use “unknown” rather than a guessed guest.', 'Those fields.', 'No invented speaker.', 25, 14, 'source', 'https://x.com/picsoung'),
      s('ng-4', 'Your domain', 'Put a side project on its own domain', 'Suggestion: one sentence, mentioned after the serious work.', 'The domain and the sentence.', 'The homepage is not a thread.', 90, 30, 'suggestion', 'https://duckfight.club'),
      s('ng-5', 'Three months', 'One meetup note a month', 'Practice only: one meetup note a month. Do not present it as something they scheduled.', 'Three notes.', 'Each has a date or says the date is unknown.', 20, 90, 'suggestion'),
    ],
  },
  nkgoutham: {
    why: 'thelaunch.space says custom AI for founder-led service firms. The X bio is an instruction to a model, not a biography.',
    mistakes: ['Treating the Grok line as his life story.', 'Calling the product “AI employees.” That wording was replaced.'],
    steps: [
      s('kg-1', 'The buyer', 'Read the homepage and write the buyer, the offer, and the ask', 'Founder-led service firms.', 'Those three, from the page.', 'All three are on the page.', 20, 7, 'source', 'https://thelaunch.space/'),
      s('kg-2', 'Two texts', 'Put the bio next to the site and do not merge them', 'On Nov 11 the bio addressed Grok. The site does the explaining.', 'What each one says.', 'You did not blend them into one biography.', 15, 7, 'source', 'https://x.com/nkgoutham'),
      s('kg-3', 'Your bio', 'If your bio addresses a model, replace it', 'Suggestion: what you sell, who it is for, the city.', 'The new bio.', 'It does not address a model.', 20, 14, 'suggestion'),
      s('kg-4', 'One Tuesday', 'Write one service founder’s afternoon', 'Suggestion: inbox, proposal, or delivery.', 'One post.', 'The buyer sells a service.', 40, 30, 'suggestion'),
      s('kg-5', 'Four scenes', 'Four businesses, one product link total', 'Practice only: four businesses, one product link total. Do not present it as something they scheduled.', 'Four posts.', 'Only one links the offer.', 30, 60, 'suggestion'),
    ],
  },
  markbowley: {
    why: 'The bio is a row of live links: Handmark, Winnny, Sparkstation, Breefing, Fully Fed, and More Making as the profile URL. No usage number was verified for Fully Fed.',
    mistakes: ['Repeating “3K+ WAU.”', 'Sending people to an old newsletter URL.'],
    steps: [
      s('mb-1', 'The row', 'Open every bio link and write whether it loads', 'Sparkstation, Breefing, Fully Fed, and More Making were live. Handmark and Winnny are accounts.', 'A line per link.', 'Fully Fed has no user count in the note.', 30, 7, 'source', 'https://x.com/markbowley'),
      s('mb-2', 'One letter', 'Read one More Making post', 'The newsletter is the profile link.', 'Title and one sentence.', 'You linked moremaking.substack.com.', 25, 7, 'source', 'https://moremaking.substack.com'),
      s('mb-3', 'One URL', 'Post about a single product', 'Practice only: post about a single product. Do not present it as something they scheduled.', 'One post.', 'The other products are absent.', 25, 14, 'suggestion'),
      s('mb-4', 'A rejection', 'Show a first draft you threw away', 'The bio pairs AI with 30 years of design. The decision is the post.', 'Draft, rejection, keeper.', 'The reason is specific.', 40, 30, 'source', 'https://x.com/markbowley'),
      s('mb-5', 'Monthly check', 'Remove a dead link the week it dies', 'Practice only: remove a dead link the week it dies. Do not present it as something they scheduled.', 'A dated checklist.', 'Every remaining URL loads.', 20, 60, 'suggestion'),
    ],
  },
  hacksultan: {
    why: 'The profile link is altschoolafrica.com. The bio says he is building that school. The X display name is the placeholder “Name cannot be blank.”',
    mistakes: ['Treating the blank display name as a rebrand.', 'Inventing Lagos. The sources we used do not name that city.'],
    steps: [
      s('hs-1', 'The school', 'Open the homepage and write what it says the school is', 'Three sentences from the page.', 'Those sentences.', 'You can point at them.', 20, 7, 'source', 'https://altschoolafrica.com'),
      s('hs-2', 'The name field', 'Record both the placeholder and the public name', 'On Nov 11 the name field read “Name cannot be blank.” This page uses Akintunde Sultan.', 'Both strings.', 'You did not “fix” the school into the glitch.', 10, 7, 'source', 'https://x.com/hackSultan'),
      s('hs-3', 'The profile URL', 'If you have an institution, link it from the profile', 'His website field is the school.', 'Your profile URL.', 'It is the institution’s domain.', 10, 14, 'source', 'https://altschoolafrica.com'),
      s('hs-4', 'One learner', 'Publish one path, with permission', 'Suggestion: the skill and the next step. No grades, no payments.', 'That note and the program link.', 'Permission is real.', 40, 30, 'suggestion'),
      s('hs-5', 'Four stories', 'Four learner notes in a season', 'Practice only: four learner notes in a season. Do not present it as something they scheduled.', 'Four posts.', 'Each names a skill.', 30, 90, 'suggestion'),
    ],
  },
  dhruvalgolakiya: {
    why: 'The bio links AppGrowKit and says a solo agency was scaled to $200K. That figure is his. The site is an App Store screenshot generator and ASO toolkit.',
    mistakes: ['Treating $200K as audited.', 'Putting ryplix.com back. It was not in the Nov 11 bio.'],
    steps: [
      s('dg-1', 'The job', 'Write what appgrowkit.com says it does', 'Screenshot generator and ASO tools, from the title we checked.', 'One sentence and the URL.', 'It matches the title.', 15, 7, 'source', 'https://appgrowkit.com'),
      s('dg-2', 'A pair', 'Make one before-and-after store screenshot', 'Suggestion: name the slot it fills.', 'Two images and the slot.', 'You can say which slot.', 50, 7, 'suggestion'),
      s('dg-3', 'The figure', 'If you cite $200K, label it as his bio', 'The bio does not give a year or a margin.', 'The sentence with “he says,” or you leave it out.', 'No chart.', 10, 14, 'source', 'https://x.com/dhruvalgolakiya'),
      s('dg-4', 'The personal site', 'Open dhruvalgolakiya.com and write only what you can read', 'The page was thin without scripts when we checked.', 'What was visible.', 'No sections you could not see.', 15, 14, 'source', 'https://dhruvalgolakiya.com'),
      s('dg-5', 'Five finishes', 'One finished file a day for five days', 'The bio says full time on products.', 'Five links or files.', 'Each is finished.', 30, 30, 'source', 'https://x.com/dhruvalgolakiya'),
    ],
  },
  idohodl: {
    why: 'vvamshi.com says he is a Staff Product Engineer at Magnit Global, on Magnit Pulse. An older domain returned 404 and is not linked.',
    mistakes: ['Linking the dead domain.', 'Describing an AI ROI product. The current site does not say that.'],
    steps: [
      s('va-1', 'The now line', 'Read employer, product, and kind of work', 'From vvamshi.com.', 'Three short quotes.', 'Magnit Pulse is named only if the page still names it.', 20, 7, 'source', 'https://vvamshi.com'),
      s('va-2', 'Less switching', 'Write one workflow and the tool you removed', 'The site talks about tasks inside tools people already use.', 'The workflow and the cut.', 'No vendor he did not name.', 40, 7, 'source', 'https://vvamshi.com'),
      s('va-3', 'Your 404s', 'Find one dead link on your own site and replace it', 'Practice only: find one dead link on your own site and replace it. Do not present it as something they scheduled.', 'Old path and new path.', 'The old path is not in your bio.', 30, 14, 'suggestion'),
      s('va-4', 'Four cuts', 'Four handoffs in a month', 'Practice only: four handoffs in a month. Do not present it as something they scheduled.', 'Four notes.', 'Each names the tool that went away.', 30, 60, 'suggestion'),
    ],
  },
  levelsio: {
    why: 'The Nov 11 bio is his own monthly column: Photo AI $68K, Vibe Jam $44K, Interior AI $23K, X $20K, Nomads $7K, Hotelist $3K. A March note said Photo AI was $105K. This page uses the bio. The profile link is the MAKE book.',
    mistakes: ['Averaging $105K and $68K.', 'Calling the figures audited.'],
    steps: [
      s('lv-1', 'The column', 'Copy the bio and mark every figure self-reported', 'Do not add Remote OK or a number that is not in that bio.', 'The list.', 'Each line says “he says.”', 20, 7, 'source', 'https://x.com/levelsio'),
      s('lv-2', 'The book', 'Open readmake.com', 'That is the profile link, not the largest product.', 'One sentence.', 'You did not describe it as Photo AI.', 15, 7, 'source', 'https://readmake.com'),
      s('lv-3', 'The project list', 'Open levels.io/projects and record the update date', 'It was Nov 3, 2026, and the page includes failures.', 'The date and one project that is not a win, if the page still shows one.', 'The date is the one on the page.', 25, 14, 'source', 'https://levels.io/projects'),
      s('lv-4', 'Both Photo AI figures', 'Write $105K and $68K with their sources', 'March note versus the Nov 11 bio. Both are his.', 'Two lines.', 'You did not average them.', 20, 30, 'source', 'https://levels.io/projects'),
      s('lv-5', 'Your column', 'If you share revenue, put your own number and date in the bio', 'Practice only: if you share revenue, put your own number and date in the bio. Do not present it as something they scheduled.', 'The line.', 'It is labeled as yours.', 20, 30, 'suggestion'),
      s('lv-6', 'Misses', 'List projects that did not work', 'Suggestion, in the shape of his project page.', 'At least five lines, including misses.', 'The misses are real.', 40, 90, 'suggestion', 'https://levels.io/projects'),
    ],
  },
  tdinh_me: {
    why: 'The bio lists Survive 10 Waves as new, then Make a Website, TypingMind at a self-reported $137K a month, and DevUtils at a self-reported $5K a month. The profile link is the book.',
    mistakes: ['Treating the new game as the flagship.', 'Treating $137K as audited.'],
    steps: [
      s('td-1', 'Four lines', 'Copy the products, the NEW mark, and both figures', 'Label the money self-reported.', 'The four lines.', 'TypingMind is not described as new.', 15, 7, 'source', 'https://x.com/tdinh_me'),
      s('td-2', 'The book', 'Open myindiebook.com', 'That is the profile link.', 'One sentence from the page.', 'You opened it.', 15, 7, 'source', 'https://www.myindiebook.com'),
      s('td-3', 'NEW', 'Mark one launch NEW and leave the older product in the list', 'Suggestion, from the bio order.', 'A bio draft with both URLs.', 'Both URLs are real.', 20, 14, 'suggestion', 'https://survive10waves.com'),
      s('td-4', 'Still opened', 'Remove a product you no longer open', 'The bio starts from tools he uses. DevUtils and TypingMind are the examples.', 'The list before and after.', 'The removed line is one you stopped opening.', 20, 30, 'source', 'https://devutils.com'),
      s('td-5', 'Three checks', 'If you publish a number, date it once a month', 'Practice only: if you publish a number, date it once a month. Do not present it as something they scheduled.', 'Three dated lines.', 'Each date is a day you checked.', 15, 90, 'suggestion'),
    ],
  },
  dannypostma: {
    why: 'The bio is one sentence: founder of HeadshotPro, a Singapore-based AI photography company. The profile link is a short intro, not the app.',
    mistakes: ['Adding older products that are not in the bio.', 'Explaining the model before showing a photo a customer would use.'],
    steps: [
      s('dp-1', 'One sentence', 'Copy the bio', 'One company.', 'The sentence.', 'No second product.', 10, 7, 'source', 'https://x.com/dannypostma'),
      s('dp-2', 'The intro', 'Open prointro.com/danny and write the next click', 'New followers get a page before the product.', 'What it asks you to do.', 'You did not skip to a feature list.', 15, 7, 'source', 'https://www.prointro.com/danny'),
      s('dp-3', 'A photo', 'Find one headshot on the product site', 'The proof is the photo.', 'The page, and the use: profile or team.', 'You can describe the use.', 15, 14, 'source', 'https://www.headshotpro.com'),
      s('dp-4', 'Your intro', 'Write a one-page intro and point your profile at it', 'Practice only: write a one-page intro and point your profile at it. Do not present it as something they scheduled.', 'The page.', 'The product is the second click.', 40, 30, 'suggestion'),
      s('dp-5', 'Four images', 'Four posts, image first', 'Practice only: four posts, image first. Do not present it as something they scheduled.', 'Four posts.', 'The model is not the first line.', 20, 60, 'suggestion'),
    ],
  },
  arvidkahl: {
    why: 'The bio says he is building Podscan at Audiohook and still links The Bootstrapped Founder. Feedback Panda is not the current job.',
    mistakes: ['Leading with Feedback Panda.', 'Dropping the show because the product is newer.'],
    steps: [
      s('ak-1', 'One line', 'Write product, company, and place', 'Podscan, Audiohook, Ontario.', 'That line.', 'Both names are in it.', 10, 7, 'source', 'https://x.com/arvidkahl'),
      s('ak-2', 'The product', 'Open podscan.fm and write what it says it does', 'Two sentences from the homepage.', 'Those two sentences.', 'You did not describe a podcast host.', 15, 7, 'source', 'https://podscan.fm'),
      s('ak-3', 'The show', 'Open tbf.fm and keep it on a separate line from the product', 'The show is still in the bio.', 'Show URL and one sentence.', 'The product URL is a different line.', 15, 14, 'source', 'https://tbf.fm'),
      s('ak-4', 'The blog', 'Take one post from tbf.link/blog and name the situation', 'The blog is in the bio.', 'Title and situation.', 'You linked the post.', 30, 14, 'source', 'https://tbf.link/blog'),
      s('ak-5', 'Four episodes', 'One idea and a link, not a full recap', 'Practice only: one idea and a link, not a full recap. Do not present it as something they scheduled.', 'Four links.', 'Each is a real episode.', 25, 60, 'suggestion'),
    ],
  },
  yongfook: {
    why: 'The bio is Bannerbear, Redacted, and a self-reported $81K MRR, from Singapore. Redacted is the free tool.',
    mistakes: ['Treating $81K as audited.', 'Describing Redacted as a paid plan.'],
    steps: [
      s('yf-1', 'The line', 'Copy the bio and mark the MRR self-reported', 'Two products and the figure.', 'The line.', 'Singapore only if you are quoting the location field.', 10, 7, 'source', 'https://x.com/yongfook'),
      s('yf-2', 'One run', 'Make one image and name the job', 'Ad, card, or certificate. Include the input.', 'Image and job name.', 'You can say what the data was.', 40, 7, 'source', 'https://www.bannerbear.com'),
      s('yf-3', 'Redacted', 'Finish one redaction on the free tool', 'Private text stays out of your note.', 'What you redacted, described safely.', 'You did not pay, or you wrote that the free path was gone.', 20, 14, 'source', 'https://www.redacted.to'),
      s('yf-4', 'Your number', 'If you publish MRR, date it and use your own books', 'Practice only: if you publish MRR, date it and use your own books. Do not present it as something they scheduled.', 'The sentence.', 'It is not his number.', 15, 30, 'suggestion'),
      s('yf-5', 'Four jobs', 'A different automation job each week', 'Practice only: a different automation job each week. Do not present it as something they scheduled.', 'Four outputs, each with an input.', 'Each has an input.', 30, 60, 'suggestion'),
    ],
  },
  hnshah: {
    why: 'The bio names Crazy Egg (2005), KISSmetrics (2008), and Nira (2020), and says he writes about what lasts. The profile link is hiten.com. KISSmetrics was not given a URL because it was not re-checked.',
    mistakes: ['Linking KISSmetrics without checking.', 'Posting a tactic that expires this month and calling it his kind of essay.'],
    steps: [
      s('hn-1', 'The years', 'Write the three companies and the years', 'From the bio.', 'Three lines.', 'No fourth company.', 10, 7, 'source', 'https://x.com/hnshah'),
      s('hn-2', 'One essay', 'Open hiten.com and read past one headline', 'X is the first paragraph. The site is the essay.', 'Title and URL.', 'You read past the headline.', 30, 7, 'source', 'https://hiten.com/'),
      s('hn-3', 'Crazy Egg', 'Confirm the domain loads, and stop', 'It responded when we checked. Do not review the product unless you used it.', 'Loaded or not, on the day you try.', 'No review.', 10, 14, 'source', 'https://www.crazyegg.com'),
      s('hn-4', 'A cut', 'Delete every line that depends on this month’s feed', 'Practice only: delete every line that depends on this month’s feed. Do not present it as something they scheduled.', 'Before and after.', 'The cut lines are gone.', 40, 14, 'suggestion'),
      s('hn-5', 'Four essays', 'One a week on your own domain', 'Suggestion. X gets a paragraph and a link.', 'Four URLs.', 'Each X post is shorter than the essay.', 40, 60, 'suggestion'),
    ],
  },
  damengchen: {
    why: 'The username is @damonchen. The bio is Testimonial.to, PDFgen, StreetInterview.ai, Chat.sh, and PDF.ai. damon.build is the profile. The page id stays damengchen so old links work.',
    mistakes: ['Searching only for @damengchen and calling the account gone.', 'Describing five products in one post.'],
    steps: [
      s('dc-1', 'The handle', 'Open x.com/damonchen and list the links you see', 'The username should be damonchen.', 'The username and the list.', 'It is not damengchen.', 10, 7, 'source', 'https://x.com/damonchen'),
      s('dc-2', 'The portfolio', 'Open damon.build and list only products you can see', 'Do not add one from memory.', 'The list.', 'Every name was on the page.', 20, 7, 'source', 'https://damon.build'),
      s('dc-3', 'One job', 'Use one product for one output', 'Testimonial.to or PDF.ai is enough.', 'The output and the domain.', 'The other four are not in the post.', 40, 14, 'source', 'https://testimonial.to'),
      s('dc-4', 'The rename', 'Write old name, new name, and date', 'This page kept the id and changed the public handle.', 'That note, for your own rename if you have one.', 'Both names are in it.', 15, 30, 'source', 'https://x.com/damonchen'),
      s('dc-5', 'Five days', 'Five posts, five domains', 'Practice only: five posts, five domains. Do not present it as something they scheduled.', 'Five posts.', 'Each URL is different.', 25, 30, 'suggestion'),
    ],
  },
  flaviocopes: {
    why: 'The bio is the site URL. He states about 130,000 newsletter subscribers. He wrote 55 free courses on Aug 3, 2026, and a later note says 87. The workshop page says enrollment opens Nov 23, 2026.',
    mistakes: ['Saying the workshop is open before that date.', 'Treating 130,000 or 87 as audited.'],
    steps: [
      s('fc-1', 'The newsletter', 'Read the newsletter page', 'Cadence, contents, and the subscriber figure as his.', 'Three bullets.', '“About 130,000” stays his wording.', 20, 7, 'source', 'https://flaviocopes.com/newsletter/'),
      s('fc-2', 'Both counts', 'Open the Aug 3 post and the summer note', '55, then 87. Both are his.', 'Both numbers and both URLs.', 'You did not hide one.', 25, 7, 'source', 'https://flaviocopes.com/free-courses-for-developers/'),
      s('fc-3', 'The date', 'Copy the workshop open date and price', 'Nov 23, 2026, from that page.', 'Date and price.', 'You did not write “open now” if today is earlier.', 15, 14, 'source', 'https://flaviocopes.com/courses/ai-workshop/'),
      s('fc-4', 'A path', 'Order five of your old posts', 'Suggestion, from the way he turned tutorials into courses.', 'A page with an order.', 'A reader knows what comes first.', 90, 30, 'suggestion'),
      s('fc-5', 'Your date', 'Publish an open date before you imply a cohort is open', 'Practice only: publish an open date before you imply a cohort is open. Do not present it as something they scheduled.', 'The date on a page.', 'The post uses the same date.', 30, 30, 'suggestion'),
      s('fc-6', 'Twelve weeks', 'One email a week, and write down the skips', 'He describes a weekly issue. Your sections can differ.', 'Twelve sends, or the skipped weeks in the log.', 'Skips are written down.', 30, 90, 'source', 'https://flaviocopes.com/newsletter/'),
    ],
  },
  thepatwalls: {
    why: 'The bio links starterstory.com and build.starterstory.com. The “1 billion people” line is his mission statement, not a result.',
    mistakes: ['Putting “1 billion” in a metrics table.', 'Sending both kinds of readers to the same URL.'],
    steps: [
      s('pw-1', 'Two sites', 'Open both and write the difference', 'Stories on one. Building on the other.', 'Two sentences.', 'They are not the same pitch.', 20, 7, 'source', 'https://www.starterstory.com'),
      s('pw-2', 'One story', 'List only numbers the page shows', 'Business, channel, figure or blank.', 'Those fields.', 'No added revenue.', 30, 7, 'source', 'https://www.starterstory.com'),
      s('pw-3', 'The mission', 'Copy the billion line and label it as his', 'It is in the bio. It is not a KPI.', 'The sentence with “he says.”', 'It is not in a stats row.', 10, 14, 'source', 'https://x.com/thepatwalls'),
      s('pw-4', 'Your split', 'Give two kinds of readers two URLs', 'Practice only: give two kinds of readers two URLs. Do not present it as something they scheduled.', 'Two links and who each is for.', 'A post uses only one.', 40, 30, 'suggestion', 'https://build.starterstory.com'),
      s('pw-5', 'Four stories', 'One a week, numbers only with a source line', 'Practice only: one a week, numbers only with a source line. Do not present it as something they scheduled.', 'Four pieces.', 'Every number has a source.', 40, 60, 'suggestion'),
    ],
  },
  biilmann: {
    why: 'The bio is one line: CEO and co-founder of Netlify. He posts as Matt Biilmann. The August 2026 Atlanta recap names him with the team. “Billman” was a typo.',
    mistakes: ['Writing Billman.', 'Inventing a personal product. The profile link is the company.'],
    steps: [
      s('bb-1', 'The spelling', 'Copy the role from the bio', 'CEO and co-founder. Profile link netlify.com.', 'The line.', 'The spelling is Biilmann.', 10, 7, 'source', 'https://x.com/biilmann'),
      s('bb-2', 'The recap', 'Find his name and the other names around it', 'August 12-13, 2026.', 'The sentence, plus one other person named there.', 'He is not the only name.', 20, 7, 'source', 'https://www.netlify.com/blog/build-with-netlify-came-to-atlanta/'),
      s('bb-3', 'Your line', 'Make the bio the job and the link the company', 'Practice only: make the bio the job and the link the company. Do not present it as something they scheduled.', 'Bio and profile URL.', 'No second pitch.', 15, 14, 'suggestion', 'https://www.netlify.com'),
      s('bb-4', 'A term', 'If you name a pattern, define it once and keep those words', 'The bio says he coins terms. A term counts only if you still use it.', 'The definition URL, or “no term.”', 'The product page uses the same words, if you have one.', 30, 60, 'source', 'https://x.com/biilmann'),
    ],
  },
  nousresearch: {
    why: 'The profile link is Hermes Agent. v0.23.0 is Nov 5, 2026. v0.23.1 is Nov 9. The notes name what a user can do.',
    mistakes: ['Announcing an older model launch as the current product.', 'Quoting commit counts without the release window.'],
    steps: [
      s('nr-1', 'One ability', 'Read v0.23.0 until you can name one new ability', 'Browser desktop, gateway, or plugin catalog. Pick the one you can point at.', 'The ability and the heading.', 'You can scroll to that heading.', 30, 7, 'source', 'https://github.com/NousResearch/hermes-agent/releases/tag/v0.23.0'),
      s('nr-2', 'The patch', 'Read what v0.23.1 fixed', 'A catalog size bug, in the notes.', 'One sentence.', 'You did not call the patch a new product.', 20, 7, 'source', 'https://github.com/nousresearch/hermes-agent/releases'),
      s('nr-3', 'Install', 'Find the install path on the Hermes site', 'That site is the X profile link.', 'The command or the button label.', 'It is on that site.', 20, 14, 'source', 'https://hermes-agent.nousresearch.com'),
      s('nr-4', 'Your note', 'Ship a version note with one user-visible change', 'Practice only: ship a version note with one user-visible change. Do not present it as something they scheduled.', 'The note.', 'It names a version.', 60, 30, 'suggestion'),
      s('nr-5', 'Three windows', 'Three releases, each with “since” and a date', 'Practice only: three releases, each with “since” and a date. Do not present it as something they scheduled.', 'Three notes.', 'Each has a date.', 30, 90, 'suggestion'),
    ],
  },
  teknium: {
    why: 'The bio says cofounder and lead engineer of Hermes Agent at Nous, previously Stability. teknium1 authored the Nov 5, 2026 release.',
    mistakes: ['Leading with Stability as the current job.', 'Linking an org homepage when you mean a tag.'],
    steps: [
      s('tk-1', 'Three facts', 'Write role, project, and previous lab', 'Stability is previous.', 'Three lines.', 'Previous is labeled previous.', 10, 7, 'source', 'https://x.com/Teknium'),
      s('tk-2', 'The author', 'Open the release and copy the author and tag', 'teknium1, v0.23.0, Nov 5, 2026.', 'Author and tag.', 'You opened the release.', 15, 7, 'source', 'https://github.com/NousResearch/hermes-agent/releases/tag/v0.23.0'),
      s('tk-3', 'Both pages', 'Open the GitHub profile and the Hugging Face page named in the bio', 'Write what each is. Do not describe a model you did not open.', 'Two sentences.', 'You opened both.', 20, 14, 'source', 'https://github.com/teknium1'),
      s('tk-4', 'Your name', 'Put your name on something you ship, from both accounts if you have two', 'Practice only: put your name on something you ship, from both accounts if you have two. Do not present it as something they scheduled.', 'Two URLs to the same tag or file.', 'They match.', 30, 30, 'suggestion'),
      s('tk-5', 'Deep links', 'For a month, link past the homepage', 'Practice only: for a month, link past the homepage. Do not present it as something they scheduled.', 'Four URLs with a path.', 'None is only an org root.', 15, 60, 'suggestion'),
    ],
  },
  demishassabis: {
    why: 'The bio lists the Nobel and three jobs: chair of Google DeepMind, chief scientist of Alphabet, CEO of Isomorphic Labs. The profile link is deepmind.com. On Nov 11 the account had 3,296 posts and 1,957,441 followers.',
    mistakes: ['Dropping Isomorphic or the chair role.', 'Inventing a 2026 paper. None was verified here.'],
    steps: [
      s('dh-1', 'Four lines', 'Copy the Nobel line and the three jobs from the bio', 'Not from a headline.', 'Four lines.', 'Isomorphic is there.', 10, 7, 'source', 'https://x.com/demishassabis'),
      s('dh-2', 'The lab', 'Open deepmind.google and write what a visitor is offered', 'That is the profile link.', 'One paragraph.', 'No paper you did not open.', 15, 7, 'source', 'https://deepmind.google'),
      s('dh-3', 'The ratio', 'Write both counts and the date', '3,296 posts. 1,957,441 followers. Nov 11, 2026.', 'The two numbers.', 'You did not round to 2 million without saying so.', 10, 14, 'source', 'https://x.com/demishassabis'),
      s('dh-4', 'A result', 'Post only when you have one, and name the people', 'Suggestion. This is not a rule he published.', 'One post, or a written reason you did not post.', 'The reason is specific.', 20, 30, 'suggestion'),
      s('dh-5', 'A quiet quarter', 'Three posts or fewer, each with a source', 'Suggestion, from the shape of the account.', 'The posts, or an empty log.', 'You did not pad it.', 15, 90, 'suggestion'),
    ],
  },
  karpathy: {
    why: 'The X bio was empty on Nov 11, 2026. nanochat is public. LLM101n is archived and the README says the course does not exist yet. May 2026 coverage quotes a move to Anthropic and describes Eureka as paused. That post was not re-read here.',
    mistakes: ['Saying the course is open.', 'Writing the Anthropic job as if it were in the X bio.'],
    steps: [
      s('ka-1', 'The bio', 'Open the profile and write what the bio contains', 'On Nov 11 it was empty, with no profile URL.', '“Empty on the day I checked,” plus your date.', 'You looked.', 10, 7, 'source', 'https://x.com/karpathy'),
      s('ka-2', 'nanochat', 'Read the README far enough to say what it is not', 'A teaching repo, not a customer product.', 'Two sentences and the URL.', 'You did not call it a startup.', 30, 7, 'source', 'https://github.com/karpathy/nanochat'),
      s('ka-3', 'The notice', 'Quote the LLM101n line that the course does not exist', 'The repo is archived.', 'The sentence.', 'You did not tell anyone to enroll.', 15, 7, 'source', 'https://github.com/karpathy/LLM101n'),
      s('ka-4', 'Secondary', 'Read the May 2026 coverage and label it secondary', 'It reports a May 19, 2026 post. We could not re-read that post.', 'Date, claim, and “secondary source.”', 'It is not written as a bio line.', 25, 14, 'source', 'https://www.startuphub.ai/ai-news/ai-figures/2026/figure-andrej-karpathy-anthropic-pretraining-2026-05-31'),
      s('ka-5', 'Eureka', 'Read the pause writeup the same way', 'Secondary. Do not say the school is enrolling.', 'One sentence and the label.', 'No enrollment claim.', 20, 30, 'source', 'https://www.techi.com/company/eureka-labs/'),
      s('ka-6', 'A small repo', 'Publish something that runs, with the limit in the README', 'Practice only: publish something that runs, with the limit in the README. Do not present it as something they scheduled.', 'The repo.', 'The limit is on the first screen.', 180, 30, 'suggestion'),
    ],
  },
  stabilityai: {
    why: 'The core-model page was last updated May 20, 2026, and lists Stable Diffusion 3.5, Stable Video, and Stable Audio. The homepage notes Stable Audio 3.0 that day. Pricing is in credits on the docs page.',
    mistakes: ['Announcing a newer flagship than those pages.', 'Posting a clip with no way to start: API, self-host, or the app.'],
    steps: [
      s('sa-1', 'The date', 'Copy the last-updated line and three model names', 'May 20, 2026, unless the page has changed.', 'The date you saw.', 'The date is from the page.', 20, 7, 'source', 'https://stability.ai/core-models'),
      s('sa-2', 'A door', 'Find API, self-host, and the app on the image page', 'The bio says self-deploy or a partner.', 'The three labels.', 'You can say which one a small project would use.', 20, 7, 'source', 'https://stability.ai/stable-image'),
      s('sa-3', 'Audio', 'Read the Stable Audio 3.0 note and quote the data claim', 'The site says licensed data. Do not extend that to every model.', 'The claim, with “the site says.”', 'The limit is in your sentence.', 15, 14, 'source', 'https://stability.ai/'),
      s('sa-4', 'One price', 'Copy one pricing row and the credit value', 'The docs say what a credit costs, if that line is still there.', 'The row and the day you checked.', 'No dollar figure you invented.', 20, 14, 'source', 'https://docs.stability.ai/pricing'),
      s('sa-5', 'Your launch', 'Name one door and one price', 'Practice only: name one door and one price. Do not present it as something they scheduled.', 'The post with both.', 'A reader can start without asking you.', 40, 30, 'suggestion'),
      s('sa-6', 'A quarter', 'Re-read the model list and write the date you see', 'Practice only: re-read the model list and write the date you see. Do not present it as something they scheduled.', 'The date, or “unchanged.”', 'You opened the page.', 15, 90, 'suggestion', 'https://stability.ai/core-models'),
    ],
  },
};

export function planFor(id: string, days: number): { why: string; mistakes: string[]; steps: PlanStep[] } | null {
  const plan = MENTOR_PLANS[id];
  if (!plan) return null;
  return { why: plan.why, mistakes: plan.mistakes, steps: plan.steps.filter((step) => step.minDays <= days) };
}
