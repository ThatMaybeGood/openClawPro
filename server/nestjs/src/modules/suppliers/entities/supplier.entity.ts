import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('suppliers')
export class SupplierEntity {
  @PrimaryGeneratedColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'team_name', length: 100 })
  teamName: string;

  @Column({ name: 'contact_person', length: 50 })
  contactPerson: string;

  @Column({ name: 'phone', length: 20 })
  phone: string;

  @Column({ name: 'business_license', type: 'text', nullable: true })
  businessLicense?: string;

  @Column({ 
    name: 'qualification_certificates', 
    type: 'simple-array', 
    default: [] 
  })
  qualificationCertificates: string[];

  @Column({
    name: 'supplier_type',
    type: 'enum',
    enum: ['construction', 'decoration', 'design', 'material'],
  })
  supplierType: 'construction' | 'decoration' | 'design' | 'material';

  @Column({ name: 'rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @Column({ name: 'projects_completed', default: 0 })
  projectsCompleted: number;

  @Column({ name: 'verified', default: false })
  verified: boolean;

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'rejected', 'suspended'],
    default: 'pending',
  })
  status: 'pending' | 'active' | 'rejected' | 'suspended';

  @Column({ type: 'simple-array', default: [] })
  tags: string[];

  @Column({ name: 'portfolio_urls', type: 'simple-array', default: [] })
  portfolioUrls: string[];

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
