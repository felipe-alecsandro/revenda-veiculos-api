import 'dotenv/config';
import { randomUUID } from 'crypto';
import { AppDataSource } from '../data-source';
import { SaleEntity } from '../../modules/sales/entities/sale.entity';
import { VehicleEntity } from '../../modules/vehicles/entities/vehicle.entity';

type VehicleSeed = Pick<
  VehicleEntity,
  'brand' | 'model' | 'year' | 'color' | 'price' | 'imageUrl'
>;

const availableVehicles: VehicleSeed[] = [
  {
    brand: 'Toyota',
    model: 'Corolla XEi',
    year: 2022,
    color: 'Preto',
    price: 129900,
    imageUrl:
      'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=900&q=80',
  },
  {
    brand: 'Honda',
    model: 'Civic Touring',
    year: 2021,
    color: 'Prata',
    price: 134500,
    imageUrl:
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',
  },
  {
    brand: 'Jeep',
    model: 'Compass Limited',
    year: 2023,
    color: 'Branco',
    price: 162300,
    imageUrl:
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=900&q=80',
  },
  {
    brand: 'Volkswagen',
    model: 'Nivus Highline',
    year: 2022,
    color: 'Cinza',
    price: 118700,
    imageUrl:
      'https://images.unsplash.com/photo-1549399542-7e82138f3b35?auto=format&fit=crop&w=900&q=80',
  },
  {
    brand: 'Chevrolet',
    model: 'Onix Premier',
    year: 2021,
    color: 'Vermelho',
    price: 89500,
    imageUrl:
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80',
  },
  {
    brand: 'Hyundai',
    model: 'Creta Platinum',
    year: 2023,
    color: 'Azul',
    price: 146900,
    imageUrl:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
  },
  {
    brand: 'Fiat',
    model: 'Toro Volcano',
    year: 2022,
    color: 'Branco',
    price: 154200,
    imageUrl:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80',
  },
  {
    brand: 'Nissan',
    model: 'Kicks Advance',
    year: 2021,
    color: 'Cinza',
    price: 104800,
    imageUrl:
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=900&q=80',
  },
  {
    brand: 'Renault',
    model: 'Duster Iconic',
    year: 2020,
    color: 'Marrom',
    price: 97800,
    imageUrl:
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
  },
  {
    brand: 'BMW',
    model: '320i GP',
    year: 2022,
    color: 'Preto',
    price: 279900,
    imageUrl:
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
  },
];

const soldVehicles: VehicleSeed[] = [
  {
    brand: 'Audi',
    model: 'A3 Sedan',
    year: 2020,
    color: 'Preto',
    price: 169000,
    imageUrl:
      'https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&w=900&q=80',
  },
  {
    brand: 'Ford',
    model: 'Ranger XLT',
    year: 2021,
    color: 'Branco',
    price: 199900,
    imageUrl:
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=80',
  },
  {
    brand: 'Mercedes-Benz',
    model: 'C200',
    year: 2019,
    color: 'Prata',
    price: 189900,
    imageUrl:
      'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=900&q=80',
  },
  {
    brand: 'Peugeot',
    model: '3008 Griffe',
    year: 2020,
    color: 'Azul',
    price: 142000,
    imageUrl:
      'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=80',
  },
  {
    brand: 'Volvo',
    model: 'XC40 Momentum',
    year: 2021,
    color: 'Cinza',
    price: 214500,
    imageUrl:
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=900&q=80',
  },
];

async function runSeed(): Promise<void> {
  await AppDataSource.initialize();
  const vehicleRepo = AppDataSource.getRepository(VehicleEntity);
  const saleRepo = AppDataSource.getRepository(SaleEntity);

  await saleRepo.createQueryBuilder().delete().execute();
  await vehicleRepo.createQueryBuilder().delete().execute();

  const availableEntities = availableVehicles.map((vehicle) =>
    vehicleRepo.create({
      id: randomUUID(),
      ...vehicle,
      status: 'AVAILABLE',
    }),
  );
  await vehicleRepo.save(availableEntities);

  const soldEntities = soldVehicles.map((vehicle) =>
    vehicleRepo.create({
      id: randomUUID(),
      ...vehicle,
      status: 'SOLD',
    }),
  );
  await vehicleRepo.save(soldEntities);

  const baseDate = new Date('2026-01-10T10:00:00.000Z');
  const sales = soldEntities.map((vehicle, index) =>
    saleRepo.create({
      id: randomUUID(),
      vehicleId: vehicle.id,
      buyerId: `buyer-${index + 1}`,
      buyerEmail: `comprador${index + 1}@email.com`,
      soldAt: new Date(baseDate.getTime() + index * 86400000).toISOString(),
      salePrice: vehicle.price,
    }),
  );
  await saleRepo.save(sales);

  console.log(
    `Seed concluido: ${availableEntities.length} disponiveis, ${soldEntities.length} vendidos.`,
  );
  await AppDataSource.destroy();
}

void runSeed().catch(async (error: unknown) => {
  console.error('Erro ao executar seed de demo:', error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
