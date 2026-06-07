import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { buildings, rooms } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const navigationRouter = router({
  campus: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const buildingRows = await db.select().from(buildings);
    const roomRows = await db
      .select({
        id: rooms.id,
        buildingId: rooms.buildingId,
        roomNumber: rooms.roomNumber,
        name: rooms.name,
        nameAr: rooms.nameAr,
        capacity: rooms.capacity,
        type: rooms.type,
        floor: rooms.floor,
        building: buildings.name,
      })
      .from(rooms)
      .leftJoin(buildings, eq(rooms.buildingId, buildings.id));

    return {
      buildings: buildingRows.map(building => ({
        ...building,
        lat: Number(building.latitude),
        lng: Number(building.longitude),
        floor:
          roomRows
            .filter(room => room.buildingId === building.id)
            .reduce((max, room) => Math.max(max, room.floor), 0) || 0,
        capacity: roomRows
          .filter(room => room.buildingId === building.id)
          .reduce((sum, room) => sum + room.capacity, 0),
      })),
      rooms: roomRows,
    };
  }),
});
