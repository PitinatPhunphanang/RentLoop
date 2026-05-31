# Rentloop (เรนท์ลูป) - Project Foundation & Database Setup

ยินดีต้อนรับสู่โปรเจกต์ **Rentloop** แพลตฟอร์มสำหรับการเช่าและแบ่งปันสิ่งของภายในชุมชน (Item Sharing & Rental Platform) นี่คือเอกสารสรุปโครงสร้างสถาปัตยกรรม ฐานข้อมูล และการตั้งค่าเริ่มต้นของระบบ

---

## 🛠️ Tech Stack (เทคโนโลยีที่ใช้)

- **Framework**: [Next.js 14+ (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database ORM**: [Prisma ORM (v7.8.0)](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: [NextAuth.js v5 (Auth.js Beta)](https://authjs.dev/)
- **Validation**: [Zod](https://zod.dev/)
- **Security**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js)

---

## 📂 Project Structure (โครงสร้างโฟลเดอร์)

```text
rentloop/
├── prisma/
│   ├── schema.prisma       # Prisma Schema (11 Models, 8 Enums)
│   └── seed.ts             # Script สำหรับ Seed ข้อมูลทดสอบ (High-Fidelity)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts  # Auth.js API Handlers (GET, POST)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   └── prisma.ts       # Singleton Prisma Client (ป้องกัน Connection Leak ใน Dev mode)
│   ├── types/
│   │   └── next-auth.d.ts  # Type Augmentation เพื่อขยายข้อมูล User, JWT, Session
│   └── auth.ts             # Auth.js Configuration (Credentials Provider + Zod + bcryptjs)
├── .env                    # ไฟล์เก็บ Environment Variables (เครื่องตัวเอง)
├── .env.example            # ไฟล์ตัวอย่างสำหรับตั้งค่าสภาพแวดล้อม
├── package.json            # ไฟล์จัดการ Dependencies และ Scripts (กำหนด prisma.seed)
├── prisma.config.ts        # ไฟล์กำหนดค่า Prisma 7 (ใช้จัดการ Connection URL แยกจาก schema)
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🗄️ Database Architecture (สถาปัตยกรรมฐานข้อมูล)

โปรเจกต์นี้ได้รับการพัฒนาขึ้นบนระบบ **Prisma 7** ซึ่งเปลี่ยนการจัดการ DataSource Dynamic URL ไปยัง `prisma.config.ts` ทำให้ในไฟล์ `schema.prisma` มีความสะอาดและปลอดภัยมากขึ้น

### 🔹 Enums ทั้งหมด (8 Enums)
1. **UserRole**: `ADMIN`, `MEMBER`
2. **CommunityType**: `UNIVERSITY`, `DORM`, `CONDO`, `COMMUNITY`
3. **ItemType**: `SALE` (ขายขาด), `RENTAL` (ให้เช่า), `BOTH` (ทำได้ทั้งสองอย่าง)
4. **ItemCondition**: `NEW` (ของใหม่), `LIKE_NEW` (เหมือนใหม่), `GOOD` (สภาพดี), `FAIR` (สภาพปานกลาง), `POOR` (สภาพชำรุดง่าย)
5. **ItemStatus**: `AVAILABLE`, `RENTED`, `SOLD`, `UNAVAILABLE`
6. **BookingStatus**: `PENDING`, `APPROVED`, `REJECTED`, `ONGOING`, `COMPLETED`, `CANCELLED`
7. **PaymentStatus**: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`
8. **ReportStatus**: `PENDING`, `INVESTIGATING`, `RESOLVED`, `DISMISSED`

### 🔹 Models ทั้งหมด (11 Models)

| Model | คำอธิบาย | ความสัมพันธ์หลัก (Relations) |
| :--- | :--- | :--- |
| **User** | บัญชีผู้ใช้งาน สมาชิก และแอดมิน | สังกัด `Community`, มีรายการประกาศ (`Item`), มีประวัติการเช่า (`Booking`), คุยแชท (`Message`), รีวิว (`Review`), รายงาน (`Report`), รายการโปรด (`Favorite`) |
| **Community** | ชุมชนหรือพื้นที่ทางกายภาพ เช่น มหาวิทยาลัย คอนโด หอพัก | บรรจุ `User` และ `Item` หลายรายการ |
| **Category** | หมวดหมู่สิ่งของ (เช่น เฟอร์นิเจอร์, หนังสือ, อุปกรณ์ไอที) | มี `Item` หลายรายการ |
| **Item** | รายการประกาศขายหรือให้เช่าสิ่งของ | เป็นของ `User` (Owner), อยู่ใน `Category` และ `Community`, มีรูปภาพหลายใบ (`ItemImage`), รายงานแจ้งปัญหา (`Report`) |
| **ItemImage** | รูปภาพของสิ่งของแต่ละรายการ (รองรับภาพหลายใบต่อชิ้น) | ผูกกับ `Item` (Cascade Delete) |
| **Booking** | รายการจองเช่าสิ่งของ ระบุวันเริ่ม-สิ้นสุด ราคา มัดจำ และสถานะ | ผูกกับ `Item`, ผู้เช่า (`User` - Renter), มีการชำระเงิน (`Payment`), มีรีวิวที่เกี่ยวเนื่อง (`Review`) |
| **Payment** | บันทึกประวัติการชำระเงินค่าเช่า | ผูกกับ `Booking` (Cascade Delete) |
| **Message** | ข้อความสนทนาระหว่างผู้เช่าและเจ้าของสิ่งของ | เชื่อมโยงกับ `Item`, ผู้ส่ง (`User` - Sender), ผู้รับ (`User` - Receiver) |
| **Review** | คะแนนและคอมเมนต์หลังเสร็จสิ้นกระบวนการเช่า | ผู้ประเมิน (`User` - Reviewer), ผู้ถูกประเมิน (`User` - Reviewee), ผูกกับ `Booking` (มี Unique Constraint ร่วมกัน) |
| **Report** | รายการรายงานหรือแจ้งปัญหาเกี่ยวกับสิ่งของละเมิดกฎ | ผู้แจ้ง (`User` - Reporter), สิ่งของที่โดนแจ้ง (`Item`) |
| **Favorite** | รายการสิ่งของโปรดที่ผู้ใช้บันทึกไว้ | คู่ของ `User` และ `Item` (มี Unique Constraint ร่วมกัน) |

---

## 🔐 Authentication Setup (ระบบความปลอดภัยและสิทธิ์)

ระบบล็อกอินใช้ **NextAuth.js v5 (Auth.js)** โดยกำหนดค่าหลักไว้ที่ `src/auth.ts`:
- **Credentials Provider**: ใช้ `email` และ `password` ในการยืนยันตัวตน
- **Zod Schema**: ป้องกันข้อมูลขาเข้าของ Credentials (อีเมลถูกต้อง, รหัสผ่านอย่างน้อย 6 ตัวอักษร)
- **Bcrypt Security**: เปรียบเทียบรหัสผ่านที่ส่งมากับ `passwordHash` ในฐานข้อมูลแบบสลับซับซ้อนปลอดภัย
- **Session & JWT Callbacks**: ดึงข้อมูลและฝัง `id`, `role`, และ `communityId` ลงใน Session Token ทันทีเพื่อให้ฝั่งหน้าบ้าน (Client) เรียกใช้ได้ง่าย
- **Type Augmentation**: มีการขยายประเภทข้อมูลภาษา TypeScript ใน `src/types/next-auth.d.ts` ทำให้ไม่เกิด Compile Error เมื่อเรียกใช้ `session.user.role` หรือ `session.user.communityId`

---

## 🌱 Database Seeding (ข้อมูลจำลองเริ่มต้น)

สคริปต์ `prisma/seed.ts` ออกแบบมาเพื่อให้พร้อมทดสอบระบบได้ทันที โดยประกอบไปด้วยข้อมูลจำลองความละเอียดสูง:
- **Admin**: `admin@rentloop.com` (รหัสผ่าน: `admin1234`)
- **Members**: บัญชีทั่วไป 5 บัญชี (รหัสผ่าน: `member123`) กระจายอยู่ตามชุมชนต่างๆ
- **Communities**: 4 ชุมชนต้นแบบ (Chulalongkorn University, CU I-House, Ideo Mobi Condo, Ari Neighborhood)
- **Categories**: 8 หมวดหมู่ภาษาไทยยอดนิยม (`เฟอร์นิเจอร์`, `อิเล็กทรอนิกส์`, `หนังสือ`, `เครื่องครัว`, `กีฬา`, `เสื้อผ้า`, `กล้องและอุปกรณ์`, `อื่นๆ`)
- **Items**: 20 รายการสิ่งของจริงที่มีสัดส่วนคละกันระหว่าง SALE, RENTAL, และ BOTH มีคำอธิบายภาษาไทยและอังกฤษ พร้อมพิกัดนัดรับสินค้าและรูปภาพจำลองคุณภาพสูงจาก Unsplash
- **Bookings & Payments & Reviews**: ตัวอย่างการทำธุรกรรมครบวงจร 5 รายการ (มีทั้งจองเสร็จสิ้น, อยู่ระหว่างการเช่า, รออนุมัติ และยกเลิก) พร้อมรีวิวและประวัติการจ่ายเงิน
- **Reports**: ตัวอย่างรายงานแจ้งปัญหาของสมาชิก 3 รายการ
- **Messages & Favorites**: ตัวอย่างข้อความแชทคุยตกลงและบันทึกของโปรดเพื่อแสดงความสัมพันธ์ในระบบ

---

## 🚀 ลำดับขั้นตอนการสั่งงานระบบ (How to Run)

เมื่อผู้พัฒนาดาวน์โหลดและตั้งค่าระบบ ให้ปฏิบัติตามลำดับขั้นตอนดังต่อไปนี้:

### 1. โคลนและเข้ามาในโฟลเดอร์โครงการ
```powershell
cd d:\projectlub\rentloop
```

### 2. ตั้งค่าสภาพแวดล้อม (Environment Variables)
คัดลอกไฟล์ `.env.example` ไปเป็น `.env` แล้วแก้ไขค่ารหัสผ่านฐานข้อมูล PostgreSQL ของคุณ:
```powershell
copy .env.example .env
```
*(ไฟล์ `.env` ได้รับการสร้างไว้ให้เบื้องต้นแล้ว สามารถเปิดตรวจสอบได้ทันที)*

### 3. สร้างฐานข้อมูล (Create Database)
ตรวจสอบให้แน่ใจว่าระบบฐานข้อมูล PostgreSQL ในเครื่องของคุณกำลังทำงาน จากนั้นสามารถสร้างฐานข้อมูลเปล่าชื่อ `rentloop` ได้โดย:
```powershell
createdb -h localhost -U postgres rentloop
```
*(หมายเหตุ: หากไม่มีโปรแกรม `createdb` ใน Environment Path หรือคุณสะดวกให้ระบบทำแทน เมื่อรันคำสั่ง Migration ในขั้นตอนที่ 4 Prisma จะตรวจพบว่าไม่มี DB และจะแสดงคำถามถามเพื่อขอยืนยันการสร้างฐานข้อมูลเปล่าให้โดยอัตโนมัติ)*

### 4. เรียกใช้การเปลี่ยนโครงสร้างฐานข้อมูล (Run Prisma Migrate)
สร้างโครงสร้างตาราง Enums และความสัมพันธ์ทั้งหมดลงไปในฐานข้อมูลจริง:
```powershell
npx prisma migrate dev --name init
```

### 5. ใส่ข้อมูลทดสอบจำลอง (Run Database Seed)
เติมข้อมูลจำลองที่ครบถ้วน (Admin, สมาชิก, สินค้า 20 ชิ้น, ประวัติเช่า) ลงในฐานข้อมูล:
```powershell
npx prisma db seed
```

### 6. เริ่มต้นรันเซิร์ฟเวอร์เพื่อพัฒนา (Start Dev Server)
เปิดใช้งาน Next.js หน้าบ้านเพื่อเริ่มต้นพัฒนาเว็บไซต์:
```powershell
npm run dev
```
เว็บจะเริ่มทำงานที่ [http://localhost:3000](http://localhost:3000)
