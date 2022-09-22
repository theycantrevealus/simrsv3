import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm'

@Entity({ name: 'menu_group' })
export class CoreMenuGroupModel {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ApiProperty({
    example: 'Menu Group Name',
  })
  @IsString()
  @Column({ nullable: false, type: 'character varying' })
  name: string

  @CreateDateColumn({ nullable: false, type: 'timestamp without time zone' })
  created_at: Date

  @UpdateDateColumn({ nullable: false, type: 'timestamp without time zone' })
  updated_at: Date

  @DeleteDateColumn({ nullable: true, type: 'timestamp without time zone' })
  deleted_at: Date
}
