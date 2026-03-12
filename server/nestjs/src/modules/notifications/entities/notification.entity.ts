import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn({ type: 'uuid' })
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['progress', 'warning', 'system', 'error'],
  })
  type: 'progress' | 'warning' | 'system' | 'error';

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Index({ composite: true, with: ['user_id'] })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
