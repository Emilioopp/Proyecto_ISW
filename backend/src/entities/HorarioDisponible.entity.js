import { EntitySchema } from "typeorm";

export const HorarioDisponible = new EntitySchema({
  name: "HorarioDisponible",
  tableName: "horarios_disponibles",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    fecha: {
      type: "date",
      nullable: false,
    },
    hora_inicio: {
      type: "time",
      nullable: false,
    },
    hora_fin: {
      type: "time",
      nullable: false,
    },
    disponible: {
      type: "boolean",
      default: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    evaluacion_oral: {
      type: "many-to-one",
      target: "EvaluacionOral",
      joinColumn: { name: "evaluacion_oral_id" },
      onDelete: "CASCADE",
    },
  },
});

