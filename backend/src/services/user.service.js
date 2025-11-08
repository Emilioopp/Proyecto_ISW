import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(User);

export async function createUser(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = userRepository.create({
    email: data.email,
    password: hashedPassword,
  });

  return await userRepository.save(newUser);
}

export async function findUserByEmail(email) {
  return await userRepository.findOneBy({ email });
}

export async function findUserById(id) {
  return await userRepository.findOneBy({ id: Number(id) });
}

export async function updateUserById(id, changes) {
  const user = await findUserById(id);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (typeof changes.email !== "undefined") {
    user.email = changes.email;
  }

  if (typeof changes.password !== "undefined" && changes.password) {
    user.password = await bcrypt.hash(changes.password, 10);
  }

  const updated = await userRepository.save(user);
  delete updated.password;
  return updated;
}

export async function deleteUserById(id) {
  const user = await findUserById(id);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  await userRepository.remove(user);
  return { id: Number(id) };
}
