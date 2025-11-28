import { db } from '../lib/db';
import { articles, categories, users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function seedArticles() {
  try {
    console.log('Seeding articles...');

    // Get or create India category
    let indiaCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, 'india'))
      .limit(1);

    if (indiaCategory.length === 0) {
      const newCategory = await db
        .insert(categories)
        .values({
          name: 'India',
          slug: 'india',
          description: 'News about Indian cricket',
        })
        .returning();
      indiaCategory = newCategory;
    }

    // Get or create International category
    let internationalCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, 'international'))
      .limit(1);

    if (internationalCategory.length === 0) {
      const newCategory = await db
        .insert(categories)
        .values({
          name: 'International',
          slug: 'international',
          description: 'International cricket news',
        })
        .returning();
      internationalCategory = newCategory;
    }

    // Get admin user
    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'))
      .limit(1);

    if (adminUser.length === 0) {
      console.error('No admin user found. Please run init-db.ts first.');
      return;
    }

    const authorId = adminUser[0].id;
    const indiaCatId = indiaCategory[0].id;
    const internationalCatId = internationalCategory[0].id;

    // India articles
    const indiaArticles = [
      {
        title: "India's U19 Squad for ACC Men's U19 Asia Cup announced",
        slug: "indias-u19-squad-for-acc-mens-u19-asia-cup-announced",
        excerpt: "BCCI names a 15-member U19 squad for the upcoming Asia Cup, detailing key selections and leadership group.",
        content: `# India's U19 Squad for ACC Men's U19 Asia Cup announced

The Board of Control for Cricket in India (BCCI) has announced a 15-member squad for the upcoming ACC Men's U19 Asia Cup. The selection committee has carefully chosen a balanced team with a mix of experienced players and promising talents.

## Key Selections

The squad includes several standout performers from recent domestic tournaments. The leadership group has been carefully selected to guide the team through the challenging tournament ahead.

## Leadership Group

The team will be led by an experienced captain who has shown excellent leadership qualities in previous tournaments. The vice-captain and other senior players will provide crucial support.

## Tournament Expectations

India will be looking to defend their title and continue their dominance in the U19 Asia Cup. The team has been training hard and is well-prepared for the challenges ahead.

The tournament will be a great opportunity for these young cricketers to showcase their talent on the international stage.`,
        categoryId: indiaCatId,
        authorId,
        published: true,
      },
      {
        title: "India's squad for IDFC First Bank ODI series against South Africa announced",
        slug: "indias-squad-for-idfc-first-bank-odi-series-against-south-africa-announced",
        excerpt: "Senior men's ODI squad list and key talking points for the home series vs South Africa.",
        content: `# India's squad for IDFC First Bank ODI series against South Africa announced

The BCCI has announced the senior men's ODI squad for the upcoming home series against South Africa. The series, sponsored by IDFC First Bank, promises to be an exciting contest between two top cricketing nations.

## Squad Composition

The squad features a mix of experienced players and fresh talent. Several key players have been included based on their recent performances in domestic and international cricket.

## Key Talking Points

- The return of some senior players who were rested in previous series
- Inclusion of promising young talents
- The balance between batting and bowling departments
- Strategic selections for home conditions

## Series Expectations

This series will be crucial for India's preparation for upcoming international tournaments. The team will be looking to build momentum and test different combinations.

The home advantage will play a significant role, and the team will be looking to capitalize on familiar conditions.`,
        categoryId: indiaCatId,
        authorId,
        published: true,
      },
      {
        title: "Schedule for IDFC First Bank T20I series against Sri Lanka Women announced",
        slug: "schedule-for-idfc-first-bank-t20i-series-against-sri-lanka-women-announced",
        excerpt: "Fixtures, venues, and dates for India women's five-match home T20I series against Sri Lanka.",
        content: `# Schedule for IDFC First Bank T20I series against Sri Lanka Women announced

The BCCI has announced the complete schedule for India women's five-match T20I series against Sri Lanka. The series, sponsored by IDFC First Bank, will be played across multiple venues in India.

## Fixtures and Venues

The five-match series will be played at different venues across the country, providing fans from various regions the opportunity to watch the team in action.

### Match Schedule

1. **1st T20I** - Venue and date to be confirmed
2. **2nd T20I** - Venue and date to be confirmed
3. **3rd T20I** - Venue and date to be confirmed
4. **4th T20I** - Venue and date to be confirmed
5. **5th T20I** - Venue and date to be confirmed

## Series Importance

This series will be crucial for the Indian women's team as they prepare for upcoming international tournaments. It will provide valuable match practice and help the team identify areas for improvement.

## Team Preparations

The team has been training hard and is looking forward to the series. The players are excited to play in front of home crowds and showcase their skills.`,
        categoryId: indiaCatId,
        authorId,
        published: true,
      },
      {
        title: "BCCI not happy with Gautam Gambhir's press conference remarks; a flop T20 World Cup could spell doom for head coach",
        slug: "bcci-not-happy-with-gautam-gambhirs-press-conference-remarks",
        excerpt: "Report on BCCI's displeasure after India's home Test series loss to South Africa and what it means for Gambhir's future.",
        content: `# BCCI not happy with Gautam Gambhir's press conference remarks

The Board of Control for Cricket in India (BCCI) has expressed its displeasure with head coach Gautam Gambhir's remarks during a recent press conference. This comes after India's disappointing home Test series loss to South Africa.

## The Press Conference

Gambhir's comments during the press conference have raised eyebrows within the BCCI. The board is reportedly not satisfied with how the coach addressed the team's performance and future plans.

## T20 World Cup Implications

With the T20 World Cup approaching, the pressure is mounting on Gambhir. A poor performance in the tournament could have serious consequences for his position as head coach.

## BCCI's Stance

The BCCI is closely monitoring the situation and will be evaluating the team's performance in upcoming tournaments. The board expects better results and improved communication from the coaching staff.

## What This Means

The relationship between the BCCI and the head coach appears to be under strain. The upcoming T20 World Cup will be a crucial test for Gambhir, and the results could determine his future with the team.

The board is committed to ensuring the best possible performance from the Indian cricket team and will take necessary steps to achieve this goal.`,
        categoryId: indiaCatId,
        authorId,
        published: true,
      },
      {
        title: "CNN-News18 Indian of the Year Awards 2025: ICC chairman Jay Shah receives Outstanding Achievement Award",
        slug: "cnn-news18-indian-of-the-year-awards-2025-jay-shah-outstanding-achievement",
        excerpt: "Coverage of Jay Shah's recognition and his role in shaping Indian cricket's recent growth.",
        content: `# CNN-News18 Indian of the Year Awards 2025: ICC chairman Jay Shah receives Outstanding Achievement Award

ICC chairman Jay Shah has been honored with the Outstanding Achievement Award at the CNN-News18 Indian of the Year Awards 2025. This recognition highlights his significant contributions to Indian cricket.

## The Award

The Outstanding Achievement Award recognizes individuals who have made exceptional contributions to their field. Jay Shah's work in cricket administration has been widely acknowledged.

## Jay Shah's Contributions

As ICC chairman, Jay Shah has played a crucial role in shaping the future of Indian cricket. His leadership has been instrumental in various initiatives and developments within the sport.

### Key Achievements

- Strategic planning and implementation of cricket development programs
- Strengthening India's position in international cricket
- Promoting cricket at various levels
- Building partnerships and collaborations

## Impact on Indian Cricket

Jay Shah's contributions have had a significant impact on Indian cricket's growth and development. His vision and leadership have helped position India as a major force in world cricket.

## Recognition

This award is a testament to Jay Shah's dedication and commitment to the sport. It recognizes not just his achievements but also his ongoing efforts to promote and develop cricket in India and globally.

The cricket community has welcomed this recognition, acknowledging the positive changes brought about under his leadership.`,
        categoryId: indiaCatId,
        authorId,
        published: true,
      },
    ];

    // International articles
    const internationalArticles = [
      {
        title: "Australia announces squad for upcoming Test series against England",
        slug: "australia-announces-squad-for-upcoming-test-series-against-england",
        excerpt: "Cricket Australia has named a strong squad for the highly anticipated Ashes series, with several key players returning to the side.",
        content: `# Australia announces squad for upcoming Test series against England

Cricket Australia has announced a formidable squad for the upcoming Test series against England. The selection includes a mix of experienced campaigners and promising newcomers.

## Squad Highlights

The squad features several key players who have been performing well in recent domestic and international matches. The selectors have focused on building a balanced team capable of competing at the highest level.

## Key Selections

Several players have earned their place in the squad through consistent performances. The team management is confident in the squad's ability to perform well in the challenging conditions ahead.

## Series Expectations

The series promises to be an exciting contest between two traditional rivals. Both teams will be looking to assert their dominance and claim bragging rights in this historic rivalry.`,
        categoryId: internationalCatId,
        authorId,
        published: true,
      },
      {
        title: "Pakistan's new head coach outlines vision for team's future",
        slug: "pakistans-new-head-coach-outlines-vision-for-teams-future",
        excerpt: "The newly appointed head coach of Pakistan cricket team shares his plans and strategies for improving the team's performance in international cricket.",
        content: `# Pakistan's new head coach outlines vision for team's future

The newly appointed head coach of the Pakistan cricket team has outlined his vision for the team's future. The coach brings extensive experience and a clear plan for development.

## Vision and Strategy

The coach has identified key areas for improvement and has developed a comprehensive strategy to address them. The focus will be on building a strong team culture and improving performance across all formats.

## Development Plans

Several development initiatives have been planned to nurture young talent and improve the overall standard of cricket in Pakistan. The coach is committed to long-term development.

## Team Goals

The primary goal is to build a competitive team that can consistently perform at the highest level. The coach is confident that with the right approach, Pakistan can achieve great success in international cricket.`,
        categoryId: internationalCatId,
        authorId,
        published: true,
      },
      {
        title: "England's white-ball revolution continues with new T20 squad announcement",
        slug: "englands-white-ball-revolution-continues-with-new-t20-squad-announcement",
        excerpt: "England Cricket Board announces an exciting new T20 squad featuring young talents and experienced players for upcoming series.",
        content: `# England's white-ball revolution continues with new T20 squad announcement

The England Cricket Board has announced an exciting new T20 squad that continues the team's white-ball revolution. The squad features a blend of experienced players and exciting young talents.

## Squad Composition

The squad includes several players who have been performing exceptionally well in domestic T20 competitions. The selectors have focused on building a team that can adapt to different conditions and situations.

## Young Talents

Several young players have been given opportunities to showcase their skills at the international level. This reflects the board's commitment to developing the next generation of English cricketers.

## Series Preparation

The team has been preparing intensively for the upcoming series. The coaching staff is working hard to ensure the players are ready to perform at their best.`,
        categoryId: internationalCatId,
        authorId,
        published: true,
      },
      {
        title: "New Zealand announces squad for World Test Championship final",
        slug: "new-zealand-announces-squad-for-world-test-championship-final",
        excerpt: "Black Caps name their squad for the highly anticipated World Test Championship final, with key players returning from injury.",
        content: `# New Zealand announces squad for World Test Championship final

New Zealand Cricket has announced its squad for the upcoming World Test Championship final. The squad includes several key players who have recovered from injuries and are ready to contribute.

## Squad Strength

The squad features a strong batting lineup and a well-balanced bowling attack. The team management is confident in the squad's ability to compete at the highest level.

## Key Returns

Several important players have returned to the squad after recovering from injuries. Their experience and skill will be crucial for New Zealand's chances in the final.

## Preparation

The team has been preparing meticulously for the final. The players are focused and determined to put in their best performance on the big stage.`,
        categoryId: internationalCatId,
        authorId,
        published: true,
      },
      {
        title: "South Africa's cricket transformation continues with new development programs",
        slug: "south-africas-cricket-transformation-continues-with-new-development-programs",
        excerpt: "Cricket South Africa launches new initiatives to develop talent and promote cricket across all communities in the country.",
        content: `# South Africa's cricket transformation continues with new development programs

Cricket South Africa has launched new development programs aimed at transforming the sport in the country. These initiatives focus on developing talent and promoting cricket across all communities.

## Development Initiatives

Several new programs have been introduced to identify and nurture young talent. These programs aim to provide opportunities for players from all backgrounds to excel in cricket.

## Community Engagement

The programs include strong community engagement components, ensuring that cricket reaches all parts of the country. This is part of a broader effort to make cricket more accessible and inclusive.

## Future Goals

The long-term goal is to build a strong pipeline of talent that can represent South Africa at the highest level. The programs are designed to support players at various stages of their development.

## Impact

These initiatives are expected to have a significant impact on South African cricket. By providing more opportunities and better support, the programs aim to produce world-class cricketers who can compete at the international level.`,
        categoryId: internationalCatId,
        authorId,
        published: true,
      },
    ];

    // Insert India articles
    for (const article of indiaArticles) {
      const existing = await db
        .select()
        .from(articles)
        .where(eq(articles.slug, article.slug))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(articles).values(article);
        console.log(`Created article: ${article.title}`);
      } else {
        console.log(`Article already exists: ${article.title}`);
      }
    }

    // Insert International articles
    for (const article of internationalArticles) {
      const existing = await db
        .select()
        .from(articles)
        .where(eq(articles.slug, article.slug))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(articles).values(article);
        console.log(`Created article: ${article.title}`);
      } else {
        console.log(`Article already exists: ${article.title}`);
      }
    }

    console.log('Articles seeding complete!');
  } catch (error) {
    console.error('Error seeding articles:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedArticles()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

export { seedArticles };

