import { EntitySchema } from "typeorm";

export const Pregunta = new EntitySchema({
  name: "Pregunta",
  tableName: "preguntas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    evaluacion_id: {
      type: "int",
      nullable: false,
    },
    enunciado: {
      type: "text",
      nullable: false,
    },
    alternativa_a: {
      type: "text",
      nullable: false,
    },
    alternativa_b: {
      type: "text",
      nullable: false,
    },
    alternativa_c: {
      type: "text",
      nullable: false,
    },
    alternativa_d: {
      type: "text",
      nullable: false,
    },
    respuesta_correcta: {
      type: "enum",
      enum: ["A", "B", "C", "D"],
      nullable: false,
    },
    explicacion: {
      type: "text",
      nullable: false,
    },
    puntaje: {
      type: "int",
      default: 1,
    },
    orden: {
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
    evaluacion: {
      type: "many-to-one",
      target: "EvaluacionPractica",
      joinColumn: { name: "evaluacion_id" },
      onDelete: "CASCADE",
    },
  },
});