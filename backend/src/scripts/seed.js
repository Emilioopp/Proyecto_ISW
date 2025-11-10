import "reflect-metadata";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";

async function seed() {
  try {
    console.log("Iniciando seeder...");
    await AppDataSource.initialize();
    console.log("Conexión a BD establecida");

    const userRepo = AppDataSource.getRepository(User.options.name);
    
    const adminEmail = "admin@ubiobio.cl";
    const adminPassword = "admin1234";
    
    let admin = await userRepo.findOne({ where: { email: adminEmail } });

    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      admin = userRepo.create({
        nombre: "Administrador",
        rut: "12.345.678-9",
        email: adminEmail,
        password: hashedPassword,
        rol: "Admin",
      });
      
      await userRepo.save(admin);
      
      console.log("Usuario Admin creado exitosamente");
      console.log("Email:", adminEmail);
      console.log("RUT:", admin.rut);
    } else {
      console.log("Usuario Admin ya existe");
      console.log("Email:", adminEmail);
    }

    console.log("\nSeeder completado exitosamente");
    
  } catch (error) {
    console.error("Error ejecutando seeder:", error.message);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Conexión a BD cerrada");
    }
  }
}

seed();