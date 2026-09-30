import { PrismaClient, EquipmentCategory, Role } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

const categories: EquipmentCategory[] = [
  'GPU_SERVER',
  'DRONE',
  'LAB_INSTRUMENT',
  'VR_AR_HEADSET',
  'CAMERA_GEAR',
  'ROBOTICS_KIT',
]

const categoryMeta: Record<EquipmentCategory, { brands: string[]; models: string[] }> = {
  GPU_SERVER: {
    brands: ['NVIDIA', 'AMD', 'Intel'],
    models: ['H100 Cluster', 'A100 Node', 'RTX 4090 Rig', 'MI300X Server'],
  },
  DRONE: {
    brands: ['DJI', 'Skydio', 'Autel'],
    models: ['Matrice 300', 'X2D', 'EVO II Pro', 'Inspire 3'],
  },
  LAB_INSTRUMENT: {
    brands: ['Tektronix', 'Keysight', 'Rohde & Schwarz'],
    models: ['Oscilloscope 4CH', 'Spectrum Analyzer', 'Signal Generator', 'Logic Analyzer'],
  },
  VR_AR_HEADSET: {
    brands: ['Meta', 'Apple', 'HTC', 'Varjo'],
    models: ['Quest Pro', 'Vision Pro', 'Vive XR Elite', 'XR-4'],
  },
  CAMERA_GEAR: {
    brands: ['Sony', 'RED', 'ARRI', 'Canon'],
    models: ['FX9', 'KOMODO-X', 'ALEXA 35', 'EOS C70'],
  },
  ROBOTICS_KIT: {
    brands: ['Boston Dynamics', 'Universal Robots', 'Dobot', 'Franka'],
    models: ['Spot Robot', 'UR10e', 'MG400', 'Panda Arm'],
  },
}

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@rentrig.dev' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@rentrig.dev',
      role: 'ADMIN',
      emailVerified: true,
    },
  })

  // Create member users
  const members = []
  for (let i = 0; i < 20; i++) {
    const member = await prisma.user.upsert({
      where: { email: faker.internet.email().toLowerCase() },
      update: {},
      create: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        role: i < 15 ? 'MEMBER' : 'GUEST',
        emailVerified: faker.datatype.boolean(),
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.alphanumeric(8)}`,
      },
    })
    members.push(member)
  }

  // Create equipment
  const equipmentList = []
  for (let i = 0; i < 60; i++) {
    const category = faker.helpers.arrayElement(categories)
    const meta = categoryMeta[category]
    const brand = faker.helpers.arrayElement(meta.brands)
    const model = faker.helpers.arrayElement(meta.models)
    const name = `${brand} ${model}`
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${faker.string.alphanumeric(4)}`

    const equipment = await prisma.equipment.create({
      data: {
        slug,
        name,
        description: faker.commerce.productDescription(),
        category,
        brand,
        model,
        pricePerDay: parseFloat(faker.commerce.price({ min: 50, max: 2500 })),
        available: faker.datatype.boolean({ probability: 0.8 }),
        imageUrl: `https://picsum.photos/seed/${slug}/800/600`,
        specs: {
          weight: `${faker.number.float({ min: 0.5, max: 50, fractionDigits: 1 })} kg`,
          powerConsumption: `${faker.number.int({ min: 50, max: 3000 })}W`,
          connectivity: faker.helpers.arrayElements(['USB-C', 'HDMI', 'Ethernet', 'WiFi 6', 'Bluetooth 5.3'], 3),
          warranty: `${faker.helpers.arrayElement([1, 2, 3])} year(s)`,
          condition: faker.helpers.arrayElement(['Excellent', 'Good', 'Fair']),
        },
      },
    })
    equipmentList.push(equipment)
  }

  // Create reservations
  for (let i = 0; i < 40; i++) {
    const user = faker.helpers.arrayElement(members)
    const equipment = faker.helpers.arrayElement(equipmentList)
    const startDate = faker.date.between({ from: '2025-01-01', to: '2026-06-01' })
    const days = faker.number.int({ min: 1, max: 14 })
    const endDate = new Date(startDate.getTime() + days * 86400000)
    const totalPrice = equipment.pricePerDay * days

    await prisma.reservation.create({
      data: {
        userId: user.id,
        equipmentId: equipment.id,
        startDate,
        endDate,
        totalPrice,
        status: faker.helpers.arrayElement(['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
        notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      },
    })
  }

  // Create audit logs
  for (let i = 0; i < 30; i++) {
    const user = faker.helpers.arrayElement(members)
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: faker.helpers.arrayElement(['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'REJECT']),
        entity: faker.helpers.arrayElement(['Reservation', 'Equipment', 'User']),
        entityId: faker.string.nanoid(10),
        metadata: { ip: faker.internet.ip(), userAgent: faker.internet.userAgent() },
      },
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
