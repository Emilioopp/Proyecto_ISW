import { EntitySchema, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable} from "typeorm";
import { Asignatura } from "./asignatura.entity.js";
import { User } from "./user.entity.js"; 

export const Tema_oral = new EntitySchema({
  name: "Tema_oral",
  tableName: "temas_orales",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment"
        },
        titulo: {
            type: "varchar",
            length: 150,
            nullable: false
        },
        descripcion: {
            type: "varchar",
            length: 500,
            nullable: true
        },
        materialUrl: {
            type: "varchar",
            length: 512,
            nullable: true
        }
    },
    relations: {
        profesor: {
            type: "many-to-one",
            target: "User",
            joinColumn: { name: "profesor_id" },
            nullable: false,
            onDelete: "CASCADE"
        },
        asignatura: {
            type: "many-to-many",
            target: "Asignatura",
            joinTable: {
                name: "tema_asignaturas",
                joinColumn: {
                    name: "tema_id", referencedColumnName: "id"},
                inverseJoinColumn: { name: "asignatura_id", referencedColumnName: "id"}
            },
            cascade: true
        }
    }
});