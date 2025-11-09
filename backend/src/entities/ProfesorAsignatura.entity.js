import { EntitySchema } from "typeorm";

export const ProfesorAsignatura = new EntitySchema({
  name: "ProfesorAsignatura",
  tableName: "profesores_asignaturas",
  columns: {
    id: {
        primary: true,
        type: "int",
        generated: "increment",
    },
    profesor_id: {
        type: "int",
        nullable: false,
    },
    asignatura_id: {
        type: "int",
        nullable: false,
    },
    created_at: {
        type: "timestamp",
        createDate: true,
        default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    profesor: {
        type: "many-to-one",
        target: "User",
        joinColumn: { name: "profesor_id" },
        onDelete: "CASCADE",
    },
    asignatura: {
        type: "many-to-one",
        target: "Asignatura",
        joinColumn: { name: "asignatura_id" },
        onDelete: "CASCADE",
    },
  },
  indices: [
    {
        name: "unique_profesor_asignatura",
        columns: ["profesor_id", "asignatura_id"],
        unique: true,
    },
  ],
});