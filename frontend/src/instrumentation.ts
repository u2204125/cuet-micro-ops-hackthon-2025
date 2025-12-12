import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-base";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { W3CTraceContextPropagator } from "@opentelemetry/core";

// Initialize Tracing
export const initInstrumentation = () => {
  console.log("Initializing OpenTelemetry...");
  try {
    // Switched to ConsoleSpanExporter because Jaeger (port 4318) was removed.
    // In a real scenario with the approved stack, you would use Sentry for traces or Elastic APM.
    const exporter = new ConsoleSpanExporter();

    console.log("WebTracerProvider class:", WebTracerProvider);
    const provider: any = new WebTracerProvider();

    console.log("Provider instance:", provider);

    if (typeof provider.addSpanProcessor === "function") {
      provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

      // Set propagator for trace context
      provider.register({
        propagator: new W3CTraceContextPropagator(),
      });

      console.log("OTel registered successfully");
    } else {
      console.error(
        "provider.addSpanProcessor is not a function. Provider keys:",
        Object.keys(provider),
      );
    }

    registerInstrumentations({
      instrumentations: [
        new FetchInstrumentation({
          propagateTraceHeaderCorsUrls: [/.+/g],
          clearTimingResources: true,
          applyCustomAttributesOnSpan: (span, request) => {
            // Tag spans with correlation info
            const spanContext = span.spanContext();
            const url =
              typeof request === "object" && "url" in request
                ? (request as any).url
                : "unknown";
            console.log(`[Trace] ${url} - TraceID: ${spanContext.traceId}`);
          },
        }),
      ],
    });
  } catch (err) {
    console.error("Failed to initialize OpenTelemetry:", err);
  }
};
