import { EntitySchema } from "typeorm";

export const EvaluacionOral = new EntitySchema({
  name: "EvaluacionOral",
  tableName: "evaluaciones_orales",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    asignatura_id: {
      type: "int",
      nullable: false,
    },
    profesor_id: {
      type: "int",
      nullable: false,
    },
    titulo: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    descripcion: {
      type: "text",
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    asignatura: {
      type: "many-to-one",
      target: "Asignatura",
      joinColumn: { name: "asignatura_id" },
      onDelete: "CASCADE",
    },
    profesor: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "profesor_id" },
      onDelete: "CASCADE",
    },
    registros: {
      type: "one-to-many",
      target: "NotaEvaluacion",
      inverseSide: "evaluacion_oral",
    },
  },
});
