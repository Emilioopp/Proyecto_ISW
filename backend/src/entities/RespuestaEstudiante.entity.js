import { EntitySchema } from "typeorm";

export const RespuestaEstudiante = new EntitySchema({
  name: "RespuestaEstudiante",
  tableName: "respuestas_estudiantes",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    intento_id: {
      type: "int",
      nullable: false,
    },
    pregunta_id: {
      type: "int",
      nullable: false,
    },
    respuesta_seleccionada: {
      type: "enum",
      enum: ["A", "B", "C", "D"],
      nullable: true,
    },
    es_correcta: {
      type: "boolean",
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    intento: {
      type: "many-to-one",
      target: "IntentoEvaluacion",
      joinColumn: { name: "intento_id" },
      onDelete: "CASCADE",
    },
    pregunta: {
      type: "many-to-one",
      target: "Pregunta",
      joinColumn: { name: "pregunta_id" },
      onDelete: "CASCADE",
    },
  },
  indices: [
    {
      name: "unique_intento_pregunta",
      columns: ["intento_id", "pregunta_id"],
      unique: true,
    },
  ],
});