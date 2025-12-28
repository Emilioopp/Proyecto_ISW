import { EntitySchema } from "typeorm";

export const IntentoEvaluacion = new EntitySchema({
  name: "IntentoEvaluacion",
  tableName: "intentos_evaluaciones",
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
    estudiante_id: {
      type: "int",
      nullable: false,
    },
    puntaje_obtenido: {
      type: "int",
      nullable: true,
    },
    puntaje_total: {
      type: "int",
      nullable: true,
    },
    tiempo_usado_segundos: {
      type: "int",
      nullable: true,
    },
    finalizado: {
      type: "boolean",
      default: false,
    },
    fecha_inicio: {
      type: "timestamp",
      nullable: false,
    },
    fecha_finalizacion: {
      type: "timestamp",
      nullable: true,
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
    estudiante: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "estudiante_id" },
      onDelete: "CASCADE",
    },
  },
});