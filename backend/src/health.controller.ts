import { Controller, Get } from '@nestjs/common';

/** Публичный endpoint для Docker healthcheck (без JWT). */
@Controller('health')
export class HealthController {
  @Get()
  health() {
    return { ok: true };
  }
}
