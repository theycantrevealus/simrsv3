import { AccountModel } from "./account.model"
import { Column, CreateDateColumn, ManyToOne, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('log_login')
export class LogLoginModel {
    @PrimaryGeneratedColumn('increment')
    id: number

    @ManyToOne(() => AccountModel, account => account.uid)
    user: AccountModel

    @Column({ type: 'text' })
    log_meta: string

    @CreateDateColumn({ nullable: false, type: 'timestamp without time zone' })
    logged_at: Date
}