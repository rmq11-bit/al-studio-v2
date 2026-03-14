import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/proposals/[id]
 * Consumer accepts or rejects a proposal on their project.
 * Accepting a proposal:
 *   1. Marks the proposal ACCEPTED
 *   2. Marks all other proposals on the same project REJECTED
 *   3. Closes the project (CLOSED)
 *   4. Opens a PROPOSAL conversation between consumer and photographer
 */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    const userId = session?.user?.id

    if (!userId || session.user.role !== 'CONSUMER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { status } = await req.json()

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })
    }

    // Fetch proposal + its project (to verify ownership)
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, consumerId: true, status: true } },
      },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'العرض غير موجود' }, { status: 404 })
    }

    if (proposal.project.consumerId !== userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    if (proposal.project.status !== 'OPEN') {
      return NextResponse.json({ error: 'المشروع مغلق' }, { status: 409 })
    }

    if (proposal.status !== 'PENDING') {
      return NextResponse.json({ error: 'العرض تمت معالجته بالفعل' }, { status: 409 })
    }

    if (status === 'ACCEPTED') {
      // Transaction: accept this proposal, reject others, close project, open conversation
      await prisma.$transaction(async (tx) => {
        // 1. Accept this proposal
        await tx.proposal.update({ where: { id }, data: { status: 'ACCEPTED' } })

        // 2. Reject all other PENDING proposals on the same project
        await tx.proposal.updateMany({
          where: {
            projectId: proposal.projectId,
            id: { not: id },
            status: 'PENDING',
          },
          data: { status: 'REJECTED' },
        })

        // 3. Close the project
        await tx.projectPost.update({
          where: { id: proposal.projectId },
          data: { status: 'CLOSED' },
        })

        // 4. Open a conversation if one doesn't exist yet
        const existing = await tx.conversation.findUnique({
          where: { proposalId: id },
        })

        if (!existing) {
          await tx.conversation.create({
            data: {
              type: 'PROPOSAL',
              consumerId: userId,
              photographerId: proposal.photographerId,
              proposalId: id,
            },
          })
        }
      })
    } else {
      // Simple rejection
      await prisma.proposal.update({ where: { id }, data: { status: 'REJECTED' } })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/proposals/:id]', err)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
