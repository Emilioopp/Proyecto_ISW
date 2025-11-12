import { EntitySchema } from "typeorm";

export const NotaEvaluacion = new EntitySchema({
  name: "NotaEvaluacion",
  tableName: "Notas_evaluaciones_orales",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    evaluacion_oral_id: {
      type: "int",
      nullable: false,
    },
    estudiante_id: {
      type: "int",
      nullable: false,
    },
    nota: {
      type: "decimal",
      precision: 2,
      scale: 1,
      nullable: false,
    },
    observacion: {
      type: "text",
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    evaluacion_oral: {
      type: "many-to-one",
      target: "EvaluacionOral",
      joinColumn: { name: "evaluacion_oral_id" },
      onDelete: "CASCADE",
    },
    estudiante: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "estudiante_id" },
      onDelete: "CASCADE",
    },
  },
  uniques: [
    {
      columns: ["evaluacion_oral_id", "estudiante_id"],
    },
  ],
});
