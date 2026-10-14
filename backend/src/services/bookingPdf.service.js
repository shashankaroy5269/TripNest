const PDFDocument = require("pdfkit");

class BookingPdfService {
  /**
   * Generates a PDF voucher/invoice Buffer for a confirmed booking
   * @param {Object} booking 
   * @returns {Promise<Buffer>}
   */
  async generateBookingPdf(booking) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margin: 40,
          info: {
            Title: `TripNest Voucher - ${booking.bookingNumber}`,
            Author: "TripNest Travel Platform"
          }
        });

        const buffers = [];
        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err) => reject(err));

        const primaryColor = "#4338CA"; // Indigo
        const darkColor = "#1E293B"; // Slate 800
        const grayColor = "#64748B"; // Slate 500
        const lightBg = "#F1F5F9"; // Slate 100
        const greenColor = "#059669"; // Emerald

        // ================= HEADER =================
        doc.rect(0, 0, 595, 95).fill(primaryColor);

        doc.fillColor("#FFFFFF")
          .fontSize(26)
          .font("Helvetica-Bold")
          .text("TripNest", 40, 25);

        doc.fontSize(10)
          .font("Helvetica")
          .fillColor("#E0E7FF")
          .text("Hotel & Holiday Trip Booking Platform", 40, 56)
          .text("Official Reservation Voucher & Tax Invoice", 40, 70);

        doc.fontSize(11)
          .font("Helvetica-Bold")
          .fillColor("#FFFFFF")
          .text(`VOUCHER #${booking.bookingNumber}`, 360, 28, { align: "right", width: 195 });

        const bookingDateStr = booking.createdAt
          ? new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
          : new Date().toLocaleDateString("en-IN");

        doc.fontSize(9)
          .font("Helvetica")
          .fillColor("#E0E7FF")
          .text(`Date of Issue: ${bookingDateStr}`, 360, 46, { align: "right", width: 195 })
          .text(`Booking Status: CONFIRMED`, 360, 60, { align: "right", width: 195 });

        doc.y = 115;

        // ================= GUEST DETAILS =================
        doc.rect(40, doc.y, 515, 60).fill(lightBg);
        const guestTop = doc.y + 10;

        doc.fillColor(primaryColor)
          .fontSize(11)
          .font("Helvetica-Bold")
          .text("PRIMARY GUEST / TRAVELER DETAILS", 55, guestTop);

        const travelerName = booking.traveler?.name || booking.user?.name || "Customer";
        const travelerEmail = booking.traveler?.email || booking.user?.email || "N/A";
        const travelerPhone = booking.traveler?.phone || booking.user?.phone || "N/A";

        doc.fillColor(darkColor)
          .fontSize(9)
          .font("Helvetica")
          .text(`Name: `, 55, guestTop + 20)
          .font("Helvetica-Bold")
          .text(travelerName, 90, guestTop + 20)
          .font("Helvetica")
          .text(`Email: `, 240, guestTop + 20)
          .font("Helvetica-Bold")
          .text(travelerEmail, 275, guestTop + 20)
          .font("Helvetica")
          .text(`Phone: `, 420, guestTop + 20)
          .font("Helvetica-Bold")
          .text(travelerPhone, 460, guestTop + 20);

        const adults = booking.guests?.adults || 1;
        const children = booking.guests?.children || 0;
        doc.font("Helvetica")
          .text(`Guests: `, 55, guestTop + 36)
          .font("Helvetica-Bold")
          .text(`${adults} Adult(s), ${children} Children`, 95, guestTop + 36);

        doc.y = 195;

        // ================= RESERVATION DETAILS =================
        doc.fillColor(primaryColor)
          .fontSize(13)
          .font("Helvetica-Bold")
          .text("RESERVATION SUMMARY", 40, doc.y);

        doc.strokeColor("#E2E8F0").lineWidth(1).moveTo(40, doc.y + 4).lineTo(555, doc.y + 4).stroke();
        doc.y += 12;

        const isTrip = booking.bookingType === "TRIP";
        const itemName = isTrip
          ? (booking.package?.title || "Holiday Package")
          : (booking.hotel?.name || "Hotel Reservation");

        const locationStr = isTrip
          ? (booking.package?.destination || "Scenic Tour")
          : (booking.hotel?.location?.address || `${booking.hotel?.location?.city || "Destination"}, India`);

        doc.fillColor(darkColor)
          .fontSize(11)
          .font("Helvetica-Bold")
          .text(itemName, 40, doc.y);

        doc.fillColor(grayColor)
          .fontSize(9)
          .font("Helvetica")
          .text(locationStr, 40, doc.y + 2);

        doc.y += 15;

        // Details grid
        const gridY = doc.y;
        doc.rect(40, gridY, 515, 65).lineWidth(1).strokeColor("#E2E8F0").stroke();

        const formatDate = (date) =>
          date ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

        if (!isTrip) {
          // Hotel specifics
          doc.fontSize(9).font("Helvetica").fillColor(grayColor)
            .text("ROOM TYPE", 55, gridY + 10)
            .text("CHECK-IN", 185, gridY + 10)
            .text("CHECK-OUT", 315, gridY + 10)
            .text("NIGHTS & ROOMS", 440, gridY + 10);

          const roomName = booking.room?.name || booking.room?.roomType || "Standard Room";
          const nights = booking.priceSnapshot?.nights || 1;
          const rooms = booking.roomsBooked || 1;

          doc.fontSize(10).font("Helvetica-Bold").fillColor(darkColor)
            .text(roomName, 55, gridY + 25, { width: 120 })
            .text(formatDate(booking.checkIn), 185, gridY + 25)
            .text(formatDate(booking.checkOut), 315, gridY + 25)
            .text(`${nights} Night(s) / ${rooms} Room(s)`, 440, gridY + 25);

          doc.fontSize(8).font("Helvetica").fillColor(grayColor)
            .text("Check-in Time: 12:00 PM", 185, gridY + 45)
            .text("Check-out Time: 11:00 AM", 315, gridY + 45);
        } else {
          // Trip package specifics
          doc.fontSize(9).font("Helvetica").fillColor(grayColor)
            .text("PACKAGE TYPE", 55, gridY + 10)
            .text("DEPARTURE DATE", 185, gridY + 10)
            .text("DURATION", 315, gridY + 10)
            .text("TRAVELERS", 440, gridY + 10);

          doc.fontSize(10).font("Helvetica-Bold").fillColor(darkColor)
            .text(booking.package?.packageType || "Holiday Package", 55, gridY + 25)
            .text(formatDate(booking.departureDate), 185, gridY + 25)
            .text(`${booking.package?.duration?.days || 3} Days / ${booking.package?.duration?.nights || 2} Nights`, 315, gridY + 25)
            .text(`${adults + children} Traveler(s)`, 440, gridY + 25);
        }

        doc.y = gridY + 85;

        // ================= PAYMENT & CHARGES BREAKDOWN =================
        doc.fillColor(primaryColor)
          .fontSize(13)
          .font("Helvetica-Bold")
          .text("FARE BREAKDOWN & PAYMENT SUMMARY", 40, doc.y);

        doc.strokeColor("#E2E8F0").lineWidth(1).moveTo(40, doc.y + 4).lineTo(555, doc.y + 4).stroke();
        doc.y += 12;

        const tableTop = doc.y;
        doc.rect(40, tableTop, 515, 24).fill(lightBg);

        doc.fontSize(9).font("Helvetica-Bold").fillColor(darkColor)
          .text("Description", 55, tableTop + 7)
          .text("Rate / Unit", 320, tableTop + 7)
          .text("Amount (INR)", 450, tableTop + 7, { align: "right", width: 90 });

        let currentY = tableTop + 24;
        const snapshot = booking.priceSnapshot || {};
        const basePrice = snapshot.basePrice || (snapshot.totalAmount || 0);
        const totalAmount = snapshot.totalAmount || 0;

        const addRow = (desc, rate, amt, isBold = false) => {
          doc.rect(40, currentY, 515, 22).lineWidth(0.5).strokeColor("#F1F5F9").stroke();
          doc.fontSize(9).font(isBold ? "Helvetica-Bold" : "Helvetica").fillColor(darkColor)
            .text(desc, 55, currentY + 6)
            .text(rate, 320, currentY + 6)
            .text(amt, 450, currentY + 6, { align: "right", width: 90 });
          currentY += 22;
        };

        if (!isTrip) {
          addRow(
            `Room Base Rate (${snapshot.nights || 1} nights x ${booking.roomsBooked || 1} room)`,
            `₹${basePrice.toLocaleString("en-IN")}`,
            `₹${((snapshot.finalPricePerRoom || basePrice) * (snapshot.nights || 1) * (booking.roomsBooked || 1)).toLocaleString("en-IN")}`
          );
        } else {
          addRow(`Package Tour Base Rate (${adults + children} travelers)`, `₹${basePrice.toLocaleString("en-IN")}`, `₹${basePrice.toLocaleString("en-IN")}`);
        }

        addRow("Taxes & Tourism Cess (Included / Calculated)", "-", "Included");

        // Total row
        doc.rect(40, currentY, 515, 30).fill("#EEF2FF");
        doc.fontSize(11).font("Helvetica-Bold").fillColor(primaryColor)
          .text("TOTAL AMOUNT PAID", 55, currentY + 9)
          .text("SUCCESS / PAID", 320, currentY + 9, { characterSpacing: 1 })
          .fillColor(greenColor)
          .text(`₹${totalAmount.toLocaleString("en-IN")}`, 430, currentY + 8, { align: "right", width: 110 });

        currentY += 45;
        doc.y = currentY;

        // ================= IMPORTANT POLICIES & TERMS =================
        doc.fillColor(primaryColor)
          .fontSize(11)
          .font("Helvetica-Bold")
          .text("TERMS & CANCELLATION POLICY", 40, doc.y);

        doc.strokeColor("#E2E8F0").lineWidth(0.5).moveTo(40, doc.y + 4).lineTo(555, doc.y + 4).stroke();
        doc.y += 10;

        doc.fontSize(8).font("Helvetica").fillColor(grayColor)
          .text("• Cancellation Policy: Free cancellation (100% refund) available up to 7 days before check-in/travel date.", 45, doc.y)
          .text("• 50% refund applicable for cancellations between 3 to 7 days prior to scheduled check-in.", 45, doc.y + 12)
          .text("• Non-refundable for cancellations made less than 72 hours before check-in or no-shows.", 45, doc.y + 24)
          .text("• Government Photo ID (Aadhaar / Passport / Driving License) is mandatory for all adult guests at check-in.", 45, doc.y + 36);

        // ================= FOOTER =================
        doc.rect(40, 750, 515, 50).fill(lightBg);
        doc.fontSize(9).font("Helvetica-Bold").fillColor(primaryColor)
          .text("Need Help with Your Journey?", 55, 758)
          .fontSize(8).font("Helvetica").fillColor(grayColor)
          .text("TripNest Customer Care: support@tripnest.com  |  Available 24/7", 55, 772)
          .text("Thank you for choosing TripNest. Wishing you a safe and memorable trip!", 55, 784);

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new BookingPdfService();