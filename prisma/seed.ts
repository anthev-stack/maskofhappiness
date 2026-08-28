import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ?? "maskofhappiness",
    10
  );

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@maskofhappiness.com" },
    update: { passwordHash, role: "admin" },
    create: {
      name: "Mask of Happiness",
      email: process.env.ADMIN_EMAIL ?? "admin@maskofhappiness.com",
      passwordHash,
      role: "admin",
    },
  });

  const events = [
    {
      slug: "listening-night-01",
      title: "Listening Night Vol. 01",
      description:
        "A small room, a big system, and a night built around sharing tracks. Bring a song you love and stay for the ones you have not heard yet.",
      location: "Sydney",
      startsAt: new Date("2026-09-12T19:00:00+10:00"),
      endsAt: new Date("2026-09-12T23:00:00+10:00"),
      priceCents: 0,
      capacity: 40,
    },
    {
      slug: "community-mix-session",
      title: "Community Mix Session",
      description:
        "Open decks for the community. Sign up to play a 20-minute mix, or just come through and listen.",
      location: "Melbourne",
      startsAt: new Date("2026-10-04T18:30:00+11:00"),
      endsAt: new Date("2026-10-04T23:30:00+11:00"),
      priceCents: 1500,
      capacity: 80,
    },
    {
      slug: "first-gathering",
      title: "The First Gathering",
      description:
        "The night that started it. Archive photos, the first playlist, and the people who showed up early.",
      location: "Sydney",
      startsAt: new Date("2026-03-08T19:00:00+11:00"),
      endsAt: new Date("2026-03-08T23:00:00+11:00"),
      priceCents: 0,
      capacity: 30,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    });
  }

  await prisma.playlist.deleteMany();
  await prisma.playlist.createMany({
    data: [
      {
        title: "Mask of Happiness — Core",
        description: "The main house mix. Swap this for your playlist in admin.",
        spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
        sortOrder: 0,
      },
      {
        title: "Late Night",
        description: "After hours listening.",
        spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6",
        sortOrder: 1,
      },
      {
        title: "Daylight",
        description: "For the commute and the studio.",
        spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0",
        sortOrder: 2,
      },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
