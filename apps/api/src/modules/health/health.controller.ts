import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  check() {
    return { status: 'ok' };
  }

  /**
   * Política de atualização OTA do app mobile.
   * Retorna minRuntimeVersion, forceUpdate e message para update crítico.
   */
  @Get('app-config')
  appConfig() {
    return {
      minRuntimeVersion: '1.0.0',
      forceUpdate: false,
      message: 'Atualização obrigatória disponível.',
    };
  }
}
