import { EntitySchema } from "typeorm";

export const EvaluacionPractica = new EntitySchema({
  name: "EvaluacionPractica",
  tableName: "evaluaciones_practicas",
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
    tiempo_minutos: {
      type: "int",
      nullable: false,
    },
    estado: {
      type: "enum",
      enum: ["oculta", "publica"],
      default: "oculta",
    },
    generada_con_ia: {
      type: "boolean",
      default: false,
    },
    archivo_original: {
      type: "varchar",
      length: 255,
      nullable: true,
    },

    // Material de estudio (PDF) asociado a la evaluación
    material_nombre_original: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    material_filename: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    material_mimetype: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    material_size: {
      type: "int",
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
  },
});