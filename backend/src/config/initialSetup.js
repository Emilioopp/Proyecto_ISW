import bcrypt from "bcrypt";
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";

export async function initialSetup() {
  try {
    console.log("Ejecutando configuración inicial...");

    const userRepo = AppDataSource.getRepository(User.options.name);
    
    const usersData = [
      {
        nombre: "Administrador",
        rut: "12.345.678-9",
        email: "admin@ubiobio.cl",
        password: "admin123",
        rol: "Admin"
      },
      {
        nombre: "María González",
        rut: "15.678.234-5",
        email: "maria.gonzalez@ubiobio.cl",
        password: "profesor123",
        rol: "Profesor"
      },
      {
        nombre: "Carlos Ramírez",
        rut: "16.234.567-8",
        email: "carlos.ramirez@gmail.com",
        password: "profesor123",
        rol: "Profesor"
      },
      {
        nombre: "Ana Martínez",
        rut: "20.123.456-7",
        email: "ana.martinez@alumnos.ubiobio.cl",
        password: "estudiante123",
        rol: "Estudiante"
      },
      {
        nombre: "Pedro Sánchez",
        rut: "20.234.567-8",
        email: "pedro.sanchez@alumnos.ubiobio.cl",
        password: "estudiante123",
        rol: "Estudiante"
      },
      {
        nombre: "Laura Torres",
        rut: "20.345.678-9",
        email: "laura.torres@alumnos.ubiobio.cl",
        password: "estudiante123",
        rol: "Estudiante"
      }
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const userData of usersData) {
      const existingUser = await userRepo.findOne({ 
        where: { email: userData.email } 
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const newUser = userRepo.create({
          nombre: userData.nombre,
          rut: userData.rut,
          email: userData.email,
          password: hashedPassword,
          rol: userData.rol,
        });
        
        await userRepo.save(newUser);
        
        console.log(` ${userData.rol} creado: ${userData.nombre}`);
        console.log(` Email: ${userData.email}`);
        console.log(` Contraseña: ${userData.password}`);
        console.log(` RUT: ${userData.rut}\n`);
        
        createdCount++;
      } else {
        existingCount++;
      }
    }

    if (createdCount > 0) {
      console.log(`Se crearon ${createdCount} usuario(s) nuevo(s)`);
    }
    if (existingCount > 0) {
      console.log(`${existingCount} usuario(s) ya existían`);
    }

    console.log(" Configuración inicial completada\n");
    
  } catch (error) {
    console.error(" Error en configuración inicial:", error.message);
    throw error;
  }
}