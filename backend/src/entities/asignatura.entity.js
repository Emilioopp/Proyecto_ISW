import { EntitySchema } from "typeorm";

export const Asignatura = new EntitySchema({
  name: "Asignatura",
  tableName: "asignaturas",
  columns: {
    id: {
        primary: true,
        type: "int",
        generated: "increment",
    },
    codigo: {
        type: "varchar",
        length: 20,
        unique: true,
        nullable: false,
    },
    nombre: {
        type: "varchar",
        length: 255,
        nullable: false,
    },
    created_at: {
        type: "timestamp",
        createDate: true,
        default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    profesorAsignaturas: {
      type: "one-to-many",
      target: "ProfesorAsignatura",
      inverseSide: "asignatura",
    },
    estudianteAsignaturas: {
      type: "one-to-many",
      target: "EstudianteAsignatura",
      inverseSide: "asignatura",
    },
    evaluacionesPracticas: {
      type: "one-to-many",
      target: "EvaluacionPractica",
      inverseSide: "asignatura",
    },
  },
});