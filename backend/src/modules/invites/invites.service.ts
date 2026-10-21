import { nanoid } from 'nanoid';
import { prisma } from '../../config/prisma.ts';
import { AppError } from '../../middleware/error.middleware.ts';
import { CreateInviteInput } from './invites.schema.ts';

export async function createInvites(input: CreateInviteInput, createdBy: string) {
  const { count, expiresInDays } = input;
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const invites = [];
  for (let i = 0; i < count; i++) {
    const code = `STUDENT-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
    const invite = await prisma.inviteCode.create({
      data: {
        code,
        status: 'ACTIVE',
        expiresAt,
        createdBy,
      },
    });
    invites.push(invite);
  }

  return invites;
}

export async function listInvites() {
  const invites = await prisma.inviteCode.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return invites;
}

export async function revokeInvite(id: string) {
  const invite = await prisma.inviteCode.findUnique({ where: { id } });
  if (!invite) {
    throw new AppError(404, 'Invite код табылмады');
  }
  if (invite.status === 'USED') {
    throw new AppError(400, 'Пайдаланылған кодты өшіруге болмайды');
  }

  await prisma.inviteCode.update({
    where: { id },
    data: { status: 'EXPIRED' },
  });

  return { message: 'Invite код өшірілді' };
}

export async function validateInvite(code: string) {
  const invite = await prisma.inviteCode.findUnique({ where: { code } });
  if (!invite) {
    throw new AppError(404, 'Invite код табылмады');
  }
  if (invite.status !== 'ACTIVE') {
    throw new AppError(400, 'Invite код пайдаланылған немесе өшірілген');
  }
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    throw new AppError(400, 'Invite код мерзімі біткен');
  }
  return { valid: true, code: invite.code };
}