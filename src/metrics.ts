import APM from 'prometheus-middleware';
export const apm = new APM({ 
  PORT: process.env.PROM_PORT?.length ? parseInt(process.env.PROM_PORT) : 9350 
});

apm.init();