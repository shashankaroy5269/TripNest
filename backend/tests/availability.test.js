/**
 * @file availability.test.js
 * @description Jest Test Suite for Section 7.2 Date-Based Room Availability & Overlap Calculation
 * Conceptual Formula: Available Rooms = Total Rooms - Overlapping Active Booked Rooms
 */

const availabilityService = require("../src/services/availability.service");
const roomRepository = require("../src/repositories/room.repository");
const hotelRepository = require("../src/repositories/hotel.repository");
const bookingRepository = require("../src/repositories/booking.repository");
const BOOKING_STATUS = require("../src/constants/bookingStatus");

// Helper function implementing the exact date overlap condition:
// existing.checkIn < requested.checkOut && existing.checkOut > requested.checkIn
function hasDateOverlap(existingCheckIn, existingCheckOut, requestedCheckIn, requestedCheckOut) {
  const eIn = new Date(existingCheckIn).getTime();
  const eOut = new Date(existingCheckOut).getTime();
  const rIn = new Date(requestedCheckIn).getTime();
  const rOut = new Date(requestedCheckOut).getTime();

  return eIn < rOut && eOut > rIn;
}

// Helper function calculating available rooms conceptual formula
function calculateAvailableRooms(totalRooms, overlappingActiveBookedRooms) {
  return Math.max(totalRooms - overlappingActiveBookedRooms, 0);
}

describe("Section 7.2: Room & Inventory Availability Engine", () => {
  describe("1. Conceptual Formula: Available Rooms = Total Rooms - Overlapping Active Booked Rooms", () => {
    test("should correctly compute available rooms when there are overlapping active bookings", () => {
      const totalRooms = 10;
      const bookedRooms = 3;
      const availableRooms = calculateAvailableRooms(totalRooms, bookedRooms);

      expect(availableRooms).toBe(7);
      expect(totalRooms - bookedRooms).toBe(availableRooms);
    });

    test("should report 0 available rooms when all inventory is consumed (Sold Out)", () => {
      const totalRooms = 5;
      const bookedRooms = 5;
      const availableRooms = calculateAvailableRooms(totalRooms, bookedRooms);

      expect(availableRooms).toBe(0);
    });

    test("should never return negative available rooms even if overbooked", () => {
      const totalRooms = 4;
      const bookedRooms = 6;
      const availableRooms = calculateAvailableRooms(totalRooms, bookedRooms);

      expect(availableRooms).toBe(0);
    });

    test("should return all rooms as available when zero active bookings overlap", () => {
      const totalRooms = 8;
      const bookedRooms = 0;
      const availableRooms = calculateAvailableRooms(totalRooms, bookedRooms);

      expect(availableRooms).toBe(8);
    });
  });

  describe("2. Date-Based Overlap Logic: (existing.checkIn < requested.checkOut && existing.checkOut > requested.checkIn)", () => {
    const requestedCheckIn = "2026-10-20";
    const requestedCheckOut = "2026-10-23";

    test("Scenario A: Exact dates overlap (20 Oct to 23 Oct) -> OVERLAPS", () => {
      const existingCheckIn = "2026-10-20";
      const existingCheckOut = "2026-10-23";

      const overlaps = hasDateOverlap(existingCheckIn, existingCheckOut, requestedCheckIn, requestedCheckOut);
      expect(overlaps).toBe(true);
    });

    test("Scenario B: Existing booking starts before and overlaps start (18 Oct to 21 Oct) -> OVERLAPS", () => {
      const existingCheckIn = "2026-10-18";
      const existingCheckOut = "2026-10-21";

      const overlaps = hasDateOverlap(existingCheckIn, existingCheckOut, requestedCheckIn, requestedCheckOut);
      expect(overlaps).toBe(true);
    });

    test("Scenario C: Existing booking starts inside and extends beyond (21 Oct to 25 Oct) -> OVERLAPS", () => {
      const existingCheckIn = "2026-10-21";
      const existingCheckOut = "2026-10-25";

      const overlaps = hasDateOverlap(existingCheckIn, existingCheckOut, requestedCheckIn, requestedCheckOut);
      expect(overlaps).toBe(true);
    });

    test("Scenario D: Existing booking completely encloses requested period (15 Oct to 28 Oct) -> OVERLAPS", () => {
      const existingCheckIn = "2026-10-15";
      const existingCheckOut = "2026-10-28";

      const overlaps = hasDateOverlap(existingCheckIn, existingCheckOut, requestedCheckIn, requestedCheckOut);
      expect(overlaps).toBe(true);
    });

    test("Scenario E: Existing booking checks out on requested check-in day (17 Oct to 20 Oct) -> NO OVERLAP (Room is vacated)", () => {
      const existingCheckIn = "2026-10-17";
      const existingCheckOut = "2026-10-20";

      const overlaps = hasDateOverlap(existingCheckIn, existingCheckOut, requestedCheckIn, requestedCheckOut);
      expect(overlaps).toBe(false);
    });

    test("Scenario F: Existing booking checks in on requested check-out day (23 Oct to 26 Oct) -> NO OVERLAP (Next guest arrives after checkout)", () => {
      const existingCheckIn = "2026-10-23";
      const existingCheckOut = "2026-10-26";

      const overlaps = hasDateOverlap(existingCheckIn, existingCheckOut, requestedCheckIn, requestedCheckOut);
      expect(overlaps).toBe(false);
    });

    test("Scenario G: Existing booking is in a completely different week -> NO OVERLAP", () => {
      const existingCheckIn = "2026-11-01";
      const existingCheckOut = "2026-11-05";

      const overlaps = hasDateOverlap(existingCheckIn, existingCheckOut, requestedCheckIn, requestedCheckOut);
      expect(overlaps).toBe(false);
    });
  });

  describe("3. AvailabilityService Integration & Edge Cases", () => {
    const mockRoomId = "room_deluxe_101";
    const mockHotelId = "hotel_resort_202";

    const mockRoom = {
      _id: mockRoomId,
      hotel: mockHotelId,
      name: "Deluxe Ocean View Room",
      roomType: "DELUXE",
      status: "ACTIVE",
      totalRooms: 10,
      basePrice: 5000,
      discountPercentage: 10,
      finalPrice: 4500,
    };

    const mockHotel = {
      _id: mockHotelId,
      name: "Grand Azure Beach Resort",
      status: "APPROVED",
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should return available = true when remaining rooms >= requestedRooms", async () => {
      jest.spyOn(roomRepository, "findById").mockResolvedValue(mockRoom);
      jest.spyOn(hotelRepository, "findById").mockResolvedValue(mockHotel);
      // 3 rooms currently booked for overlapping dates
      jest.spyOn(bookingRepository, "getBookedRoomCount").mockResolvedValue(3);

      const result = await availabilityService.checkRoomAvailability({
        roomId: mockRoomId,
        checkIn: "2026-10-20",
        checkOut: "2026-10-23",
        requestedRooms: 2,
      });

      expect(result.totalRooms).toBe(10);
      expect(result.bookedRooms).toBe(3);
      expect(result.availableRooms).toBe(7); // 10 - 3 = 7
      expect(result.available).toBe(true); // 7 >= 2
      expect(result.requestedRooms).toBe(2);
      expect(result.price.finalPricePerRoom).toBe(4500);
    });

    test("should return available = false when requestedRooms exceed remaining inventory", async () => {
      jest.spyOn(roomRepository, "findById").mockResolvedValue(mockRoom);
      jest.spyOn(hotelRepository, "findById").mockResolvedValue(mockHotel);
      // 9 rooms booked out of 10
      jest.spyOn(bookingRepository, "getBookedRoomCount").mockResolvedValue(9);

      const result = await availabilityService.checkRoomAvailability({
        roomId: mockRoomId,
        checkIn: "2026-10-20",
        checkOut: "2026-10-23",
        requestedRooms: 2, // only 1 left
      });

      expect(result.totalRooms).toBe(10);
      expect(result.bookedRooms).toBe(9);
      expect(result.availableRooms).toBe(1); // 10 - 9 = 1
      expect(result.available).toBe(false); // 1 < 2
    });

    test("should throw BAD_REQUEST when check-out date is before or equal to check-in date", async () => {
      await expect(
        availabilityService.checkRoomAvailability({
          roomId: mockRoomId,
          checkIn: "2026-10-23",
          checkOut: "2026-10-20",
          requestedRooms: 1,
        })
      ).rejects.toThrow("Check-out must be after check-in");

      await expect(
        availabilityService.checkRoomAvailability({
          roomId: mockRoomId,
          checkIn: "2026-10-20",
          checkOut: "2026-10-20",
          requestedRooms: 1,
        })
      ).rejects.toThrow("Check-out must be after check-in");
    });

    test("should accurately compute nights and server-side pricing", async () => {
      jest.spyOn(roomRepository, "findById").mockResolvedValue(mockRoom);
      jest.spyOn(hotelRepository, "findById").mockResolvedValue(mockHotel);
      jest.spyOn(bookingRepository, "getBookedRoomCount").mockResolvedValue(2);

      const checkIn = "2026-10-20";
      const checkOut = "2026-10-23"; // 3 nights

      const priceResult = await availabilityService.calculateBookingPrice({
        roomId: mockRoomId,
        checkIn,
        checkOut,
        requestedRooms: 2,
      });

      expect(priceResult.nights).toBe(3);
      expect(priceResult.rooms).toBe(2);
      expect(priceResult.pricePerRoom).toBe(4500);
      // 4500 * 2 rooms * 3 nights = 27000
      expect(priceResult.totalAmount).toBe(27000);
    });
  });
});
