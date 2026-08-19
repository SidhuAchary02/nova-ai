async function main() {
  console.log("[heavy-generation-worker] Redis queue is disabled. No worker is required.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Heavy generation worker failed to start:", error);
  process.exit(1);
});
