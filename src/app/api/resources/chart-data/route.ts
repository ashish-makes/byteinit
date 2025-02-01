// app/api/resources/chart-data/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/prisma"
import { auth } from "@/auth"

type TimeRange = 'today' | '7d' | '30d' | '3m' | '6m' | '1y' | 'all';

const getRangeInDays = (range: TimeRange): number => {
  switch (range) {
    case 'today': return 1;
    case '7d': return 7;
    case '30d': return 30;
    case '3m': return 90;
    case '6m': return 180;
    case '1y': return 365;
    case 'all': return 3650; // 10 years max
    default: return 30;
  }
};

interface PrismaGroupByResult {
  createdAt?: Date;
  savedAt?: Date;
  _count: {
    _all: number;
  };
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range") as TimeRange || "30d"
  const days = getRangeInDays(range)
  
  try {
    const endDate = new Date()
    const startDate = new Date()
    
    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
    } else {
      startDate.setDate(endDate.getDate() - days)
    }

    // Get daily data for the date range
    const dailyStats = await prisma.$transaction([
      // Get daily likes
      prisma.resourceInteraction.groupBy({
        by: ['createdAt'],
        where: {
          type: 'LIKE',
          resource: {
            userId: session.user.id
          },
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        _count: {
          _all: true
        }
      }),
      // Get daily saves
      prisma.savedResource.groupBy({
        by: ['savedAt'],
        where: {
          resource: {
            userId: session.user.id
          },
          userId: {
            not: session.user.id
          },
          savedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          savedAt: 'asc'
        },
        _count: {
          _all: true
        }
      })
    ])

    // Generate appropriate intervals based on range
    const getInterval = () => {
      if (range === 'today') return 'hour';
      if (range === '7d' || range === '30d') return 'day';
      if (range === '3m' || range === '6m') return 'week';
      return 'month';
    }

    const interval = getInterval();
    let dates: string[] = [];

    if (interval === 'hour') {
      // Generate hourly intervals for today
      dates = Array.from({ length: 24 }, (_, i) => {
        const date = new Date(startDate);
        date.setHours(i, 0, 0, 0);
        return date.toISOString();
      });
    } else {
      // Generate daily/weekly/monthly intervals
      dates = Array.from({ length: days }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        return date.toISOString().split('T')[0];
      });
    }

    // Format data for chart with appropriate grouping
    const chartData = dates.map(date => {
      const likes = (dailyStats[0] as unknown as PrismaGroupByResult[]).filter(stat => {
        const statDate = new Date(stat.createdAt!);
        if (interval === 'hour') {
          return statDate.getHours() === new Date(date).getHours();
        }
        return statDate.toISOString().split('T')[0] === date;
      }).reduce((sum: number, stat) => sum + stat._count._all, 0);

      const saves = (dailyStats[1] as unknown as PrismaGroupByResult[]).filter(stat => {
        const statDate = new Date(stat.savedAt!);
        if (interval === 'hour') {
          return statDate.getHours() === new Date(date).getHours();
        }
        return statDate.toISOString().split('T')[0] === date;
      }).reduce((sum: number, stat) => sum + stat._count._all, 0);

      return {
        date,
        likes,
        saves
      }
    });

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error fetching chart data:", error)
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    )
  }
}
