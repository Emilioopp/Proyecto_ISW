import { EntitySchema } from "typeorm";

export const InscripcionEvaluacion = new EntitySchema({
  name: "InscripcionEvaluacion",
  tableName: "inscripciones_evaluaciones",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    evaluacion_id: {
      type: "int",
      nullable: false,
    },
    estudiante_id: {
      type: "int",
      nullable: false,
    },
    fecha_inscripcion: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
    asistio: {
      type: "boolean",
      default: false,
      nullable: true,
    },
    tema_asignado_id: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    evaluacion: {
      type: "many-to-one",
      target: "EvaluacionOral",
      joinColumn: { name: "evaluacion_id" },
      onDelete: "CASCADE",
    },
    estudiante: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "estudiante_id" },
      onDelete: "CASCADE",
    },
    tema_asignado: {
      type: "many-to-one",
      target: "TemaEvaluacio",
      joinColumn: { name: "tema_asignado_id" },
    },
  },
  indices: [
    {
      name: "unique_inscripcion",
      columns: ["evaluacion_id", "estudiante_id"],
      unique: true,
    },
  ],
});
