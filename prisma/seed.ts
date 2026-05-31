import { PrismaClient, UserRole, CommunityType, ItemType, ItemCondition, ItemStatus, BookingStatus, PaymentStatus, ReportStatus } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import * as bcrypt from "bcryptjs"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required")
}
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Starting database seeding...")

  // 1. Clean existing database records (in reverse dependency order to avoid foreign key violations)
  console.log("Clearing existing data...")
  await prisma.favorite.deleteMany()
  await prisma.report.deleteMany()
  await prisma.review.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.message.deleteMany()
  await prisma.itemImage.deleteMany()
  await prisma.item.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.community.deleteMany()
  console.log("Database cleared.")

  // 2. Create Communities
  console.log("Creating communities...")
  const communityUni = await prisma.community.create({
    data: {
      name: "Chulalongkorn University",
      type: CommunityType.UNIVERSITY,
      location: "Phaya Thai Rd, Pathum Wan, Bangkok",
    },
  })

  const communityDorm = await prisma.community.create({
    data: {
      name: "CU I-House",
      type: CommunityType.DORM,
      location: "Chula Soi 9, Charoen Mueang Rd, Bangkok",
    },
  })

  const communityCondo = await prisma.community.create({
    data: {
      name: "Ideo Mobi Condo",
      type: CommunityType.CONDO,
      location: "Phaya Thai BTS Station, Bangkok",
    },
  })

  const communityComm = await prisma.community.create({
    data: {
      name: "Ari Neighborhood Community",
      type: CommunityType.COMMUNITY,
      location: "Ari Soi 1-5, Phahonyothin Rd, Bangkok",
    },
  })

  // 3. Create Categories
  console.log("Creating categories...")
  const categoriesList = [
    { name: "เฟอร์นิเจอร์" },
    { name: "อิเล็กทรอนิกส์" },
    { name: "หนังสือ" },
    { name: "เครื่องครัว" },
    { name: "กีฬา" },
    { name: "เสื้อผ้า" },
    { name: "กล้องและอุปกรณ์" },
    { name: "อื่นๆ" },
  ]

  const categories: Record<string, any> = {}
  for (const cat of categoriesList) {
    const createdCat = await prisma.category.create({
      data: cat,
    })
    categories[cat.name] = createdCat
  }

  // 4. Create Users (hashed passwords)
  console.log("Creating users...")
  const adminPasswordHash = await bcrypt.hash("admin1234", 10)
  const memberPasswordHash = await bcrypt.hash("member123", 10)

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@rentloop.com",
      name: "System Admin",
      passwordHash: adminPasswordHash,
      phone: "0812345678",
      role: UserRole.ADMIN,
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
    },
  })

  // Create Members
  const member1 = await prisma.user.create({
    data: {
      email: "somchai@rentloop.com",
      name: "Somchai Dev",
      passwordHash: memberPasswordHash,
      phone: "0898765432",
      role: UserRole.MEMBER,
      communityId: communityCondo.id,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=somchai",
    },
  })

  const member2 = await prisma.user.create({
    data: {
      email: "suda@rentloop.com",
      name: "Suda Kaew",
      passwordHash: memberPasswordHash,
      phone: "0823456789",
      role: UserRole.MEMBER,
      communityId: communityUni.id,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=suda",
    },
  })

  const member3 = await prisma.user.create({
    data: {
      email: "john@rentloop.com",
      name: "John Smith",
      passwordHash: memberPasswordHash,
      phone: "0834567890",
      role: UserRole.MEMBER,
      communityId: communityDorm.id,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    },
  })

  const member4 = await prisma.user.create({
    data: {
      email: "nattapong@rentloop.com",
      name: "Nattapong P.",
      passwordHash: memberPasswordHash,
      phone: "0845678901",
      role: UserRole.MEMBER,
      communityId: communityComm.id,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=nattapong",
    },
  })

  const member5 = await prisma.user.create({
    data: {
      email: "pitcha@rentloop.com",
      name: "Pitcha O.",
      passwordHash: memberPasswordHash,
      phone: "0856789012",
      role: UserRole.MEMBER,
      communityId: communityUni.id,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=pitcha",
    },
  })

  const members = [member1, member2, member3, member4, member5]

  // 5. Create 20 Items (Mix of SALE, RENTAL, BOTH)
  console.log("Creating 20 items...")
  const itemData = [
    {
      title: "Sofa Bed 3-Seater Gray",
      description: "โซฟาเบดสีเทา 3 ที่นั่ง สภาพดี ปรับเอนนอนได้ นุ่มสบายมากๆ ซื้อมาได้ 1 ปี",
      type: ItemType.SALE,
      price: 4500.0,
      rentalPricePerDay: null,
      depositAmount: null,
      condition: ItemCondition.GOOD,
      status: ItemStatus.AVAILABLE,
      ownerId: member1.id,
      categoryId: categories["เฟอร์นิเจอร์"].id,
      communityId: communityCondo.id,
      pickupLocation: "Lobby Ideo Mobi Condo, Phaya Thai",
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
    },
    {
      title: "PlayStation 5 (Disc Edition)",
      description: "เครื่อง PS5 รุ่นใส่แผ่นได้ พร้อมจอย DualSense 2 ตัว และเกมฟุตบอล 1 เกม",
      type: ItemType.RENTAL,
      price: null,
      rentalPricePerDay: 350.0,
      depositAmount: 2000.0,
      condition: ItemCondition.LIKE_NEW,
      status: ItemStatus.AVAILABLE,
      ownerId: member2.id,
      categoryId: categories["อิเล็กทรอนิกส์"].id,
      communityId: communityUni.id,
      pickupLocation: "ตึกคณะวิศวกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
      imageUrl: "https://images.unsplash.com/photo-1606813907291-d86edd9b72ad?w=500",
    },
    {
      title: "Calculus 1 Textbook (Thomas Calculus)",
      description: "หนังสือแคลคูลัส 1 สภาพ 95% แทบไม่มีรอยขีดเขียน เหมาะสำหรับนิสิตชั้นปีที่ 1",
      type: ItemType.BOTH,
      price: 300.0,
      rentalPricePerDay: 20.0,
      depositAmount: 100.0,
      condition: ItemCondition.LIKE_NEW,
      status: ItemStatus.AVAILABLE,
      ownerId: member3.id,
      categoryId: categories["หนังสือ"].id,
      communityId: communityDorm.id,
      pickupLocation: "CU I-House Lobby",
      imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500",
    },
    {
      title: "Philips Air Fryer XL",
      description: "หม้อทอดไร้น้ำมันขนาดใหญ่ ทำอาหารได้ง่าย สภาพใหม่ ใช้งานไป 2 ครั้งถ้วน",
      type: ItemType.RENTAL,
      price: null,
      rentalPricePerDay: 80.0,
      depositAmount: 500.0,
      condition: ItemCondition.LIKE_NEW,
      status: ItemStatus.AVAILABLE,
      ownerId: member4.id,
      categoryId: categories["เครื่องครัว"].id,
      communityId: communityComm.id,
      pickupLocation: "หน้าร้านคาเฟ่ใกล้ BTS อารีย์",
      imageUrl: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=500",
    },
    {
      title: "Java Road Bike Pro 2024",
      description: "จักรยานเสือหมอบ Java ไซส์ 50 เกียร์ 18 สปีด ปรับเบาะและแฮนด์แล้ว ขี่สนุกมาก",
      type: ItemType.RENTAL,
      price: null,
      rentalPricePerDay: 250.0,
      depositAmount: 1500.0,
      condition: ItemCondition.GOOD,
      status: ItemStatus.AVAILABLE,
      ownerId: member5.id,
      categoryId: categories["กีฬา"].id,
      communityId: communityUni.id,
      pickupLocation: "สนามกีฬากลาง จุฬาฯ",
      imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500",
    },
    {
      title: "North Face Winter Jacket (Unisex L)",
      description: "เสื้อกันหนาวขนเป็ดสีดำ แบรนด์แท้ อุ่นมาก เหมาะสำหรับคนไปเที่ยวอุณหภูมิติดลบ",
      type: ItemType.SALE,
      price: 1200.0,
      rentalPricePerDay: null,
      depositAmount: null,
      condition: ItemCondition.GOOD,
      status: ItemStatus.AVAILABLE,
      ownerId: member1.id,
      categoryId: categories["เสื้อผ้า"].id,
      communityId: communityCondo.id,
      pickupLocation: "Lobby Ideo Mobi Condo",
      imageUrl: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=500",
    },
    {
      title: "Sony Alpha A7 III Camera Body",
      description: "กล้องฟูลเฟรมยอดฮิต มีแต่บอดี้ (ไม่มีเลนส์ให้) มีแบตแท้ 2 ก้อน และแท่นชาร์จคู่",
      type: ItemType.RENTAL,
      price: null,
      rentalPricePerDay: 600.0,
      depositAmount: 5000.0,
      condition: ItemCondition.GOOD,
      status: ItemStatus.RENTED, // active booking
      ownerId: member2.id,
      categoryId: categories["กล้องและอุปกรณ์"].id,
      communityId: communityUni.id,
      pickupLocation: "คณะนิเทศศาสตร์ จุฬาฯ",
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
    },
    {
      title: "Xiaomi Electric Scooter Pro 2",
      description: "สกู๊ตเตอร์ไฟฟ้าพับได้ วิ่งได้ไกล 45 กม. ความเร็วสูงสุด 25 กม./ชม. มีรอยขีดข่วนเล็กน้อย",
      type: ItemType.BOTH,
      price: 8000.0,
      rentalPricePerDay: 150.0,
      depositAmount: 1000.0,
      condition: ItemCondition.GOOD,
      status: ItemStatus.AVAILABLE,
      ownerId: member3.id,
      categoryId: categories["อื่นๆ"].id,
      communityId: communityDorm.id,
      pickupLocation: "หน้าตึก CU I-House",
      imageUrl: "https://images.unsplash.com/photo-1608613375879-fc4410296431?w=500",
    },
    {
      title: "Timemore Chestnut C3 Manual Coffee Grinder",
      description: "เครื่องบดกาแฟมือหมุน ปรับระดับความละเอียดได้ดีมาก เฟืองบดเหล็กทนทาน บดกาแฟหอมฟุ้ง",
      type: ItemType.SALE,
      price: 1500.0,
      rentalPricePerDay: null,
      depositAmount: null,
      condition: ItemCondition.NEW,
      status: ItemStatus.SOLD, // already sold
      ownerId: member4.id,
      categoryId: categories["เครื่องครัว"].id,
      communityId: communityComm.id,
      pickupLocation: "BTS Ari Station Exit 3",
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500",
    },
    {
      title: "Nintendo Switch (OLED Model)",
      description: "เครื่องเกมพกพาจอ OLED สีขาว สวยคมชัด พร้อมกระเป๋าใส่พกพาและอุปกรณ์ครบกล่อง",
      type: ItemType.RENTAL,
      price: null,
      rentalPricePerDay: 180.0,
      depositAmount: 1000.0,
      condition: ItemCondition.LIKE_NEW,
      status: ItemStatus.AVAILABLE,
      ownerId: member5.id,
      categoryId: categories["อิเล็กทรอนิกส์"].id,
      communityId: communityUni.id,
      pickupLocation: "ศาลาพระเกี้ยว จุฬาฯ",
      imageUrl: "https://images.unsplash.com/photo-1595169001211-40c451f50a62?w=500",
    },
    {
      title: "Ergonomic Office Chair Modus",
      description: "เก้าอี้เพื่อสุขภาพ ปรับความสูง ที่วางแขน และจุดรองรับหลังได้ สบายตลอดวันทำงาน ป้องกันออฟฟิศซินโดรม",
      type: ItemType.SALE,
      price: 2500.0,
      rentalPricePerDay: null,
      depositAmount: null,
      condition: ItemCondition.GOOD,
      status: ItemStatus.AVAILABLE,
      ownerId: member1.id,
      categoryId: categories["เฟอร์นิเจอร์"].id,
      communityId: communityCondo.id,
      pickupLocation: "Lobby Ideo Mobi Condo",
      imageUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500",
    },
    {
      title: "Quechua Camping Tent 4-person (Waterproof)",
      description: "เต็นท์ตั้งแคมป์ยี่ห้อ Quechua ขนาดนอนได้ 4 คน กางและพับง่าย กันฝนได้สบาย",
      type: ItemType.RENTAL,
      price: null,
      rentalPricePerDay: 120.0,
      depositAmount: 600.0,
      condition: ItemCondition.GOOD,
      status: ItemStatus.AVAILABLE,
      ownerId: member2.id,
      categoryId: categories["กีฬา"].id,
      communityId: communityUni.id,
      pickupLocation: "ลานจอดรถใกล้ตึกวิศวะ จุฬาฯ",
      imageUrl: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=500",
    },
    {
      title: "Programming in Go: Hands-on Guide",
      description: "หนังสือภาษา Go เพื่อเรียนรู้แบบลงมือทำ ละเอียดและเข้าใจง่าย เหมาะสำหรับโปรแกรมเมอร์ทุกคน",
      type: ItemType.BOTH,
      price: 450.0,
      rentalPricePerDay: 30.0,
      depositAmount: 150.0,
      condition: ItemCondition.NEW,
      status: ItemStatus.AVAILABLE,
      ownerId: member3.id,
      categoryId: categories["หนังสือ"].id,
      communityId: communityDorm.id,
      pickupLocation: "Lobby CU I-House",
      imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
    },
    {
      title: "Dr. Martens Leather Boots Size 42",
      description: "รองเท้าบูทหนังแท้แบรนด์ดัง เท่ ดุดัน ใส่ขับมอเตอร์ไซค์หรือไปเที่ยว สภาพใช้งานมาพอสมควร",
      type: ItemType.SALE,
      price: 2800.0,
      rentalPricePerDay: null,
      depositAmount: null,
      condition: ItemCondition.FAIR,
      status: ItemStatus.AVAILABLE,
      ownerId: member4.id,
      categoryId: categories["เสื้อผ้า"].id,
      communityId: communityComm.id,
      pickupLocation: "ซอยอารีย์ 2 ใกล้สำนักงานเขต",
      imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500",
    },
    {
      title: "Ring Light 18 inch with Tripod",
      description: "ไฟวงแหวนไลฟ์สด ขนาด 18 นิ้ว ปรับระดับความสว่างและโทนสีได้ พร้อมขาตั้งปรับความสูงได้ถึง 2 เมตร",
      type: ItemType.RENTAL,
      price: null,
      rentalPricePerDay: 50.0,
      depositAmount: 200.0,
      condition: ItemCondition.GOOD,
      status: ItemStatus.AVAILABLE,
      ownerId: member5.id,
      categoryId: categories["กล้องและอุปกรณ์"].id,
      communityId: communityUni.id,
      pickupLocation: "หอพักนิสิตจุฬาฯ",
      imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500",
    },
    {
      title: "Board Game: Catan (Settlers of Catan)",
      description: "บอร์ดเกมสร้างเมืองสุดคลาสสิก อุปกรณ์ครบกล่อง เล่นการ์ดได้สนุกสนาน รองรับผู้เล่น 3-4 คน",
      type: ItemType.BOTH,
      price: 1000.0,
      rentalPricePerDay: 70.0,
      depositAmount: 300.0,
      condition: ItemCondition.GOOD,
      status: ItemStatus.AVAILABLE,
      ownerId: member1.id,
      categoryId: categories["อื่นๆ"].id,
      communityId: communityCondo.id,
      pickupLocation: "Lobby Ideo Mobi Condo",
      imageUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=500",
    },
    {
      title: "Sharp Microwave Oven 20L",
      description: "ไมโครเวฟขนาดความจุ 20 ลิตร ใช้งานง่าย ปรับความร้อนได้ 5 ระดับ อุ่นอาหารได้เร็วทันใจ",
      type: ItemType.SALE,
      price: 1800.0,
      rentalPricePerDay: null,
      depositAmount: null,
      condition: ItemCondition.GOOD,
      status: ItemStatus.AVAILABLE,
      ownerId: member2.id,
      categoryId: categories["เครื่องครัว"].id,
      communityId: communityUni.id,
      pickupLocation: "คณะอักษรศาสตร์ จุฬาฯ",
      imageUrl: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500",
    },
    {
      title: "Adjustable Dumbbells Set 20kg",
      description: "ดัมเบลคู่ปรับน้ำหนักได้รวม 20 กก. พร้อมก้านต่อเพิ่มความยาวเป็นบาร์เบลได้ ออกกำลังกายฟิตหุ่นที่บ้านสบาย",
      type: ItemType.RENTAL,
      price: null,
      rentalPricePerDay: 90.0,
      depositAmount: 400.0,
      condition: ItemCondition.GOOD,
      status: ItemStatus.AVAILABLE,
      ownerId: member3.id,
      categoryId: categories["กีฬา"].id,
      communityId: communityDorm.id,
      pickupLocation: "Lobby CU I-House",
      imageUrl: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=500",
    },
    {
      title: "iPad Pro 11-inch (M1 Chip, 128GB)",
      description: "ไอแพดโปรชิป M1 ลื่นไหล แรงๆ รองรับ Apple Pencil รุ่น 2 เหมาะสำหรับจดโน้ตและวาดภาพ",
      type: ItemType.RENTAL,
      price: null,
      rentalPricePerDay: 400.0,
      depositAmount: 3000.0,
      condition: ItemCondition.LIKE_NEW,
      status: ItemStatus.AVAILABLE,
      ownerId: member4.id,
      categoryId: categories["อิเล็กทรอนิกส์"].id,
      communityId: communityComm.id,
      pickupLocation: "ตึกออฟฟิศใกล้ BTS อารีย์",
      imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
    },
    {
      title: "Keychron K6 Wireless Mechanical Keyboard",
      description: "คีย์บอร์ดไร้สายขนาด 65% บลูสวิตช์ กดเสียงดังเด้งมือสนุกสนาน ไฟ RGB ปรับเอฟเฟกต์ได้หลากหลาย",
      type: ItemType.BOTH,
      price: 3500.0,
      rentalPricePerDay: 100.0,
      depositAmount: 500.0,
      condition: ItemCondition.GOOD,
      status: ItemStatus.AVAILABLE,
      ownerId: member5.id,
      categoryId: categories["เฟอร์นิเจอร์"].id,
      communityId: communityUni.id,
      pickupLocation: "หอในนิสิตจุฬาฯ",
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
    },
  ]

  const items: Record<string, any> = {}
  for (const item of itemData) {
    const createdItem = await prisma.item.create({
      data: {
        title: item.title,
        description: item.description,
        type: item.type,
        price: item.price,
        rentalPricePerDay: item.rentalPricePerDay,
        depositAmount: item.depositAmount,
        condition: item.condition,
        status: item.status,
        ownerId: item.ownerId,
        categoryId: item.categoryId,
        communityId: item.communityId,
        pickupLocation: item.pickupLocation,
        images: {
          create: {
            url: item.imageUrl,
          },
        },
      },
    })
    items[item.title] = createdItem
  }

  // 6. Create 5 Sample Bookings
  console.log("Creating sample bookings...")
  // Booking 1: Renter: John, Item: PlayStation 5 (Owner: Suda), 3 days, total: 1050, Status: COMPLETED
  const booking1 = await prisma.booking.create({
    data: {
      itemId: items["PlayStation 5 (Disc Edition)"].id,
      renterId: member3.id,
      startDate: new Date("2026-05-10T10:00:00Z"),
      endDate: new Date("2026-05-13T10:00:00Z"),
      totalPrice: 1050.0,
      deposit: 2000.0,
      status: BookingStatus.COMPLETED,
      payments: {
        create: {
          amount: 3050.0, // rent + deposit
          status: PaymentStatus.COMPLETED,
          method: "PROMPTPAY",
        },
      },
      reviews: {
        create: {
          rating: 5,
          comment: "เครื่องสภาพดีมากๆ คืนมัดจำรวดเร็ว นิสัยดีคุยง่ายครับ แนะนำ!",
          reviewerId: member3.id,
          revieweeId: member2.id,
        },
      },
    },
  })

  // Booking 2: Renter: Pitcha, Item: Sony Alpha A7 III (Owner: Suda), 5 days, total: 3000, Status: ONGOING
  const booking2 = await prisma.booking.create({
    data: {
      itemId: items["Sony Alpha A7 III Camera Body"].id,
      renterId: member5.id,
      startDate: new Date("2026-05-28T09:00:00Z"),
      endDate: new Date("2026-06-02T09:00:00Z"),
      totalPrice: 3000.0,
      deposit: 5000.0,
      status: BookingStatus.ONGOING,
      payments: {
        create: {
          amount: 8000.0,
          status: PaymentStatus.COMPLETED,
          method: "STRIPE",
        },
      },
    },
  })

  // Booking 3: Renter: Somchai, Item: Java Road Bike (Owner: Pitcha), 2 days, total: 500, Status: APPROVED
  const booking3 = await prisma.booking.create({
    data: {
      itemId: items["Java Road Bike Pro 2024"].id,
      renterId: member1.id,
      startDate: new Date("2026-06-05T08:00:00Z"),
      endDate: new Date("2026-06-07T08:00:00Z"),
      totalPrice: 500.0,
      deposit: 1500.0,
      status: BookingStatus.APPROVED,
      payments: {
        create: {
          amount: 2000.0,
          status: PaymentStatus.PENDING,
          method: "PROMPTPAY",
        },
      },
    },
  })

  // Booking 4: Renter: Nattapong, Item: Quechua Camping Tent (Owner: Suda), 4 days, total: 480, Status: PENDING
  const booking4 = await prisma.booking.create({
    data: {
      itemId: items["Quechua Camping Tent 4-person (Waterproof)"].id,
      renterId: member4.id,
      startDate: new Date("2026-06-15T12:00:00Z"),
      endDate: new Date("2026-06-19T12:00:00Z"),
      totalPrice: 480.0,
      deposit: 600.0,
      status: BookingStatus.PENDING,
    },
  })

  // Booking 5: Renter: Suda, Item: Board Game: Catan (Owner: Somchai), 2 days, total: 140, Status: CANCELLED
  const booking5 = await prisma.booking.create({
    data: {
      itemId: items["Board Game: Catan (Settlers of Catan)"].id,
      renterId: member2.id,
      startDate: new Date("2026-05-15T14:00:00Z"),
      endDate: new Date("2026-05-17T14:00:00Z"),
      totalPrice: 140.0,
      deposit: 300.0,
      status: BookingStatus.CANCELLED,
    },
  })

  // 7. Create 3 Sample Reports
  console.log("Creating sample reports...")
  // Report 1: Reporter: Pitcha, Item: PlayStation 5, reason: "Inaccurate description, claims it has 2 controllers but only has 1", Status: PENDING
  await prisma.report.create({
    data: {
      reason: "รายละเอียดไม่ตรงตามจริง! เจ้าของบอกมีจอยให้ 2 อัน แต่ตอนส่งมอบมีจอยแค่ 1 อัน และสายชาร์จหาย",
      status: ReportStatus.PENDING,
      reporterId: member5.id,
      itemId: items["PlayStation 5 (Disc Edition)"].id,
    },
  })

  // Report 2: Reporter: Somchai, Item: Sony Alpha A7 III, reason: "Suspicious listing details, potential scam", Status: INVESTIGATING
  await prisma.report.create({
    data: {
      reason: "รูปภาพสินค้าเหมือนไปก๊อปปี้มาจากในเน็ต คุยแล้วให้โอนเงินมัดจำนอกแพลตฟอร์มอย่างเดียว น่าสงสัยว่าหลอกลวง",
      status: ReportStatus.INVESTIGATING,
      reporterId: member1.id,
      itemId: items["Sony Alpha A7 III Camera Body"].id,
    },
  })

  // Report 3: Reporter: Nattapong, Item: Sofa Bed 3-Seater Gray, reason: "Inappropriate images used in listing", Status: RESOLVED
  await prisma.report.create({
    data: {
      reason: "มีรูปถ่ายคนติดในรูปสินค้าโดยไม่ได้รับอนุญาต รบกวนเจ้าของเบลอหน้าหรือครอปภาพออกด้วยครับ",
      status: ReportStatus.RESOLVED,
      reporterId: member4.id,
      itemId: items["Sofa Bed 3-Seater Gray"].id,
    },
  })

  // 8. Create a few custom messages to build relationships
  console.log("Creating messages...")
  await prisma.message.create({
    data: {
      itemId: items["Calculus 1 Textbook (Thomas Calculus)"].id,
      senderId: member5.id,
      receiverId: member3.id,
      content: "สวัสดีครับ นิยายหรือหนังสือแคลคูลัสปี 1 ยังอยู่ไหมครับ สนใจยืมสอบกลางภาคครับ",
      createdAt: new Date("2026-05-01T08:30:00Z"),
    },
  })
  await prisma.message.create({
    data: {
      itemId: items["Calculus 1 Textbook (Thomas Calculus)"].id,
      senderId: member3.id,
      receiverId: member5.id,
      content: "ยังอยู่ครับผม สภาพดี สนใจนัดรับตึกหอได้เลยครับ ยืมกี่วันดีครับ?",
      createdAt: new Date("2026-05-01T08:35:00Z"),
    },
  })

  // 9. Add a couple favorites
  console.log("Creating favorites...")
  await prisma.favorite.create({
    data: {
      userId: member1.id,
      itemId: items["Nintendo Switch (OLED Model)"].id,
    },
  })
  await prisma.favorite.create({
    data: {
      userId: member2.id,
      itemId: items["Xiaomi Electric Scooter Pro 2"].id,
    },
  })

  console.log("Database seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("Error during seeding process:")
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
