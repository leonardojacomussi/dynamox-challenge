import {
  CreateMachineDto,
  createMachineDto,
  UpdateMachineDto,
  updateMachineDto,
} from '@dynamox-challenge/dto';
import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaError } from '@dynamox-challenge/prisma';
import { PrismaService } from '../database/PrismaService';

@Injectable()
export class MachinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateMachineDto, userId: number): Promise<{
    statusCode: number;
    data: string | { id: number; name: string; type: string, inUse: boolean}
  }> {
    const validation = createMachineDto.safeParse(body);
    if (!validation.success) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        data: validation.error.issues.map(issue => `Invalid value for attribute '${issue.path[0]}' - Message: ${issue.message}`).join('\n')
      }
    }

    const data: CreateMachineDto = validation.data;

    try {
      const machine = await this.prisma.machine.create({
        data: {
          ...data,
          inUse: false,
          user: {
            connect: {
              id: userId
            }
          }
        }
      });

      return {
        statusCode: HttpStatus.CREATED,
        data: {
          id: machine.id,
          name: machine.name,
          type: machine.type,
          inUse: machine.inUse
        }
      }
    } catch (error) {
      return PrismaError.handle(error);
    }
  }

  async findAll(userId: number): Promise<{
    statusCode: number;
    data: string | Array<{ id: number; name: string; type: string; inUse: boolean }>
  }> {
    try {
      const machines = await this.prisma.machine.findMany({
        where: {
          userId
        },
        select: {
          id: true,
          name: true,
          type: true,
          inUse: true
        }
      });

      return {
        statusCode: HttpStatus.OK,
        data: machines.map(machine => ({
          id: machine.id,
          name: machine.name,
          type: machine.type,
          inUse: machine.inUse
        }))
      }
    } catch (error) {
      return PrismaError.handle(error);
    }
  }

  async findOne(id: number, userId: number): Promise<{
    statusCode: number;
    data: string | { id: number; name: string; type: string, inUse: boolean }
  }> {
    try {
      const machine = await this.prisma.machine.findFirst({
        where: {
          id,
          userId
        },
        select: {
          id: true,
          name: true,
          type: true,
          inUse: true
        }
      });

      if (!machine) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          data: 'Machine not found'
        }
      }

      return {
        statusCode: HttpStatus.OK,
        data: {
          id: machine.id,
          name: machine.name,
          type: machine.type,
          inUse: machine.inUse
        }
      }
    } catch (error) {
      return PrismaError.handle(error);
    }
  }

  async update(id: number, body: UpdateMachineDto, userId: number): Promise<{
    statusCode: number;
    data: string | { id: number; name: string; type: string, inUse: boolean }
  }> {
    const validation = updateMachineDto.safeParse(body);
    if (!validation.success) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        data: validation.error.issues.map(issue => `Invalid value for attribute '${issue.path[0]}' - Message: ${issue.message}`).join('\n')
      }
    }

    const data: UpdateMachineDto = validation.data;

    try {
      const machine = await this.prisma.machine.update({
        where: {
          id,
          userId
        },
        data: {
          ...data
        }
      });

      return {
        statusCode: HttpStatus.OK,
        data: {
          id: machine.id,
          name: machine.name,
          type: machine.type,
          inUse: machine.inUse
        }
      }
    } catch (error) {
      return PrismaError.handle(error);
    }
  }

  async remove(id: number, userId: number): Promise<{
    statusCode: number;
    data: string
  }> {
    try {
      const machine = await this.prisma.machine.findUnique({
        where: {
          id,
          userId
        }
      });

      if (!machine) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          data: 'Machine not found'
        };
      }

      if (machine.inUse) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          data: 'Machine is in use, cannot be removed'
        };
      }

      await this.prisma.machine.delete({
        where: {
          id,
          userId
        }
      });

      return {
        statusCode: HttpStatus.OK,
        data: `Machine #${id} removed`
      }
    } catch (error) {
      return PrismaError.handle(error);
    }
  }
}
