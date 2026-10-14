require("dotenv").config();
const bcrypt = require("bcryptjs");
const Database = require("../config/db");
const User = require("../models/user.model");
const { Hotel } = require("../models/hotel.model");
const { Room } = require("../models/room.model");
const { Package } = require("../models/package.model");
const Destination = require("../models/destination.model");
const Coupon = require("../models/coupon.model");
const { Booking } = require("../models/booking.model");
const Payment = require("../models/payment.model");
const Review = require("../models/review.model");
const ROLES = require("../constants/roles");
const ACCOUNT_STATUS = require("../constants/status");

const seedAll = async () => {
  try {
    await Database.connect();
    console.log("Starting full TripNest database seeding...");

    // 1. CLEAR COLLECTIONS FOR FRESH CONSISTENT DATA
    await Promise.all([
      User.deleteMany({}),
      Hotel.deleteMany({}),
      Room.deleteMany({}),
      Package.deleteMany({}),
      Destination.deleteMany({}),
      Coupon.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Review.deleteMany({})
    ]);

    // 2. CREATE USERS FOR ALL 4 ROLES
    const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
    const hotelAdminPasswordHash = await bcrypt.hash("Hotel@123456", 10);
    const tripManagerPasswordHash = await bcrypt.hash("Trip@123456", 10);
    const customerPasswordHash = await bcrypt.hash("Customer@123456", 10);

    const superAdmin = await User.create({
      name: "TripNest Super Admin",
      email: "admin@tripnest.com",
      phone: "+919876543210",
      passwordHash: adminPasswordHash,
      role: ROLES.SUPER_ADMIN,
      status: ACCOUNT_STATUS.ACTIVE,
      emailVerified: true
    });

    const hotelAdmin = await User.create({
      name: "Rajesh Sharma (Hotel Admin)",
      email: "hoteladmin@tripnest.com",
      phone: "+919876543211",
      passwordHash: hotelAdminPasswordHash,
      role: ROLES.HOTEL_ADMIN,
      status: ACCOUNT_STATUS.ACTIVE,
      emailVerified: true
    });

    const tripManager = await User.create({
      name: "Pooja Verma (Trip Manager)",
      email: "tripmanager@tripnest.com",
      phone: "+919876543212",
      passwordHash: tripManagerPasswordHash,
      role: ROLES.TRIP_MANAGER,
      status: ACCOUNT_STATUS.ACTIVE,
      emailVerified: true
    });

    const customer = await User.create({
      name: "Rahul Roy (Customer)",
      email: "customer@tripnest.com",
      phone: "+919876543213",
      passwordHash: customerPasswordHash,
      role: ROLES.CUSTOMER,
      status: ACCOUNT_STATUS.ACTIVE,
      emailVerified: true
    });

    console.log("Users created for all 4 roles successfully.");

    // 3. SEED DESTINATIONS
    const destinationsData = [
      {
        name: "Goa",
        state: "Goa",
        description: "Sun-kissed golden beaches, vibrant nightlife, historic Portuguese cathedrals, and water sports.",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80",
        popular: true
      },
      {
        name: "Manali",
        state: "Himachal Pradesh",
        description: "Snow-capped Himalayan peaks, pine forests, Solang Valley adventures, and Rohtang Pass thrills.",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80",
        popular: true
      },
      {
        name: "Jaipur",
        state: "Rajasthan",
        description: "The magnificent Pink City of grand forts, royal palaces, vibrant bazaars, and rich Rajputana culture.",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1000&q=80",
        popular: true
      },
      {
        name: "Kerala",
        state: "Kerala",
        description: "God's Own Country: tranquil backwaters, lush Munnar tea estates, Ayurvedic wellness, and houseboats.",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80",
        popular: true
      },
      {
        name: "Udaipur",
        state: "Rajasthan",
        description: "The romantic City of Lakes, iconic Lake Pichola, floating palaces, and breathtaking sunset viewpoints.",
        image: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1000&q=80",
        popular: true
      }
    ];

    await Destination.insertMany(destinationsData);
    console.log("Destinations seeded.");

    // 4. SEED HOTELS
    const hotel1 = await Hotel.create({
      name: "The Grand Azure Beachfront Resort",
      description: "Nestled along the pristine sands of Calangute Beach, The Grand Azure offers private beach access, infinity ocean-view pools, multi-cuisine dining, and world-class spa facilities.",
      hotelType: "RESORT",
      owner: hotelAdmin._id,
      location: {
        address: "Calangute Beach Road, North Goa",
        city: "Goa",
        state: "Goa",
        country: "India",
        pincode: "403516",
        coordinates: { latitude: 15.544, longitude: 73.755 }
      },
      amenities: [
        "Free Wi-Fi",
        "Swimming Pool",
        "Beach Access",
        "Spa & Wellness",
        "Restaurant",
        "Air Conditioning",
        "Bar & Lounge",
        "Gym"
      ],
      policies: {
        checkIn: "02:00 PM",
        checkOut: "11:00 AM",
        cancellation: "Free cancellation up to 7 days before check-in",
        childrenAllowed: true,
        petsAllowed: false
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
          publicId: "hotel_azure_1"
        },
        {
          url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
          publicId: "hotel_azure_2"
        },
        {
          url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
          publicId: "hotel_azure_3"
        }
      ],
      rating: 4.8,
      totalReviews: 24,
      status: "APPROVED"
    });

    const hotel2 = await Hotel.create({
      name: "Himalayan Pines Luxury Retreat & Spa",
      description: "Perched gracefully in the majestic cedar forests of Manali with panoramic views of the Pir Panjal mountain range, offering heated suites, bonfire evenings, and pine forest nature trails.",
      hotelType: "HOTEL",
      owner: hotelAdmin._id,
      location: {
        address: "Hadimba Temple Road, Old Manali",
        city: "Manali",
        state: "Himachal Pradesh",
        country: "India",
        pincode: "175131",
        coordinates: { latitude: 32.243, longitude: 77.189 }
      },
      amenities: [
        "Free Wi-Fi",
        "Mountain View",
        "Heated Rooms",
        "Spa",
        "Restaurant",
        "Free Parking",
        "Bonfire Area"
      ],
      policies: {
        checkIn: "12:00 PM",
        checkOut: "10:30 AM",
        cancellation: "Free cancellation up to 5 days before check-in",
        childrenAllowed: true,
        petsAllowed: true
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80",
          publicId: "hotel_pines_1"
        },
        {
          url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
          publicId: "hotel_pines_2"
        }
      ],
      rating: 4.9,
      totalReviews: 18,
      status: "APPROVED"
    });

    const hotel3 = await Hotel.create({
      name: "Royal Rajputana Palace Heritage Stay",
      description: "An authentic 18th-century Rajput palace restored into a luxury heritage hotel. Experience royal hospitality, courtyard folk performances, hand-carved jharokhas, and rooftop candlelit dining.",
      hotelType: "RESORT",
      owner: hotelAdmin._id,
      location: {
        address: "Amer Fort Highway, Civil Lines",
        city: "Jaipur",
        state: "Rajasthan",
        country: "India",
        pincode: "302006",
        coordinates: { latitude: 26.912, longitude: 75.787 }
      },
      amenities: [
        "Free Wi-Fi",
        "Swimming Pool",
        "Heritage Architecture",
        "Royal Dining",
        "Spa",
        "Valet Parking",
        "Air Conditioning"
      ],
      policies: {
        checkIn: "02:00 PM",
        checkOut: "12:00 PM",
        cancellation: "Free cancellation up to 7 days before check-in",
        childrenAllowed: true,
        petsAllowed: false
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
          publicId: "hotel_jaipur_1"
        },
        {
          url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
          publicId: "hotel_jaipur_2"
        }
      ],
      rating: 4.7,
      totalReviews: 32,
      status: "APPROVED"
    });

    const hotel4 = await Hotel.create({
      name: "Kerala Backwater Palm Lagoon Villa",
      description: "Floating tranquil paradise on the serene banks of Vembanad Lake in Alleppey. Featuring private sundecks, traditional thatched roofs, authentic Kerala seafood, and Ayurvedic massage therapies.",
      hotelType: "VILLA",
      owner: hotelAdmin._id,
      location: {
        address: "Punnamada Lakefront, Alleppey",
        city: "Kerala",
        state: "Kerala",
        country: "India",
        pincode: "688006",
        coordinates: { latitude: 9.498, longitude: 76.338 }
      },
      amenities: [
        "Free Wi-Fi",
        "Lake View",
        "Ayurvedic Spa",
        "Restaurant",
        "Boating Facilities",
        "Air Conditioning"
      ],
      policies: {
        checkIn: "01:00 PM",
        checkOut: "11:00 AM",
        cancellation: "Free cancellation up to 7 days before arrival",
        childrenAllowed: true,
        petsAllowed: false
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80",
          publicId: "hotel_kerala_1"
        },
        {
          url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
          publicId: "hotel_kerala_2"
        }
      ],
      rating: 4.9,
      totalReviews: 15,
      status: "APPROVED"
    });

    console.log("Hotels seeded.");

    // 5. SEED ROOMS
    const rooms = await Room.insertMany([
      // Hotel 1 (Goa)
      {
        hotel: hotel1._id,
        roomType: "DELUXE",
        name: "Deluxe Ocean View Room",
        description: "Spacious contemporary room with private balcony overlooking the Arabian Sea, king plush bed, and rainfall shower.",
        basePrice: 4200,
        discountPercentage: 10,
        finalPrice: 3780,
        capacity: { adults: 2, children: 1 },
        beds: "1 King Bed",
        totalRooms: 12,
        amenities: ["Ocean Balcony", "Air Conditioning", "Free High-Speed Wi-Fi", "Mini Bar", "Smart LED TV", "Tea/Coffee Maker"],
        images: [{ url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80", publicId: "room_goa_1" }],
        status: "ACTIVE"
      },
      {
        hotel: hotel1._id,
        roomType: "SUITE",
        name: "Executive Beachfront Luxury Suite",
        description: "Opulent suite with separate living parlor, ocean-view Jacuzzi, butler service, and complimentary cocktail hours.",
        basePrice: 7500,
        discountPercentage: 15,
        finalPrice: 6375,
        capacity: { adults: 3, children: 1 },
        beds: "1 Super King Bed",
        totalRooms: 6,
        amenities: ["Private Jacuzzi", "Living Room", "Ocean Balcony", "Free Wi-Fi", "Espresso Machine", "Bathtub"],
        images: [{ url: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80", publicId: "room_goa_2" }],
        status: "ACTIVE"
      },
      // Hotel 2 (Manali)
      {
        hotel: hotel2._id,
        roomType: "DELUXE",
        name: "Pine Forest Deluxe Chalet",
        description: "Warm wooden-interior chalet with panoramic Himalayan snow views, radiant fireplace, and heated down duvets.",
        basePrice: 3800,
        discountPercentage: 10,
        finalPrice: 3420,
        capacity: { adults: 2, children: 1 },
        beds: "1 Queen Bed",
        totalRooms: 10,
        amenities: ["Fireplace", "Mountain View Balcony", "Room Heating", "Free Wi-Fi", "Electric Kettle"],
        images: [{ url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80", publicId: "room_manali_1" }],
        status: "ACTIVE"
      },
      // Hotel 3 (Jaipur)
      {
        hotel: hotel3._id,
        roomType: "SUPER_DELUXE",
        name: "Royal Heritage Courtyard Room",
        description: "Traditional Rajasthani hand-painted fresco walls, antique carved furniture, four-poster bed, and garden view.",
        basePrice: 5000,
        discountPercentage: 10,
        finalPrice: 4500,
        capacity: { adults: 2, children: 1 },
        beds: "1 Four-Poster King Bed",
        totalRooms: 8,
        amenities: ["Courtyard View", "Air Conditioning", "Free Wi-Fi", "Royal Bath Tub", "Heritage Decor"],
        images: [{ url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80", publicId: "room_jaipur_1" }],
        status: "ACTIVE"
      },
      // Hotel 4 (Kerala)
      {
        hotel: hotel4._id,
        roomType: "FAMILY",
        name: "Lakeside Thatched Waterfront Cottage",
        description: "Private cottage right on the edge of the lake with personal sun deck, wooden verandah, and refreshing breeze.",
        basePrice: 4800,
        discountPercentage: 10,
        finalPrice: 4320,
        capacity: { adults: 2, children: 2 },
        beds: "1 King Bed + 1 Day Bed",
        totalRooms: 7,
        amenities: ["Lake Sundeck", "Air Conditioning", "Free Wi-Fi", "Open-to-Sky Shower", "Hammock"],
        images: [{ url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", publicId: "room_kerala_1" }],
        status: "ACTIVE"
      }
    ]);

    console.log("Rooms seeded.");

    // 6. SEED HOLIDAY PACKAGES WITH DAY-WISE ITINERARIES
    const packages = await Package.insertMany([
      {
        title: "Mesmerizing Goa Beach & Sunset Cruise Vacation",
        destination: "Goa",
        description: "Experience the vibrant beach culture of Goa, thrilling water sports at Baga, historical exploration of Fort Aguada, and a scenic luxury sunset river cruise on the Mandovi.",
        duration: { days: 4, nights: 3 },
        startingPrice: 14999,
        capacity: 30,
        availableSeats: 26,
        packageType: "beach",
        images: [
          { url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80", publicId: null },
          { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", publicId: null }
        ],
        inclusions: [
          "3 Nights 4-Star Resort Accommodation",
          "Daily Buffet Breakfast & 1 Welcome Dinner",
          "Mandovi River Sunset Cruise Tickets",
          "AC Vehicle Sightseeing & Airport Pick/Drop",
          "All Toll, Parking & Taxes"
        ],
        exclusions: [
          "Airfare / Train tickets",
          "Water sports personal activities fees",
          "Lunch and alcoholic beverages",
          "Personal expenses"
        ],
        cancellationPolicy: "100% refund up to 7 days before departure. 50% refund between 3 to 7 days.",
        departureDates: [
          new Date(Date.now() + 5 * 86400000),
          new Date(Date.now() + 12 * 86400000),
          new Date(Date.now() + 19 * 86400000),
          new Date(Date.now() + 26 * 86400000)
        ],
        itinerary: [
          {
            dayNumber: 1,
            title: "Arrival in Goa & Beach Relaxation",
            description: "Arrival at Goa Dabolim/MOPA airport or railway station. Private transfer to resort. Check-in and relax by the pool. Evening walk on Calangute Beach followed by beach shacks dinner.",
            sightseeing: ["Calangute Beach", "Tito's Lane", "Local Market"],
            meals: ["Welcome Drink", "Dinner"],
            hotelInfo: "The Grand Azure Beachfront Resort",
            transportation: "Private AC Cab from Airport to Resort"
          },
          {
            dayNumber: 2,
            title: "North Goa Sightseeing & Water Sports",
            description: "Head to Baga & Anjuna beaches for exciting parasailing, jet skiing, and banana boat rides. Visit historic 17th-century Fort Aguada and Chapora Fort overlooking the coastline.",
            sightseeing: ["Fort Aguada", "Chapora Fort", "Baga Beach", "Anjuna Flea Market"],
            meals: ["Breakfast"],
            hotelInfo: "The Grand Azure Beachfront Resort",
            transportation: "Full-day AC Sightseeing Vehicle"
          },
          {
            dayNumber: 3,
            title: "South Goa Heritage & Mandovi Sunset Cruise",
            description: "Explore the UNESCO World Heritage Basilica of Bom Jesus, Se Cathedral, Mangueshi Temple, and Miramar Beach. In the evening, enjoy a 1-hour festive Goan folk dance cruise on Mandovi River.",
            sightseeing: ["Basilica of Bom Jesus", "Se Cathedral", "Mandovi River Cruise", "Miramar Beach"],
            meals: ["Breakfast"],
            hotelInfo: "The Grand Azure Beachfront Resort",
            transportation: "Full-day AC Sightseeing Vehicle"
          },
          {
            dayNumber: 4,
            title: "Souvenir Shopping & Departure",
            description: "Enjoy breakfast at the resort. Free time for buying Goan feni, cashews, and handicrafts at Panaji market. Transfer to airport with joyful holiday memories.",
            sightseeing: ["Panaji Latin Quarter (Fontainhas)"],
            meals: ["Breakfast"],
            hotelInfo: "Checkout",
            transportation: "Private transfer to airport"
          }
        ],
        manager: tripManager._id,
        rating: 4.8,
        totalReviews: 12,
        status: "ACTIVE",
        featured: true
      },
      {
        title: "Scenic Himachal & Solang Valley Snow Explorer",
        destination: "Manali",
        description: "Immerse in the alpine paradise of Himachal Pradesh. Snow activities in Solang Valley, drive to Atal Tunnel, serene Hadimba Devi Temple, and riverside trout dining.",
        duration: { days: 5, nights: 4 },
        startingPrice: 18999,
        capacity: 25,
        availableSeats: 21,
        packageType: "adventure",
        images: [
          { url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80", publicId: null },
          { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", publicId: null }
        ],
        inclusions: [
          "4 Nights Premium Hotel Stay in Manali",
          "Breakfast & Dinner included daily",
          "Solang Valley and Atal Tunnel excursion",
          "Dedicated Private SUV for sightseeing",
          "Bonfire evening with Himachali music"
        ],
        exclusions: [
          "Rohtang Pass NGT permit fee (optional add-on)",
          "Adventure activities (paragliding, zorbing, ATV)",
          "Tips, laundry and personal expenses"
        ],
        cancellationPolicy: "100% refund up to 7 days before departure. 50% between 3 to 7 days.",
        departureDates: [
          new Date(Date.now() + 8 * 86400000),
          new Date(Date.now() + 15 * 86400000),
          new Date(Date.now() + 22 * 86400000)
        ],
        itinerary: [
          {
            dayNumber: 1,
            title: "Arrival in Manali & Old Manali Stroll",
            description: "Arrival at Manali Volvo stand. Transfer to hotel, check-in, rest and acclimatize. Evening leisure walk on the vibrant Mall Road and Old Manali riverside cafes.",
            sightseeing: ["Mall Road", "Club House", "Beas River Promenade"],
            meals: ["Dinner"],
            hotelInfo: "Himalayan Pines Luxury Retreat",
            transportation: "Private SUV transfer"
          },
          {
            dayNumber: 2,
            title: "Local Manali Sights & Hadimba Temple",
            description: "Visit the 450-year-old pagoda-style Hadimba Temple surrounded by towering deodars. Explore Vashisht Village, soak in natural sulfur hot springs, and visit Tibetan Monastery.",
            sightseeing: ["Hadimba Temple", "Vashisht Hot Springs", "Tibetan Monastery", "Van Vihar"],
            meals: ["Breakfast", "Dinner"],
            hotelInfo: "Himalayan Pines Luxury Retreat",
            transportation: "Private SUV sightseeing"
          },
          {
            dayNumber: 3,
            title: "Solang Valley Adventure & Atal Tunnel",
            description: "Drive through the engineering marvel of Atal Tunnel into Lahaul Valley. Stop at Solang Valley for thrilling paragliding, skiing, and snow scooter rides.",
            sightseeing: ["Solang Valley", "Atal Tunnel", "Sissu Waterfall"],
            meals: ["Breakfast", "Dinner"],
            hotelInfo: "Himalayan Pines Luxury Retreat",
            transportation: "Private SUV excursion"
          },
          {
            dayNumber: 4,
            title: "Naggar Castle & Heritage Art Gallery",
            description: "Excursion to the 15th-century wood and stone Naggar Castle overlooking the valley. Visit Roerich Art Gallery and enjoy a cozy Himalayan bonfire dinner.",
            sightseeing: ["Naggar Castle", "Nicholas Roerich Gallery", "Trout Fish Farm"],
            meals: ["Breakfast", "Dinner"],
            hotelInfo: "Himalayan Pines Luxury Retreat",
            transportation: "Private SUV sightseeing"
          },
          {
            dayNumber: 5,
            title: "Departure with Himalayan Memories",
            description: "Breakfast at the resort with snow peak views. Last-minute shawl and souvenir shopping at Tibetan market. Board return Volvo or transfer to Kullu airport.",
            sightseeing: ["Tibetan Handicrafts Market"],
            meals: ["Breakfast"],
            hotelInfo: "Checkout",
            transportation: "Private drop to station"
          }
        ],
        manager: tripManager._id,
        rating: 4.9,
        totalReviews: 8,
        status: "ACTIVE",
        featured: true
      },
      {
        title: "Royal Rajasthan: Jaipur & Udaipur Palace Tour",
        destination: "Jaipur",
        description: "Travel through the royal lands of Rajputana kings. Marvel at Amber Fort, Hawa Mahal, Lake Pichola boat cruises, and exquisite royal gastronomy.",
        duration: { days: 5, nights: 4 },
        startingPrice: 24999,
        capacity: 20,
        availableSeats: 16,
        packageType: "luxury",
        images: [
          { url: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80", publicId: null },
          { url: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80", publicId: null }
        ],
        inclusions: [
          "2 Nights in Jaipur Heritage Hotel, 2 Nights in Udaipur Lake Hotel",
          "Daily Royal Breakfast & Authentic Thali Dinners",
          "Private AC Sedan/SUV for entire circuit",
          "Sunset Boat Cruise on Lake Pichola",
          "Licensed English & Hindi Speaking Tour Guide"
        ],
        exclusions: [
          "Monument entry tickets and camera fees",
          "Lunch and personal drinks",
          "Tips to guides and drivers"
        ],
        cancellationPolicy: "100% refund up to 7 days before departure.",
        departureDates: [
          new Date(Date.now() + 10 * 86400000),
          new Date(Date.now() + 20 * 86400000)
        ],
        itinerary: [
          {
            dayNumber: 1,
            title: "Arrival in Pink City Jaipur",
            description: "Warm welcome with traditional garland at Jaipur. Transfer to heritage hotel. Evening visit to the vibrant Birla Mandir and Chokhi Dhani ethnic village.",
            sightseeing: ["Birla Mandir", "Chokhi Dhani Folk Village"],
            meals: ["Welcome Drink", "Dinner"],
            hotelInfo: "Royal Rajputana Palace Heritage Stay",
            transportation: "Private AC Car"
          },
          {
            dayNumber: 2,
            title: "Forts & Palaces of Jaipur",
            description: "Ascend the iconic Amber Fort with mirror-work Sheesh Mahal. Photo stop at the wind palace Hawa Mahal, and explore City Palace museum and Jantar Mantar observatory.",
            sightseeing: ["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar"],
            meals: ["Breakfast", "Dinner"],
            hotelInfo: "Royal Rajputana Palace Heritage Stay",
            transportation: "Private AC Car"
          },
          {
            dayNumber: 3,
            title: "Jaipur to Udaipur via Chittorgarh",
            description: "Scenic road journey to Udaipur with stopover at heroic Chittorgarh Fort, the largest fort complex in India. Arrive in Udaipur by evening for dinner by the lake.",
            sightseeing: ["Chittorgarh Fort", "Vijay Stambh"],
            meals: ["Breakfast", "Dinner"],
            hotelInfo: "Lake Pichola Heritage Hotel",
            transportation: "Private AC Highway Drive"
          },
          {
            dayNumber: 4,
            title: "Udaipur City Palace & Sunset Boat Cruise",
            description: "Visit the grand City Palace overlooking Lake Pichola. Stroll through the royal gardens of Saheliyon Ki Bari, followed by a romantic sunset boat cruise around Jag Mandir.",
            sightseeing: ["City Palace Udaipur", "Jag Mandir Island", "Saheliyon Ki Bari", "Bagore Ki Haveli"],
            meals: ["Breakfast", "Dinner"],
            hotelInfo: "Lake Pichola Heritage Hotel",
            transportation: "Private AC Car"
          },
          {
            dayNumber: 5,
            title: "Departure from Udaipur",
            description: "Breakfast at the lakeside restaurant. Free time for miniature painting and leather craft shopping. Transfer to Udaipur airport or railway station.",
            sightseeing: ["Hathi Pol Art Market"],
            meals: ["Breakfast"],
            hotelInfo: "Checkout",
            transportation: "Private transfer to airport"
          }
        ],
        manager: tripManager._id,
        rating: 4.8,
        totalReviews: 6,
        status: "ACTIVE",
        featured: true
      },
      {
        title: "Kerala Backwaters & Munnar Tea Plantation Bliss",
        destination: "Kerala",
        description: "Discover serene palm-fringed backwaters and misty rolling hills of tea in Munnar. Indulge in an exclusive overnight houseboat stay with freshly cooked Karimeen fish.",
        duration: { days: 4, nights: 3 },
        startingPrice: 17500,
        capacity: 20,
        availableSeats: 18,
        packageType: "honeymoon",
        images: [
          { url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80", publicId: null },
          { url: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80", publicId: null }
        ],
        inclusions: [
          "2 Nights Munnar Luxury Tea Resort + 1 Night Deluxe Alleppey Houseboat",
          "All Meals on Houseboat (Lunch, Evening Tea/Snacks, Dinner, Breakfast)",
          "Tea Garden Safari and Spice Plantation Walk",
          "Private AC Cab for airport pick-up, drop, and all transfers"
        ],
        exclusions: [
          "Kathakali cultural show ticket",
          "Ayurvedic massage charges",
          "Personal expenses"
        ],
        cancellationPolicy: "100% refund up to 7 days before departure.",
        departureDates: [
          new Date(Date.now() + 6 * 86400000),
          new Date(Date.now() + 16 * 86400000)
        ],
        itinerary: [
          {
            dayNumber: 1,
            title: "Cochin Arrival & Scenic Munnar Drive",
            description: "Pick-up from Cochin Airport. Drive through emerald green Western Ghats with photo stops at Cheeyappara and Valara waterfalls. Check into Munnar tea resort.",
            sightseeing: ["Cheeyappara Waterfalls", "Valara Waterfalls", "Tea Garden Viewpoints"],
            meals: ["Dinner"],
            hotelInfo: "Munnar Misty Hills Resort",
            transportation: "Private AC Cab"
          },
          {
            dayNumber: 2,
            title: "Munnar Tea Gardens & Eravikulam National Park",
            description: "Spot the endangered Nilgiri Tahr at Eravikulam National Park. Visit Tata Tea Museum, Mattupetty Dam, and Echo Point. Enjoy aromatic spice shopping in the evening.",
            sightseeing: ["Eravikulam National Park", "Tea Museum", "Mattupetty Dam", "Echo Point"],
            meals: ["Breakfast", "Dinner"],
            hotelInfo: "Munnar Misty Hills Resort",
            transportation: "Private AC Cab"
          },
          {
            dayNumber: 3,
            title: "Munnar to Alleppey Luxury Houseboat",
            description: "Drive down to Alleppey. Board your traditional Kerala Kettuvallam houseboat by 12:00 PM. Cruise through enchanting canals, paddy fields, and lagoons while enjoying authentic Kerala cuisine.",
            sightseeing: ["Alleppey Backwaters", "Vembanad Lake", "Paddy Village Canals"],
            meals: ["Breakfast", "Lunch", "Evening Snacks", "Dinner"],
            hotelInfo: "Deluxe AC Alleppey Houseboat",
            transportation: "Private AC Cab & Houseboat Cruise"
          },
          {
            dayNumber: 4,
            title: "Houseboat Check-out & Cochin Departure",
            description: "Morning cruise with sunrise tea. Disembark houseboat at 9:00 AM. Stop at Fort Kochi Chinese fishing nets and Jewish Synagogue before transfer to Cochin airport.",
            sightseeing: ["Fort Kochi", "Chinese Fishing Nets"],
            meals: ["Breakfast"],
            hotelInfo: "Checkout",
            transportation: "Private drop to Cochin Airport"
          }
        ],
        manager: tripManager._id,
        rating: 4.9,
        totalReviews: 10,
        status: "ACTIVE",
        featured: true
      }
    ]);

    console.log("Holiday packages seeded.");

    // 7. SEED PROMOTIONAL COUPONS
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);

    const coupons = await Coupon.insertMany([
      {
        code: "WELCOME500",
        type: "FIXED",
        value: 500,
        minAmount: 2500,
        maxDiscount: 500,
        expiry: futureDate,
        usageLimit: 500,
        usageCount: 12,
        isActive: true
      },
      {
        code: "TRIPNEST10",
        type: "PERCENTAGE",
        value: 10,
        minAmount: 4000,
        maxDiscount: 2000,
        expiry: futureDate,
        usageLimit: 200,
        usageCount: 45,
        isActive: true
      },
      {
        code: "SUMMER2026",
        type: "FIXED",
        value: 1500,
        minAmount: 10000,
        maxDiscount: 1500,
        expiry: futureDate,
        usageLimit: 100,
        usageCount: 8,
        isActive: true
      }
    ]);

    console.log("Coupons seeded.");

    // 8. SEED SAMPLE CONFIRMED BOOKINGS & PAYMENTS
    const checkInDate = new Date(Date.now() + 10 * 86400000);
    const checkOutDate = new Date(Date.now() + 13 * 86400000);

    const booking1 = await Booking.create({
      bookingNumber: "TN-BK-2026-9001",
      user: customer._id,
      bookingType: "HOTEL",
      hotel: hotel1._id,
      room: rooms[0]._id,
      traveler: {
        name: "Rahul Roy",
        email: "customer@tripnest.com",
        phone: "+919876543213"
      },
      checkIn: checkInDate,
      checkOut: checkOutDate,
      roomsBooked: 1,
      guests: { adults: 2, children: 1 },
      coupon: "WELCOME500",
      couponDiscount: 500,
      priceSnapshot: {
        basePrice: 4200,
        discountPercentage: 10,
        finalPricePerRoom: 3780,
        nights: 3,
        totalAmount: 10840
      },
      status: "CONFIRMED"
    });

    const payment1 = await Payment.create({
      booking: booking1._id,
      user: customer._id,
      amount: 10840,
      currency: "INR",
      razorpayOrderId: "order_seed_9001",
      razorpayPaymentId: "pay_seed_9001",
      razorpaySignature: "sig_seed_9001",
      status: "SUCCESS",
      paidAt: new Date(Date.now() - 2 * 86400000)
    });

    // Sample Trip Booking
    const booking2 = await Booking.create({
      bookingNumber: "TN-TR-2026-9002",
      user: customer._id,
      bookingType: "TRIP",
      package: packages[0]._id,
      departureDate: new Date(Date.now() + 15 * 86400000),
      traveler: {
        name: "Rahul Roy",
        email: "customer@tripnest.com",
        phone: "+919876543213"
      },
      guests: { adults: 2, children: 0 },
      coupon: "TRIPNEST10",
      couponDiscount: 2000,
      priceSnapshot: {
        basePrice: 14999,
        discountPercentage: 0,
        finalPricePerRoom: 14999,
        nights: 3,
        totalAmount: 27998
      },
      status: "CONFIRMED"
    });

    const payment2 = await Payment.create({
      booking: booking2._id,
      user: customer._id,
      amount: 27998,
      currency: "INR",
      razorpayOrderId: "order_seed_9002",
      razorpayPaymentId: "pay_seed_9002",
      razorpaySignature: "sig_seed_9002",
      status: "SUCCESS",
      paidAt: new Date(Date.now() - 1 * 86400000)
    });

    // 9. SEED REVIEWS
    await Review.insertMany([
      {
        user: customer._id,
        booking: booking1._id,
        hotel: hotel1._id,
        rating: 5,
        comment: "Outstanding beachfront experience! The infinity pool and the ocean view from the deluxe room were breathtaking. Highly recommend TripNest for hotel bookings!",
        status: "APPROVED"
      },
      {
        user: customer._id,
        booking: booking2._id,
        package: packages[0]._id,
        rating: 5,
        comment: "The Goa beach package was exceptionally curated! The Mandovi river cruise and Fort Aguada sightseeing were seamless. Great tour management by Pooja!",
        status: "APPROVED"
      }
    ]);

    console.log("Sample bookings, payments, and reviews seeded.");
   
    console.log("TripNest database seeded successfully!");
    
    console.log("Demo Credentials:");
    console.log("1. Super Admin:  admin@tripnest.com      / Admin@123456");
    console.log("2. Hotel Admin:  hoteladmin@tripnest.com / Hotel@123456");
    console.log("3. Trip Manager: tripmanager@tripnest.com/ Trip@123456");
    console.log("4. Customer:     customer@tripnest.com   / Customer@123456");
    
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed with error:", err);
    process.exit(1);
  }
};

seedAll();
