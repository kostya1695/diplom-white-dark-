import { Type } from 'class-transformer';
import { IsArray, IsIn, IsUUID, ValidateNested } from 'class-validator';
import { UserRole } from '../common/enums';

/** Роли, которые можно назначить через API (не ADMIN) */
export const ASSIGNABLE_USER_ROLES = [
  UserRole.STUDENT,
  UserRole.KAFEDRA,
  UserRole.DEKANAT,
] as const;

export type AssignableUserRole = (typeof ASSIGNABLE_USER_ROLES)[number];

export class RoleUpdateItemDto {
  @IsUUID('4')
  userId!: string;

  @IsIn(ASSIGNABLE_USER_ROLES as unknown as UserRole[])
  role!: AssignableUserRole;
}

export class BatchUpdateRolesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleUpdateItemDto)
  updates!: RoleUpdateItemDto[];
}
