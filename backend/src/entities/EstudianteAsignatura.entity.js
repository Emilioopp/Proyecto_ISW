import { EntitySchema } from "typeorm";

export const EstudianteAsignatura = new EntitySchema({
    name: "EstudianteAsignatura",
    tableName: "estudiantes_asignaturas",
    columns: {
    id: { 
        primary: true, 
        type: "int", 
        generated: "increment"
    },
    estudiante_id: { 
        type: "int", 
        nullable: false 
    },
    asignatura_id: { 
        type: "int", 
        nullable: false 
    },
    created_at: {
        type: "timestamp",
        createDate: true,
        default: () => "CURRENT_TIMESTAMP",
    },
  },
    relations: {
        estudiante: {
            type: "many-to-one",
            target: "User",
            joinColumn: { name: "estudiante_id" },
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
      name: "unique_estudiante_asignatura",
      columns: ["estudiante_id", "asignatura_id"],
      unique: true,
    },
  ],
});