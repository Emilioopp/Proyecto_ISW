import { EntitySchema } from "typeorm";

export const TemaEvaluacion = new EntitySchema({
  name: "TemaEvaluacion",
  tableName: "temas_evaluacion",
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
    asignatura_id: {
      type: "int",
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
    asignatura: {
      type: "many-to-one",
      target: "Asignatura",
      joinColumn: { name: "asignatura_id" },
      onDelete: "CASCADE",
    },
    evaluacionesOrales: {
      type: "many-to-many",
      target: "EvaluacionOral",
      mappedBy: "temas",
    },
    evaluacionesPracticas: {
      type: "many-to-many",
      target: "EvaluacionPractica",
      mappedBy: "temas",
    },
  },
});
