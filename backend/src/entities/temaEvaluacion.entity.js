import { EntitySchema } from "typeorm";

export const TemaEvaluacion = new EntitySchema({
  name: "TemaEvaluacion", // Nombre usado en relaciones
  tableName: "temas_evaluacion", // Nombre en la base de datos
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    titulo: {
      type: "varchar",
      length: 150,
      nullable: false,
    },
    descripcion: {
      type: "varchar",
      length: 500,
      nullable: true,
    },
    materialUrl: {
      type: "varchar",
      length: 512,
      nullable: true,
    },
  },
  relations: {
    profesor: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "profesor_id" },
      nullable: false,
      onDelete: "CASCADE",
    },
    asignaturas: {
      type: "many-to-many",
      target: "Asignatura",
      joinTable: {
        name: "tema_asignaturas", // Tabla intermedia
        joinColumn: { name: "tema_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "asignatura_id", referencedColumnName: "id" },
      },
      cascade: true,
    },
    evaluaciones: {
      type: "many-to-many",
      target: "Evaluacion",
      mappedBy: "temas", 
    },
  },
});