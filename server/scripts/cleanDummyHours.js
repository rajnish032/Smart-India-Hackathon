import prisma from '../src/config/db.js';

async function cleanDummyHours() {
  console.log('--- Cleaning dummy baseline data for learners ---');
  const profiles = await prisma.learnerProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          submissions: { select: { id: true } },
          enrollments: { select: { id: true } },
          simulationRuns: { select: { id: true } },
          experiments: { select: { id: true } },
          savedCircuits: { select: { id: true } },
        },
      },
    },
  });

  for (const profile of profiles) {
    const user = profile.user;
    if (!user) continue;

    const totalActivities =
      (user.submissions?.length || 0) +
      (user.enrollments?.length || 0) +
      (user.simulationRuns?.length || 0) +
      (user.experiments?.length || 0) +
      (user.savedCircuits?.length || 0);

    // If learner has 0 real activities and has the legacy dummy 1.5h or 150xp
    if (totalActivities === 0 && (profile.learningHours === 1.5 || profile.xp === 150)) {
      console.log(`Resetting dummy data for ${user.name} (${user.email}):`);
      console.log(`  Before: hours=${profile.learningHours}, xp=${profile.xp}, streak=${profile.streak}`);

      const updated = await prisma.learnerProfile.update({
        where: { id: profile.id },
        data: {
          learningHours: 0,
          xp: 0,
          level: 1,
          streak: 0,
          longestStreak: 0,
        },
      });

      console.log(`  After: hours=${updated.learningHours}, xp=${updated.xp}, streak=${updated.streak}`);
    } else {
      console.log(`User ${user.name} (${user.email}) has ${totalActivities} activities. Keeping.`);
    }
  }

  console.log('--- Cleanup complete ---');
  process.exit(0);
}

cleanDummyHours().catch((err) => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
