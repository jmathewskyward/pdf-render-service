import * as opentelemetry from '@opentelemetry/api';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import * as grpc from '@opentelemetry/exporter-trace-otlp-grpc';
import * as http from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { hostname } from 'os';

const EXPORTER = process.env.OTEL_EXPORTER || 'http';
const DESTINATION = process.env.OTEL_DEST || 'localhost:4318';
const SERVICE_NAME = process.env.OTEL_SERVICE_NAME || 'pdf-render-service';
const HOSTNAME = process.env.OTEL_HOSTNAME || hostname();

export const tracer = ((serviceName: string) => {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
    }),
  });

  let exporter;
  if (EXPORTER.toLowerCase().startsWith('g')) {
    exporter = new grpc.OTLPTraceExporter({
        hostname: HOSTNAME,
        url: DESTINATION
    });
  } else {
    exporter = new http.OTLPTraceExporter({
        hostname: HOSTNAME,
        url: DESTINATION
    });
  }

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation(),
    ],
  });

  return opentelemetry.trace.getTracer('http');
})(SERVICE_NAME);