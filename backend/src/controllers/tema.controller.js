import { validarCrearTema } from "../validations/tema.validation.js";
import { AppDataSource } from "../config/configDb.js";
import { Tema } from "../entities/tema.entity.js";
import { Asignatura } from "../entities/asignatura.entity.js";

export async function crearTema(req, res) {
  // Validar los datos de entrada
  const { error, value } = validarCrearTema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: "Datos inválidos", details: error.details });
  }

  const asignaturaRepo = AppDataSource.getRepository(Asignatura);
  const asignaturas = await asignaturaRepo.findByIds(value.asignaturaIds);
  if (asignaturas.length !== value.asignaturaIds.length) {
    return res.status(404).json({ message: "Una o más asignaturas no fueron encontradas" });
  }

  const temaRepo = AppDataSource.getRepository(Tema);
  const tema = temaRepo.create({
    titulo: value.titulo,
    descripcion: value.descripcion,
    materialUrl: value.materialUrl,
    profesor: req.user, //usuario autenticado debe ser tipo profesor
    asignatura: asignaturas
  });
  await temaRepo.save(tema);
    return res.status(201).json({ message: "Tema creado exitosamente", tema });
}

export async function obtenerTemas(req, res) {
    const temaRepo = AppDataSource.getRepository(Tema);
    const temas = await temaRepo.find({ relations: ["profesor", "asignatura"] });
    return res.status(200).json(temas);
}

export async function obtenerTemaPorId(req, res) {
    const temaId = parseInt(req.params.id);
    const temaRepo = AppDataSource.getRepository(Tema);
    const tema = await temaRepo.findOne({ 
        where: { id: temaId },
        relations: ["profesor", "asignatura"]
    });
    if (!tema) {
        return res.status(404).json({ message: "Tema no encontrado" });
    }
    return res.status(200).json(tema);
}

export async function eliminarTema(req, res) {
    const temaId = parseInt(req.params.id);
    const temaRepo = AppDataSource.getRepository(Tema);
    const tema = await temaRepo.findOneBy({ id: temaId });  
    if (!tema) {
        return res.status(404).json({ message: "Tema no encontrado" });
    }
    await temaRepo.remove(tema);
    return res.status(200).json({ message: "Tema eliminado exitosamente" });
}

export async function actualizarTema(req, res) {
    const temaId = parseInt(req.params.id);
    const { error, value } = validarCrearTema.validate(req.body, { abortEarly: false });    
    if (error) {
        return res.status(400).json({ message: "Datos inválidos", details: error.details });
    }
    const temaRepo = AppDataSource.getRepository(Tema);
    const tema = await temaRepo.findOneBy({ id: temaId });
    if (!tema) {
        return res.status(404).json({ message: "Tema no encontrado" });
    }
    tema.titulo = value.titulo;
    tema.descripcion = value.descripcion;
    tema.materialUrl = value.materialUrl;
    await temaRepo.save(tema);
    return res.status(200).json({ message: "Tema actualizado exitosamente", tema });
}

export async function obtenerTemasPorProfesor(req, res) {
    const profesorId = req.user.id;
    const temaRepo = AppDataSource.getRepository(Tema);
    const temas = await temaRepo.find({ 
        where: { profesor: { id: profesorId } },
        relations: ["profesor", "asignatura"]
    });
    return res.status(200).json(temas);
}

export async function obtenerTemasPorAsignatura(req, res) {
    const asignaturaId = parseInt(req.params.asignaturaId);
    const temaRepo = AppDataSource.getRepository(Tema);
    const temas = await temaRepo
        .createQueryBuilder("tema")
        .leftJoinAndSelect("tema.asignatura", "asignatura")
        .leftJoinAndSelect("tema.profesor", "profesor")
        .where("asignatura.id = :asignaturaId", { asignaturaId })
        .getMany();
    return res.status(200).json(temas);
}
