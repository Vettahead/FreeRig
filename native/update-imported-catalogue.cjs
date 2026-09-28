// Compatibility entry point for the former one-off import updater.
// Definitions now live in effects/*.json; this command rebuilds all descriptors.
import('../scripts/build-effects.mjs').catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
