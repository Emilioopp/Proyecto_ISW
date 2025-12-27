import { EntitySchema } from "typeorm";

export const Evaluacion = new EntitySchema({
  name: "Evaluacion",
  tableName: "evaluaciones",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
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
    tipo: {
      type: "enum",
      enum: ["oral", "presencial", "entregable"],
      default: "oral",
      nullable: false,
    },
    fecha_hora: {
      type: "timestamp",
      nullable: true,
    },
    sala: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    material_estudio: {
      type: "text",
      nullable: true,
      comment: "Enlaces o referencias bibliograficas"
    },
    

    duracion_minutos: {
      type: "int",
      nullable: true,
    },
    cupos_disponibles: {
      type: "int",
      nullable: true,
    },
    estado: {
      type: "enum",
      enum: ["programada", "en_curso", "finalizada", "cancelada"],
      default: "programada",
      nullable: false,
    },
    asignatura_id: {
      type: "int",
      nullable: false,
    },
    profesor_id: {
      type: "int",
      nullable: false,
    },
    created_at: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
    updated_at: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
      nullable: false,
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
    },
    notas: {
      type: "one-to-many",
      target: "NotaEvaluacion",
      inverseSide: "evaluacion",
    },
    temas: {
      type: "many-to-many",
      target: "TemaEvaluacion",
      joinTable: {
        name: "evaluacion_temas", // Tabla intermedia
        joinColumn: { name: "evaluacion_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "tema_id", referencedColumnName: "id" },
      },
      cascade: true,
    },
    inscripciones: {
      type: "one-to-many",
      target: "InscripcionEvaluacion",
      inverseSide: "evaluacion",
    },
  },
});
