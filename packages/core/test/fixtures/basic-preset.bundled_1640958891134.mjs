var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/utils.ts
import createDebugger from "debug";
var debug = {
  apply: makeDebugger("preset:core:apply"),
  resolve: makeDebugger("preset:core:resolve"),
  import: makeDebugger("preset:core:import"),
  context: makeDebugger("preset:core:context"),
  action: makeDynamicDebugger("preset:core:action"),
  preset: makeDynamicDebugger("preset:core:execution")
};
function makeDebugger(baseName) {
  return createDebugger(baseName);
}
function makeDynamicDebugger(baseName) {
  return (name, content, ...args) => createDebugger(`${baseName}:${name}`)(content, ...args);
}

// src/events.ts
import { createNanoEvents } from "nanoevents";
var emitter = createNanoEvents();

// src/context.ts
import cac from "cac";
import simpleGit from "simple-git";
var contexts = [];
function getCurrentContext() {
  debug.context(`Retrieving the current context from the stack (count: ${contexts.length}).`);
  const context = contexts.at(-1);
  if (!context) {
    debug.context("Context could not be found in the context stack. This might cause issues.");
  }
  debug.context("Current context:", context);
  return context;
}
function destroyCurrentContext() {
  debug.context("Destroying the current context.");
  if (!contexts.pop()) {
    debug.context("No context found to destroy");
  }
}

// src/api.ts
function definePreset(options) {
  var _a;
  return {
    name: options.name,
    flags: (_a = options.flags) != null ? _a : {},
    apply: (context) => __async(this, null, function* () {
      debug.preset(options.name, `Applying preset "${options.name}".`);
      emitter.emit("preset:start", options.name);
      try {
        debug.preset(options.name, "Preset context:", context);
        debug.preset(options.name, "Executing handler.");
        if ((yield options.handler(context)) === false) {
          debug.preset(options.name, "Handler returned false, throwing.");
          throw new Error("Action failed without throwing.");
        }
        if (context.errors.length) {
          debug.preset(options.name, "One or more actions failed.");
          throw new Error("One or more actions failed.");
        }
        debug.preset(options.name, "Handler executed without throwing.");
        emitter.emit("preset:success", options.name);
      } catch (error) {
        debug.preset(options.name, "Handler threw an error:", error);
        emitter.emit("preset:failed", options.name, error);
      }
      emitter.emit("preset:end", options.name);
      destroyCurrentContext();
    })
  };
}
function defineAction(name, action, defaultOptions) {
  return (options) => __async(this, null, function* () {
    debug.action(name, `Running action "${name}".`);
    emitter.emit("action:start", name);
    const context = getCurrentContext();
    try {
      const resolved = __spreadValues(__spreadValues({}, defaultOptions != null ? defaultOptions : {}), options != null ? options : {});
      if (!(yield action({ options: resolved, context }))) {
        debug.action(name, "Action handler returned false, throwing.");
        throw new Error("Action failed without throwing.");
      }
      debug.action(name, "Handler executed without throwing.");
      emitter.emit("action:success", name);
    } catch (error) {
      context == null ? void 0 : context.errors.push({
        action: name,
        error
      });
      debug.action(name, "Handler threw an error:", error);
      emitter.emit("action:failed", name, error);
    }
    emitter.emit("action:end", name);
  });
}

// src/actions/extract-templates.ts
var extractTemplates = defineAction("extract-template", (_0) => __async(void 0, [_0], function* ({ options }) {
  throw new Error("Not yet implemented");
}), {
  from: "templates",
  to: ".",
  whenConflict: "override",
  extractDotfiles: false
});

// test/fixtures/basic-preset.ts
var basic_preset_default = definePreset({
  name: "basic-preset",
  flags: {
    install: true,
    git: true
  },
  handler: () => __async(void 0, null, function* () {
    yield extractTemplates({});
  })
});
export {
  basic_preset_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3V0aWxzLnRzIiwgInNyYy9ldmVudHMudHMiLCAic3JjL2NvbnRleHQudHMiLCAic3JjL2FwaS50cyIsICJzcmMvYWN0aW9ucy9leHRyYWN0LXRlbXBsYXRlcy50cyIsICJ0ZXN0L2ZpeHR1cmVzL2Jhc2ljLXByZXNldC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IGNyZWF0ZURlYnVnZ2VyIGZyb20gJ2RlYnVnJ1xuXG5leHBvcnQgY29uc3QgZGVidWcgPSB7XG5cdGFwcGx5OiBtYWtlRGVidWdnZXIoJ3ByZXNldDpjb3JlOmFwcGx5JyksXG5cdHJlc29sdmU6IG1ha2VEZWJ1Z2dlcigncHJlc2V0OmNvcmU6cmVzb2x2ZScpLFxuXHRpbXBvcnQ6IG1ha2VEZWJ1Z2dlcigncHJlc2V0OmNvcmU6aW1wb3J0JyksXG5cdGNvbnRleHQ6IG1ha2VEZWJ1Z2dlcigncHJlc2V0OmNvcmU6Y29udGV4dCcpLFxuXHRhY3Rpb246IG1ha2VEeW5hbWljRGVidWdnZXIoJ3ByZXNldDpjb3JlOmFjdGlvbicpLFxuXHRwcmVzZXQ6IG1ha2VEeW5hbWljRGVidWdnZXIoJ3ByZXNldDpjb3JlOmV4ZWN1dGlvbicpLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZURlYnVnZ2VyKGJhc2VOYW1lOiBzdHJpbmcpIHtcblx0cmV0dXJuIGNyZWF0ZURlYnVnZ2VyKGJhc2VOYW1lKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUR5bmFtaWNEZWJ1Z2dlcihiYXNlTmFtZTogc3RyaW5nKSB7XG5cdHJldHVybiAobmFtZTogc3RyaW5nLCBjb250ZW50OiBhbnksIC4uLmFyZ3M6IGFueVtdKSA9PiBjcmVhdGVEZWJ1Z2dlcihgJHtiYXNlTmFtZX06JHtuYW1lfWApKGNvbnRlbnQsIC4uLmFyZ3MpXG59XG5cbi8qKlxuICogV3JhcHMgdGhlIHZhbHVlIGluIGFuIGFycmF5IGlmIG5lY2Vzc2FyeS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyYXA8VD4odmFsdWU6IFQgfCBUW10pOiBUW10ge1xuXHRpZiAoIXZhbHVlKSB7XG5cdFx0cmV0dXJuIFtdXG5cdH1cblxuXHRpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0dmFsdWUgPSBbdmFsdWVdXG5cdH1cblxuXHRyZXR1cm4gdmFsdWVcbn1cbiIsICJpbXBvcnQgeyBjcmVhdGVOYW5vRXZlbnRzIH0gZnJvbSAnbmFub2V2ZW50cydcblxuZXhwb3J0IGNvbnN0IGVtaXR0ZXIgPSBjcmVhdGVOYW5vRXZlbnRzPHtcblx0Ly8gUHJlc2V0c1xuXHQncHJlc2V0OnN0YXJ0JzogKG5hbWU6IHN0cmluZykgPT4gdm9pZFxuXHQncHJlc2V0OmVuZCc6IChuYW1lOiBzdHJpbmcpID0+IHZvaWRcblx0J3ByZXNldDpzdWNjZXNzJzogKG5hbWU6IHN0cmluZykgPT4gdm9pZFxuXHQncHJlc2V0OmZhaWxlZCc6IChuYW1lOiBzdHJpbmcsIGVycm9yOiBFcnJvcikgPT4gdm9pZFxuXG5cdC8vIEFjdGlvbnNcblx0J2FjdGlvbjpzdGFydCc6IChuYW1lOiBzdHJpbmcpID0+IHZvaWRcblx0J2FjdGlvbjplbmQnOiAobmFtZTogc3RyaW5nKSA9PiB2b2lkXG5cdCdhY3Rpb246c3VjY2Vzcyc6IChuYW1lOiBzdHJpbmcpID0+IHZvaWRcblx0J2FjdGlvbjpmYWlsZWQnOiAobmFtZTogc3RyaW5nLCBlcnJvcjogRXJyb3IpID0+IHZvaWRcbn0+KClcbiIsICJpbXBvcnQgY2FjIGZyb20gJ2NhYydcbmltcG9ydCBzaW1wbGVHaXQgZnJvbSAnc2ltcGxlLWdpdCdcbmltcG9ydCB7IGRlYnVnIH0gZnJvbSAnLi91dGlscydcbmltcG9ydCB0eXBlIHsgQ29udGV4dENyZWF0aW9uT3B0aW9ucywgUHJlc2V0LCBQcmVzZXRDb250ZXh0IH0gZnJvbSAnLi90eXBlcydcblxuLyoqXG4gKiBDb250ZXh0IGxpc3QsIGluIG9yZGVyIG9mIGV4ZWN1dGlvbi5cbiAqL1xuY29uc3QgY29udGV4dHM6IFByZXNldENvbnRleHRbXSA9IFtdXG5cbi8qKlxuICAqIENyZWF0ZXMgdGhlIGNvbnRleHQgZm9yIHRoZSBnaXZlbiBwcmVzZXQuXG4gICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlUHJlc2V0Q29udGV4dChwcmVzZXQ6IFByZXNldCwgb3B0aW9uczogQ29udGV4dENyZWF0aW9uT3B0aW9ucyk6IFByb21pc2U8UHJlc2V0Q29udGV4dD4ge1xuXHRkZWJ1Zy5jb250ZXh0KGBDcmVhdGluZyBhIG5ldyBjb250ZXh0IGZvciBcIiR7cHJlc2V0Lm5hbWV9XCIuYClcblxuXHRjb25zdCBjb250ZXh0OiBQcmVzZXRDb250ZXh0ID0ge1xuXHRcdC4uLmNhYygpLnBhcnNlKFsnJywgJycsIC4uLm9wdGlvbnMuYXJnc10pLFxuXHRcdG5hbWU6IHByZXNldC5uYW1lLFxuXHRcdGVycm9yczogW10sXG5cdFx0Z2l0OiB7XG5cdFx0XHRpbnN0YW5jZTogc2ltcGxlR2l0KHByb2Nlc3MuY3dkKCkpLFxuXHRcdFx0Y29uZmlnOiAoYXdhaXQgc2ltcGxlR2l0KCkubGlzdENvbmZpZygpKS5hbGwsXG5cdFx0fSxcblx0fVxuXG5cdGRlYnVnLmNvbnRleHQoJ0FkZGluZyBjb250ZXh0IHRvIHRoZSBzdGFjazonLCBjb250ZXh0KVxuXHRjb250ZXh0cy5wdXNoKGNvbnRleHQpXG5cblx0cmV0dXJuIGNvbnRleHRcbn1cblxuLyoqXG4gICogR2V0cyB0aGUgY29udGV4dCBmb3IgdGhlIGN1cnJlbnQgcHJlc2V0LlxuICAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRDb250ZXh0KCk6IFByZXNldENvbnRleHQgfCB1bmRlZmluZWQge1xuXHRkZWJ1Zy5jb250ZXh0KGBSZXRyaWV2aW5nIHRoZSBjdXJyZW50IGNvbnRleHQgZnJvbSB0aGUgc3RhY2sgKGNvdW50OiAke2NvbnRleHRzLmxlbmd0aH0pLmApXG5cblx0Y29uc3QgY29udGV4dCA9IGNvbnRleHRzLmF0KC0xKVxuXG5cdGlmICghY29udGV4dCkge1xuXHRcdGRlYnVnLmNvbnRleHQoJ0NvbnRleHQgY291bGQgbm90IGJlIGZvdW5kIGluIHRoZSBjb250ZXh0IHN0YWNrLiBUaGlzIG1pZ2h0IGNhdXNlIGlzc3Vlcy4nKVxuXHR9XG5cblx0ZGVidWcuY29udGV4dCgnQ3VycmVudCBjb250ZXh0OicsIGNvbnRleHQpXG5cblx0cmV0dXJuIGNvbnRleHRcbn1cblxuLyoqXG4gICogUmVtb3ZlcyB0aGUgY3VycmVudCBjb250ZXh0IGZyb20gdGhlIGNvbnRleHQgc3RhY2tzLlxuICAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3lDdXJyZW50Q29udGV4dCgpOiB2b2lkIHtcblx0ZGVidWcuY29udGV4dCgnRGVzdHJveWluZyB0aGUgY3VycmVudCBjb250ZXh0LicpXG5cblx0aWYgKCFjb250ZXh0cy5wb3AoKSkge1xuXHRcdGRlYnVnLmNvbnRleHQoJ05vIGNvbnRleHQgZm91bmQgdG8gZGVzdHJveScpXG5cdH1cbn1cbiIsICJpbXBvcnQgeyBSZWFkb25seURlZXAgfSBmcm9tICd0eXBlLWZlc3QnXG5pbXBvcnQgeyBkZWJ1ZyB9IGZyb20gJy4vdXRpbHMnXG5pbXBvcnQgeyBlbWl0dGVyIH0gZnJvbSAnLi9ldmVudHMnXG5pbXBvcnQgeyBkZXN0cm95Q3VycmVudENvbnRleHQsIGdldEN1cnJlbnRDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHR5cGUgeyBQcmVzZXRPcHRpb25zLCBQcmVzZXQsIEFjdGlvbkhhbmRsZXIsIEFjdGlvbiwgUHJlc2V0Q29udGV4dCB9IGZyb20gJy4vdHlwZXMnXG5cbi8qKlxuICogRGVmaW5lcyBhIHByZXNldC5cbiAqXG4gKiBAcGFyYW0gbmFtZSBUaGUgcHJlc2V0IG5hbWUuXG4gKiBAcGFyYW0gcHJlc2V0IFRoZSBwcmVzZXQncyBzY3JpcHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVQcmVzZXQob3B0aW9uczogUHJlc2V0T3B0aW9ucyk6IFByZXNldCB7XG5cdHJldHVybiB7XG5cdFx0bmFtZTogb3B0aW9ucy5uYW1lLFxuXHRcdGZsYWdzOiBvcHRpb25zLmZsYWdzID8/IHt9LFxuXHRcdGFwcGx5OiBhc3luYyhjb250ZXh0KSA9PiB7XG5cdFx0XHRkZWJ1Zy5wcmVzZXQob3B0aW9ucy5uYW1lLCBgQXBwbHlpbmcgcHJlc2V0IFwiJHtvcHRpb25zLm5hbWV9XCIuYClcblx0XHRcdGVtaXR0ZXIuZW1pdCgncHJlc2V0OnN0YXJ0Jywgb3B0aW9ucy5uYW1lKVxuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRkZWJ1Zy5wcmVzZXQob3B0aW9ucy5uYW1lLCAnUHJlc2V0IGNvbnRleHQ6JywgY29udGV4dClcblx0XHRcdFx0ZGVidWcucHJlc2V0KG9wdGlvbnMubmFtZSwgJ0V4ZWN1dGluZyBoYW5kbGVyLicpXG5cblx0XHRcdFx0Ly8gRXhlY3V0ZXMgdGhlIGhhbmRsZXJcblx0XHRcdFx0aWYgKChhd2FpdCBvcHRpb25zLmhhbmRsZXIoY29udGV4dCkpID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdGRlYnVnLnByZXNldChvcHRpb25zLm5hbWUsICdIYW5kbGVyIHJldHVybmVkIGZhbHNlLCB0aHJvd2luZy4nKVxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignQWN0aW9uIGZhaWxlZCB3aXRob3V0IHRocm93aW5nLicpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBJZiB0aGVyZSB3YXMgZXJyb3JzIGR1cmluZyB0aGUgZXhlY3V0aW9uXG5cdFx0XHRcdGlmIChjb250ZXh0LmVycm9ycy5sZW5ndGgpIHtcblx0XHRcdFx0XHRkZWJ1Zy5wcmVzZXQob3B0aW9ucy5uYW1lLCAnT25lIG9yIG1vcmUgYWN0aW9ucyBmYWlsZWQuJylcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ09uZSBvciBtb3JlIGFjdGlvbnMgZmFpbGVkLicpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkZWJ1Zy5wcmVzZXQob3B0aW9ucy5uYW1lLCAnSGFuZGxlciBleGVjdXRlZCB3aXRob3V0IHRocm93aW5nLicpXG5cdFx0XHRcdGVtaXR0ZXIuZW1pdCgncHJlc2V0OnN1Y2Nlc3MnLCBvcHRpb25zLm5hbWUpXG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRkZWJ1Zy5wcmVzZXQob3B0aW9ucy5uYW1lLCAnSGFuZGxlciB0aHJldyBhbiBlcnJvcjonLCBlcnJvcilcblx0XHRcdFx0ZW1pdHRlci5lbWl0KCdwcmVzZXQ6ZmFpbGVkJywgb3B0aW9ucy5uYW1lLCBlcnJvciBhcyBFcnJvcilcblx0XHRcdH1cblxuXHRcdFx0ZW1pdHRlci5lbWl0KCdwcmVzZXQ6ZW5kJywgb3B0aW9ucy5uYW1lKVxuXG5cdFx0XHQvLyBEZXN0cm95cyB0aGUgY29udGV4dFxuXHRcdFx0ZGVzdHJveUN1cnJlbnRDb250ZXh0KClcblx0XHR9LFxuXHR9XG59XG5cbi8qKlxuICogRGVmaW5lcyBhbiBhY3Rpb24gaGFuZGxlci5cbiAqXG4gKiBAcGFyYW0gbmFtZSBUaGUgYWN0aW9uIG5hbWUuXG4gKiBAcGFyYW0gcHJlc2V0IFRoZSBhY3Rpb24ncyBzY3JpcHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVBY3Rpb248VCA9IHZvaWQ+KG5hbWU6IHN0cmluZywgYWN0aW9uOiBBY3Rpb25IYW5kbGVyPFQ+LCBkZWZhdWx0T3B0aW9ucz86IFJlcXVpcmVkPFQ+KTogQWN0aW9uPFQ+IHtcblx0cmV0dXJuIGFzeW5jKG9wdGlvbnMpID0+IHtcblx0XHRkZWJ1Zy5hY3Rpb24obmFtZSwgYFJ1bm5pbmcgYWN0aW9uIFwiJHtuYW1lfVwiLmApXG5cdFx0ZW1pdHRlci5lbWl0KCdhY3Rpb246c3RhcnQnLCBuYW1lKVxuXG5cdFx0Y29uc3QgY29udGV4dCA9IGdldEN1cnJlbnRDb250ZXh0KClcblxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCByZXNvbHZlZCA9IHtcblx0XHRcdFx0Li4uZGVmYXVsdE9wdGlvbnMgPz8ge30sXG5cdFx0XHRcdC4uLm9wdGlvbnMgPz8ge30sXG5cdFx0XHR9IGFzIFJlYWRvbmx5RGVlcDxSZXF1aXJlZDxUPj5cblxuXHRcdFx0aWYgKCFhd2FpdCBhY3Rpb24oeyBvcHRpb25zOiByZXNvbHZlZCwgY29udGV4dDogY29udGV4dCBhcyBQcmVzZXRDb250ZXh0IH0pKSB7XG5cdFx0XHRcdGRlYnVnLmFjdGlvbihuYW1lLCAnQWN0aW9uIGhhbmRsZXIgcmV0dXJuZWQgZmFsc2UsIHRocm93aW5nLicpXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignQWN0aW9uIGZhaWxlZCB3aXRob3V0IHRocm93aW5nLicpXG5cdFx0XHR9XG5cblx0XHRcdGRlYnVnLmFjdGlvbihuYW1lLCAnSGFuZGxlciBleGVjdXRlZCB3aXRob3V0IHRocm93aW5nLicpXG5cdFx0XHRlbWl0dGVyLmVtaXQoJ2FjdGlvbjpzdWNjZXNzJywgbmFtZSlcblx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRjb250ZXh0Py5lcnJvcnMucHVzaCh7XG5cdFx0XHRcdGFjdGlvbjogbmFtZSxcblx0XHRcdFx0ZXJyb3IsXG5cdFx0XHR9KVxuXG5cdFx0XHRkZWJ1Zy5hY3Rpb24obmFtZSwgJ0hhbmRsZXIgdGhyZXcgYW4gZXJyb3I6JywgZXJyb3IpXG5cdFx0XHRlbWl0dGVyLmVtaXQoJ2FjdGlvbjpmYWlsZWQnLCBuYW1lLCBlcnJvciBhcyBFcnJvcilcblx0XHR9XG5cblx0XHRlbWl0dGVyLmVtaXQoJ2FjdGlvbjplbmQnLCBuYW1lKVxuXHR9XG59XG4iLCAiaW1wb3J0IHsgZGVmaW5lQWN0aW9uIH0gZnJvbSAnLi4vYXBpJ1xuXG5pbnRlcmZhY2UgRXh0cmFjdFRlbXBsYXRlc09wdGlvbnMge1xuXHRmcm9tPzogc3RyaW5nXG5cdHRvPzogc3RyaW5nXG5cdHdoZW5Db25mbGljdD86ICdvdmVycmlkZScgfCAnc2tpcCdcblx0ZXh0cmFjdERvdGZpbGVzPzogYm9vbGVhblxufVxuXG5leHBvcnQgY29uc3QgZXh0cmFjdFRlbXBsYXRlcyA9IGRlZmluZUFjdGlvbjxFeHRyYWN0VGVtcGxhdGVzT3B0aW9ucz4oJ2V4dHJhY3QtdGVtcGxhdGUnLCBhc3luYyh7IG9wdGlvbnMgfSkgPT4ge1xuXHR0aHJvdyBuZXcgRXJyb3IoJ05vdCB5ZXQgaW1wbGVtZW50ZWQnKVxufSwge1xuXHRmcm9tOiAndGVtcGxhdGVzJyxcblx0dG86ICcuJyxcblx0d2hlbkNvbmZsaWN0OiAnb3ZlcnJpZGUnLFxuXHRleHRyYWN0RG90ZmlsZXM6IGZhbHNlLFxufSlcbiIsICJpbXBvcnQgeyBkZWZpbmVQcmVzZXQsIGV4dHJhY3RUZW1wbGF0ZXMgfSBmcm9tICcuLi8uLi9zcmMvaW5kZXgnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZVByZXNldCh7XG5cdG5hbWU6ICdiYXNpYy1wcmVzZXQnLFxuXHRmbGFnczoge1xuXHRcdGluc3RhbGw6IHRydWUsXG5cdFx0Z2l0OiB0cnVlLFxuXHR9LFxuXHRoYW5kbGVyOiBhc3luYygpID0+IHtcblx0XHRhd2FpdCBleHRyYWN0VGVtcGxhdGVzKHt9KVxuXHR9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFFTyxJQUFNLFFBQVE7QUFBQSxFQUNwQixPQUFPLGFBQWE7QUFBQSxFQUNwQixTQUFTLGFBQWE7QUFBQSxFQUN0QixRQUFRLGFBQWE7QUFBQSxFQUNyQixTQUFTLGFBQWE7QUFBQSxFQUN0QixRQUFRLG9CQUFvQjtBQUFBLEVBQzVCLFFBQVEsb0JBQW9CO0FBQUE7QUFHdEIsc0JBQXNCLFVBQWtCO0FBQzlDLFNBQU8sZUFBZTtBQUFBO0FBR2hCLDZCQUE2QixVQUFrQjtBQUNyRCxTQUFPLENBQUMsTUFBYyxZQUFpQixTQUFnQixlQUFlLEdBQUcsWUFBWSxRQUFRLFNBQVMsR0FBRztBQUFBOzs7QUNoQjFHO0FBRU8sSUFBTSxVQUFVOzs7QUNGdkI7QUFDQTtBQU9BLElBQU0sV0FBNEI7QUEyQjNCLDZCQUF3RDtBQUM5RCxRQUFNLFFBQVEseURBQXlELFNBQVM7QUFFaEYsUUFBTSxVQUFVLFNBQVMsR0FBRztBQUU1QixNQUFJLENBQUMsU0FBUztBQUNiLFVBQU0sUUFBUTtBQUFB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
